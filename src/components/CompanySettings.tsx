import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CompanyProfile } from '../types';
import { BackupRestoreModal } from './BackupRestoreModal';
import {
  Building2,
  Save,
  Download,
  Upload,
  RefreshCw,
  CheckCircle,
  Smartphone,
  Database,
  FileJson,
} from 'lucide-react';

export const CompanySettings: React.FC = () => {
  const {
    company,
    updateCompany,
    exportBackup,
    importBackup,
    resetToSampleData,
  } = useApp();

  const [form, setForm] = useState<CompanyProfile>({ ...company });
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      if (field === 'currencySymbol') {
        if (value === '৳') updated.currencyCode = 'BDT';
        else if (value === '$') updated.currencyCode = 'USD';
        else if (value === '€') updated.currencyCode = 'EUR';
        else if (value === '£') updated.currencyCode = 'GBP';
        else if (value === '₹') updated.currencyCode = 'INR';
      }
      return updated;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompany(form);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const result = importBackup(content, 'replace');
      if (result.success) {
        setImportStatus(result.message);
        setTimeout(() => setImportStatus(null), 4000);
      } else {
        setImportStatus(result.message || 'Failed to parse backup file. Please check JSON format.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Company Profile & Preferences
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure registered Bangladesh business details, BIN, e-TIN, bank routing, and MFS payment channels
          </p>
        </div>

        <button
          type="button"
          onClick={handleSave}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          {savedSuccess ? <CheckCircle className="w-4 h-4 text-emerald-300" /> : <Save className="w-4 h-4" />}
          <span>{savedSuccess ? 'Changes Saved!' : 'Save Settings'}</span>
        </button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Business Identity */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Building2 className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Business Particulars (প্রতিষ্ঠান বিবরণী)
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company / Trade Name (প্রতিষ্ঠানের নাম) *
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => handleChange('name', e.target.value)}
                required
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Tagline / Business Subtitle
              </label>
              <input
                type="text"
                value={form.tagline}
                onChange={(e) => handleChange('tagline', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>


            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Taxpayer Identification Number (e-TIN কর শনাক্তকরণ নং)
              </label>
              <input
                type="text"
                value={form.tin || form.pan || ''}
                onChange={(e) => {
                  handleChange('tin', e.target.value);
                  handleChange('pan', e.target.value);
                }}
                placeholder="481928371902"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number (হটলাইন)
              </label>
              <input
                type="text"
                value={form.phone}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="01568799017"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Business Number (হোয়াটসঅ্যাপ)
              </label>
              <input
                type="text"
                value={form.whatsapp || ''}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                placeholder="01628491979"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none text-emerald-700 font-semibold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shop Logo (লোকাল বা কাস্টম লোগো)
              </label>
              <div className="flex items-center gap-3">
                {form.logoUrl && (
                  <img
                    src={form.logoUrl}
                    alt="Logo preview"
                    className="w-10 h-10 object-contain rounded border border-slate-200 bg-slate-50 p-1"
                  />
                )}
                <label className="cursor-pointer px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-300 transition-colors">
                  Upload Logo
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          handleChange('logoUrl', evt.target?.result as string);
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="text-xs pt-2">
            <label className="block font-semibold text-slate-700 mb-1">
              Registered Office Address (ঠিকানা)
            </label>
            <textarea
              rows={2}
              value={form.address}
              onChange={(e) => handleChange('address', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">City / District</label>
              <input
                type="text"
                value={form.city}
                onChange={(e) => handleChange('city', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Division (বিভাগ)</label>
              <input
                type="text"
                value={form.state}
                onChange={(e) => handleChange('state', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={form.pincode}
                onChange={(e) => handleChange('pincode', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Country</label>
              <input
                type="text"
                value={form.country}
                onChange={(e) => handleChange('country', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Currency & Terms */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Currency Symbol (মুদ্রা)
              </label>
              <select
                value={form.currencySymbol}
                onChange={(e) => handleChange('currencySymbol', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white font-mono-numbers focus:outline-none font-bold"
              >
                <option value="৳">৳ (Bangladeshi Taka - BDT)</option>
                <option value="$">$ (US Dollar - USD)</option>
                <option value="€">€ (Euro - EUR)</option>
                <option value="£">£ (British Pound - GBP)</option>
                <option value="₹">₹ (Indian Rupee - INR)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Signatory Title (স্বাক্ষরকারীর পদবী)
              </label>
              <input
                type="text"
                value={form.signatureTitle}
                onChange={(e) => handleChange('signatureTitle', e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
              />
            </div>
          </div>

          <div className="text-xs">
            <label className="block font-semibold text-slate-700 mb-1">
              Default Terms & Conditions (বিল ও চালানের শর্তাবলী)
            </label>
            <textarea
              rows={4}
              value={form.termsAndConditions}
              onChange={(e) => handleChange('termsAndConditions', e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
            />
          </div>
        </div>

        {/* Data Persistence, Backup & Reset */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
            Data Portability, Backups & Reset
          </h3>

          <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 font-bold text-slate-900 text-xs">
                <Database className="w-4 h-4 text-indigo-600" />
                <span>Full JSON Backup & Restore Center</span>
              </div>
              <p className="text-[11px] text-slate-600">
                Safely download your complete shop data (invoices, challans, items, clients) or restore from an existing JSON backup.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setIsBackupModalOpen(true)}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs whitespace-nowrap"
            >
              <Database className="w-4 h-4" />
              <span>Open Backup & Restore</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <button
              type="button"
              onClick={exportBackup}
              className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold transition-colors"
            >
              <Download className="w-4 h-4 text-slate-600" />
              <span>Quick Export JSON</span>
            </button>

            <label className="flex items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold cursor-pointer transition-colors">
              <Upload className="w-4 h-4 text-slate-600" />
              <span>Quick Restore JSON</span>
              <input
                type="file"
                accept=".json,application/json"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>

            <button
              type="button"
              onClick={() => {
                if (
                  confirm(
                    'Reset all invoices, challans, items, and settings to the default M.A. TECH ENTERPRISE dataset?'
                  )
                ) {
                  resetToSampleData();
                }
              }}
              className="flex items-center justify-center gap-2 p-3 rounded-lg border border-rose-200 hover:bg-rose-50 text-rose-700 font-semibold transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset to Sample Data</span>
            </button>
          </div>

          {importStatus && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-900 font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{importStatus}</span>
            </div>
          )}
        </div>
      </form>

      {/* Backup & Restore Interactive Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};
