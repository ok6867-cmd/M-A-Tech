import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BillDocument, BillPaymentStatus } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Search,
  Plus,
  Eye,
  Printer,
  Edit,
  Copy,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  Clock,
  CreditCard,
  FileText,
  DollarSign,
} from 'lucide-react';

export const BillsList: React.FC = () => {
  const {
    bills,
    company,
    setActiveTab,
    setEditingBill,
    setPreviewDoc,
    deleteBill,
    duplicateBill,
    markBillPayment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | BillPaymentStatus>('all');
  const [paymentModalBill, setPaymentModalBill] = useState<BillDocument | null>(null);
  const [modalPaidAmount, setModalPaidAmount] = useState<number>(0);
  const [modalPaymentMethod, setModalPaymentMethod] = useState<string>('');

  // Calculations for stats overview
  const stats = useMemo(() => {
    let totalInvoiced = 0;
    let totalCollected = 0;
    let totalPending = 0;
    let overdueCount = 0;

    bills.forEach((b) => {
      totalInvoiced += b.grandTotal;
      totalCollected += b.amountPaid;
      totalPending += b.balanceDue;
      if (b.paymentStatus === 'overdue') overdueCount++;
    });

    return { totalInvoiced, totalCollected, totalPending, overdueCount };
  }, [bills]);

  // Filtered bills
  const filteredBills = useMemo(() => {
    return bills.filter((bill) => {
      const matchesSearch =
        bill.billNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        bill.clientDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (bill.clientDetails.company &&
          bill.clientDetails.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (bill.poNumber && bill.poNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (bill.referenceChallanNo &&
          bill.referenceChallanNo.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || bill.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bills, searchQuery, statusFilter]);

  const handleOpenPreview = (bill: BillDocument) => {
    setPreviewDoc({ type: 'bill', doc: bill });
  };

  const handleEditBill = (bill: BillDocument) => {
    setEditingBill(bill);
    setActiveTab('new-bill');
  };

  const handleOpenPaymentModal = (bill: BillDocument) => {
    setPaymentModalBill(bill);
    setModalPaidAmount(bill.amountPaid);
    setModalPaymentMethod(bill.paymentMethod || '');
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentModalBill) return;
    markBillPayment(paymentModalBill.id, modalPaidAmount, modalPaymentMethod);
    setPaymentModalBill(null);
  };

  const renderStatusBadge = (status: BillPaymentStatus) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid</span>
          </span>
        );
      case 'partial':
        return (
          <span className="inline-flex items-center gap-1 text-sky-700 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Partially Paid</span>
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center gap-1 text-rose-700 font-semibold text-xs">
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Overdue</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Unpaid</span>
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Bar / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Bills & Tax Invoices
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage sales bills, monitor payment collections, and generate certified PDFs
          </p>
        </div>

        <button
          onClick={() => {
            setEditingBill(null);
            setActiveTab('new-bill');
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Invoice</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Invoiced
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono-numbers mt-1">
            {formatCurrency(stats.totalInvoiced, company.currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {bills.length} issued invoices
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Collected
          </span>
          <div className="text-xl font-bold text-emerald-600 font-mono-numbers mt-1">
            {formatCurrency(stats.totalCollected, company.currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Payments received in bank
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Outstanding Due
          </span>
          <div className="text-xl font-bold text-amber-600 font-mono-numbers mt-1">
            {formatCurrency(stats.totalPending, company.currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Pending client settlements
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Overdue Invoices
          </span>
          <div className="text-xl font-bold text-rose-600 font-mono-numbers mt-1">
            {stats.overdueCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Exceeded payment due date
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by invoice number, client company, PO, or challan ref..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Interactive Segmented Filter Controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({bills.length})
          </button>
          <button
            onClick={() => setStatusFilter('unpaid')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'unpaid'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Unpaid
          </button>
          <button
            onClick={() => setStatusFilter('partial')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'partial'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Partial
          </button>
          <button
            onClick={() => setStatusFilter('paid')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'paid'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Paid
          </button>
          <button
            onClick={() => setStatusFilter('overdue')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'overdue'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Overdue
          </button>
        </div>
      </div>

      {/* Invoices High-Density Data Grid */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredBills.length === 0 ? (
          <div className="text-center py-16 px-4">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No invoices found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {searchQuery || statusFilter !== 'all'
                ? 'No invoices match your selected filters. Try resetting the search or filter.'
                : 'Get started by creating your first sales invoice with automated tax calculations.'}
            </p>
            <button
              onClick={() => {
                setEditingBill(null);
                setActiveTab('new-bill');
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Invoice</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <th className="py-3 px-4">Invoice / Date</th>
                  <th className="py-3 px-4">Client / Consignee</th>
                  <th className="py-3 px-3 text-center">Tax Type</th>
                  <th className="py-3 px-4 text-right">Grand Total</th>
                  <th className="py-3 px-4 text-right">Balance Due</th>
                  <th className="py-3 px-4">Payment Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredBills.map((bill) => (
                  <tr
                    key={bill.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono-numbers">
                        {bill.billNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                        <span>Date: {bill.billDate}</span>
                        {bill.referenceChallanNo && (
                          <>
                            <span>·</span>
                            <span className="text-indigo-600 font-medium">Challan: {bill.referenceChallanNo}</span>
                          </>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {bill.clientDetails.company || bill.clientDetails.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {bill.clientDetails.billingCity}, {bill.clientDetails.billingState}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className="text-[10px] font-medium text-slate-700 font-mono-numbers">
                        {bill.taxType === 'exempt' ? 'Exempt' : 'VAT (ভ্যাট)'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-mono-numbers font-semibold text-slate-900">
                      {formatCurrency(bill.grandTotal, company.currencySymbol)}
                    </td>

                    <td className="py-3 px-4 text-right font-mono-numbers font-bold">
                      <span className={bill.balanceDue > 0 ? 'text-amber-700' : 'text-slate-700'}>
                        {formatCurrency(bill.balanceDue, company.currencySymbol)}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {renderStatusBadge(bill.paymentStatus)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleOpenPreview(bill)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View & PDF Export"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleOpenPaymentModal(bill)}
                          className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="Record / Update Payment"
                        >
                          <CreditCard className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleEditBill(bill)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Invoice"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => duplicateBill(bill.id)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Duplicate Invoice"
                        >
                          <Copy className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete invoice ${bill.billNumber}?`)) {
                              deleteBill(bill.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Invoice"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Record Payment Modal */}
      {paymentModalBill && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-5 border border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-1">
              Record Payment for {paymentModalBill.billNumber}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Invoice Grand Total: <strong className="font-mono-numbers text-slate-900">{formatCurrency(paymentModalBill.grandTotal, company.currencySymbol)}</strong>
            </p>

            <form onSubmit={handleSavePayment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount Received ({company.currencySymbol})
                </label>
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    min="0"
                    max={paymentModalBill.grandTotal}
                    value={modalPaidAmount}
                    onChange={(e) => setModalPaidAmount(Number(e.target.value))}
                    required
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-300 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => setModalPaidAmount(paymentModalBill.grandTotal)}
                    className="px-3 py-2 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg whitespace-nowrap"
                  >
                    Mark Full
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Payment Mode & Reference
                </label>
                <input
                  type="text"
                  value={modalPaymentMethod}
                  onChange={(e) => setModalPaymentMethod(e.target.value)}
                  placeholder="e.g. NEFT Transfer (UTR: HDFC129038)"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-lg text-xs space-y-1">
                <div className="flex justify-between text-slate-600">
                  <span>Balance Remaining:</span>
                  <span className="font-mono-numbers font-bold text-slate-900">
                    {formatCurrency(
                      Math.max(0, paymentModalBill.grandTotal - modalPaidAmount),
                      company.currencySymbol
                    )}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentModalBill(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
