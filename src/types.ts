export type MissingStrategy = 
  | 'keep'
  | 'drop_rows'
  | 'fill_numeric_median'
  | 'fill_text_unknown'
  | 'fill_numeric_mean'
  | 'fill_numeric_zero';

export interface CleaningSettings {
  removeDuplicates: boolean;
  standardizeText: boolean;
  missingStrategy: MissingStrategy;
  flagInvalidAges: boolean;
  clampInvalidAges?: boolean;
  columnOverrides?: Record<string, string>;
}

export interface ColumnQuality {
  column: string;
  inferredType: 'number' | 'string' | 'boolean' | 'date' | 'empty';
  totalCount: number;
  nonMissingCount: number;
  missingCount: number;
  missingPercentage: number;
  uniqueValuesCount: number;
  extraSpacesCount: number;
  inconsistentCaseCount: number;
  invalidAgeCount?: number;
}

export interface QualityReportData {
  totalRows: number;
  totalColumns: number;
  totalCells: number;
  missingCells: number;
  missingPercentage: number;
  duplicateRows: number;
  healthScore: number;
  healthGrade: 'A' | 'B' | 'C' | 'D' | 'F';
  columnReports: ColumnQuality[];
  invalidAges: { rowIdx: number; name?: string; age: number | string }[];
  duplicateRowIndices: number[];
}

export interface CleaningAuditEntry {
  type: 'duplicate' | 'text' | 'missing' | 'age' | 'other';
  message: string;
  details?: string;
  rowIdx?: number;
  column?: string;
}

export interface CleaningReport {
  original_rows: number;
  cleaned_rows: number;
  original_columns: number;
  cleaned_columns: number;
  duplicates_removed: number;
  missing_values_filled: number;
  text_values_standardized: number;
  invalid_ages_flagged: number;
  remaining_missing_values: number;
  execution_time_ms: number;
  audit_log: CleaningAuditEntry[];
}

export type DataRow = Record<string, any>;
