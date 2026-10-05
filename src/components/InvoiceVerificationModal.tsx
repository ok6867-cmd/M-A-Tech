import React from 'react';
import { BillDocument, CompanyProfile } from '../types';
import { formatCurrency } from '../utils/calculations';
import { amountToWords } from '../utils/numberToWords';
import {
  CheckCircle2,
  ShieldCheck,
  Printer,
  Share2,
  Phone,
  MessageCircle,
  X,
  PackageCheck,
  Calendar,
  User,
  Building,
  ArrowLeft,
  FileCheck2,
} from 'lucide-react';

interface Props {
  scannedData: {
    billNumber: string;
    bill?: BillDocument | null;
    rawPayload?: any;
  };
  company: CompanyProfile;
  onClose: () => void;
}

export const InvoiceVerificationModal: React.FC<Props> = ({
  scannedData,
  company,
  onClose,
}) => {
  const { bill, rawPayload, billNumber } = scannedData;

  // Use full bill object if exists in database, or extract from verified payload
  const invoiceNo = bill?.billNumber || rawPayload?.n || billNumber;
  const invoiceDate = bill?.billDate || rawPayload?.d || new Date().toISOString().split('T')[0];
  const customerName = bill?.clientDetails?.company || bill?.clientDetails?.name || rawPayload?.c || 'Customer';
  const customerPhone = bill?.clientDetails?.phone || rawPayload?.p || '';
  const customerAddress = bill?.clientDetails?.billingAddress || rawPayload?.a || '';
  const grandTotal = bill?.grandTotal ?? rawPayload?.g ?? 0;
  const amountPaid = bill?.amountPaid ?? rawPayload?.pd ?? 0;
  const balanceDue = bill?.balanceDue ?? rawPayload?.b ?? 0;
  const items = bill?.items || rawPayload?.it || [];

  const words = amountToWords(grandTotal, company.currencyCode);

  const isFullyPaid = balanceDue <= 0 && grandTotal > 0;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsAppContact = () => {
    const shopPhone = company.whatsapp || company.phone || '01620815977';
    const cleanPhone = shopPhone.replace(/[^0-9]/g, '').replace(/^0/, '880');
    const msg = `Hello ${company.name}, I scanned my Invoice #${invoiceNo} (Date: ${invoiceDate}, Amount: ৳${grandTotal.toLocaleString('en-IN')}).`;
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Verification Status Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white p-5 sm:p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="w-7 h-7 text-white" />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 text-[11px] font-semibold tracking-wide uppercase mb-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Authentic Invoice (অনুমোদিত ডিজিটাল চালান)</span>
                </div>
                <h2 className="text-xl font-black tracking-tight">{invoiceNo}</h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4 pt-4 border-t border-white/20 text-xs">
            <div>
              <span className="text-emerald-100 text-[11px] block">Invoice Date</span>
              <strong className="font-semibold text-white">{invoiceDate}</strong>
            </div>
            <div>
              <span className="text-emerald-100 text-[11px] block">Grand Total</span>
              <strong className="font-semibold text-white font-mono-numbers">
                {formatCurrency(grandTotal, company.currencySymbol)}
              </strong>
            </div>
            <div>
              <span className="text-emerald-100 text-[11px] block">Paid Amount</span>
              <strong className="font-semibold text-white font-mono-numbers">
                {formatCurrency(amountPaid, company.currencySymbol)}
              </strong>
            </div>
            <div>
              <span className="text-emerald-100 text-[11px] block">Payment Status</span>
              <span
                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mt-0.5 ${
                  isFullyPaid ? 'bg-emerald-900/60 text-emerald-200' : 'bg-amber-500/80 text-amber-950'
                }`}
              >
                {isFullyPaid ? 'Paid' : `Due ৳${balanceDue.toLocaleString('en-IN')}`}
              </span>
            </div>
          </div>
        </div>

        {/* Invoice Body Content */}
        <div className="p-5 sm:p-6 space-y-5 max-h-[65vh] overflow-y-auto">
          {/* Shop and Customer Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200 text-xs">
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Issued By (বিক্রেতা প্রতিষ্ঠান)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{company.name}</h4>
              <p className="text-slate-600 mt-0.5 leading-relaxed">
                {company.address}, {company.city}
              </p>
              <div className="mt-2 text-slate-700 space-y-0.5">
                <div>Phone: <strong>{company.phone}</strong></div>
                {company.email && <div>Email: {company.email}</div>}
              </div>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Billed To (ক্রেতার বিবরণ)
              </span>
              <h4 className="font-bold text-slate-900 text-sm">{customerName}</h4>
              {customerAddress && (
                <p className="text-slate-600 mt-0.5 leading-relaxed">{customerAddress}</p>
              )}
              {customerPhone && (
                <div className="mt-2 text-slate-700">
                  Mobile: <strong>{customerPhone}</strong>
                </div>
              )}
            </div>
          </div>

          {/* Itemized List with Warranty Badges */}
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Items & Warranty Verification (পণ্যের তালিকা ও ওয়ারেন্টি)</span>
              <span className="text-[11px] text-slate-500 font-normal">
                {items.length} item{items.length > 1 ? 's' : ''}
              </span>
            </h4>

            <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
              {items.map((item: any, idx: number) => {
                const name = item.name || item.n || 'Product';
                const qty = item.quantity ?? item.q ?? 1;
                const unit = item.unit || item.u || 'Pcs';
                const warranty = item.warranty || item.w || '1 Year Warranty';
                const rate = item.unitPrice ?? item.r ?? 0;
                const total = item.total ?? item.t ?? rate * qty;

                return (
                  <div key={idx} className="p-3.5 flex items-start justify-between gap-3 hover:bg-slate-50/70 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-slate-900">{name}</div>
                      <div className="flex flex-wrap items-center gap-2 mt-1">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 font-semibold text-[11px] border border-indigo-100">
                          <PackageCheck className="w-3 h-3 text-indigo-600" />
                          <span>{warranty}</span>
                        </span>
                        <span className="text-slate-500 text-[11px]">
                          Qty: <strong className="text-slate-800">{qty} {unit}</strong> × {formatCurrency(rate, company.currencySymbol)}
                        </span>
                      </div>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className="font-bold text-slate-900 font-mono-numbers text-sm">
                        {formatCurrency(total, company.currencySymbol)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Amount In Words & Financial Summary */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
            <div className="flex justify-between items-center text-slate-700">
              <span>Subtotal:</span>
              <span className="font-mono-numbers font-medium">{formatCurrency(grandTotal, company.currencySymbol)}</span>
            </div>
            <div className="flex justify-between items-center font-bold text-slate-900 text-sm pt-2 border-t border-slate-200">
              <span>Grand Total (সর্বমোট):</span>
              <span className="font-mono-numbers text-emerald-700">{formatCurrency(grandTotal, company.currencySymbol)}</span>
            </div>
            <div className="pt-2 text-[11px] text-slate-600 italic">
              <strong>In Words:</strong> {words}
            </div>
          </div>
        </div>

        {/* Modal Actions Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppContact}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-xl transition-colors"
            >
              <MessageCircle className="w-4 h-4 text-emerald-700" />
              <span>Contact on WhatsApp</span>
            </button>
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl transition-colors shadow-2xs"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors shadow-xs ml-auto"
          >
            Close / Open Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};
