import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { BillsList } from './components/BillsList';
import { ChallansList } from './components/ChallansList';
import { BillEditor } from './components/BillEditor';
import { ChallanEditor } from './components/ChallanEditor';
import { ClientsManager } from './components/ClientsManager';
import { InventoryManager } from './components/InventoryManager';
import { CompanySettings } from './components/CompanySettings';
import { DocumentPreview } from './components/DocumentPreview';
import { InvoiceVerificationModal } from './components/InvoiceVerificationModal';
import { BillDocument } from './types';

const MainContent: React.FC = () => {
  const { activeTab, previewDoc, setPreviewDoc, company, bills } = useApp();
  const [scannedInvoiceData, setScannedInvoiceData] = useState<{
    billNumber: string;
    bill?: BillDocument | null;
    rawPayload?: any;
  } | null>(null);

  useEffect(() => {
    // Check URL parameters when opened or scanned with a camera
    const params = new URLSearchParams(window.location.search);
    const scanInvoice = params.get('scan_invoice') || params.get('invoice') || params.get('view_bill');
    const dataEncoded = params.get('data') || params.get('v');

    if (scanInvoice || dataEncoded) {
      let rawPayload = null;
      if (dataEncoded) {
        try {
          rawPayload = JSON.parse(decodeURIComponent(atob(dataEncoded)));
        } catch (e) {
          console.error('Failed to parse scan data', e);
        }
      }

      // Find in existing bills if available
      const matchedBill = bills.find(
        (b) => b.billNumber === scanInvoice || (rawPayload?.n && b.billNumber === rawPayload.n)
      );

      setScannedInvoiceData({
        billNumber: scanInvoice || rawPayload?.n || 'INVOICE',
        bill: matchedBill || null,
        rawPayload,
      });
    }
  }, [bills]);

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'bills':
        return <BillsList />;
      case 'challans':
        return <ChallansList />;
      case 'new-bill':
        return <BillEditor />;
      case 'new-challan':
        return <ChallanEditor />;
      case 'clients':
        return <ClientsManager />;
      case 'inventory':
        return <InventoryManager />;
      case 'settings':
        return <CompanySettings />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar />

      <main className="flex-1 pb-12">
        {renderActiveView()}
      </main>

      {/* Document PDF & Print Modal */}
      {previewDoc && (
        <DocumentPreview onClose={() => setPreviewDoc(null)} />
      )}

      {/* QR Code Scanned Digital Invoice Verification Modal */}
      {scannedInvoiceData && (
        <InvoiceVerificationModal
          scannedData={scannedInvoiceData}
          company={company}
          onClose={() => {
            setScannedInvoiceData(null);
            // Clean URL query parameters smoothly without reloading
            const cleanUrl = window.location.pathname;
            window.history.replaceState({}, document.title, cleanUrl);
          }}
        />
      )}

      {/* Quiet, Clean Footer */}
      <footer className="no-print border-t border-slate-200 bg-white py-6 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">{company.name}</span>
            <span>·</span>
            <span>BIN: {company.bin || company.gstin}</span>
          </div>
          <div>
            VoucherFlow · Sales Invoicing & Delivery Challan System (Bangladesh)
          </div>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
