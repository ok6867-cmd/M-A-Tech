import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import {
  BillDocument,
  DocumentItemRow,
  TaxType,
  Client,
  ProductItem,
} from '../types';
import {
  calculateItemRow,
  calculateBillSummary,
  formatCurrency,
  isInterState,
} from '../utils/calculations';
import { amountToWords } from '../utils/numberToWords';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Eye,
  Percent,
  CheckCircle,
  AlertCircle,
  Truck,
  Package,
  User,
  Phone,
  MapPin,
  Building2,
  Mail,
  MessageCircle,
} from 'lucide-react';

export const BillEditor: React.FC = () => {
  const {
    company,
    clients,
    products,
    bills,
    editingBill,
    saveBill,
    saveClient,
    setActiveTab,
    setPreviewDoc,
  } = useApp();

  // Helper to generate new invoice number
  const generateBillNumber = () => {
    const year = new Date().getFullYear();
    const count = bills.length + 1;
    return `INV-${year}-${String(count).padStart(4, '0')}`;
  };

  const [billNumber, setBillNumber] = useState(
    editingBill?.billNumber || generateBillNumber()
  );
  const [billDate, setBillDate] = useState(
    editingBill?.billDate || new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState(editingBill?.dueDate || '');
  const [poNumber, setPoNumber] = useState(editingBill?.poNumber || '');
  const [referenceChallanNo, setReferenceChallanNo] = useState(
    editingBill?.referenceChallanNo || ''
  );
  const [selectedClientId, setSelectedClientId] = useState<string>(
    editingBill?.clientId || (clients.length > 0 ? clients[0].id : '')
  );

  const [selectedClient, setSelectedClient] = useState<Client>(() => {
    if (editingBill) return editingBill.clientDetails;
    return clients[0] || ({} as Client);
  });

  const [taxType, setTaxType] = useState<TaxType>(
    editingBill?.taxType || 'exempt'
  );

  const [items, setItems] = useState<DocumentItemRow[]>(() => {
    if (editingBill && editingBill.items.length > 0) {
      return editingBill.items;
    }
    // Default initial row
    return [
      calculateItemRow(
        {
          name: '',
          hsnCode: '',
          quantity: 1,
          unit: 'Pcs',
          unitPrice: 0,
          discountPercent: 0,
          taxRate: 18,
        },
        'intra-state'
      ),
    ];
  });

  const [shippingCharges, setShippingCharges] = useState<number>(
    editingBill?.shippingCharges || 0
  );
  const [applyRoundOff, setApplyRoundOff] = useState<boolean>(
    editingBill?.applyRoundOff !== undefined ? editingBill.applyRoundOff : true
  );
  const [amountPaid, setAmountPaid] = useState<number>(
    editingBill?.amountPaid || 0
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    editingBill?.paymentMethod || ''
  );
  const [notes, setNotes] = useState<string>(
    editingBill?.notes || 'Thank you for your business!'
  );
  const [terms, setTerms] = useState<string>(
    editingBill?.terms || company.termsAndConditions
  );
  const [templateStyle, setTemplateStyle] = useState<'classic' | 'gst-detailed'>(
    editingBill?.templateStyle === 'classic' ? 'classic' : 'gst-detailed'
  );

  // When client changes, auto-detect inter-state vs intra-state tax
  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) {
      setSelectedClient(client);
      const interState = isInterState(company.state, client.billingState);
      const newTaxType = interState ? 'inter-state' : 'intra-state';
      setTaxType(newTaxType);
      // Recalculate all existing rows with new tax type
      setItems((prev) => prev.map((row) => calculateItemRow(row, newTaxType)));
    }
  };

  const [clientSavedNotice, setClientSavedNotice] = useState(false);

  const handleClientFieldChange = (field: keyof Client, value: any) => {
    setSelectedClient((prev) => ({
      ...prev,
      [field]: value,
      ...(field === 'billingAddress' && prev.shippingSameAsBilling ? { shippingAddress: value } : {}),
      ...(field === 'billingCity' && prev.shippingSameAsBilling ? { shippingCity: value } : {}),
    }));
  };

  const handleQuickNewClient = () => {
    const newId = `cli_${Date.now()}`;
    const freshClient: Client = {
      id: newId,
      name: '',
      company: '',
      email: '',
      phone: '',
      bin: '',
      tin: '',
      billingAddress: '',
      billingCity: 'Dhaka',
      billingState: 'Dhaka Division',
      billingPincode: '1216',
      shippingSameAsBilling: true,
      shippingAddress: '',
      shippingCity: 'Dhaka',
      shippingState: 'Dhaka Division',
      shippingPincode: '1216',
    };
    setSelectedClientId(newId);
    setSelectedClient(freshClient);
  };

  const handleSaveCurrentClient = () => {
    if (!selectedClient.name.trim()) return;
    saveClient(selectedClient);
    setClientSavedNotice(true);
    setTimeout(() => setClientSavedNotice(false), 2000);
  };

  // Recalculate rows when taxType toggles manually
  const handleTaxTypeChange = (newTaxType: TaxType) => {
    setTaxType(newTaxType);
    setItems((prev) => prev.map((row) => calculateItemRow(row, newTaxType)));
  };

  // Row update handler
  const handleRowChange = (
    index: number,
    field: keyof DocumentItemRow,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const currentRow = { ...updated[index], [field]: value };
      updated[index] = calculateItemRow(currentRow, taxType);
      return updated;
    });
  };

  // Pick item from product catalog
  const handleSelectProduct = (index: number, productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (!product) return;

    setItems((prev) => {
      const updated = [...prev];
      const row = {
        ...updated[index],
        productId: product.id,
        name: product.name,
        description: product.description,
        hsnCode: product.hsnCode,
        unit: product.unit,
        warranty: product.warranty || '1 Year Warranty',
        unitPrice: product.unitPrice,
        taxRate: product.taxRate,
      };
      updated[index] = calculateItemRow(row, taxType);
      return updated;
    });
  };

  const handleAddRow = () => {
    setItems((prev) => [
      ...prev,
      calculateItemRow(
        {
          name: '',
          hsnCode: '',
          quantity: 1,
          unit: 'Pcs',
          warranty: '1 Year Warranty',
          unitPrice: 0,
          discountPercent: 0,
          taxRate: 18,
        },
        taxType
      ),
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Real-time Automated Document Summary calculation
  const summary = calculateBillSummary(
    items,
    shippingCharges,
    applyRoundOff,
    amountPaid,
    dueDate
  );

  const amountWords = amountToWords(summary.grandTotal, company.currencyCode);

  const constructBillDoc = (): BillDocument => {
    return {
      id: editingBill?.id || `bill_${Date.now()}`,
      type: 'bill',
      billNumber: billNumber.trim() || generateBillNumber(),
      billDate,
      dueDate,
      poNumber: poNumber.trim(),
      referenceChallanId: editingBill?.referenceChallanId,
      referenceChallanNo: referenceChallanNo.trim(),
      clientId: selectedClientId,
      clientDetails: selectedClient,
      items,
      subtotal: summary.subtotal,
      totalDiscount: summary.totalDiscount,
      totalTaxable: summary.totalTaxable,
      taxType,
      totalTax: summary.totalTax,
      cgstTotal: summary.cgstTotal,
      sgstTotal: summary.sgstTotal,
      igstTotal: summary.igstTotal,
      shippingCharges,
      applyRoundOff,
      roundOff: summary.roundOff,
      grandTotal: summary.grandTotal,
      amountPaid: summary.amountPaid,
      balanceDue: summary.balanceDue,
      paymentStatus: summary.paymentStatus,
      paymentMethod,
      notes,
      terms,
      templateStyle,
      createdAt: editingBill?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!billNumber.trim()) {
      alert('Please provide an invoice number.');
      return;
    }
    if (!selectedClient || !selectedClient.name) {
      alert('Please select or specify a client.');
      return;
    }
    const doc = constructBillDoc();
    saveBill(doc);
  };

  const handleOpenPreview = () => {
    const doc = constructBillDoc();
    setPreviewDoc({ type: 'bill', doc });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('bills')}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {editingBill ? `Edit Invoice ${billNumber}` : 'Create New Invoice'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Automated calculations for tax rates, round-offs, discounts, and balances
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleOpenPreview}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors shadow-xs"
          >
            <Eye className="w-4 h-4 text-slate-500" />
            <span>Preview & PDF</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs"
          >
            <Save className="w-4 h-4" />
            <span>Save Invoice</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Document Meta & Client Selection Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                value={billNumber}
                onChange={(e) => setBillNumber(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono-numbers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Invoice Date *
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PO / Order Number
              </label>
              <input
                type="text"
                value={poNumber}
                onChange={(e) => setPoNumber(e.target.value)}
                placeholder="e.g. PO-2026-904"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Client Information Section (Name, Number, Address) */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Client Information (গ্রাহকের তথ্য)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Customer Name, Mobile/WhatsApp Number & Delivery Address
                  </p>
                </div>
              </div>

              {/* Quick actions: Select existing or Create new */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={selectedClientId}
                  onChange={(e) => handleClientChange(e.target.value)}
                  className="px-2.5 py-1 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 bg-white font-medium max-w-[220px]"
                >
                  <option value="" disabled>-- Pick from Address Book --</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} {c.company ? `(${c.company})` : ''} - {c.phone}
                    </option>
                  ))}
                </select>

                <button
                  type="button"
                  onClick={handleQuickNewClient}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  title="Clear and enter fresh customer"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ New Client</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveCurrentClient}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                  title="Save this customer to saved address book"
                >
                  {clientSavedNotice ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-600" />
                      <span className="text-emerald-700">Saved!</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-3 h-3" />
                      <span>Save to Contacts</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Core 3 Client Fields: Name, Number, Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {/* 1. Client Name */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Client Name (গ্রাহকের নাম) *</span>
                </label>
                <input
                  type="text"
                  value={selectedClient.name || ''}
                  onChange={(e) => handleClientFieldChange('name', e.target.value)}
                  placeholder="e.g. Kamrul Hasan / Rafiqul Islam"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-slate-50/50"
                />
              </div>

              {/* 2. Client Phone / Number */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mobile / WhatsApp (ফোন নম্বর) *</span>
                  </span>
                  {selectedClient.phone && (
                    <a
                      href={`https://wa.me/88${selectedClient.phone.replace(/[^0-9]/g, '').replace(/^88/, '').replace(/^0/, '880')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[10px] text-emerald-600 hover:underline flex items-center gap-0.5"
                    >
                      <MessageCircle className="w-2.5 h-2.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </label>
                <input
                  type="text"
                  value={selectedClient.phone || ''}
                  onChange={(e) => handleClientFieldChange('phone', e.target.value)}
                  placeholder="e.g. 01712-458921 / 01628491979"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 bg-slate-50/50"
                />
              </div>

              {/* 3. Company / Organization Name (Optional) */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Company / Shop (প্রতিষ্ঠান / দোকান)</span>
                </label>
                <input
                  type="text"
                  value={selectedClient.company || ''}
                  onChange={(e) => handleClientFieldChange('company', e.target.value)}
                  placeholder="e.g. Mirpur Diagnostic / Al-Madina Mart"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Client Full Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Client Address (ঠিকানা - বাসা/রোড/এলাকা) *</span>
                </label>
                <input
                  type="text"
                  value={selectedClient.billingAddress || ''}
                  onChange={(e) => handleClientFieldChange('billingAddress', e.target.value)}
                  placeholder="e.g. House 14, Main Road, Block C, Section 11, Pallabi, Mirpur"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  City & Postal Code (শহর ও পোস্ট কোড)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={selectedClient.billingCity || ''}
                    onChange={(e) => handleClientFieldChange('billingCity', e.target.value)}
                    placeholder="Mirpur, Dhaka"
                    className="w-2/3 px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none text-slate-900 bg-slate-50/50"
                  />
                  <input
                    type="text"
                    value={selectedClient.billingPincode || ''}
                    onChange={(e) => handleClientFieldChange('billingPincode', e.target.value)}
                    placeholder="1216"
                    className="w-1/3 px-2 py-1.5 text-xs rounded-lg border border-slate-300 font-mono-numbers focus:outline-none text-slate-900 bg-slate-50/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Line Items Table with Real-time Automated Row Math */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Line Items & Automated Calculations
            </h3>
            <span className="text-xs text-slate-500">
              {items.length} item{items.length > 1 ? 's' : ''} listed
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3 min-w-[240px]">Item Description & Catalog (পণ্যের বিবরণ)</th>
                  <th className="py-2.5 px-2 w-20 text-right">Qty</th>
                  <th className="py-2.5 px-2 w-20">Unit</th>
                  <th className="py-2.5 px-2 w-36">Warranty (ওয়ারেন্টি)</th>
                  <th className="py-2.5 px-2 w-28 text-right">Rate (দর ৳)</th>
                  <th className="py-2.5 px-3 w-32 text-right">Total (মোট ৳)</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3 text-slate-400 font-mono-numbers">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <div className="space-y-1">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                            placeholder="Product or accessory name..."
                            required
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          />
                          {products.length > 0 && (
                            <select
                              value={row.productId || ''}
                              onChange={(e) => handleSelectProduct(idx, e.target.value)}
                              className="w-32 px-1.5 py-1 text-[11px] border border-slate-200 rounded bg-slate-50 text-slate-600 focus:outline-none"
                              title="Pick from saved inventory"
                            >
                              <option value="">Catalog...</option>
                              {products.map((p) => (
                                <option key={p.id} value={p.id}>
                                  {p.name}
                                </option>
                              ))}
                            </select>
                          )}
                        </div>
                        <input
                          type="text"
                          value={row.description || ''}
                          onChange={(e) => handleRowChange(idx, 'description', e.target.value)}
                          placeholder="Optional specifications, model or serial..."
                          className="w-full px-2 py-0.5 text-[11px] text-slate-500 border border-slate-100 rounded focus:outline-none"
                        />
                      </div>
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0.01"
                        step="any"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right font-mono-numbers focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <select
                        value={row.unit}
                        onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                        className="w-full px-1 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none font-medium"
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Nos">Nos</option>
                        <option value="Box">Box</option>
                        <option value="Set">Set</option>
                        <option value="Kg">Kg</option>
                        <option value="Mtr">Mtr</option>
                        <option value="Roll">Roll</option>
                        <option value="Pkt">Pkt</option>
                        <option value="Ltr">Ltr</option>
                      </select>
                    </td>

                    {/* Warranty Column */}
                    <td className="py-2 px-2">
                      <div className="relative">
                        <input
                          type="text"
                          list={`warranty-options-${idx}`}
                          value={row.warranty || ''}
                          onChange={(e) => handleRowChange(idx, 'warranty', e.target.value)}
                          placeholder="e.g. 1 Year"
                          className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium bg-white text-slate-900"
                        />
                        <datalist id={`warranty-options-${idx}`}>
                          <option value="2 Years Warranty" />
                          <option value="1 Year Warranty" />
                          <option value="6 Months Warranty" />
                          <option value="3 Months Warranty" />
                          <option value="1 Month Warranty" />
                          <option value="7 Days Replacement" />
                          <option value="Service Warranty" />
                          <option value="Official Warranty" />
                          <option value="No Warranty" />
                        </datalist>
                      </div>
                    </td>

                    {/* Rate / Unit Price */}
                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.unitPrice}
                        onChange={(e) => handleRowChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right font-mono-numbers focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                      />
                    </td>

                    {/* Total */}
                    <td className="py-2 px-3 text-right font-mono-numbers font-bold text-slate-900">
                      {formatCurrency(row.total, company.currencySymbol)}
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={items.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded transition-colors"
                        title="Remove row"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Another Item Row</span>
            </button>
          </div>
        </div>

        {/* Bottom Split: Calculations Summary & Terms */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Notes, Terms & Template Style */}
          <div className="lg:col-span-7 space-y-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Document Settings & Notes
              </h4>


              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Customer Notes & Delivery Instructions
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Terms & Conditions
                </label>
                <textarea
                  rows={3}
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none text-slate-600"
                />
              </div>
            </div>

            {/* Live Currency Words Box */}
            <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-100">
              <span className="text-[11px] font-bold text-indigo-900 uppercase tracking-wide block mb-1">
                Automated Amount in Words:
              </span>
              <p className="text-xs font-medium text-indigo-950 italic">
                {amountWords}
              </p>
            </div>
          </div>

          {/* Automated Totals Breakdown Card */}
          <div className="lg:col-span-5 bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-200 pb-2">
              Automated Summary Calculation
            </h4>

            <div className="space-y-2 text-xs divide-y divide-slate-100">
              <div className="flex justify-between py-1 text-slate-600">
                <span>Subtotal (Base Value):</span>
                <span className="font-mono-numbers font-medium">{formatCurrency(summary.subtotal, company.currencySymbol)}</span>
              </div>

              {summary.totalDiscount > 0 && (
                <div className="flex justify-between py-1 text-emerald-700">
                  <span>Total Discount:</span>
                  <span className="font-mono-numbers font-medium">-{formatCurrency(summary.totalDiscount, company.currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between py-1 text-slate-800 font-medium">
                <span>Taxable Amount:</span>
                <span className="font-mono-numbers">{formatCurrency(summary.totalTaxable, company.currencySymbol)}</span>
              </div>

              {taxType === 'intra-state' ? (
                <>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>CGST Total:</span>
                    <span className="font-mono-numbers">{formatCurrency(summary.cgstTotal, company.currencySymbol)}</span>
                  </div>
                  <div className="flex justify-between py-1 text-slate-600">
                    <span>SGST Total:</span>
                    <span className="font-mono-numbers">{formatCurrency(summary.sgstTotal, company.currencySymbol)}</span>
                  </div>
                </>
              ) : (
                <div className="flex justify-between py-1 text-slate-600">
                  <span>IGST Total:</span>
                  <span className="font-mono-numbers">{formatCurrency(summary.igstTotal, company.currencySymbol)}</span>
                </div>
              )}

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-700">Freight & Shipping:</span>
                <div className="w-28">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={shippingCharges}
                    onChange={(e) => setShippingCharges(Number(e.target.value))}
                    className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right font-mono-numbers focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-between items-center py-1.5 text-slate-600">
                <label className="flex items-center gap-1.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={applyRoundOff}
                    onChange={(e) => setApplyRoundOff(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500"
                  />
                  <span>Auto Round Off</span>
                </label>
                <span className="font-mono-numbers font-medium">
                  {applyRoundOff
                    ? summary.roundOff > 0
                      ? `+${summary.roundOff}`
                      : summary.roundOff
                    : '0.00'}
                </span>
              </div>

              <div className="flex justify-between py-2 text-base font-bold text-slate-900 border-t-2 border-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono-numbers text-indigo-600">
                  {formatCurrency(summary.grandTotal, company.currencySymbol)}
                </span>
              </div>

              {/* Payment Advance & Balance section */}
              <div className="pt-2 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-slate-700 font-medium">Amount Received / Paid:</span>
                  <div className="w-28">
                    <input
                      type="number"
                      min="0"
                      step="any"
                      value={amountPaid}
                      onChange={(e) => setAmountPaid(Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right font-mono-numbers text-emerald-700 font-semibold focus:outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-center pt-1 text-slate-900 font-bold">
                  <span>Balance Due:</span>
                  <span className={`font-mono-numbers text-sm ${summary.balanceDue > 0 ? 'text-amber-700' : 'text-slate-900'}`}>
                    {formatCurrency(summary.balanceDue, company.currencySymbol)}
                  </span>
                </div>

                <div>
                  <input
                    type="text"
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    placeholder="Payment note / UTR transaction ID..."
                    className="w-full px-2.5 py-1 text-[11px] border border-slate-200 rounded focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3">
              <button
                type="submit"
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Save Invoice & Finalize</span>
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};
