import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { ChallanDocument, ChallanStatus } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Search,
  Plus,
  Eye,
  Printer,
  Edit,
  Trash2,
  Truck,
  ArrowRightCircle,
  FileCheck,
  CheckCircle,
  Clock,
  RotateCcw,
  Package,
} from 'lucide-react';

export const ChallansList: React.FC = () => {
  const {
    challans,
    company,
    setActiveTab,
    setEditingChallan,
    setPreviewDoc,
    deleteChallan,
    updateChallanStatus,
    convertChallanToBill,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ChallanStatus>('all');

  // Stats
  const stats = useMemo(() => {
    let totalChallans = challans.length;
    let totalUnits = 0;
    let totalEstimatedValue = 0;
    let pendingCount = 0;

    challans.forEach((c) => {
      totalUnits += c.totalQuantity;
      totalEstimatedValue += c.totalEstimatedValue;
      if (c.status === 'pending' || c.status === 'dispatched') pendingCount++;
    });

    return { totalChallans, totalUnits, totalEstimatedValue, pendingCount };
  }, [challans]);

  const filteredChallans = useMemo(() => {
    return challans.filter((c) => {
      const matchesSearch =
        c.challanNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.clientDetails.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.clientDetails.company &&
          c.clientDetails.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.vehicleNumber && c.vehicleNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.transporterName && c.transporterName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (c.lrNumber && c.lrNumber.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus = statusFilter === 'all' || c.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [challans, searchQuery, statusFilter]);

  const handleOpenPreview = (challan: ChallanDocument) => {
    setPreviewDoc({ type: 'challan', doc: challan });
  };

  const handleEdit = (challan: ChallanDocument) => {
    setEditingChallan(challan);
    setActiveTab('new-challan');
  };

  const renderStatus = (status: ChallanStatus, convertedId?: string) => {
    switch (status) {
      case 'converted':
        return (
          <span className="inline-flex items-center gap-1 text-emerald-700 font-semibold text-xs">
            <FileCheck className="w-3.5 h-3.5" />
            <span>Converted to Invoice</span>
          </span>
        );
      case 'delivered':
        return (
          <span className="inline-flex items-center gap-1 text-indigo-700 font-semibold text-xs">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Delivered & Signed</span>
          </span>
        );
      case 'dispatched':
        return (
          <span className="inline-flex items-center gap-1 text-sky-700 font-semibold text-xs">
            <Truck className="w-3.5 h-3.5" />
            <span>In Transit</span>
          </span>
        );
      case 'returned':
        return (
          <span className="inline-flex items-center gap-1 text-slate-700 font-semibold text-xs">
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Goods Returned</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-amber-700 font-semibold text-xs">
            <Clock className="w-3.5 h-3.5" />
            <span>Pending Dispatch</span>
          </span>
        );
    }
  };

  const getChallanTypeBadge = (type: ChallanDocument['challanType']) => {
    switch (type) {
      case 'delivery':
        return 'Delivery';
      case 'jobwork':
        return 'Job Work';
      case 'approval':
        return 'Approval / Trial';
      case 'returnable':
        return 'Returnable';
      case 'transfer':
        return 'Branch Transfer';
      default:
        return 'Dispatch';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Delivery Challans & Dispatch
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Log transit consignments, track vehicle numbers, and convert challans to invoices with 1 click
          </p>
        </div>

        <button
          onClick={() => {
            setEditingChallan(null);
            setActiveTab('new-challan');
          }}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Delivery Challan</span>
        </button>
      </div>

      {/* KPI Overview Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Challans
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono-numbers mt-1">
            {stats.totalChallans}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Dispatches recorded
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Total Material Units
          </span>
          <div className="text-xl font-bold text-indigo-600 font-mono-numbers mt-1">
            {stats.totalUnits}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Units transported
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Est. Consignment Value
          </span>
          <div className="text-xl font-bold text-slate-900 font-mono-numbers mt-1">
            {formatCurrency(stats.totalEstimatedValue, company.currencySymbol)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Total goods in transit / delivered
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider block">
            Active / In-Transit
          </span>
          <div className="text-xl font-bold text-sky-600 font-mono-numbers mt-1">
            {stats.pendingCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Awaiting proof of delivery
          </span>
        </div>
      </div>

      {/* Search and Segmented Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-xl border border-slate-200 shadow-xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by challan #, client, vehicle #, transporter, or LR #..."
            className="w-full pl-9 pr-4 py-1.5 text-xs rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All ({challans.length})
          </button>
          <button
            onClick={() => setStatusFilter('dispatched')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'dispatched'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            In Transit
          </button>
          <button
            onClick={() => setStatusFilter('delivered')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'delivered'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Delivered
          </button>
          <button
            onClick={() => setStatusFilter('converted')}
            className={`px-3 py-1 font-medium rounded-md transition-colors whitespace-nowrap ${
              statusFilter === 'converted'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Converted to Bill
          </button>
        </div>
      </div>

      {/* High Density Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredChallans.length === 0 ? (
          <div className="text-center py-16 px-4">
            <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-slate-900">No challans found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Create delivery challans for outgoing transport consignments and job work batches.
            </p>
            <button
              onClick={() => {
                setEditingChallan(null);
                setActiveTab('new-challan');
              }}
              className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Create First Challan</span>
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <th className="py-3 px-4">Challan # / Date</th>
                  <th className="py-3 px-4">Consignee</th>
                  <th className="py-3 px-3">Nature / Mode</th>
                  <th className="py-3 px-4">Carrier / Vehicle</th>
                  <th className="py-3 px-3 text-right">Units</th>
                  <th className="py-3 px-4 text-right">Est. Value</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredChallans.map((challan) => (
                  <tr
                    key={challan.id}
                    className="hover:bg-slate-50/70 transition-colors group"
                  >
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 font-mono-numbers">
                        {challan.challanNumber}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {challan.challanDate}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">
                        {challan.clientDetails.company || challan.clientDetails.name}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {challan.clientDetails.shippingCity || challan.clientDetails.billingCity}
                      </div>
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-medium text-slate-800">
                        {getChallanTypeBadge(challan.challanType)}
                      </div>
                      <div className="text-[11px] text-slate-500 uppercase">
                        Via {challan.dispatchMode}
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-mono-numbers font-medium text-slate-900">
                        {challan.vehicleNumber || 'Direct Handoff'}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        {challan.transporterName || 'Self Transport'}
                      </div>
                    </td>

                    <td className="py-3 px-3 text-right font-mono-numbers font-semibold text-slate-900">
                      {challan.totalQuantity}
                    </td>

                    <td className="py-3 px-4 text-right font-mono-numbers text-slate-700">
                      {formatCurrency(challan.totalEstimatedValue, company.currencySymbol)}
                    </td>

                    <td className="py-3 px-4">
                      {renderStatus(challan.status, challan.convertedToBillId)}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {/* 1-Click Convert Challan to Invoice */}
                        {challan.status !== 'converted' && (
                          <button
                            onClick={() => convertChallanToBill(challan.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                            title="Convert this delivery challan into a sales invoice"
                          >
                            <ArrowRightCircle className="w-3.5 h-3.5" />
                            <span>To Invoice</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleOpenPreview(challan)}
                          className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          title="View & PDF Export"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleEdit(challan)}
                          className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                          title="Edit Challan"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Are you sure you want to delete challan ${challan.challanNumber}?`)) {
                              deleteChallan(challan.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          title="Delete Challan"
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
    </div>
  );
};
