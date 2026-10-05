import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  CompanyProfile,
  Client,
  ProductItem,
  BillDocument,
  ChallanDocument,
  ActiveTab,
  ChallanStatus,
  BackupData,
  BackupImportResult,
} from '../types';
import {
  DEFAULT_COMPANY,
  INITIAL_CLIENTS,
  INITIAL_PRODUCTS,
  INITIAL_BILLS,
  INITIAL_CHALLANS,
} from '../utils/sampleData';
import { calculateBillSummary, calculateItemRow, isInterState } from '../utils/calculations';

interface AppContextType {
  company: CompanyProfile;
  clients: Client[];
  products: ProductItem[];
  bills: BillDocument[];
  challans: ChallanDocument[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  editingBill: BillDocument | null;
  setEditingBill: (bill: BillDocument | null) => void;
  editingChallan: ChallanDocument | null;
  setEditingChallan: (challan: ChallanDocument | null) => void;
  previewDoc: { type: 'bill' | 'challan'; doc: BillDocument | ChallanDocument } | null;
  setPreviewDoc: (doc: { type: 'bill' | 'challan'; doc: BillDocument | ChallanDocument } | null) => void;
  
  // Bill operations
  saveBill: (bill: BillDocument) => void;
  deleteBill: (id: string) => void;
  duplicateBill: (id: string) => void;
  markBillPayment: (id: string, amountPaid: number, method?: string) => void;

  // Challan operations
  saveChallan: (challan: ChallanDocument) => void;
  deleteChallan: (id: string) => void;
  updateChallanStatus: (id: string, status: ChallanStatus) => void;
  convertChallanToBill: (challanId: string) => void;

  // Client operations
  saveClient: (client: Client) => void;
  deleteClient: (id: string) => void;

  // Product operations
  saveProduct: (product: ProductItem) => void;
  deleteProduct: (id: string) => void;

  // Company settings
  updateCompany: (profile: Partial<CompanyProfile>) => void;

  // Backup & Import
  exportBackup: () => void;
  importBackup: (jsonContent: string, mode?: 'replace' | 'merge') => BackupImportResult;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  COMPANY: 'voucherflow_company',
  CLIENTS: 'voucherflow_clients',
  PRODUCTS: 'voucherflow_products',
  BILLS: 'voucherflow_bills',
  CHALLANS: 'voucherflow_challans',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load state from localStorage with migration to M.A. TECH ENTERPRISE
  const [company, setCompany] = useState<CompanyProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.name === 'M.A. TECH ENTERPRISE' || parsed.name === 'M A Tech Enterprise') {
          return parsed;
        }
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_COMPANY;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const savedCompany = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (savedCompany) {
      try {
        const parsedComp = JSON.parse(savedCompany);
        if (parsedComp.name === 'M.A. TECH ENTERPRISE' || parsedComp.name === 'M A Tech Enterprise') {
          const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
          return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
        }
      } catch (e) {}
    }
    return INITIAL_CLIENTS;
  });

  const [products, setProducts] = useState<ProductItem[]>(() => {
    const savedCompany = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (savedCompany) {
      try {
        const parsedComp = JSON.parse(savedCompany);
        if (parsedComp.name === 'M.A. TECH ENTERPRISE' || parsedComp.name === 'M A Tech Enterprise') {
          const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
          return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
        }
      } catch (e) {}
    }
    return INITIAL_PRODUCTS;
  });

  const [bills, setBills] = useState<BillDocument[]>(() => {
    const savedCompany = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (savedCompany) {
      try {
        const parsedComp = JSON.parse(savedCompany);
        if (parsedComp.name === 'M.A. TECH ENTERPRISE' || parsedComp.name === 'M A Tech Enterprise') {
          const saved = localStorage.getItem(STORAGE_KEYS.BILLS);
          return saved ? JSON.parse(saved) : INITIAL_BILLS;
        }
      } catch (e) {}
    }
    return INITIAL_BILLS;
  });

  const [challans, setChallans] = useState<ChallanDocument[]>(() => {
    const savedCompany = localStorage.getItem(STORAGE_KEYS.COMPANY);
    if (savedCompany) {
      try {
        const parsedComp = JSON.parse(savedCompany);
        if (parsedComp.name === 'M.A. TECH ENTERPRISE' || parsedComp.name === 'M A Tech Enterprise') {
          const saved = localStorage.getItem(STORAGE_KEYS.CHALLANS);
          return saved ? JSON.parse(saved) : INITIAL_CHALLANS;
        }
      } catch (e) {}
    }
    return INITIAL_CHALLANS;
  });

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [editingBill, setEditingBill] = useState<BillDocument | null>(null);
  const [editingChallan, setEditingChallan] = useState<ChallanDocument | null>(null);
  const [previewDoc, setPreviewDoc] = useState<{
    type: 'bill' | 'challan';
    doc: BillDocument | ChallanDocument;
  } | null>(null);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(company));
  }, [company]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(bills));
  }, [bills]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(challans));
  }, [challans]);

  // Bill Operations
  const saveBill = (bill: BillDocument) => {
    setBills((prev) => {
      const idx = prev.findIndex((b) => b.id === bill.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...bill, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [{ ...bill, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev];
    });
    setEditingBill(null);
    setActiveTab('bills');
  };

  const deleteBill = (id: string) => {
    setBills((prev) => prev.filter((b) => b.id !== id));
    if (previewDoc?.doc.id === id) {
      setPreviewDoc(null);
    }
  };

  const duplicateBill = (id: string) => {
    const original = bills.find((b) => b.id === id);
    if (!original) return;

    const newNumber = `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(4, '0')}`;
    const duplicated: BillDocument = {
      ...original,
      id: `bill_${Date.now()}`,
      billNumber: newNumber,
      billDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      amountPaid: 0,
      balanceDue: original.grandTotal,
      paymentStatus: 'unpaid',
      paymentMethod: undefined,
      referenceChallanId: undefined,
      referenceChallanNo: undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    setEditingBill(duplicated);
    setActiveTab('new-bill');
  };

  const markBillPayment = (id: string, amountPaid: number, method?: string) => {
    setBills((prev) =>
      prev.map((b) => {
        if (b.id !== id) return b;
        const newPaid = Math.max(0, amountPaid);
        const newBalance = Math.max(0, b.grandTotal - newPaid);
        let newStatus: BillDocument['paymentStatus'] = 'unpaid';
        if (newPaid >= b.grandTotal && b.grandTotal > 0) {
          newStatus = 'paid';
        } else if (newPaid > 0) {
          newStatus = 'partial';
        }
        return {
          ...b,
          amountPaid: newPaid,
          balanceDue: newBalance,
          paymentStatus: newStatus,
          paymentMethod: method || b.paymentMethod,
          updatedAt: new Date().toISOString(),
        };
      })
    );
  };

  // Challan Operations
  const saveChallan = (challan: ChallanDocument) => {
    setChallans((prev) => {
      const idx = prev.findIndex((c) => c.id === challan.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = { ...challan, updatedAt: new Date().toISOString() };
        return updated;
      }
      return [{ ...challan, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }, ...prev];
    });
    setEditingChallan(null);
    setActiveTab('challans');
  };

  const deleteChallan = (id: string) => {
    setChallans((prev) => prev.filter((c) => c.id !== id));
    if (previewDoc?.doc.id === id) {
      setPreviewDoc(null);
    }
  };

  const updateChallanStatus = (id: string, status: ChallanStatus) => {
    setChallans((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status, updatedAt: new Date().toISOString() } : c))
    );
  };

  /**
   * Enterprise feature: Convert a delivery challan directly into an invoice/bill!
   */
  const convertChallanToBill = (challanId: string) => {
    const challan = challans.find((c) => c.id === challanId);
    if (!challan) return;

    const newBillNumber = `INV-${new Date().getFullYear()}-${String(bills.length + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];
    const dueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const taxType = 'standard-vat';

    // Recalculate each row for the bill
    const billItems = challan.items.map((row) => calculateItemRow(row, taxType));
    const summary = calculateBillSummary(billItems, 0, true, 0, dueDate);

    const newBill: BillDocument = {
      id: `bill_${Date.now()}`,
      type: 'bill',
      billNumber: newBillNumber,
      billDate: today,
      dueDate: dueDate,
      poNumber: '',
      referenceChallanId: challan.id,
      referenceChallanNo: challan.challanNumber,
      clientId: challan.clientId,
      clientDetails: challan.clientDetails,
      items: billItems,
      subtotal: summary.subtotal,
      totalDiscount: summary.totalDiscount,
      totalTaxable: summary.totalTaxable,
      taxType,
      totalTax: summary.totalTax,
      cgstTotal: 0,
      sgstTotal: 0,
      igstTotal: 0,
      shippingCharges: 0,
      applyRoundOff: true,
      roundOff: summary.roundOff,
      grandTotal: summary.grandTotal,
      amountPaid: 0,
      balanceDue: summary.grandTotal,
      paymentStatus: 'unpaid',
      notes: `Generated against Delivery Challan (Mushak-6.5) #${challan.challanNumber}. Vehicle: ${challan.vehicleNumber || 'N/A'}.`,
      terms: company.termsAndConditions,
      templateStyle: 'vat-mushak',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update challan status to converted and link bill
    updateChallanStatus(challanId, 'converted');
    setChallans((prev) =>
      prev.map((c) => (c.id === challanId ? { ...c, convertedToBillId: newBill.id } : c))
    );

    setEditingBill(newBill);
    setActiveTab('new-bill');
  };

  // Client Operations
  const saveClient = (client: Client) => {
    setClients((prev) => {
      const idx = prev.findIndex((c) => c.id === client.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = client;
        return updated;
      }
      return [client, ...prev];
    });
  };

  const deleteClient = (id: string) => {
    setClients((prev) => prev.filter((c) => c.id !== id));
  };

  // Product Operations
  const saveProduct = (product: ProductItem) => {
    setProducts((prev) => {
      const idx = prev.findIndex((p) => p.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = product;
        return updated;
      }
      return [product, ...prev];
    });
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const updateCompany = (profile: Partial<CompanyProfile>) => {
    setCompany((prev) => ({ ...prev, ...profile }));
  };

  const exportBackup = () => {
    const data: BackupData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      appName: 'M.A. TECH ENTERPRISE - Billing & Inventory Suite',
      stats: {
        totalBills: bills.length,
        totalChallans: challans.length,
        totalProducts: products.length,
        totalClients: clients.length,
      },
      company,
      clients,
      products,
      bills,
      challans,
    };
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2));
    const nowStr = new Date().toISOString().slice(0, 10);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `MA_TECH_ENTERPRISE_Backup_${nowStr}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const importBackup = (jsonContent: string, mode: 'replace' | 'merge' = 'replace'): BackupImportResult => {
    try {
      const parsed = JSON.parse(jsonContent);
      
      // Determine candidate records (supports wrapped or raw array export)
      const candidateCompany = parsed.company;
      const candidateClients = Array.isArray(parsed.clients) ? parsed.clients : [];
      const candidateProducts = Array.isArray(parsed.products) ? parsed.products : [];
      const candidateBills = Array.isArray(parsed.bills) ? parsed.bills : [];
      const candidateChallans = Array.isArray(parsed.challans) ? parsed.challans : [];

      if (
        !candidateCompany &&
        candidateClients.length === 0 &&
        candidateProducts.length === 0 &&
        candidateBills.length === 0 &&
        candidateChallans.length === 0
      ) {
        return {
          success: false,
          message: 'Invalid backup file: No valid company, client, item, or invoice records found.',
        };
      }

      if (mode === 'replace') {
        if (candidateCompany) {
          setCompany(candidateCompany);
          localStorage.setItem(STORAGE_KEYS.COMPANY, JSON.stringify(candidateCompany));
        }
        setClients(candidateClients);
        localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(candidateClients));

        setProducts(candidateProducts);
        localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(candidateProducts));

        setBills(candidateBills);
        localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(candidateBills));

        setChallans(candidateChallans);
        localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(candidateChallans));
      } else {
        // Merge mode: combine unique by ID or identifiers
        if (candidateCompany) {
          setCompany((prev) => ({ ...prev, ...candidateCompany }));
        }

        setClients((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const toAdd = candidateClients.filter((c: Client) => !existingIds.has(c.id));
          const merged = [...prev, ...toAdd];
          localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(merged));
          return merged;
        });

        setProducts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const toAdd = candidateProducts.filter((p: ProductItem) => !existingIds.has(p.id));
          const merged = [...prev, ...toAdd];
          localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(merged));
          return merged;
        });

        setBills((prev) => {
          const existingIds = new Set(prev.map((b) => b.id));
          const toAdd = candidateBills.filter((b: BillDocument) => !existingIds.has(b.id));
          const merged = [...prev, ...toAdd];
          localStorage.setItem(STORAGE_KEYS.BILLS, JSON.stringify(merged));
          return merged;
        });

        setChallans((prev) => {
          const existingIds = new Set(prev.map((c) => c.id));
          const toAdd = candidateChallans.filter((c: ChallanDocument) => !existingIds.has(c.id));
          const merged = [...prev, ...toAdd];
          localStorage.setItem(STORAGE_KEYS.CHALLANS, JSON.stringify(merged));
          return merged;
        });
      }

      return {
        success: true,
        message: `Successfully restored ${candidateBills.length} invoices, ${candidateChallans.length} delivery challans, ${candidateProducts.length} products, and ${candidateClients.length} clients!`,
        counts: {
          bills: candidateBills.length,
          challans: candidateChallans.length,
          products: candidateProducts.length,
          clients: candidateClients.length,
        },
      };
    } catch (e: any) {
      console.error('Failed to parse backup JSON:', e);
      return {
        success: false,
        message: `Error parsing JSON file: ${e?.message || 'Invalid format'}`,
      };
    }
  };

  const resetToSampleData = () => {
    setCompany(DEFAULT_COMPANY);
    setClients(INITIAL_CLIENTS);
    setProducts(INITIAL_PRODUCTS);
    setBills(INITIAL_BILLS);
    setChallans(INITIAL_CHALLANS);
    setEditingBill(null);
    setEditingChallan(null);
    setPreviewDoc(null);
    setActiveTab('dashboard');
  };

  return (
    <AppContext.Provider
      value={{
        company,
        clients,
        products,
        bills,
        challans,
        activeTab,
        setActiveTab,
        editingBill,
        setEditingBill,
        editingChallan,
        setEditingChallan,
        previewDoc,
        setPreviewDoc,
        saveBill,
        deleteBill,
        duplicateBill,
        markBillPayment,
        saveChallan,
        deleteChallan,
        updateChallanStatus,
        convertChallanToBill,
        saveClient,
        deleteClient,
        saveProduct,
        deleteProduct,
        updateCompany,
        exportBackup,
        importBackup,
        resetToSampleData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
