import React, { useState, useEffect, useRef } from 'react';
import Papa from 'papaparse';
import confetti from 'canvas-confetti';
import { Header } from './components/Header';
import { DatasetSelector } from './components/DatasetSelector';
import { OverviewSection } from './components/OverviewSection';
import { QualityReportSection } from './components/QualityReportSection';
import { CleaningControlsSection } from './components/CleaningControlsSection';
import { CleaningResultsSection } from './components/CleaningResultsSection';
import { SAMPLE_DATASETS } from './data/sampleDatasets';
import { CleaningSettings, DataRow, QualityReportData } from './types';
import { analyzeDataset } from './engine/dataQuality';
import { cleanDataset, CleanDatasetResult } from './engine/cleaningEngine';
import { FileSpreadsheet } from 'lucide-react';

export default function App() {
  const [datasetName, setDatasetName] = useState<string>('messy_dataset.csv');
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [qualityReport, setQualityReport] = useState<QualityReportData | null>(null);

  const [settings, setSettings] = useState<CleaningSettings>({
    removeDuplicates: true,
    standardizeText: true,
    missingStrategy: 'keep',
    flagInvalidAges: true,
    clampInvalidAges: false,
  });

  const [cleanedResult, setCleanedResult] = useState<CleanDatasetResult | null>(null);
  const [isCleaning, setIsCleaning] = useState<boolean>(false);
  const resultsRef = useRef<HTMLDivElement>(null);

  // Initialize with original sample dataset from Maham's repository
  useEffect(() => {
    loadInitialSample();
  }, []);

  const loadInitialSample = () => {
    const defaultSample = SAMPLE_DATASETS[0];
    Papa.parse(defaultSample.csvContent, {
      header: true,
      dynamicTyping: false,
      skipEmptyLines: 'greedy',
      complete: (results) => {
        const rows = results.data as DataRow[];
        const cols = results.meta.fields || Object.keys(rows[0] || {});
        setData(rows);
        setColumns(cols);
        setDatasetName(defaultSample.filename);
        setCleanedResult(null);
      },
    });
  };

  // Re-analyze dataset whenever data or columns change
  useEffect(() => {
    if (data.length > 0 && columns.length > 0) {
      const report = analyzeDataset(data, columns);
      setQualityReport(report);
    }
  }, [data, columns]);

  const handleDatasetLoaded = (newData: DataRow[], newCols: string[], newName: string) => {
    setData(newData);
    setColumns(newCols);
    setDatasetName(newName);
    setCleanedResult(null);
  };

  const handleRunCleaning = () => {
    setIsCleaning(true);

    setTimeout(() => {
      const result = cleanDataset(data, columns, settings);
      setCleanedResult(result);
      setIsCleaning(false);

      // Confetti celebration
      try {
        confetti({
          particleCount: 45,
          spread: 60,
          origin: { y: 0.8 },
          colors: ['#059669', '#10b981', '#0d9488', '#2563eb'],
        });
      } catch (e) {
        // ignore if confetti is disabled
      }

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 250);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans antialiased">
      <Header onResetToSample={loadInitialSample} datasetName={datasetName} />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Simple & clear banner */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Data Cleaning Assistant
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
                Inspect, sanitize, and format any CSV or Excel file. Automatically removes duplicate rows,
                standardizes text capitalization, handles missing values, and flags out-of-range anomalies.
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
              <span className="text-xs px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium flex items-center gap-1.5">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                All CSV & Excel Files Supported
              </span>
            </div>
          </div>
        </div>

        {/* Upload & Dataset Selector */}
        <DatasetSelector
          onDatasetLoaded={handleDatasetLoaded}
          currentDatasetName={datasetName}
        />

        {qualityReport && (
          <>
            {/* Step 1: Overview */}
            <OverviewSection data={data} columns={columns} report={qualityReport} />

            {/* Step 2: Quality Report */}
            <QualityReportSection report={qualityReport} data={data} columns={columns} />

            {/* Step 3: Configure Cleaning */}
            <CleaningControlsSection
              settings={settings}
              onSettingsChange={setSettings}
              onRunCleaning={handleRunCleaning}
              report={qualityReport}
              isCleaning={isCleaning}
            />

            {/* Step 4: Results & Downloads */}
            {cleanedResult && (
              <div ref={resultsRef}>
                <CleaningResultsSection
                  originalData={data}
                  cleanedData={cleanedResult.cleanedData}
                  columns={columns}
                  report={cleanedResult.report}
                  changedCells={cleanedResult.changedCells}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Clean Footer */}
      <footer className="mt-12 sm:mt-16 border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">AI Data Cleaning Assistant</span>
            <span>•</span>
            <span>Created by Maham Yasir</span>
          </div>
          <div className="text-slate-400">
            <span>Fast, browser-based tabular data cleaning</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
