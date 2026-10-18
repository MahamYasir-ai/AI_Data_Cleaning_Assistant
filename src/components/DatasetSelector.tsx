import React, { useRef, useState } from 'react';
import { UploadCloud, FileSpreadsheet, AlertCircle } from 'lucide-react';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { SAMPLE_DATASETS, SamplePreset } from '../data/sampleDatasets';
import { DataRow } from '../types';

interface DatasetSelectorProps {
  onDatasetLoaded: (data: DataRow[], columns: string[], name: string) => void;
  currentDatasetName: string;
}

export const DatasetSelector: React.FC<DatasetSelectorProps> = ({
  onDatasetLoaded,
  currentDatasetName,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleProcessCSV = (csvText: string, name: string) => {
    try {
      Papa.parse(csvText, {
        header: true,
        dynamicTyping: false,
        skipEmptyLines: 'greedy',
        complete: (results) => {
          if (!results.data || results.data.length === 0) {
            setUploadError('The selected file contains no data rows.');
            return;
          }
          const rawRows = results.data as DataRow[];
          const columns = results.meta.fields || Object.keys(rawRows[0] || {});
          if (columns.length === 0) {
            setUploadError('The file contains no columns.');
            return;
          }
          setUploadError(null);
          onDatasetLoaded(rawRows, columns, name);
        },
        error: (err: any) => {
          setUploadError(`Failed to parse CSV: ${err.message}`);
        }
      });
    } catch (err: any) {
      setUploadError(`Error processing CSV: ${err.message}`);
    }
  };

  const handleProcessExcel = (buffer: ArrayBuffer, name: string) => {
    try {
      const workbook = XLSX.read(buffer, { type: 'array' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: null }) as DataRow[];

      if (jsonData.length === 0) {
        setUploadError('The Excel sheet contains no data rows.');
        return;
      }
      const columns = Object.keys(jsonData[0] || {});
      setUploadError(null);
      onDatasetLoaded(jsonData, columns, name);
    } catch (err: any) {
      setUploadError(`Failed to parse Excel file: ${err.message}`);
    }
  };

  const handleFileChange = (file: File) => {
    setUploadError(null);
    const fileName = file.name;
    const isCsv = fileName.toLowerCase().endsWith('.csv');
    const isXlsx = fileName.toLowerCase().endsWith('.xlsx') || fileName.toLowerCase().endsWith('.xls');

    if (!isCsv && !isXlsx) {
      setUploadError('Please select a valid CSV (.csv) or Excel (.xlsx, .xls) file.');
      return;
    }

    const reader = new FileReader();
    if (isCsv) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        handleProcessCSV(text, fileName);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        handleProcessExcel(buffer, fileName);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const loadPreset = (preset: SamplePreset) => {
    handleProcessCSV(preset.csvContent, preset.filename);
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileSpreadsheet className="w-5 h-5 text-emerald-600" />
            Upload Any CSV or Excel File
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Works with any tabular dataset: sales, staff, survey, customers, finances, inventory, or logs
          </p>
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium">Or test with:</span>
          {SAMPLE_DATASETS.map((preset) => {
            const isSelected = currentDatasetName === preset.filename;
            return (
              <button
                key={preset.id}
                onClick={() => loadPreset(preset)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300 font-semibold shadow-xs'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900'
                }`}
                title={preset.description}
              >
                {preset.name.replace('Sample Dataset (', '').replace(')', '')}
              </button>
            );
          })}
        </div>
      </div>

      {/* Drag & drop upload box */}
      <div className="mt-4">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-5 sm:p-6 text-center cursor-pointer transition-all flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isDragging
              ? 'border-emerald-500 bg-emerald-50/60'
              : 'border-slate-300 hover:border-emerald-500 bg-slate-50/70 hover:bg-emerald-50/20'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileChange(e.target.files[0]);
              }
            }}
            accept=".csv, .xlsx, .xls"
            className="hidden"
          />

          <div className="flex flex-col sm:flex-row items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-emerald-600 shrink-0">
              <UploadCloud className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-800">
                Click to browse or drop your CSV or Excel file here
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                Supports <span className="font-semibold text-slate-700">.csv</span>, <span className="font-semibold text-slate-700">.xlsx</span>, and <span className="font-semibold text-slate-700">.xls</span> (processed securely in your browser)
              </p>
            </div>
          </div>

          <div className="shrink-0">
            <span className="text-xs px-3 py-1.5 rounded-lg bg-white text-slate-700 border border-slate-200 shadow-xs font-mono">
              Loaded: {currentDatasetName}
            </span>
          </div>
        </div>

        {uploadError && (
          <div className="mt-3 flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{uploadError}</span>
          </div>
        )}
      </div>
    </div>
  );
};
