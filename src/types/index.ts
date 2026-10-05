export interface CompanyProfile {
  name: string;
  tagline: string;
  bin?: string; // Business Identification Number (VAT Registration in Bangladesh - optional)
  tin?: string; // Taxpayer Identification Number (e-TIN - optional)
  gstin?: string; // fallback alias
  pan?: string; // fallback alias
  email: string;
  phone: string;
  whatsapp?: string;
  address: string;
  city: string;
  state: string; // Division/District (e.g. Dhaka, Chattogram)
  pincode: string;
  country: string;
  bankName: string;
  bankAccountNo: string;
  bankRoutingNo: string; // Bangladesh Bank Routing Number
  bankIfsc?: string; // fallback alias
  bankBranch: string;
  mfsNumber: string; // bKash / Nagad / Rocket Merchant ID
  upiId?: string; // fallback alias
  currencySymbol: string; // ৳
  currencyCode: 'BDT' | 'USD' | 'EUR' | 'GBP' | 'INR';
  termsAndConditions: string;
  signatureTitle: string;
  logoUrl?: string;
}

export interface Client {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  bin: string; // Client BIN (VAT ID)
  tin?: string;
  gstin?: string; // fallback
  billingAddress: string;
  billingCity: string;
  billingState: string; // Division (Dhaka, Chattogram, etc.)
  billingPincode: string;
  shippingSameAsBilling: boolean;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
}

export interface ProductItem {
  id: string;
  name: string;
  sku: string;
  hsnCode: string; // HS Code (8-digit / 4-digit Bangladesh Customs Tariff)
  unit: string; // Pcs, Box, Kg, Mtr, Nos, Set, Ton, Litre
  unitPrice: number;
  taxRate: number; // Bangladesh VAT rate: 15% standard, 10%, 7.5%, 5%, 0%
  description: string;
  warranty?: string; // e.g. "1 Year", "2 Years", "6 Months", "No Warranty"
  stock: number;
}

export interface DocumentItemRow {
  id: string;
  productId?: string;
  name: string;
  description?: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  warranty?: string; // e.g. "1 Year", "2 Years", "6 Months", "No Warranty"
  unitPrice: number;
  discountPercent: number;
  discountAmount: number;
  taxRate: number; // VAT rate %
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  taxAmount: number; // Total VAT amount
  total: number;
}

export type TaxType = 'standard-vat' | 'exempt' | 'custom-vat' | 'intra-state' | 'inter-state';

export type BillPaymentStatus = 'unpaid' | 'partial' | 'paid' | 'overdue';

export interface BillDocument {
  id: string;
  type: 'bill';
  billNumber: string;
  billDate: string;
  dueDate: string;
  poNumber?: string;
  referenceChallanId?: string;
  referenceChallanNo?: string; // Mushak-6.5 / Delivery Challan Ref
  clientId: string;
  clientDetails: Client;
  items: DocumentItemRow[];
  subtotal: number;
  totalDiscount: number;
  totalTaxable: number;
  taxType: TaxType;
  totalTax: number;
  cgstTotal: number;
  sgstTotal: number;
  igstTotal: number;
  shippingCharges: number;
  applyRoundOff: boolean;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  paymentStatus: BillPaymentStatus;
  paymentMethod?: string;
  notes: string;
  terms: string;
  templateStyle: 'vat-mushak' | 'classic' | 'gst-detailed';
  createdAt: string;
  updatedAt: string;
}

export type ChallanType = 'mushak-6.5' | 'delivery' | 'jobwork' | 'approval' | 'returnable' | 'transfer';
export type ChallanStatus = 'pending' | 'dispatched' | 'delivered' | 'returned' | 'converted';
export type DispatchMode = 'road' | 'courier' | 'hand' | 'rail' | 'waterway' | 'air';

export interface ChallanDocument {
  id: string;
  type: 'challan';
  challanNumber: string;
  challanDate: string;
  challanType: ChallanType;
  dispatchMode: DispatchMode;
  vehicleNumber: string; // e.g. Dhaka Metro-Ta 11-4589
  transporterName: string;
  lrNumber: string; // Tracking / Consignment note #
  ewayBillNo: string; // E-Challan / Gate Pass #
  driverName?: string;
  driverContact?: string;
  clientId: string;
  clientDetails: Client;
  items: DocumentItemRow[];
  totalQuantity: number;
  totalEstimatedValue: number;
  status: ChallanStatus;
  convertedToBillId?: string;
  notes: string;
  terms: string;
  templateStyle: 'standard' | 'minimal';
  createdAt: string;
  updatedAt: string;
}

export type ActiveTab = 'dashboard' | 'bills' | 'challans' | 'new-bill' | 'new-challan' | 'clients' | 'inventory' | 'settings';

export interface BackupData {
  version: string;
  exportedAt: string;
  appName: string;
  stats?: {
    totalBills: number;
    totalChallans: number;
    totalProducts: number;
    totalClients: number;
  };
  company: CompanyProfile;
  clients: Client[];
  products: ProductItem[];
  bills: BillDocument[];
  challans: ChallanDocument[];
}

export interface BackupImportResult {
  success: boolean;
  message: string;
  counts?: {
    bills: number;
    challans: number;
    products: number;
    clients: number;
  };
}
