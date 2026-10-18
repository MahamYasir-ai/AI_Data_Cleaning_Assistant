import { CleaningAuditEntry, CleaningReport, CleaningSettings, DataRow } from '../types';
import { inferColumnType, isNullOrEmpty } from './dataQuality';

export const KNOWN_ACRONYMS: Record<string, string> = {
  it: 'IT',
  hr: 'HR',
  ai: 'AI',
  'r&d': 'R&D',
  usa: 'USA',
  uk: 'UK',
  ceo: 'CEO',
  cto: 'CTO',
  cfo: 'CFO',
  qa: 'QA',
  ui: 'UI',
  ux: 'UX',
  api: 'API',
  sql: 'SQL'
};

export function standardizeStringValue(val: any): string {
  if (val === null || val === undefined) return val;
  if (typeof val !== 'string') return val;

  // 1. Collapse multiple whitespaces and trim edges
  const trimmed = val.replace(/\s+/g, ' ').trim();
  if (!trimmed) return trimmed;

  // 2. Check acronyms
  const lower = trimmed.toLowerCase();
  if (KNOWN_ACRONYMS[lower]) {
    return KNOWN_ACRONYMS[lower];
  }

  // 3. Title case words
  return trimmed.replace(/\w\S*/g, (txt) => {
    const wordLower = txt.toLowerCase();
    if (KNOWN_ACRONYMS[wordLower]) return KNOWN_ACRONYMS[wordLower];
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

function calculateMedian(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 !== 0) {
    return sorted[mid];
  }
  return Number(((sorted[mid - 1] + sorted[mid]) / 2).toFixed(2));
}

function calculateMean(numbers: number[]): number | null {
  if (numbers.length === 0) return null;
  const sum = numbers.reduce((acc, curr) => acc + curr, 0);
  return Number((sum / numbers.length).toFixed(2));
}

export interface CleanDatasetResult {
  cleanedData: DataRow[];
  report: CleaningReport;
  changedCells: Map<string, { original: any; cleaned: any }>; // key: `${rowIdx}_${col}`
  removedRowIndices: number[];
}

export function cleanDataset(
  originalData: DataRow[],
  columns: string[],
  settings: CleaningSettings
): CleanDatasetResult {
  const startTime = performance.now();
  const auditLog: CleaningAuditEntry[] = [];
  const changedCells = new Map<string, { original: any; cleaned: any }>();

  let workingData: { row: DataRow; origIdx: number }[] = originalData.map((row, idx) => ({
    row: { ...row },
    origIdx: idx
  }));

  const initialRowCount = workingData.length;
  let duplicatesRemoved = 0;
  let textStandardizedCount = 0;
  let missingValuesFilled = 0;
  let invalidAgesFlagged = 0;
  const removedRowIndices: number[] = [];

  // 1. DUPLICATE REMOVAL
  if (settings.removeDuplicates) {
    const seenHashes = new Set<string>();
    const deduplicated: { row: DataRow; origIdx: number }[] = [];

    workingData.forEach(({ row, origIdx }) => {
      const hash = columns.map((col) => String(row[col] ?? '')).join('|||');
      if (seenHashes.has(hash)) {
        duplicatesRemoved++;
        removedRowIndices.push(origIdx);
        auditLog.push({
          type: 'duplicate',
          message: `Removed identical duplicate row at original index ${origIdx + 1}`,
          rowIdx: origIdx
        });
      } else {
        seenHashes.add(hash);
        deduplicated.push({ row, origIdx });
      }
    });

    workingData = deduplicated;
  }

  // Detect column types
  const colTypes = new Map<string, 'number' | 'string' | 'boolean' | 'date' | 'empty'>();
  columns.forEach((col) => {
    colTypes.set(col, inferColumnType(originalData.map((r) => r[col])));
  });

  // 2. TEXT STANDARDIZATION
  if (settings.standardizeText) {
    workingData.forEach(({ row, origIdx }) => {
      columns.forEach((col) => {
        const type = colTypes.get(col);
        const val = row[col];

        if (typeof val === 'string' && !isNullOrEmpty(val)) {
          const standardized = standardizeStringValue(val);
          if (standardized !== val) {
            textStandardizedCount++;
            row[col] = standardized;
            changedCells.set(`${origIdx}_${col}`, {
              original: val,
              cleaned: standardized
            });
            auditLog.push({
              type: 'text',
              message: `Standardized "${val}" → "${standardized}"`,
              rowIdx: origIdx,
              column: col
            });
          }
        }
      });
    });
  }

  // 3. MISSING VALUE STRATEGY
  if (settings.missingStrategy === 'drop_rows') {
    const beforeDrop = workingData.length;
    const kept: { row: DataRow; origIdx: number }[] = [];

    workingData.forEach(({ row, origIdx }) => {
      const hasMissing = columns.some((col) => isNullOrEmpty(row[col]));
      if (hasMissing) {
        removedRowIndices.push(origIdx);
        auditLog.push({
          type: 'missing',
          message: `Dropped row ${origIdx + 1} because it contained missing values`,
          rowIdx: origIdx
        });
      } else {
        kept.push({ row, origIdx });
      }
    });

    workingData = kept;
  } else if (settings.missingStrategy === 'fill_numeric_median') {
    // Calculate medians for numeric columns
    const medians = new Map<string, number | null>();
    columns.forEach((col) => {
      if (colTypes.get(col) === 'number') {
        const nums = workingData
          .map(({ row }) => Number(row[col]))
          .filter((n) => !isNaN(n) && isFinite(n));
        medians.set(col, calculateMedian(nums));
      }
    });

    workingData.forEach(({ row, origIdx }) => {
      columns.forEach((col) => {
        if (isNullOrEmpty(row[col]) && colTypes.get(col) === 'number') {
          const median = medians.get(col);
          if (median !== null && median !== undefined) {
            missingValuesFilled++;
            const originalVal = row[col];
            row[col] = median;
            changedCells.set(`${origIdx}_${col}`, {
              original: originalVal ?? 'null',
              cleaned: median
            });
            auditLog.push({
              type: 'missing',
              message: `Imputed missing numeric value with median (${median}) in column "${col}"`,
              rowIdx: origIdx,
              column: col
            });
          }
        }
      });
    });
  } else if (settings.missingStrategy === 'fill_text_unknown') {
    workingData.forEach(({ row, origIdx }) => {
      columns.forEach((col) => {
        const type = colTypes.get(col);
        if (isNullOrEmpty(row[col]) && type !== 'number') {
          missingValuesFilled++;
          const originalVal = row[col];
          row[col] = 'Unknown';
          changedCells.set(`${origIdx}_${col}`, {
            original: originalVal ?? 'null',
            cleaned: 'Unknown'
          });
          auditLog.push({
            type: 'missing',
            message: `Imputed missing text with "Unknown" in column "${col}"`,
            rowIdx: origIdx,
            column: col
          });
        }
      });
    });
  } else if (settings.missingStrategy === 'fill_numeric_mean') {
    const means = new Map<string, number | null>();
    columns.forEach((col) => {
      if (colTypes.get(col) === 'number') {
        const nums = workingData
          .map(({ row }) => Number(row[col]))
          .filter((n) => !isNaN(n) && isFinite(n));
        means.set(col, calculateMean(nums));
      }
    });

    workingData.forEach(({ row, origIdx }) => {
      columns.forEach((col) => {
        if (isNullOrEmpty(row[col]) && colTypes.get(col) === 'number') {
          const mean = means.get(col);
          if (mean !== null && mean !== undefined) {
            missingValuesFilled++;
            const originalVal = row[col];
            row[col] = mean;
            changedCells.set(`${origIdx}_${col}`, {
              original: originalVal ?? 'null',
              cleaned: mean
            });
            auditLog.push({
              type: 'missing',
              message: `Imputed missing numeric value with mean (${mean}) in column "${col}"`,
              rowIdx: origIdx,
              column: col
            });
          }
        }
      });
    });
  } else if (settings.missingStrategy === 'fill_numeric_zero') {
    workingData.forEach(({ row, origIdx }) => {
      columns.forEach((col) => {
        if (isNullOrEmpty(row[col]) && colTypes.get(col) === 'number') {
          missingValuesFilled++;
          const originalVal = row[col];
          row[col] = 0;
          changedCells.set(`${origIdx}_${col}`, {
            original: originalVal ?? 'null',
            cleaned: 0
          });
          auditLog.push({
            type: 'missing',
            message: `Imputed missing value with 0 in column "${col}"`,
            rowIdx: origIdx,
            column: col
          });
        }
      });
    });
  }

  // 4. AGE / OUTLIER VALIDATION
  if (settings.flagInvalidAges) {
    const ageCol = columns.find((c) => c.toLowerCase() === 'age');
    if (ageCol) {
      workingData.forEach(({ row, origIdx }) => {
        const rawAge = row[ageCol];
        if (!isNullOrEmpty(rawAge)) {
          const numAge = Number(rawAge);
          if (!isNaN(numAge) && (numAge < 0 || numAge > 100)) {
            invalidAgesFlagged++;
            auditLog.push({
              type: 'age',
              message: `Implausible age value (${numAge}) detected for row ${origIdx + 1}`,
              rowIdx: origIdx,
              column: ageCol
            });

            if (settings.clampInvalidAges) {
              const clamped = Math.max(0, Math.min(100, numAge));
              row[ageCol] = clamped;
              changedCells.set(`${origIdx}_${ageCol}`, {
                original: rawAge,
                cleaned: clamped
              });
            }
          }
        }
      });
    }
  }

  // Calculate remaining missing values
  let remainingMissing = 0;
  workingData.forEach(({ row }) => {
    columns.forEach((col) => {
      if (isNullOrEmpty(row[col])) remainingMissing++;
    });
  });

  const durationMs = Math.round(performance.now() - startTime);

  const finalCleanedRows = workingData.map((w) => w.row);

  const report: CleaningReport = {
    original_rows: initialRowCount,
    cleaned_rows: finalCleanedRows.length,
    original_columns: columns.length,
    cleaned_columns: columns.length,
    duplicates_removed: duplicatesRemoved,
    missing_values_filled: missingValuesFilled,
    text_values_standardized: textStandardizedCount,
    invalid_ages_flagged: invalidAgesFlagged,
    remaining_missing_values: remainingMissing,
    execution_time_ms: durationMs,
    audit_log: auditLog
  };

  return {
    cleanedData: finalCleanedRows,
    report,
    changedCells,
    removedRowIndices
  };
}
