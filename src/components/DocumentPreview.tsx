import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BillDocument, ChallanDocument } from '../types';
import { BillTemplateClassic } from './templates/BillTemplateClassic';
import { BillTemplateGst } from './templates/BillTemplateGst';
import { ChallanTemplate } from './templates/ChallanTemplate';
import { exportElementToPdf, triggerNativePrint } from '../utils/pdfExport';
import {
  Printer,
  Download,
  X,
  Edit3,
  Share2,
  FileCheck,
  Check,
  Layout,
  FileSpreadsheet,
  MessageCircle,
} from 'lucide-react';

interface Props {
  onClose?: () => void;
}

export const DocumentPreview: React.FC<Props> = ({ onClose }) => {
  const { previewDoc, company, setEditingBill, setEditingChallan, setActiveTab } = useApp();
  const [isExporting, setIsExporting] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<'gst' | 'classic'>('gst');

  if (!previewDoc) return null;

  const isBill = previewDoc.type === 'bill';
  const bill = isBill ? (previewDoc.doc as BillDocument) : null;
  const challan = !isBill ? (previewDoc.doc as ChallanDocument) : null;

  const docNumber = isBill ? bill?.billNumber : challan?.challanNumber;
  const clientName = isBill
    ? bill?.clientDetails.company || bill?.clientDetails.name
    : challan?.clientDetails.company || challan?.clientDetails.name;

  const [exportError, setExportError] = useState<string | null>(null);

  const handleDownloadPdf = async () => {
    setIsExporting(true);
    setExportError(null);
    const fileName = `${docNumber || 'document'}_${clientName?.replace(/\s+/g, '_')}`;
    const result = await exportElementToPdf('printable-document-container', { fileName });
    if (!result.success) {
      setExportError(result.error || 'Failed to generate PDF. You can also use the "Print" button to save as PDF.');
    }
    setIsExporting(false);
  };

  const handleEdit = () => {
    if (isBill && bill) {
      setEditingBill(bill);
      setActiveTab('new-bill');
      if (onClose) onClose();
    } else if (challan) {
      setEditingChallan(challan);
      setActiveTab('new-challan');
      if (onClose) onClose();
    }
  };

  const handleShareSummary = () => {
    let summaryText = '';
    if (isBill && bill) {
      summaryText = `Invoice: ${bill.billNumber}\nDate: ${bill.billDate}\nClient: ${clientName}\nGrand Total: ${company.currencySymbol}${bill.grandTotal.toLocaleString('en-IN')}\nBalance Due: ${company.currencySymbol}${bill.balanceDue.toLocaleString('en-IN')}\nBank: ${company.bankName} (A/C: ${company.bankAccountNo})\nbKash/Nagad: ${company.mfsNumber}\nShop: ${company.name}, Mirpur Dhaka (WA: ${company.whatsapp || company.phone})`;
    } else if (challan) {
      summaryText = `Delivery Challan: ${challan.challanNumber}\nDate: ${challan.challanDate}\nVehicle: ${challan.vehicleNumber || 'Direct'}\nTotal Units: ${challan.totalQuantity} Pkgs\nCarrier: ${challan.transporterName || 'Self'}\nShop: ${company.name}, Mirpur Dhaka`;
    }
    navigator.clipboard.writeText(summaryText);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppShare = () => {
    let message = '';
    if (isBill && bill) {
      message = `*${company.name}*\n` +
        `*${selectedTemplate === 'gst' ? 'VAT Tax Invoice (Mushak-6.3)' : 'Commercial Invoice'}*\n` +
        `--------------------------------\n` +
        `Bill No: *${bill.billNumber}*\n` +
        `Date: ${bill.billDate}\n` +
        `Client: ${clientName}\n` +
        `Grand Total: *${company.currencySymbol}${bill.grandTotal.toLocaleString('en-IN')}*\n` +
        `Paid: ${company.currencySymbol}${bill.amountPaid.toLocaleString('en-IN')}\n` +
        `Balance Due: *${company.currencySymbol}${bill.balanceDue.toLocaleString('en-IN')}*\n` +
        `--------------------------------\n` +
        `Payment (bKash/Nagad): ${company.mfsNumber}\n` +
        `Bank: ${company.bankName} (A/C: ${company.bankAccountNo})\n` +
        `Address: ${company.address}, ${company.city}-${company.pincode}\n` +
        `Hotline: ${company.phone} | WA: ${company.whatsapp || company.phone}`;
    } else if (challan) {
      message = `*${company.name}*\n` +
        `*Delivery Challan (${challan.challanType === 'mushak-6.5' ? 'Mushak-6.5' : 'Consignment'})*\n` +
        `--------------------------------\n` +
        `Challan No: *${challan.challanNumber}*\n` +
        `Date: ${challan.challanDate}\n` +
        `Recipient: ${clientName}\n` +
        `Total Quantity: ${challan.totalQuantity} Pcs\n` +
        `Carrier: ${challan.transporterName || 'Self / Courier'}\n` +
        `Vehicle: ${challan.vehicleNumber || 'Direct Handover'}\n` +
        `--------------------------------\n` +
        `Address: ${company.address}, ${company.city}\n` +
        `Hotline: ${company.phone} | WA: ${company.whatsapp || company.phone}`;
    }

    const clientPhone = (isBill ? bill?.clientDetails.phone : challan?.clientDetails.phone) || '';
    const cleanPhone = clientPhone.replace(/[^0-9]/g, '').replace(/^0/, '880');
    const targetUrl = cleanPhone.length >= 10
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
      : `https://wa.me/?text=${encodeURIComponent(message)}`;

    window.open(targetUrl, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex justify-center p-2 sm:p-4 print:p-0 print:static print:bg-white print:overflow-visible">
      <div className="relative w-full max-w-5xl bg-slate-100 rounded-xl shadow-2xl flex flex-col my-auto border border-slate-300 print:border-none print:shadow-none print:bg-white print:rounded-none">
        
        {/* Floating Top Action Toolbar */}
        <div className="no-print sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 bg-white border-b border-slate-200 rounded-t-xl">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 text-sm font-mono-numbers">
              {docNumber}
            </span>
            <span className="text-xs text-slate-400">·</span>
            <span className="text-xs text-slate-600 truncate max-w-xs">{clientName}</span>

            {isBill && (
              <div className="hidden sm:flex items-center gap-1 ml-4 p-1 bg-slate-100 rounded-lg text-xs">
                <button
                  onClick={() => setSelectedTemplate('gst')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    selectedTemplate === 'gst'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Mushak-6.3 VAT (মূসক-৬.৩)
                </button>
                <button
                  onClick={() => setSelectedTemplate('classic')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-colors ${
                    selectedTemplate === 'classic'
                      ? 'bg-white text-slate-900 shadow-xs font-semibold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Commercial Invoice (বাণিজ্যিক বিল)
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleWhatsAppShare}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors"
              title="Send via WhatsApp"
            >
              <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleShareSummary}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
              title="Copy Summary to Clipboard"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copied!' : 'Share'}</span>
            </button>

            <button
              onClick={handleEdit}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit</span>
            </button>

            <button
              onClick={triggerNativePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-slate-600" />
              <span>Print</span>
            </button>

            <button
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 rounded-lg transition-colors shadow-xs"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF'}</span>
            </button>

            {onClose && (
              <button
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors ml-2"
                aria-label="Close"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Error notification banner if any */}
        {exportError && (
          <div className="no-print mx-5 mt-3 p-3 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center justify-between">
            <span>{exportError}</span>
            <button
              onClick={() => setExportError(null)}
              className="text-rose-500 hover:text-rose-800 font-bold ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Printable Sheet Viewport */}
        <div className="p-4 sm:p-8 flex justify-center overflow-auto print:p-0">
          <div
            id="printable-document-container"
            className="print-sheet bg-white w-full max-w-[210mm] shadow-lg rounded-sm overflow-hidden"
          >
            {isBill && bill ? (
              selectedTemplate === 'gst' ? (
                <BillTemplateGst bill={bill} company={company} />
              ) : (
                <BillTemplateClassic bill={bill} company={company} />
              )
            ) : challan ? (
              <ChallanTemplate challan={challan} company={company} />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
