import React from 'react';
import { Sliders, Check, Play, AlertCircle, Wand2, RefreshCw } from 'lucide-react';
import { CleaningSettings, MissingStrategy, QualityReportData } from '../types';
import { KNOWN_ACRONYMS } from '../engine/cleaningEngine';

interface CleaningControlsSectionProps {
  settings: CleaningSettings;
  onSettingsChange: (settings: CleaningSettings) => void;
  onRunCleaning: () => void;
  report: QualityReportData;
  isCleaning: boolean;
}

export const CleaningControlsSection: React.FC<CleaningControlsSectionProps> = ({
  settings,
  onSettingsChange,
  onRunCleaning,
  report,
  isCleaning,
}) => {
  const updateSetting = <K extends keyof CleaningSettings>(key: K, value: CleaningSettings[K]) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const applyRecommended = () => {
    onSettingsChange({
      removeDuplicates: report.duplicateRows > 0,
      standardizeText: true,
      missingStrategy: report.missingCells > 0 ? 'fill_numeric_median' : 'keep',
      flagInvalidAges: true,
      clampInvalidAges: false,
    });
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
              3
            </span>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight">Configure Cleaning Options</h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Choose which automatic cleaning operations to apply to your dataset
          </p>
        </div>

        {/* Smart recommendation button */}
        <button
          onClick={applyRecommended}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 hover:bg-emerald-100 text-xs font-semibold transition-all shadow-xs cursor-pointer self-start sm:self-auto"
        >
          <Wand2 className="w-3.5 h-3.5 text-emerald-700" />
          <span>Auto-Select Recommended Options</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6">
        {/* Left Column: Toggles */}
        <div className="space-y-3 bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-emerald-600" />
            Standard Cleaning Rules
          </h3>

          {/* Toggle: Remove Duplicates */}
          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 cursor-pointer transition-colors shadow-xs">
            <input
              type="checkbox"
              checked={settings.removeDuplicates}
              onChange={(e) => updateSetting('removeDuplicates', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-900">Remove exact duplicate rows</span>
                {report.duplicateRows > 0 && (
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-mono font-bold">
                    {report.duplicateRows} detected
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Automatically deletes identical rows so each record is unique.
              </p>
            </div>
          </label>

          {/* Toggle: Standardize Text */}
          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 cursor-pointer transition-colors shadow-xs">
            <input
              type="checkbox"
              checked={settings.standardizeText}
              onChange={(e) => updateSetting('standardizeText', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs font-bold text-slate-900">
                Trim extra spaces & capitalize words (Title Case)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Removes double spaces and cleans casing while keeping standard acronyms:
              </p>
              <div className="flex flex-wrap gap-1 mt-1.5">
                {Object.values(KNOWN_ACRONYMS).slice(0, 8).map((acr) => (
                  <span
                    key={acr}
                    className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 rounded font-mono font-medium"
                  >
                    {acr}
                  </span>
                ))}
              </div>
            </div>
          </label>

          {/* Toggle: Flag invalid ages */}
          <label className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 cursor-pointer transition-colors shadow-xs">
            <input
              type="checkbox"
              checked={settings.flagInvalidAges}
              onChange={(e) => updateSetting('flagInvalidAges', e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 cursor-pointer"
            />
            <div className="flex-1">
              <span className="text-xs font-bold text-slate-900">
                Validate and flag abnormal age values (0–100)
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Flags impossible ages (like negative numbers or 100+) in any "Age" column.
              </p>
            </div>
          </label>
        </div>

        {/* Right Column: Missing Values Strategy */}
        <div className="space-y-3 bg-slate-50/70 border border-slate-200 rounded-xl p-4 sm:p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Missing Value Handling Strategy
            </h3>

            <p className="text-xs text-slate-500 mb-3">
              How should empty cells be handled across this dataset?
            </p>

            <div className="space-y-2">
              {[
                {
                  id: 'keep',
                  label: 'Keep missing values',
                  desc: 'Leave blank cells as they are without modifying them.',
                },
                {
                  id: 'drop_rows',
                  label: 'Drop rows with missing values',
                  desc: 'Removes any row that contains one or more empty cells.',
                },
                {
                  id: 'fill_numeric_median',
                  label: 'Fill numeric missing values with median',
                  desc: 'Calculates the middle value of numeric columns to fill gaps.',
                },
                {
                  id: 'fill_text_unknown',
                  label: 'Fill missing text with "Unknown"',
                  desc: 'Replaces blank text columns with a clean "Unknown" label.',
                },
                {
                  id: 'fill_numeric_mean',
                  label: 'Fill numeric missing values with average (mean)',
                  desc: 'Uses the column average to fill blank numeric cells.',
                },
              ].map((opt) => {
                const isSelected = settings.missingStrategy === opt.id;
                return (
                  <label
                    key={opt.id}
                    onClick={() => updateSetting('missingStrategy', opt.id as MissingStrategy)}
                    className={`flex items-start gap-3 p-2.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                      isSelected
                        ? 'border-emerald-500 bg-emerald-50/60 text-slate-900 font-semibold'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="missingStrategy"
                      checked={isSelected}
                      onChange={() => updateSetting('missingStrategy', opt.id as MissingStrategy)}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <div>
                      <div className="text-xs font-bold">{opt.label}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">{opt.desc}</div>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <AlertCircle className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>
            Safe: Your original data stays intact in memory; a cleaned copy will be produced.
          </span>
        </div>

        <button
          onClick={onRunCleaning}
          disabled={isCleaning}
          className="w-full sm:w-auto px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          {isCleaning ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" />
              <span>Cleaning Dataset...</span>
            </>
          ) : (
            <>
              <Play className="w-4 h-4 fill-white" />
              <span>Run Data Cleaning</span>
            </>
          )}
        </button>
      </div>
    </section>
  );
};
