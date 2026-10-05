import React from 'react';
import { BillDocument, CompanyProfile } from '../../types';
import { amountToWords } from '../../utils/numberToWords';
import { SvgBarcode, SvgQrCode, getBillVerificationUrl } from './BarcodeAndQR';
import { InvoiceCircularLogo } from './InvoiceCircularLogo';

interface Props {
  bill: BillDocument;
  company: CompanyProfile;
}

function formatInvoiceDate(dateString: string): string {
  if (!dateString) return '';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

export const BillTemplateGst: React.FC<Props> = ({ bill, company }) => {
  const words = amountToWords(bill.grandTotal, company.currencyCode);
  const formattedDate = formatInvoiceDate(bill.billDate);
  const invoiceSl = bill.id ? bill.id.replace(/[^0-9]/g, '').slice(-4) || '2989' : '2989';

  // Format currency numbers without currency symbol for clean invoice tabular look
  const formatNumber = (num: number) => {
    return num.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  return (
    <div className="bg-white p-8 max-w-[210mm] min-h-[297mm] mx-auto text-slate-900 text-xs leading-normal font-sans shadow-lg print:shadow-none print:p-0 flex flex-col justify-between">
      <div>
        {/* Header: Logo + Company Info | Barcode + Invoice Meta */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-200">
          {/* Left / Center Company Details */}
          <div className="flex items-start gap-4 flex-1">
            {/* Print-Proof Vector Logo */}
            <InvoiceCircularLogo
              logoUrl={company.logoUrl}
              companyName={company.name}
              size={76}
            />

            {/* Address & Contacts */}
            <div className="space-y-0.5 pr-6 border-r border-slate-200 text-[11px] text-slate-700">
              <h1 className="text-base font-bold text-slate-950 uppercase tracking-tight">
                {company.name}
              </h1>
              <p className="max-w-xs text-slate-600 leading-tight">
                {company.address}, {company.city} - {company.pincode}
              </p>
              <div className="pt-0.5 space-y-0.5">
                <div>
                  Phone: <span className="font-mono-numbers text-slate-900">{company.phone}</span>
                </div>
                {company.whatsapp && (
                  <div>
                    Mobile: <span className="font-mono-numbers text-slate-900">{company.whatsapp}</span>
                  </div>
                )}
                {company.email && (
                  <div>
                    Email: <span className="text-slate-800">{company.email}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Invoice & Barcode Block */}
          <div className="flex flex-col items-end text-right text-[11px] text-slate-800 space-y-0.5 min-w-[190px]">
            <div className="mb-1">
              <SvgBarcode value={bill.billNumber} className="h-7 w-40" />
            </div>
            <div>
              <span className="text-slate-600">Invoice N°:</span>{' '}
              <strong className="font-mono-numbers text-slate-950">{bill.billNumber}</strong>
            </div>
            <div>
              <span className="text-slate-600">InvSL:</span>{' '}
              <strong className="font-mono-numbers text-slate-950"># {invoiceSl}</strong>
            </div>
            <div>
              <span className="text-slate-600">User:</span>{' '}
              <span className="text-slate-900 font-medium">Sales Executive</span>
            </div>
            <div>
              <span className="text-slate-600">Date:</span>{' '}
              <strong className="text-slate-950">{formattedDate}</strong>
            </div>
          </div>
        </div>

        {/* Title Banner */}
        <div className="my-3 text-center">
          <h2 className="text-sm font-bold text-sky-600 tracking-wider uppercase">
            SALES INVOICE
          </h2>
        </div>

        {/* Customer & Address 2-Column Section */}
        <div className="grid grid-cols-2 gap-6 mb-4 text-[11px]">
          <div>
            <div className="font-bold text-slate-900 mb-0.5">Customer</div>
            <div className="font-bold text-slate-950 uppercase text-xs">
              {bill.clientDetails.company || bill.clientDetails.name}
            </div>
            <div className="text-slate-700 mt-0.5">
              Contact: <span className="font-mono-numbers font-medium">{bill.clientDetails.phone}</span>
            </div>
            <div className="text-slate-700">
              Client ID: <span className="font-mono-numbers">{bill.clientDetails.id ? bill.clientDetails.id.toUpperCase() : 'ABA/SU/014'}</span>
            </div>
          </div>

          <div>
            <div className="font-bold text-slate-900 mb-0.5">Address</div>
            <div className="text-slate-800 uppercase font-medium leading-relaxed">
              {bill.clientDetails.shippingSameAsBilling
                ? bill.clientDetails.billingAddress
                : bill.clientDetails.shippingAddress || bill.clientDetails.billingAddress}
              {bill.clientDetails.billingCity ? `, ${bill.clientDetails.billingCity}` : ''}
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border-t-2 border-red-500 overflow-hidden mb-3">
          <table className="w-full border-collapse text-left text-[11px]">
            <thead>
              <tr className="border-b border-slate-300 text-slate-900 font-bold bg-white">
                <th className="py-2 px-2 w-8 text-center border-r border-slate-200">N°</th>
                <th className="py-2 px-3 border-r border-slate-200">Description(Code)</th>
                <th className="py-2 px-2 w-24 text-right border-r border-slate-200">Price</th>
                <th className="py-2 px-2 w-24 text-center border-r border-slate-200">Qty</th>
                <th className="py-2 px-2 w-16 text-center border-r border-slate-200">Dis</th>
                <th className="py-2 px-3 w-28 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {bill.items.map((item, idx) => (
                <tr key={item.id || idx} className="align-top">
                  <td className="py-2 px-2 text-center font-mono-numbers text-slate-700 border-r border-slate-200">
                    {idx + 1}
                  </td>
                  <td className="py-2 px-3 border-r border-slate-200">
                    <div className="font-bold text-slate-950 uppercase">{item.name}</div>
                    {(item.description || item.warranty) && (
                      <div className="text-[10px] text-slate-600 mt-0.5 font-normal">
                        {item.description ? `${item.description}, ` : ''}
                        {item.warranty ? `${item.warranty}.` : ''}
                      </div>
                    )}
                  </td>
                  <td className="py-2 px-2 text-right font-mono-numbers text-slate-900 border-r border-slate-200">
                    {formatNumber(item.unitPrice)}
                  </td>
                  <td className="py-2 px-2 text-center font-mono-numbers text-slate-900 border-r border-slate-200 whitespace-nowrap">
                    {item.quantity.toFixed(2)} {item.unit}
                  </td>
                  <td className="py-2 px-2 text-center font-mono-numbers text-slate-600 border-r border-slate-200">
                    {item.discountPercent > 0 ? `${item.discountPercent}%` : ''}
                  </td>
                  <td className="py-2 px-3 text-right font-mono-numbers font-semibold text-slate-950">
                    {formatNumber(item.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Summary Box (Right Aligned) */}
        <div className="flex justify-end mb-3">
          <div className="w-64 border border-slate-200 divide-y divide-slate-200 text-[11px]">
            <div className="flex justify-between py-1 px-3">
              <span className="font-bold text-slate-800">Sub Total</span>
              <span className="font-mono-numbers font-semibold text-slate-950">
                {formatNumber(bill.subtotal)}
              </span>
            </div>
            <div className="flex justify-between py-1 px-3">
              <span className="font-bold text-slate-800">Gross Total</span>
              <span className="font-mono-numbers font-bold text-slate-950">
                {formatNumber(bill.grandTotal)}
              </span>
            </div>
            <div className="flex justify-between py-1 px-3">
              <span className="font-bold text-slate-800">Paid Amount</span>
              <span className="font-mono-numbers font-semibold text-slate-950">
                {formatNumber(bill.amountPaid)}
              </span>
            </div>
            <div className="flex justify-between py-1 px-3 bg-slate-50">
              <span className="font-bold text-slate-950">Outstanding</span>
              <span className="font-mono-numbers font-bold text-slate-950">
                {formatNumber(bill.balanceDue)}
              </span>
            </div>
          </div>
        </div>

        {/* Amount in words */}
        <div className="mb-4 text-[11px]">
          <span className="font-bold text-slate-900">Amount in words:</span>{' '}
          <span className="font-bold text-slate-900 uppercase">{words}</span>
        </div>

        {/* Terms & Conditions */}
        <div className="text-[10px] text-slate-700 space-y-1 mb-6">
          <div className="font-bold text-slate-900 text-[11px]">Terms & Conditions:</div>
          <div className="text-slate-600">
            {bill.notes || 'This is your note where you can write your Note, Terms & Condition'}
          </div>
          <ol className="list-decimal pl-4 space-y-0.5 text-slate-700">
            <li>VAT & Taxes are not included in the above price.</li>
            <li>Read the manual or warranty card supplied with the product with attention and follow instructions properly.</li>
            <li>Delivery of document/warranty is subject to clearance of all dues (if any).</li>
            <li>Goods once sold are supported under standard official manufacturer warranty terms.</li>
          </ol>
        </div>
      </div>

      {/* Footer: Signatures, QR Code & Copyright */}
      <div className="pt-6 border-t border-slate-200">
        <div className="grid grid-cols-3 items-center gap-4 text-center">
          {/* Customer Signature */}
          <div className="flex flex-col items-center">
            <div className="w-48 border-t border-slate-700 pt-1 text-[11px] font-semibold text-slate-800">
              Customer Signature
            </div>
          </div>

          {/* QR Code */}
          <div className="flex justify-center">
            <SvgQrCode value={getBillVerificationUrl(bill)} size={68} />
          </div>

          {/* Authorized Signature */}
          <div className="flex flex-col items-center">
            <div className="w-48 border-t border-slate-700 pt-1 text-[11px] font-semibold text-slate-800">
              Authorized Signature
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-4 text-center text-[10px] text-slate-500 font-medium tracking-wide uppercase">
          {company.name}. © {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
};
