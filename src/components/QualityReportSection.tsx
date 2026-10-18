import React, { useState } from 'react';
import { BarChart3, CopyCheck, Code, AlertCircle, CheckCircle, FileText, ShieldAlert } from 'lucide-react';
import { QualityReportData, DataRow } from '../types';

interface QualityReportSectionProps {
  report: QualityReportData;
  data: DataRow[];
  columns: string[];
}

export const QualityReportSection: React.FC<QualityReportSectionProps> = ({
  report,
  data,
  columns,
}) => {
  const [activeTab, setActiveTab] = useState<'missing' | 'duplicates' | 'types' | 'anomalies'>('missing');

  const columnsWithMissing = report.columnReports.filter((c) => c.missingCount > 0);
  const maxMissingCount = Math.max(1, ...report.columnReports.map((c) => c.missingCount));

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              2
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Data Quality Report</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Detailed breakdown of missing values, duplicate records, column types, and formatting
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-5 overflow-x-auto gap-1 sm:gap-2">
        <button
          onClick={() => setActiveTab('missing')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'missing'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Missing Values</span>
          {report.missingCells > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
              {report.missingCells}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('duplicates')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'duplicates'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <CopyCheck className="w-4 h-4" />
          <span>Duplicates</span>
          {report.duplicateRows > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-rose-100 text-rose-800 rounded text-[10px] font-bold">
              {report.duplicateRows}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('types')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'types'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Data Types</span>
          <span className="ml-1 px-1.5 py-0.2 bg-slate-100 text-slate-700 rounded text-[10px]">
            {columns.length}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('anomalies')}
          className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'anomalies'
              ? 'border-emerald-600 text-emerald-700 bg-emerald-50/50'
              : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Formatting & Age Check</span>
          {report.invalidAges.length > 0 && (
            <span className="ml-1 px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded text-[10px] font-bold">
              {report.invalidAges.length}
            </span>
          )}
        </button>
      </div>

      {/* Tab 1: Missing Values */}
      {activeTab === 'missing' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 font-semibold text-xs text-slate-700">
                Column Missing Values
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200">
                    <tr>
                      <th className="py-2 px-3 font-semibold">Column</th>
                      <th className="py-2 px-3 font-semibold">Missing Count</th>
                      <th className="py-2 px-3 font-semibold">Missing %</th>
                      <th className="py-2 px-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                    {report.columnReports.map((col) => (
                      <tr key={col.column} className="hover:bg-slate-50">
                        <td className="py-2.5 px-3 font-bold text-slate-900">{col.column}</td>
                        <td className="py-2.5 px-3">{col.missingCount}</td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-2">
                            <span>{col.missingPercentage}%</span>
                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full ${
                                  col.missingPercentage > 0 ? 'bg-amber-500' : 'bg-emerald-500'
                                }`}
                                style={{ width: `${col.missingPercentage}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="py-2.5 px-3">
                          {col.missingCount === 0 ? (
                            <span className="text-[11px] font-sans text-emerald-700 flex items-center gap-1 font-semibold">
                              <CheckCircle className="w-3.5 h-3.5 text-emerald-600" /> Complete
                            </span>
                          ) : (
                            <span className="text-[11px] font-sans text-amber-700 flex items-center gap-1 font-semibold">
                              <AlertCircle className="w-3.5 h-3.5 text-amber-600" /> Has empty
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Visual Bar Chart */}
            <div className="border border-slate-200 rounded-xl p-4 sm:p-5 bg-slate-50/50 flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-600" />
                  Missing Values Distribution
                </h4>

                {columnsWithMissing.length === 0 ? (
                  <div className="py-8 flex flex-col items-center justify-center text-center">
                    <CheckCircle className="w-8 h-8 text-emerald-600 mb-2" />
                    <p className="text-sm font-bold text-slate-800">No Missing Values</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      All cells in this dataset have complete data.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {columnsWithMissing.map((col) => {
                      const barWidth = Math.round((col.missingCount / maxMissingCount) * 100);
                      return (
                        <div key={col.column} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-slate-700">{col.column}</span>
                            <span className="font-mono text-amber-700 font-bold">
                              {col.missingCount} missing ({col.missingPercentage}%)
                            </span>
                          </div>
                          <div className="h-3.5 bg-slate-200 rounded-md overflow-hidden p-0.5">
                            <div
                              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-sm transition-all duration-500"
                              style={{ width: `${Math.max(8, barWidth)}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <p className="mt-4 pt-3 border-t border-slate-200 text-xs text-slate-500">
                You can remove rows or automatically fill missing cells in Step 3 below.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Duplicates */}
      {activeTab === 'duplicates' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-slate-800">Exact Duplicate Detection</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Checks for rows that have exactly identical values in every column
              </p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xl font-extrabold text-slate-900">{report.duplicateRows}</span>
              <span className="text-xs text-slate-500">duplicate rows</span>
            </div>
          </div>

          {report.duplicateRows > 0 ? (
            <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
              <div className="px-4 py-2.5 bg-amber-50 border-b border-amber-200 font-semibold text-xs text-amber-900 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-700" />
                Detected Duplicate Rows
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-50 text-slate-600 border-b border-slate-200 font-semibold">
                    <tr>
                      <th className="py-2 px-3">Row #</th>
                      {columns.map((c) => (
                        <th key={c} className="py-2 px-3">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {report.duplicateRowIndices.map((rowIdx) => {
                      const row = data[rowIdx];
                      return (
                        <tr key={rowIdx} className="bg-amber-50/50 hover:bg-amber-50">
                          <td className="py-2 px-3 text-amber-900 font-bold">#{rowIdx + 1}</td>
                          {columns.map((c) => (
                            <td key={c} className="py-2 px-3 text-slate-800">{String(row[c] ?? '')}</td>
                          ))}
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center border border-slate-200 rounded-xl bg-slate-50">
              <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800">No Duplicate Rows Found</p>
              <p className="text-xs text-slate-500 mt-0.5">Every row in the dataset is unique.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Data Types */}
      {activeTab === 'types' && (
        <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 font-semibold">
                <tr>
                  <th className="py-3 px-4">Column Name</th>
                  <th className="py-3 px-4">Detected Data Type</th>
                  <th className="py-3 px-4">Populated Values</th>
                  <th className="py-3 px-4">Missing Values</th>
                  <th className="py-3 px-4">Unique Values</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-mono text-slate-800">
                {report.columnReports.map((col) => {
                  const typeBadgeColor =
                    col.inferredType === 'number'
                      ? 'bg-blue-50 text-blue-700 border-blue-200'
                      : col.inferredType === 'date'
                      ? 'bg-purple-50 text-purple-700 border-purple-200'
                      : 'bg-emerald-50 text-emerald-700 border-emerald-200';

                  return (
                    <tr key={col.column} className="hover:bg-slate-50">
                      <td className="py-3 px-4 font-bold text-slate-900">{col.column}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded text-[11px] font-sans font-semibold border ${typeBadgeColor}`}>
                          {col.inferredType.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-4">{col.nonMissingCount} / {col.totalCount}</td>
                      <td className="py-3 px-4 text-slate-500">{col.missingCount}</td>
                      <td className="py-3 px-4 text-slate-500">{col.uniqueValuesCount}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Formatting & Age check */}
      {activeTab === 'anomalies' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Whitespace & Casing Summary */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-emerald-600" />
                Text Formatting Inconsistencies
              </h4>
              <div className="space-y-2 font-mono text-xs">
                {report.columnReports
                  .filter((c) => c.extraSpacesCount > 0 || c.inconsistentCaseCount > 0)
                  .map((c) => (
                    <div key={c.column} className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="flex justify-between font-bold text-slate-900 font-sans mb-1">
                        <span>{c.column}</span>
                      </div>
                      <div className="flex flex-col gap-1 text-[11px] text-slate-600">
                        {c.extraSpacesCount > 0 && (
                          <span className="text-amber-700">
                            • {c.extraSpacesCount} value(s) with extra leading/trailing spaces
                          </span>
                        )}
                        {c.inconsistentCaseCount > 0 && (
                          <span className="text-blue-700">
                            • {c.inconsistentCaseCount} value(s) with non-standard capitalization
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                {report.columnReports.every((c) => c.extraSpacesCount === 0 && c.inconsistentCaseCount === 0) && (
                  <p className="text-slate-500 text-xs py-4 text-center">No formatting issues detected.</p>
                )}
              </div>
            </div>

            {/* Age Validation Box */}
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4 text-amber-600" />
                Age Validation (Range 0 - 100)
              </h4>

              {report.invalidAges.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs text-amber-800 font-medium">
                    Found {report.invalidAges.length} implausible age value(s) outside 0–100:
                  </p>
                  <div className="border border-slate-200 rounded-lg overflow-hidden font-mono text-xs bg-white">
                    <table className="w-full text-left">
                      <thead className="bg-slate-100 text-slate-600 text-[11px]">
                        <tr>
                          <th className="p-2">Row</th>
                          <th className="p-2">Record Name</th>
                          <th className="p-2 text-right">Age Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {report.invalidAges.map((item, idx) => (
                          <tr key={idx} className="bg-amber-50/60">
                            <td className="p-2 text-slate-500">#{item.rowIdx + 1}</td>
                            <td className="p-2 font-bold text-slate-900">{item.name}</td>
                            <td className="p-2 text-right text-rose-700 font-bold">{String(item.age)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center">
                  <CheckCircle className="w-7 h-7 text-emerald-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-700 font-semibold">All ages within expected 0–100 threshold</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
