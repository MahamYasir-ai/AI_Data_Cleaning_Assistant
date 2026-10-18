import React from 'react';
import { RotateCcw, FileSpreadsheet } from 'lucide-react';

interface HeaderProps {
  onResetToSample: () => void;
  datasetName: string;
}

export const Header: React.FC<HeaderProps> = ({ onResetToSample, datasetName }) => {
  return (
    <header className="border-b border-slate-200 bg-white sticky top-0 z-40 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-sm">
            <FileSpreadsheet className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight leading-tight">
              AI Data Cleaning Assistant
            </h1>
            <p className="text-xs text-slate-500">
              Active file: <span className="text-slate-800 font-medium">{datasetName}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={onResetToSample}
            title="Reset to sample dataset"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-600" />
            <span className="hidden sm:inline">Reset to Sample</span>
          </button>
        </div>
      </div>
    </header>
  );
};
