import { ColumnQuality, DataRow, QualityReportData } from '../types';

export function isNullOrEmpty(value: any): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed === '' || trimmed.toLowerCase() === 'nan' || trimmed.toLowerCase() === 'null';
  }
  if (typeof value === 'number' && isNaN(value)) return true;
  return false;
}

export function inferColumnType(values: any[]): 'number' | 'string' | 'boolean' | 'date' | 'empty' {
  const nonNull = values.filter((v) => !isNullOrEmpty(v));
  if (nonNull.length === 0) return 'empty';

  let numCount = 0;
  let boolCount = 0;
  let dateCount = 0;

  for (const val of nonNull) {
    const s = String(val).trim();
    if (s.toLowerCase() === 'true' || s.toLowerCase() === 'false') {
      boolCount++;
    } else if (!isNaN(Number(s)) && !isNaN(parseFloat(s))) {
      numCount++;
    } else if (!isNaN(Date.parse(s)) && s.length > 5 && (s.includes('-') || s.includes('/'))) {
      dateCount++;
    }
  }

  const threshold = nonNull.length * 0.75;
  if (numCount >= threshold) return 'number';
  if (boolCount >= threshold) return 'boolean';
  if (dateCount >= threshold) return 'date';
  return 'string';
}

function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase());
}

export function analyzeDataset(data: DataRow[], columns: string[]): QualityReportData {
  const totalRows = data.length;
  const totalColumns = columns.length;
  const totalCells = totalRows * totalColumns;

  if (totalRows === 0 || totalColumns === 0) {
    return {
      totalRows: 0,
      totalColumns: 0,
      totalCells: 0,
      missingCells: 0,
      missingPercentage: 0,
      duplicateRows: 0,
      healthScore: 100,
      healthGrade: 'A',
      columnReports: [],
      invalidAges: [],
      duplicateRowIndices: []
    };
  }

  // 1. Identify duplicates
  const rowHashList: string[] = [];
  const seenMap = new Map<string, number>();
  const duplicateIndices: number[] = [];

  data.forEach((row, idx) => {
    // Generate normalized JSON representation of row values
    const hash = columns.map((col) => String(row[col] ?? '')).join('|||');
    if (seenMap.has(hash)) {
      duplicateIndices.push(idx);
    } else {
      seenMap.set(hash, idx);
    }
    rowHashList.push(hash);
  });

  const duplicateRows = duplicateIndices.length;

  // 2. Column-by-column report
  let totalMissingCells = 0;
  let totalAnomalies = 0;
  const invalidAgesList: { rowIdx: number; name?: string; age: number | string }[] = [];

  const columnReports: ColumnQuality[] = columns.map((col) => {
    const values = data.map((r) => r[col]);
    const inferredType = inferColumnType(values);

    let missing = 0;
    let extraSpaces = 0;
    let inconsistentCase = 0;
    let invalidAgeCount = 0;
    const uniqueSet = new Set<string>();

    values.forEach((v, idx) => {
      if (isNullOrEmpty(v)) {
        missing++;
      } else {
        const strVal = String(v);
        uniqueSet.add(strVal);

        // Extra whitespace
        if (strVal !== strVal.trim() || /\s{2,}/.test(strVal)) {
          extraSpaces++;
        }

        // Inconsistent casing for text
        if (inferredType === 'string') {
          const trimmed = strVal.trim();
          const expectedTitle = toTitleCase(trimmed);
          if (trimmed !== expectedTitle && trimmed !== trimmed.toUpperCase()) {
            inconsistentCase++;
          }
        }

        // Age column check (like in original repo)
        if (col.toLowerCase() === 'age') {
          const num = Number(strVal);
          if (isNaN(num) || num < 0 || num > 100) {
            invalidAgeCount++;
            invalidAgesList.push({
              rowIdx: idx,
              name: data[idx]['Name'] || data[idx]['name'] || `Row ${idx + 1}`,
              age: v
            });
          }
        }
      }
    });

    totalMissingCells += missing;
    totalAnomalies += extraSpaces + inconsistentCase + invalidAgeCount;

    return {
      column: col,
      inferredType,
      totalCount: totalRows,
      nonMissingCount: totalRows - missing,
      missingCount: missing,
      missingPercentage: totalRows > 0 ? Number(((missing / totalRows) * 100).toFixed(1)) : 0,
      uniqueValuesCount: uniqueSet.size,
      extraSpacesCount: extraSpaces,
      inconsistentCaseCount: inconsistentCase,
      invalidAgeCount: col.toLowerCase() === 'age' ? invalidAgeCount : undefined
    };
  });

  const missingPercentage = totalCells > 0 ? Number(((totalMissingCells / totalCells) * 100).toFixed(1)) : 0;

  // 3. Health Score calculation (0 to 100)
  // Deductions:
  // - Missing cells ratio (up to 40 pts penalty)
  // - Duplicate rows ratio (up to 30 pts penalty)
  // - Casing / Whitespace / Age anomalies ratio (up to 30 pts penalty)
  const missingPenalty = Math.min(40, (totalMissingCells / Math.max(1, totalCells)) * 100);
  const dupPenalty = Math.min(30, (duplicateRows / Math.max(1, totalRows)) * 100);
  const anomalyPenalty = Math.min(30, (totalAnomalies / Math.max(1, totalCells)) * 50);

  let healthScore = Math.max(10, Math.round(100 - (missingPenalty + dupPenalty + anomalyPenalty)));

  let healthGrade: 'A' | 'B' | 'C' | 'D' | 'F' = 'A';
  if (healthScore >= 90) healthGrade = 'A';
  else if (healthScore >= 75) healthGrade = 'B';
  else if (healthScore >= 60) healthGrade = 'C';
  else if (healthScore >= 40) healthGrade = 'D';
  else healthGrade = 'F';

  return {
    totalRows,
    totalColumns,
    totalCells,
    missingCells: totalMissingCells,
    missingPercentage,
    duplicateRows,
    healthScore,
    healthGrade,
    columnReports,
    invalidAges: invalidAgesList,
    duplicateRowIndices: duplicateIndices
  };
}
