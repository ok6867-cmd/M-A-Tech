import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/calculations';
import { BackupRestoreModal } from './BackupRestoreModal';
import {
  FileText,
  Truck,
  Plus,
  ArrowRight,
  Eye,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ShieldCheck,
  FileSpreadsheet,
  Database,
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const {
    bills,
    challans,
    company,
    setActiveTab,
    setEditingBill,
    setEditingChallan,
    setPreviewDoc,
    convertChallanToBill,
  } = useApp();

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Metrics
  const totalRevenue = bills.reduce((acc, b) => acc + b.grandTotal, 0);
  const totalCollected = bills.reduce((acc, b) => acc + b.amountPaid, 0);
  const totalOutstanding = bills.reduce((acc, b) => acc + b.balanceDue, 0);
  const overdueBills = bills.filter((b) => b.paymentStatus === 'overdue');
  const activeChallans = challans.filter(
    (c) => c.status === 'dispatched' || c.status === 'pending'
  );

  const recentBills = bills.slice(0, 5);
  const recentChallans = challans.slice(0, 5);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Shop Identity & Contact Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 text-white shadow-md border border-slate-700/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          {company.logoUrl ? (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-xl bg-white/95 p-1.5 shadow-md flex-shrink-0"
            />
          ) : (
            <div className="w-16 h-16 rounded-xl bg-white flex items-center justify-center p-2 flex-shrink-0">
              <FileSpreadsheet className="w-10 h-10 text-indigo-600" />
            </div>
          )}
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-semibold tracking-wide border border-emerald-500/30">
              <span>● Shop Online & In-Store Billing</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
              {company.name}
            </h1>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              📍 {company.address}, {company.city} - {company.pincode}
            </p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs">
              <span className="text-slate-300">
                📞 Hotline: <strong className="text-white font-mono-numbers">{company.phone}</strong>
              </span>
              {company.whatsapp && (
                <a
                  href={`https://wa.me/88${company.whatsapp.replace(/[^0-9]/g, '').replace(/^88/, '')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-300 hover:text-emerald-200 font-semibold flex items-center gap-1 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-600/40"
                >
                  <span>💬 WhatsApp: {company.whatsapp}</span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setIsBackupModalOpen(true)}
            className="inline-flex items-center justify-center gap-1.5 px-3 py-2.5 text-xs font-bold text-slate-200 bg-slate-800/80 hover:bg-slate-700 hover:text-white rounded-xl transition-all border border-slate-700 whitespace-nowrap"
            title="Export or Restore JSON Database"
          >
            <Database className="w-4 h-4 text-indigo-400" />
            <span>Backup (JSON)</span>
          </button>
          <button
            onClick={() => {
              setEditingChallan(null);
              setActiveTab('new-challan');
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-900 bg-white hover:bg-slate-100 rounded-xl transition-all shadow-sm whitespace-nowrap"
          >
            <Truck className="w-4 h-4 text-indigo-600" />
            <span>+ New Challan</span>
          </button>
          <button
            onClick={() => {
              setEditingBill(null);
              setActiveTab('new-bill');
            }}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-all shadow-sm whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            <span>+ New Bill</span>
          </button>
        </div>
      </div>

      {/* Category Shortcuts */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
            📹
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">CCTV Cameras</div>
            <div className="text-[11px] text-slate-500">Hikvision, Dahua, DVR</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
            💻
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Computer Accessories</div>
            <div className="text-[11px] text-slate-500">SSD, Monitors, Mice</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
            📱
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Phone Accessories</div>
            <div className="text-[11px] text-slate-500">Fast Chargers, Cables</div>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          className="p-3.5 bg-white rounded-xl border border-slate-200 hover:border-indigo-400 hover:shadow-xs transition-all text-left group flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-lg group-hover:scale-105 transition-transform">
            🌐
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Networking & Spares</div>
            <div className="text-[11px] text-slate-500">Cat6 Cable, Routers</div>
          </div>
        </button>
      </div>

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Total Invoiced
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-2">
            {formatCurrency(totalRevenue, company.currencySymbol)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            From {bills.length} generated tax bills
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Collected Payments
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-emerald-600 font-mono-numbers mt-2">
            {formatCurrency(totalCollected, company.currencySymbol)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Realized in bank account
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Pending Collections
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-amber-600 font-mono-numbers mt-2">
            {formatCurrency(totalOutstanding, company.currencySymbol)}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Awaiting client remittance
          </span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              Active Challans
            </span>
            <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
              <Truck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-900 font-mono-numbers mt-2">
            {activeChallans.length}
          </div>
          <span className="text-xs text-slate-500 mt-1 block">
            Consignments currently in transit
          </span>
        </div>
      </div>

      {/* Overdue Warning Callout if any */}
      {overdueBills.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 p-4 rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            <div>
              <h4 className="text-xs font-bold text-rose-900">
                {overdueBills.length} Invoice{overdueBills.length > 1 ? 's' : ''} Overdue for Payment
              </h4>
              <p className="text-xs text-rose-700 mt-0.5">
                Total overdue balance:{' '}
                <strong className="font-mono-numbers">
                  {formatCurrency(
                    overdueBills.reduce((acc, b) => acc + b.balanceDue, 0),
                    company.currencySymbol
                  )}
                </strong>
                . Follow up with clients to expedite payments.
              </p>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('bills')}
            className="px-3 py-1.5 text-xs font-semibold text-rose-800 bg-white border border-rose-300 rounded-lg hover:bg-rose-100 transition-colors whitespace-nowrap shadow-xs"
          >
            Review Overdue
          </button>
        </div>
      )}

      {/* Dual Tables: Recent Invoices & Recent Delivery Challans */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Invoices Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Invoices</h3>
            </div>
            <button
              onClick={() => setActiveTab('bills')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentBills.map((b) => (
              <div
                key={b.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono-numbers text-xs">
                      {b.billNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {b.clientDetails.company || b.clientDetails.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Date: {b.billDate} · Due: {b.dueDate}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono-numbers font-bold text-slate-900 text-xs">
                      {formatCurrency(b.grandTotal, company.currencySymbol)}
                    </div>
                    <span
                      className={`text-[10px] font-semibold ${
                        b.paymentStatus === 'paid'
                          ? 'text-emerald-700'
                          : b.paymentStatus === 'overdue'
                          ? 'text-rose-700'
                          : 'text-amber-700'
                      }`}
                    >
                      {b.paymentStatus.toUpperCase()}
                    </span>
                  </div>

                  <button
                    onClick={() => setPreviewDoc({ type: 'bill', doc: b })}
                    className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                    title="Preview & Export PDF"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Delivery Challans Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Truck className="w-4 h-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900">Recent Delivery Challans</h3>
            </div>
            <button
              onClick={() => setActiveTab('challans')}
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {recentChallans.map((c) => (
              <div
                key={c.id}
                className="p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 font-mono-numbers text-xs">
                      {c.challanNumber}
                    </span>
                    <span className="text-[10px] text-slate-400">·</span>
                    <span className="text-xs text-slate-600 font-medium">
                      {c.clientDetails.company || c.clientDetails.name}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Vehicle: {c.vehicleNumber || 'Direct'} · {c.totalQuantity} Units
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="font-mono-numbers font-medium text-slate-900 text-xs">
                      {formatCurrency(c.totalEstimatedValue, company.currencySymbol)}
                    </div>
                    <span className="text-[10px] font-semibold text-sky-700 uppercase">
                      {c.status}
                    </span>
                  </div>

                  {c.status !== 'converted' ? (
                    <button
                      onClick={() => convertChallanToBill(c.id)}
                      className="px-2 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors whitespace-nowrap"
                      title="Convert to Invoice"
                    >
                      To Invoice
                    </button>
                  ) : (
                    <button
                      onClick={() => setPreviewDoc({ type: 'challan', doc: c })}
                      className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-md hover:bg-slate-100 transition-colors"
                      title="Preview & Export PDF"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Workflow Explainer & Quick Capabilities */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
          Integrated Business Workflow
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">1. Dispatch Consignment</div>
            <p className="text-slate-600 leading-relaxed">
              Create a Rule-55 Delivery Challan with Vehicle #, Transporter, and E-Way bill for legal material transit without an upfront tax demand.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">2. 1-Click Convert to Invoice</div>
            <p className="text-slate-600 leading-relaxed">
              Upon goods delivery confirmation, click &ldquo;To Invoice&rdquo; to auto-populate the sales bill with exact item lines, HSN codes, and inter-state GST splits.
            </p>
          </div>
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-100">
            <div className="font-bold text-slate-900 mb-1">3. Certified PDF & Print Export</div>
            <p className="text-slate-600 leading-relaxed">
              Export standard A4 vector-crisp PDFs via direct client-side download or print directly with bank transfer and UPI details embedded.
            </p>
          </div>
        </div>
      </div>

      {/* Backup & Restore Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </div>
  );
};
