import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BackupData, BackupImportResult } from '../types';
import {
  Download,
  Upload,
  X,
  CheckCircle2,
  AlertTriangle,
  FileJson,
  Database,
  FileText,
  Truck,
  Package,
  Users,
  Building2,
  Copy,
  Check,
  RefreshCw,
} from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const BackupRestoreModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const {
    company,
    clients,
    products,
    bills,
    challans,
    exportBackup,
    importBackup,
    resetToSampleData,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedPreview, setParsedPreview] = useState<BackupData | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('replace');
  const [importResult, setImportResult] = useState<BackupImportResult | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    setParseError(null);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);

        // Sanitize preview
        const preview: BackupData = {
          version: parsed.version || '1.0',
          exportedAt: parsed.exportedAt || new Date().toISOString(),
          appName: parsed.appName || 'M.A. TECH ENTERPRISE Backup',
          company: parsed.company || company,
          clients: Array.isArray(parsed.clients) ? parsed.clients : [],
          products: Array.isArray(parsed.products) ? parsed.products : [],
          bills: Array.isArray(parsed.bills) ? parsed.bills : [],
          challans: Array.isArray(parsed.challans) ? parsed.challans : [],
          stats: {
            totalBills: Array.isArray(parsed.bills) ? parsed.bills.length : 0,
            totalChallans: Array.isArray(parsed.challans) ? parsed.challans.length : 0,
            totalProducts: Array.isArray(parsed.products) ? parsed.products.length : 0,
            totalClients: Array.isArray(parsed.clients) ? parsed.clients.length : 0,
          },
        };

        if (
          preview.bills.length === 0 &&
          preview.challans.length === 0 &&
          preview.products.length === 0 &&
          preview.clients.length === 0 &&
          !parsed.company
        ) {
          setParseError('The uploaded JSON does not appear to contain valid M.A. Tech Enterprise billing data.');
          setParsedPreview(null);
        } else {
          setParsedPreview(preview);
        }
      } catch (err: any) {
        setParseError(`Invalid JSON format: ${err?.message || 'Syntax error'}`);
        setParsedPreview(null);
      }
    };
    reader.readAsText(file);
  };

  const handleExecuteRestore = () => {
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const result = importBackup(text, importMode);
      setImportResult(result);
      if (result.success) {
        setSelectedFile(null);
        setParsedPreview(null);
      }
    };
    reader.readAsText(selectedFile);
  };

  const handleCopyJSON = () => {
    const data: BackupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      appName: 'M.A. TECH ENTERPRISE - Billing & Inventory Suite',
      stats: {
        totalBills: bills.length,
        totalChallans: challans.length,
        totalProducts: products.length,
        totalClients: clients.length,
      },
      company,
      clients,
      products,
      bills,
      challans,
    };
    navigator.clipboard.writeText(JSON.stringify(data, null, 2));
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleDownloadBackup = () => {
    setIsExporting(true);
    exportBackup();
    setTimeout(() => setIsExporting(false), 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Data Backup & Restore (ডাটা ব্যাকআপ ও রিস্টোর)
              </h2>
              <p className="text-xs text-slate-500">
                Export and import all bills, challans, products, clients and settings as a JSON file
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-white px-6 pt-3 gap-4">
          <button
            onClick={() => {
              setActiveTab('export');
              setImportResult(null);
            }}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'export'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Export Backup (ডাটা ডাউনলোড)</span>
          </button>

          <button
            onClick={() => {
              setActiveTab('import');
              setImportResult(null);
            }}
            className={`flex items-center gap-2 pb-3 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'import'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Upload className="w-4 h-4" />
            <span>Import & Restore (রিস্টোর করুন)</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          {activeTab === 'export' ? (
            <div className="space-y-5">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Current Database Summary
                  </span>
                  <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Ready to Export
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <FileText className="w-4 h-4 text-indigo-600 mx-auto mb-1" />
                    <div className="text-base font-bold text-slate-900 font-mono-numbers">
                      {bills.length}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Invoices (বিল)</div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <Truck className="w-4 h-4 text-sky-600 mx-auto mb-1" />
                    <div className="text-base font-bold text-slate-900 font-mono-numbers">
                      {challans.length}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Challans (চালান)</div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <Package className="w-4 h-4 text-amber-600 mx-auto mb-1" />
                    <div className="text-base font-bold text-slate-900 font-mono-numbers">
                      {products.length}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Products (পণ্য)</div>
                  </div>

                  <div className="p-3 bg-white rounded-lg border border-slate-200 text-center">
                    <Users className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                    <div className="text-base font-bold text-slate-900 font-mono-numbers">
                      {clients.length}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">Clients (গ্রাহক)</div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Shop: <strong>{company.name}</strong></span>
                  </span>
                  <span>Currency: <strong>{company.currencySymbol} ({company.currencyCode})</strong></span>
                </div>
              </div>

              <div className="bg-indigo-50/70 border border-indigo-200/80 rounded-xl p-4 text-xs text-indigo-900 space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <FileJson className="w-4 h-4 text-indigo-600" />
                  <span>Portable JSON Format</span>
                </div>
                <p className="text-indigo-800 text-[11px] leading-relaxed">
                  Your backup file is a standard, unencrypted JSON document. You can save it to Google Drive, email it to yourself, or transfer it to another computer or phone anytime.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDownloadBackup}
                  disabled={isExporting}
                  className="w-full sm:w-2/3 inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md active:scale-98"
                >
                  <Download className="w-4 h-4" />
                  <span>{isExporting ? 'Generating JSON File...' : 'Download JSON Backup (.json)'}</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyJSON}
                  className="w-full sm:w-1/3 inline-flex items-center justify-center gap-1.5 px-3 py-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-xl transition-colors"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span className="text-emerald-700">Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-slate-500" />
                      <span>Copy Raw JSON</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Success Result Banner */}
              {importResult && importResult.success && (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-emerald-950 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-emerald-800">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>Backup Successfully Restored!</span>
                  </div>
                  <p className="text-emerald-900 leading-relaxed font-medium">
                    {importResult.message}
                  </p>
                </div>
              )}

              {/* Error Banner */}
              {(parseError || (importResult && !importResult.success)) && (
                <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-rose-900 text-xs space-y-1">
                  <div className="flex items-center gap-2 font-bold text-rose-700">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Restore Issue</span>
                  </div>
                  <p>{parseError || importResult?.message}</p>
                </div>
              )}

              {/* File Upload Area */}
              <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 rounded-2xl p-6 text-center bg-slate-50/50 hover:bg-indigo-50/30 transition-colors">
                <input
                  type="file"
                  id="backup-file-input"
                  accept=".json,application/json"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <label
                  htmlFor="backup-file-input"
                  className="cursor-pointer flex flex-col items-center justify-center space-y-2"
                >
                  <div className="w-12 h-12 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-600 hover:underline">
                      Click to choose a .json backup file
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Select previously exported MA_TECH_ENTERPRISE_Backup.json file
                    </p>
                  </div>
                </label>
              </div>

              {/* Parsed JSON Preview */}
              {parsedPreview && (
                <div className="bg-white border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-xs">
                    <div className="font-bold text-slate-900">
                      Backup File Content Preview:
                    </div>
                    <span className="text-slate-500 text-[11px] font-mono">
                      Exported: {new Date(parsedPreview.exportedAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-50 text-center border border-slate-200">
                      <span className="font-bold text-indigo-600 text-sm font-mono-numbers block">
                        {parsedPreview.bills.length}
                      </span>
                      <span className="text-[10px] text-slate-500">Invoices</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 text-center border border-slate-200">
                      <span className="font-bold text-sky-600 text-sm font-mono-numbers block">
                        {parsedPreview.challans.length}
                      </span>
                      <span className="text-[10px] text-slate-500">Challans</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 text-center border border-slate-200">
                      <span className="font-bold text-amber-600 text-sm font-mono-numbers block">
                        {parsedPreview.products.length}
                      </span>
                      <span className="text-[10px] text-slate-500">Products</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-50 text-center border border-slate-200">
                      <span className="font-bold text-emerald-600 text-sm font-mono-numbers block">
                        {parsedPreview.clients.length}
                      </span>
                      <span className="text-[10px] text-slate-500">Clients</span>
                    </div>
                  </div>

                  {/* Mode Selector */}
                  <div className="pt-2 border-t border-slate-100">
                    <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                      Restore Mode (রিস্টোর অপশন):
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      <label
                        className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-colors ${
                          importMode === 'replace'
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="replace"
                          checked={importMode === 'replace'}
                          onChange={() => setImportMode('replace')}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div>
                          <div className="font-bold">Replace All Data (সম্পূর্ণ প্রতিস্থাপন)</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Overwrites current local database with backup snapshot
                          </div>
                        </div>
                      </label>

                      <label
                        className={`p-3 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-colors ${
                          importMode === 'merge'
                            ? 'border-indigo-600 bg-indigo-50/50 text-indigo-950 font-medium'
                            : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <input
                          type="radio"
                          name="importMode"
                          value="merge"
                          checked={importMode === 'merge'}
                          onChange={() => setImportMode('merge')}
                          className="mt-0.5 text-indigo-600"
                        />
                        <div>
                          <div className="font-bold">Merge with Existing (যুক্ত করুন)</div>
                          <div className="text-[10px] text-slate-500 mt-0.5">
                            Appends missing records without deleting current items
                          </div>
                        </div>
                      </label>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleExecuteRestore}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl transition-colors shadow-md mt-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Apply & Restore Data Now</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <button
            type="button"
            onClick={() => {
              if (
                confirm(
                  'Are you sure you want to reset all data back to the default M.A. TECH ENTERPRISE initial sample dataset?'
                )
              ) {
                resetToSampleData();
                onClose();
              }
            }}
            className="text-rose-600 hover:text-rose-800 hover:underline inline-flex items-center gap-1 font-medium"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset to Default Shop Catalog</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 font-medium text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
