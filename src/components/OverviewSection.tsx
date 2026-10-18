import React, { useState } from 'react';
import { Table, Search, AlertTriangle, Layers, Database, CopyCheck, ChevronDown, ChevronUp } from 'lucide-react';
import { DataRow, QualityReportData } from '../types';

interface OverviewSectionProps {
  data: DataRow[];
  columns: string[];
  report: QualityReportData;
}

export const OverviewSection: React.FC<OverviewSectionProps> = ({ data, columns, report }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [page, setPage] = useState(0);
  const pageSize = 8;

  const filteredData = data.filter((row) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return columns.some((col) => String(row[col] ?? '').toLowerCase().includes(term));
  });

  const totalPages = Math.ceil(filteredData.length / pageSize);
  const displayedRows = filteredData.slice(page * pageSize, (page + 1) * pageSize);

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              1
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Dataset Overview</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Quick summary of rows, columns, missing values, and duplicate records
          </p>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-5">
        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Rows</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {report.totalRows.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">Records in file</p>
        </div>

        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Total Columns</span>
            <Database className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {report.totalColumns.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5 truncate">{columns.join(', ')}</p>
        </div>

        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Missing Cells</span>
            <AlertTriangle className={`w-4 h-4 ${report.missingCells > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-1.5">
            <span>{report.missingCells.toLocaleString()}</span>
            <span className="text-xs font-medium text-slate-500">({report.missingPercentage}%)</span>
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {report.missingCells === 0 ? 'No empty cells' : 'Needs handling / filling'}
          </p>
        </div>

        <div className="bg-slate-50/70 border border-slate-200 rounded-xl p-3.5 sm:p-4">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium uppercase tracking-wider">Duplicate Rows</span>
            <CopyCheck className={`w-4 h-4 ${report.duplicateRows > 0 ? 'text-amber-500' : 'text-emerald-500'}`} />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            {report.duplicateRows.toLocaleString()}
          </div>
          <p className="text-[11px] text-slate-500 mt-0.5">
            {report.duplicateRows === 0 ? 'All rows unique' : 'Exact match rows'}
          </p>
        </div>
      </div>

      {/* Dataset Preview Table */}
      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Table className="w-4 h-4 text-emerald-600" />
            <span className="text-xs sm:text-sm font-bold text-slate-800">Original Dataset Preview</span>
            <span className="text-xs text-slate-500 font-mono">({data.length} rows)</span>
          </div>

          <div className="flex items-center gap-2 self-stretch sm:self-auto justify-between">
            <div className="relative flex-1 sm:flex-initial">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(0);
                }}
                placeholder="Search rows..."
                className="pl-8 pr-3 py-1 bg-white border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-emerald-500 w-full sm:w-44 shadow-xs"
              />
            </div>

            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="p-1.5 hover:bg-slate-200 rounded-md text-slate-500 transition-colors"
              title={isExpanded ? 'Collapse preview' : 'Expand preview'}
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {isExpanded && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
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
                <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                  {displayedRows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length + 1} className="py-6 text-center text-slate-500">
                        No rows found matching search filter.
                      </td>
                    </tr>
                  ) : (
                    displayedRows.map((row, idx) => {
                      const absoluteIdx = page * pageSize + idx;
                      const isDup = report.duplicateRowIndices.includes(absoluteIdx);

                      return (
                        <tr
                          key={idx}
                          className={`hover:bg-slate-50 transition-colors ${
                            isDup ? 'bg-amber-50/60' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 text-center text-slate-500 border-r border-slate-200">
                            {absoluteIdx + 1}
                          </td>
                          {columns.map((col) => {
                            const val = row[col];
                            const isEmpty = val === null || val === undefined || String(val).trim() === '';
                            const isAgeAnomaly =
                              col.toLowerCase() === 'age' &&
                              !isEmpty &&
                              (Number(val) < 0 || Number(val) > 100);

                            return (
                              <td key={col} className="py-2.5 px-4 text-slate-800 truncate max-w-xs">
                                {isEmpty ? (
                                  <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-sans font-bold bg-rose-50 text-rose-700 border border-rose-200">
                                    NULL
                                  </span>
                                ) : isAgeAnomaly ? (
                                  <span className="inline-flex items-center gap-1 text-amber-800 font-semibold bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                    {String(val)} <span className="text-[10px] font-sans text-amber-600">(invalid)</span>
                                  </span>
                                ) : (
                                  String(val)
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
                  Showing {page * pageSize + 1}–{Math.min((page + 1) * pageSize, filteredData.length)} of{' '}
                  {filteredData.length}
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
          </>
        )}
      </div>
    </section>
  );
};
