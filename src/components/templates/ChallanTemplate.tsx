import React from 'react';
import { ChallanDocument, CompanyProfile } from '../../types';
import { formatCurrency } from '../../utils/calculations';

interface Props {
  challan: ChallanDocument;
  company: CompanyProfile;
}

export const ChallanTemplate: React.FC<Props> = ({ challan, company }) => {
  const getChallanTypeLabel = (type: ChallanDocument['challanType']) => {
    switch (type) {
      case 'mushak-6.5':
        return 'পণ্য স্থানান্তর চালানপত্র (Mushak-6.5 Goods Transfer / Delivery)';
      case 'delivery':
        return 'পণ্য সরবরাহ / ডেলিভারি চালান (Commercial Delivery Challan)';
      case 'jobwork':
        return 'জব ওয়ার্ক / প্রক্রিয়াকরণের জন্য স্থানান্তর (Job Work - Returnable)';
      case 'approval':
        return 'অনুমোদন বা ট্রায়ালের জন্য প্রেরণ (Approval / Trial)';
      case 'returnable':
        return 'ফেরতযোগ্য যন্ত্রপাতি ও সরঞ্জাম (Returnable Tooling)';
      case 'transfer':
        return 'শাখা বা ডিপো স্থানান্তর (Inter-Branch / Depot Transfer)';
      default:
        return 'পণ্য ডেলিভারি চালান (Delivery Challan)';
    }
  };

  return (
    <div className="bg-white p-6 max-w-[210mm] mx-auto text-slate-900 text-xs leading-normal font-sans border-2 border-slate-900 shadow-sm print:shadow-none print:p-0">
      {/* Top Banner - Mushak-6.5 / Bangladesh NBR Format */}
      <div className="text-center border-b-2 border-slate-900 pb-2 mb-3">
        <div className="text-[11px] font-medium text-slate-700">
          গণপ্রজাতন্ত্রী বাংলাদেশ সরকার, জাতীয় রাজস্ব বোর্ড
        </div>
        <div className="text-sm font-bold text-slate-900 uppercase tracking-wide">
          ডেলিভারি চালানপত্র (DELIVERY CHALLAN)
        </div>
        <div className="text-[10px] text-slate-600">
          [বিধি ৪২ দ্রষ্টব্য] · <strong>মূসক - ৬.৫ (MUSHAK - 6.5) / COMMERCIAL CHALLAN</strong>
        </div>
        <div className="flex justify-center gap-3 font-semibold text-[10px] text-slate-600 mt-1">
          <span className="border border-slate-400 px-1.5 py-0.2 rounded-xs bg-slate-100">মূল কপি (গ্রাহকের জন্য)</span>
          <span className="border border-slate-300 px-1.5 py-0.2 rounded-xs text-slate-400">পরিবহনকারীর কপি</span>
          <span className="border border-slate-300 px-1.5 py-0.2 rounded-xs text-slate-400">অফিস কপি</span>
        </div>
      </div>

      {/* Header Particulars */}
      <div className="grid grid-cols-12 border-b-2 border-slate-800 pb-3 mb-3 items-start">
        <div className="col-span-7 pr-3 flex items-start gap-3">
          {company.logoUrl && (
            <img
              src={company.logoUrl}
              alt={company.name}
              className="w-14 h-14 object-contain rounded border border-slate-200 p-0.5 flex-shrink-0"
            />
          )}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase mb-0.5">
              প্রেরক / সরবরাহকারীর বিবরণ (Consignor Details):
            </div>
            <h1 className="text-base font-bold tracking-tight text-slate-900 uppercase">
              {company.name}
            </h1>
            <p className="text-slate-600 mt-0.5 leading-normal">
              {company.address}, {company.city} - {company.pincode}, {company.country}
            </p>
            <div className="mt-1 space-y-0.5 text-slate-700 text-[11px]">
              {(company.bin || company.gstin) && (
                <div>
                  বিআইএন (BIN):{' '}
                  <strong className="text-slate-900 font-mono-numbers">
                    {company.bin || company.gstin}
                  </strong>
                </div>
              )}
              <div>
                ফোন: <strong className="font-mono-numbers text-slate-900">{company.phone}</strong>
                {company.whatsapp && (
                  <span> · WhatsApp: <strong className="font-mono-numbers text-emerald-800">{company.whatsapp}</strong></span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="col-span-5 border-l border-slate-800 pl-3">
          <div className="text-center font-bold text-xs bg-slate-900 text-white py-1 uppercase tracking-wider mb-2">
            চালান মেমো (Challan Details)
          </div>
          <div className="grid grid-cols-2 gap-y-1 text-slate-800 text-[11px]">
            <div>চালান নং (Challan No):</div>
            <div className="font-bold text-slate-900 font-mono-numbers text-xs">{challan.challanNumber}</div>
            <div>তারিখ (Date):</div>
            <div className="font-semibold">{challan.challanDate}</div>
            <div>পরিবহন মাধ্যম (Mode):</div>
            <div className="uppercase font-medium">{challan.dispatchMode}</div>
            {challan.convertedToBillId && (
              <>
                <div>ইনভয়েস স্ট্যাটাস:</div>
                <div className="font-semibold text-emerald-700 font-mono-numbers">বিল সম্পন্ন (Billed)</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Purpose of Dispatch Notice */}
      <div className="bg-slate-100 border border-slate-400 px-3 py-1.5 mb-3 rounded-xs flex items-center justify-between text-xs">
        <div>
          <span className="text-slate-500 font-semibold uppercase text-[10px]">চালানের ধরণ (Nature of Dispatch): </span>
          <strong className="text-slate-900">{getChallanTypeLabel(challan.challanType)}</strong>
        </div>
        <div className="text-[11px] font-medium text-slate-700">
          শুধু পরিবহনের জন্য (Transit Memorandum)
        </div>
      </div>

      {/* Consignor vs Consignee */}
      <div className="grid grid-cols-2 border border-slate-800 mb-3 divide-x divide-slate-800">
        <div className="p-2.5">
          <div className="font-bold uppercase text-[10px] text-slate-500 mb-1 border-b border-slate-200 pb-1">
            পণ্য প্রেরক (Dispatched From):
          </div>
          <div className="font-bold text-slate-900 text-xs">{company.name}</div>
          <div className="text-slate-600 mt-0.5">{company.address}, {company.city} - {company.pincode}</div>
          <div className="mt-1 font-semibold text-slate-900">
            BIN: <span className="font-mono-numbers">{company.bin || company.gstin}</span>
          </div>
        </div>

        <div className="p-2.5">
          <div className="font-bold uppercase text-[10px] text-slate-500 mb-1 border-b border-slate-200 pb-1">
            পণ্য প্রাপক (Consignee - Delivered To):
          </div>
          <div className="font-bold text-slate-900 text-xs">{challan.clientDetails.company || challan.clientDetails.name}</div>
          <div className="text-slate-700 font-medium">প্রতিনিধি: {challan.clientDetails.name}</div>
          <div className="text-slate-600 leading-normal">
            {challan.clientDetails.shippingSameAsBilling ? challan.clientDetails.billingAddress : challan.clientDetails.shippingAddress}
          </div>
          <div className="text-slate-600">
            {challan.clientDetails.shippingSameAsBilling
              ? `${challan.clientDetails.billingCity}, ${challan.clientDetails.billingState} - ${challan.clientDetails.billingPincode}`
              : `${challan.clientDetails.shippingCity}, ${challan.clientDetails.shippingState} - ${challan.clientDetails.shippingPincode}`}
          </div>
          <div className="mt-1 font-semibold text-slate-900">
            গ্রাহকের BIN: <span className="font-mono-numbers">{challan.clientDetails.bin || challan.clientDetails.gstin || 'Unregistered'}</span>
          </div>
        </div>
      </div>

      {/* Transport & Carrier Particulars Box */}
      <div className="border border-slate-800 mb-3 bg-slate-50/60 p-2.5">
        <div className="font-bold uppercase text-[10px] text-slate-600 mb-1.5 border-b border-slate-200 pb-1">
          পরিবহন ও ড্রাইভার সংক্রান্ত তথ্য (Transport Particulars):
        </div>
        <div className="grid grid-cols-4 gap-3 text-[11px] text-slate-700">
          <div>
            <span className="text-slate-500 block text-[10px]">যানবাহন নং (Vehicle No):</span>
            <strong className="font-mono-numbers text-slate-900">{challan.vehicleNumber || 'সরাসরি হস্তান্তর (Direct)'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">ট্রান্সপোর্টার / কুরিয়ার:</span>
            <strong className="text-slate-900">{challan.transporterName || 'নিজস্ব পরিবহন (Self)'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">কনসাইনমেন্ট / ট্র্যাকিং নং:</span>
            <strong className="font-mono-numbers text-slate-900">{challan.lrNumber || 'N/A'}</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">গেট পাস নং (Gate Pass):</span>
            <strong className="font-mono-numbers text-slate-900">{challan.ewayBillNo || 'N/A'}</strong>
          </div>
          {challan.driverName && (
            <div>
              <span className="text-slate-500 block text-[10px]">ড্রাইভারের নাম:</span>
              <span className="font-medium text-slate-900">{challan.driverName}</span>
            </div>
          )}
          {challan.driverContact && (
            <div>
              <span className="text-slate-500 block text-[10px]">ড্রাইভার মোবাইল:</span>
              <span className="font-mono-numbers font-medium text-slate-900">{challan.driverContact}</span>
            </div>
          )}
          <div>
            <span className="text-slate-500 block text-[10px]">মোট আইটেম সংখ্যা:</span>
            <strong className="font-mono-numbers text-slate-900">{challan.items.length} টি</strong>
          </div>
          <div>
            <span className="text-slate-500 block text-[10px]">মোট ইউনিট পরিমাণ:</span>
            <strong className="font-mono-numbers text-slate-900 text-indigo-700">{challan.totalQuantity} Units</strong>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <table className="w-full border-collapse border border-slate-800 text-left mb-3">
        <thead>
          <tr className="bg-slate-100 text-slate-900 border-b border-slate-800 font-bold text-[10px] uppercase">
            <th className="p-1.5 border-r border-slate-800 w-8 text-center">ক্র.</th>
            <th className="p-1.5 border-r border-slate-800">পণ্যের নাম ও বিবরণ (Description)</th>
            <th className="p-1.5 border-r border-slate-800 text-center w-20">HS কোড</th>
            <th className="p-1.5 border-r border-slate-800 text-right w-20">পরিমাণ (Qty)</th>
            <th className="p-1.5 border-r border-slate-800 text-right w-24">আনুমানিক দর (৳)</th>
            <th className="p-1.5 text-right w-28">আনুমানিক মূল্য (৳)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300">
          {challan.items.map((item, idx) => (
            <tr key={item.id || idx}>
              <td className="p-1.5 border-r border-slate-800 text-center font-mono-numbers">{idx + 1}</td>
              <td className="p-1.5 border-r border-slate-800">
                <div className="font-semibold text-slate-900">{item.name}</div>
                {item.description && <div className="text-[10px] text-slate-500 mt-0.5">{item.description}</div>}
              </td>
              <td className="p-1.5 border-r border-slate-800 text-center font-mono-numbers">{item.hsnCode || '-'}</td>
              <td className="p-1.5 border-r border-slate-800 text-right font-mono-numbers font-semibold">
                {item.quantity} {item.unit}
              </td>
              <td className="p-1.5 border-r border-slate-800 text-right font-mono-numbers text-slate-600">
                {formatCurrency(item.unitPrice, company.currencySymbol)}
              </td>
              <td className="p-1.5 text-right font-mono-numbers font-semibold text-slate-900">
                {formatCurrency(item.quantity * item.unitPrice, company.currencySymbol)}
              </td>
            </tr>
          ))}
          {/* Total row */}
          <tr className="bg-slate-50 font-bold border-t border-slate-800">
            <td colSpan={3} className="p-2 border-r border-slate-800 text-right uppercase text-[10px]">
              সর্বমোট প্রেরিত পরিমাণ ও আনুমানিক মূল্য:
            </td>
            <td className="p-2 border-r border-slate-800 text-right font-mono-numbers text-sm text-indigo-700">
              {challan.totalQuantity} Units
            </td>
            <td className="p-2 border-r border-slate-800"></td>
            <td className="p-2 text-right font-mono-numbers text-sm">
              {formatCurrency(challan.totalEstimatedValue, company.currencySymbol)}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Notes / Special Instructions */}
      <div className="border border-slate-800 p-2.5 mb-3 bg-slate-50/40">
        <div className="font-bold text-[10px] uppercase text-slate-600 mb-1">
          বিশেষ দ্রষ্টব্য ও পরিবহন নির্দেশনা (Remarks & Instructions):
        </div>
        <p className="text-slate-700 text-xs">
          {challan.notes || 'পণ্য অক্ষত ও সুরক্ষিত অবস্থায় প্রেরণ করা হলো। প্রাপ্তিস্বীকারে স্বাক্ষর করুন।'}
        </p>
        {challan.terms && (
          <p className="text-[10px] text-slate-500 mt-1 italic">
            শর্তাবলী: {challan.terms}
          </p>
        )}
      </div>

      {/* Dual Signature Blocks: Dispatched By & Received By */}
      <div className="grid grid-cols-2 border border-slate-800 divide-x divide-slate-800">
        <div className="p-3 flex flex-col justify-between h-28">
          <div className="text-[10px] font-bold uppercase text-slate-600">
            পণ্য গ্রহণকারীর প্রাপ্তিস্বীকার (Receiver's Signature):
          </div>
          <div className="text-[9.5px] text-slate-500">
            উপরে উল্লেখিত সকল পণ্য অক্ষত ও সঠিক পরিমাণে গ্রহণ করিলাম।
          </div>
          <div className="border-t border-slate-400 pt-1 text-center text-[10px] text-slate-700">
            গ্রহীতার স্বাক্ষর, তারিখ ও প্রতিষ্ঠানের সিলমোহর (Seal)
          </div>
        </div>

        <div className="p-3 flex flex-col justify-between h-28 text-right">
          <div className="text-[10px] font-bold uppercase text-slate-600">
            প্রেরক কর্তৃপক্ষের পক্ষে (For {company.name})
          </div>
          <div className="mt-8 border-t border-slate-400 pt-1 text-center w-48 ml-auto text-[10px] text-slate-700">
            {company.signatureTitle}
          </div>
        </div>
      </div>
    </div>
  );
};
