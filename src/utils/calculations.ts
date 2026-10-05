import { DocumentItemRow, TaxType, BillPaymentStatus } from '../types';

export function roundTo2Decimals(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Calculates a single row's taxable amount, VAT amount, and line total.
 */
export function calculateItemRow(
  row: Partial<DocumentItemRow>,
  taxType: TaxType = 'standard-vat'
): DocumentItemRow {
  const quantity = Math.max(0, Number(row.quantity) || 0);
  const unitPrice = Math.max(0, Number(row.unitPrice) || 0);
  const discountPercent = Math.min(100, Math.max(0, Number(row.discountPercent) || 0));
  const taxRate = Math.max(0, Number(row.taxRate) !== undefined ? Number(row.taxRate) : 15);

  const baseAmount = roundTo2Decimals(quantity * unitPrice);
  const discountAmount = roundTo2Decimals((baseAmount * discountPercent) / 100);
  const taxableAmount = Math.max(0, roundTo2Decimals(baseAmount - discountAmount));

  let taxAmount = 0;
  let cgstAmount = 0;
  let sgstAmount = 0;
  let igstAmount = 0;

  if (taxType === 'intra-state') {
    const halfRate = taxRate / 2;
    cgstAmount = roundTo2Decimals((taxableAmount * halfRate) / 100);
    sgstAmount = roundTo2Decimals((taxableAmount * halfRate) / 100);
    taxAmount = roundTo2Decimals(cgstAmount + sgstAmount);
  } else if (taxType === 'inter-state') {
    igstAmount = roundTo2Decimals((taxableAmount * taxRate) / 100);
    taxAmount = igstAmount;
  } else if (taxType === 'exempt') {
    taxAmount = 0;
  } else {
    // Standard VAT (e.g. Bangladesh 15% / 10% / 7.5% / 5% NBR VAT)
    taxAmount = roundTo2Decimals((taxableAmount * taxRate) / 100);
  }

  const total = roundTo2Decimals(taxableAmount + taxAmount);

  return {
    id: row.id || `item_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    productId: row.productId,
    name: row.name || '',
    description: row.description || '',
    hsnCode: row.hsnCode || '',
    quantity,
    unit: row.unit || 'Pcs',
    warranty: row.warranty !== undefined ? row.warranty : '1 Year Warranty',
    unitPrice,
    discountPercent,
    discountAmount,
    taxRate,
    taxableAmount,
    cgstAmount,
    sgstAmount,
    igstAmount,
    taxAmount,
    total,
  };
}

export interface BillSummaryCalculation {
  subtotal: number;
  totalDiscount: number;
  totalTaxable: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  totalTax: number;
  shippingCharges: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: BillPaymentStatus;
}

export function calculateBillSummary(
  items: DocumentItemRow[],
  shippingChargesInput: number,
  applyRoundOff: boolean,
  amountPaidInput: number,
  dueDateString: string
): BillSummaryCalculation {
  const shippingCharges = Math.max(0, Number(shippingChargesInput) || 0);
  const amountPaid = Math.max(0, Number(amountPaidInput) || 0);

  let subtotal = 0;
  let totalDiscount = 0;
  let totalTaxable = 0;
  let cgstTotal = 0;
  let sgstTotal = 0;
  let igstTotal = 0;
  let totalTax = 0;

  for (const item of items) {
    const base = item.quantity * item.unitPrice;
    subtotal += base;
    totalDiscount += item.discountAmount;
    totalTaxable += item.taxableAmount;
    cgstTotal += item.cgstAmount;
    sgstTotal += item.sgstAmount;
    igstTotal += item.igstAmount;
    totalTax += item.taxAmount;
  }

  subtotal = roundTo2Decimals(subtotal);
  totalDiscount = roundTo2Decimals(totalDiscount);
  totalTaxable = roundTo2Decimals(totalTaxable);
  cgstTotal = roundTo2Decimals(cgstTotal);
  sgstTotal = roundTo2Decimals(sgstTotal);
  igstTotal = roundTo2Decimals(igstTotal);
  totalTax = roundTo2Decimals(totalTax);

  const preTotal = roundTo2Decimals(totalTaxable + totalTax + shippingCharges);

  let grandTotal = preTotal;
  let roundOff = 0;

  if (applyRoundOff) {
    grandTotal = Math.round(preTotal);
    roundOff = roundTo2Decimals(grandTotal - preTotal);
  }

  const balanceDue = Math.max(0, roundTo2Decimals(grandTotal - amountPaid));

  let paymentStatus: BillPaymentStatus = 'unpaid';
  if (amountPaid >= grandTotal && grandTotal > 0) {
    paymentStatus = 'paid';
  } else if (amountPaid > 0) {
    paymentStatus = 'partial';
  } else {
    const today = new Date().toISOString().split('T')[0];
    if (dueDateString && dueDateString < today) {
      paymentStatus = 'overdue';
    } else {
      paymentStatus = 'unpaid';
    }
  }

  return {
    subtotal,
    totalDiscount,
    totalTaxable,
    cgstTotal,
    sgstTotal,
    igstTotal,
    totalTax,
    shippingCharges,
    roundOff,
    grandTotal,
    amountPaid,
    balanceDue,
    paymentStatus,
  };
}

export function isInterState(companyState: string, clientState: string): boolean {
  if (!companyState || !clientState) return false;
  return companyState.trim().toLowerCase() !== clientState.trim().toLowerCase();
}

/**
 * Format currency values cleanly with Taka (৳) and South Asian formatting
 */
export function formatCurrency(
  value: number,
  currencySymbol: string = '৳'
): string {
  const formatted = Math.abs(value).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${value < 0 ? '-' : ''}${currencySymbol}${formatted}`;
}
