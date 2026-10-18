import React, { useState } from 'react';
import {
  Download,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  Copy,
  ChevronDown,
  ChevronUp,
  History,
} from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { CleaningReport, DataRow } from '../types';

interface CleaningResultsSectionProps {
  originalData: DataRow[];
  cleanedData: DataRow[];
  columns: string[];
  report: CleaningReport;
  changedCells: Map<string, { original: any; cleaned: any }>;
}

export const CleaningResultsSection: React.FC<CleaningResultsSectionProps> = ({
  originalData,
  cleanedData,
  columns,
  report,
  changedCells,
}) => {
  const [viewMode, setViewMode] = useState<'cleaned' | 'original'>('cleaned');
  const [page, setPage] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showAuditLog, setShowAuditLog] = useState(false);
  const [showJsonReport, setShowJsonReport] = useState(false);
  const pageSize = 8;

  const currentDisplayData = viewMode === 'original' ? originalData : cleanedData;
  const totalPages = Math.ceil(currentDisplayData.length / pageSize);
  const displayedRows = currentDisplayData.slice(page * pageSize, (page + 1) * pageSize);

  const rowsRemoved = report.original_rows - report.cleaned_rows;

  // Export handlers
  const handleDownloadCSV = () => {
    const csvString = Papa.unparse(cleanedData);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cleaned_dataset.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(cleanedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cleaned Data');
    XLSX.writeFile(workbook, 'cleaned_dataset.xlsx');
  };

  const handleDownloadReportCSV = () => {
    const reportRows = [
      { Metric: 'original_rows', Value: report.original_rows },
      { Metric: 'cleaned_rows', Value: report.cleaned_rows },
      { Metric: 'duplicates_removed', Value: report.duplicates_removed },
      { Metric: 'missing_values_filled', Value: report.missing_values_filled },
      { Metric: 'text_values_standardized', Value: report.text_values_standardized },
      { Metric: 'invalid_ages_flagged', Value: report.invalid_ages_flagged },
      { Metric: 'remaining_missing_values', Value: report.remaining_missing_values },
      { Metric: 'execution_time_ms', Value: report.execution_time_ms },
    ];
    const csvString = Papa.unparse(reportRows);
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'cleaning_report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyJSON = () => {
    navigator.clipboard.writeText(JSON.stringify(cleanedData, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              4
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Cleaned Results & Preview</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Inspect cleaned data, review what was changed, and download your files
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Processed in {report.execution_time_ms}ms
          </span>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Rows Removed</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{rowsRemoved.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {report.original_rows} → {report.cleaned_rows} rows
          </p>
        </div>

        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Duplicates Removed</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{report.duplicates_removed.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Exact duplicates deleted</p>
        </div>

        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Text Cleaned</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{report.text_values_standardized.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">Spaces & casing fixed</p>
        </div>

        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <span className="text-xs font-medium uppercase tracking-wider text-slate-500">Missing Left</span>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">{report.remaining_missing_values.toLocaleString()}</div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {report.missing_values_filled} filled
          </p>
        </div>
      </div>

      {/* Table & Diff Viewer */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider">View:</span>
            <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => {
                  setViewMode('cleaned');
                  setPage(0);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'cleaned'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Cleaned Data ({cleanedData.length})
              </button>
              <button
                onClick={() => {
                  setViewMode('original');
                  setPage(0);
                }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                  viewMode === 'original'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Original Data ({originalData.length})
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between sm:justify-end">
            <span className="text-xs text-slate-500">
              {changedCells.size} cell{changedCells.size === 1 ? '' : 's'} modified
            </span>
            <button
              onClick={handleCopyJSON}
              className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-md transition-colors cursor-pointer shadow-xs"
            >
              <Copy className="w-3.5 h-3.5 text-slate-600" />
              <span>{copied ? 'Copied!' : 'Copy JSON'}</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse font-mono">
            <thead>
              <tr className="bg-slate-100 text-slate-700 uppercase tracking-wider font-semibold border-b border-slate-200">
                <th className="py-2.5 px-3 w-12 text-center border-r border-slate-200">#</th>
                {columns.map((col) => (
                  <th key={col} className="py-2.5 px-4 font-semibold text-slate-700">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {displayedRows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="py-6 text-center text-slate-500">
                    No records to show.
                  </td>
                </tr>
              ) : (
                displayedRows.map((row, idx) => {
                  const absoluteIdx = page * pageSize + idx;

                  return (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 px-3 text-center text-slate-500 border-r border-slate-200">
                        {absoluteIdx + 1}
                      </td>
                      {columns.map((col) => {
                        const val = row[col];
                        const isEmpty = val === null || val === undefined || String(val).trim() === '';
                        const cellKey = `${absoluteIdx}_${col}`;
                        const wasChanged = viewMode === 'cleaned' && changedCells.has(cellKey);
                        const changeInfo = wasChanged ? changedCells.get(cellKey) : null;

                        return (
                          <td
                            key={col}
                            className={`py-2.5 px-4 truncate max-w-xs transition-colors ${
                              wasChanged
                                ? 'bg-emerald-50 text-emerald-950 font-bold border-l-2 border-emerald-500'
                                : 'text-slate-800'
                            }`}
                            title={wasChanged ? `Original: "${changeInfo?.original}"` : undefined}
                          >
                            {isEmpty ? (
                              <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                NULL
                              </span>
                            ) : (
                              <div className="flex items-center gap-1.5">
                                <span>{String(val)}</span>
                                {wasChanged && (
                                  <span className="text-[10px] font-sans font-semibold px-1 bg-emerald-100 text-emerald-800 rounded">
                                    Fixed
                                  </span>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, currentDisplayData.length)} of{' '}
              {currentDisplayData.length}
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 rounded border border-slate-300 text-slate-700 shadow-xs cursor-pointer"
              >
                Prev
              </button>
              <span className="px-2 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                disabled={page >= totalPages - 1}
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                className="px-2.5 py-1 bg-white hover:bg-slate-100 disabled:opacity-40 rounded border border-slate-300 text-slate-700 shadow-xs cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Export Section */}
      <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-5">
        <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
          <Download className="w-4 h-4 text-emerald-600" />
          Download Cleaned Files
        </h3>
        <p className="text-xs text-slate-500 mb-4">
          Save your sanitized dataset in CSV, Excel, or summary format
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleDownloadCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV (.csv)</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>

          <button
            onClick={handleDownloadReportCSV}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 transition-colors cursor-pointer shadow-xs"
          >
            <FileText className="w-4 h-4 text-slate-600" />
            <span>Download Report (.csv)</span>
          </button>
        </div>
      </div>

      {/* Audit Log and Full JSON report */}
      <div className="space-y-3">
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setShowAuditLog(!showAuditLog)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-emerald-600" />
              <span>Transformation Details Log ({report.audit_log.length} changes logged)</span>
            </div>
            {showAuditLog ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showAuditLog && (
            <div className="p-4 border-t border-slate-200 bg-slate-50 max-h-60 overflow-y-auto space-y-1.5 font-mono text-xs">
              {report.audit_log.length === 0 ? (
                <p className="text-slate-500">No modifications were needed for this dataset.</p>
              ) : (
                report.audit_log.map((entry, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-white border border-slate-200 flex items-start gap-2 shadow-xs"
                  >
                    <span className="text-emerald-700 font-bold shrink-0">#{idx + 1}</span>
                    <span className="text-slate-800">{entry.message}</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <button
            onClick={() => setShowJsonReport(!showJsonReport)}
            className="w-full px-4 py-3 flex items-center justify-between text-left text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-600" />
              <span>Full Cleaning Report JSON</span>
            </div>
            {showJsonReport ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showJsonReport && (
            <div className="p-4 border-t border-slate-200 bg-slate-900 max-h-60 overflow-y-auto font-mono text-xs text-emerald-400 rounded-b-xl">
              <pre>{JSON.stringify(report, null, 2)}</pre>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
