import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ChallanDocument,
  DocumentItemRow,
  ChallanType,
  DispatchMode,
  Client,
} from '../types';
import { calculateItemRow, formatCurrency } from '../utils/calculations';
import {
  ArrowLeft,
  Save,
  Eye,
  Plus,
  Trash2,
  Truck,
  Package,
  User,
  Phone,
  MapPin,
  Building2,
  CheckCircle,
  MessageCircle,
} from 'lucide-react';

export const ChallanEditor: React.FC = () => {
  const {
    company,
    clients,
    products,
    challans,
    editingChallan,
    saveChallan,
    saveClient,
    setActiveTab,
    setPreviewDoc,
  } = useApp();

  const generateChallanNumber = () => {
    const year = new Date().getFullYear();
    const count = challans.length + 1;
    return `CHL-${year}-${String(count).padStart(4, '0')}`;
  };

  const [challanNumber, setChallanNumber] = useState(
    editingChallan?.challanNumber || generateChallanNumber()
  );
  const [challanDate, setChallanDate] = useState(
    editingChallan?.challanDate || new Date().toISOString().split('T')[0]
  );
  const [challanType, setChallanType] = useState<ChallanType>(
    editingChallan?.challanType || 'delivery'
  );
  const [dispatchMode, setDispatchMode] = useState<DispatchMode>(
    editingChallan?.dispatchMode || 'road'
  );
  const [vehicleNumber, setVehicleNumber] = useState(
    editingChallan?.vehicleNumber || ''
  );
  const [transporterName, setTransporterName] = useState(
    editingChallan?.transporterName || ''
  );
  const [lrNumber, setLrNumber] = useState(editingChallan?.lrNumber || '');
  const [ewayBillNo, setEwayBillNo] = useState(
    editingChallan?.ewayBillNo || ''
  );
  const [driverName, setDriverName] = useState(
    editingChallan?.driverName || ''
  );
  const [driverContact, setDriverContact] = useState(
    editingChallan?.driverContact || ''
  );

  const [selectedClientId, setSelectedClientId] = useState<string>(
    editingChallan?.clientId || (clients.length > 0 ? clients[0].id : '')
  );

  const [selectedClient, setSelectedClient] = useState<Client>(() => {
    if (editingChallan) return editingChallan.clientDetails;
    return clients[0] || ({} as Client);
  });

  const [items, setItems] = useState<DocumentItemRow[]>(() => {
    if (editingChallan && editingChallan.items.length > 0) {
      return editingChallan.items;
    }
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

  const [notes, setNotes] = useState(
    editingChallan?.notes || 'Goods dispatched in standard export packaging.'
  );
  const [terms, setTerms] = useState(
    editingChallan?.terms ||
      'Goods sent under standard delivery terms. Carrier assumes transit liability under standard carrier guidelines.'
  );

  const [clientSavedNotice, setClientSavedNotice] = useState(false);

  const handleClientChange = (clientId: string) => {
    setSelectedClientId(clientId);
    const client = clients.find((c) => c.id === clientId);
    if (client) setSelectedClient(client);
  };

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

  const handleRowChange = (
    index: number,
    field: keyof DocumentItemRow,
    value: any
  ) => {
    setItems((prev) => {
      const updated = [...prev];
      const currentRow = { ...updated[index], [field]: value };
      updated[index] = calculateItemRow(currentRow, 'intra-state');
      return updated;
    });
  };

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
        unitPrice: product.unitPrice,
        taxRate: product.taxRate,
      };
      updated[index] = calculateItemRow(row, 'intra-state');
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
          unitPrice: 0,
          discountPercent: 0,
          taxRate: 18,
        },
        'intra-state'
      ),
    ]);
  };

  const handleRemoveRow = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  // Automated Calculations for Challan
  const totalQuantity = items.reduce((acc, it) => acc + (Number(it.quantity) || 0), 0);
  const totalEstimatedValue = items.reduce(
    (acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0),
    0
  );

  const constructChallanDoc = (): ChallanDocument => {
    return {
      id: editingChallan?.id || `chl_${Date.now()}`,
      type: 'challan',
      challanNumber: challanNumber.trim() || generateChallanNumber(),
      challanDate,
      challanType,
      dispatchMode,
      vehicleNumber: vehicleNumber.trim(),
      transporterName: transporterName.trim(),
      lrNumber: lrNumber.trim(),
      ewayBillNo: ewayBillNo.trim(),
      driverName: driverName.trim(),
      driverContact: driverContact.trim(),
      clientId: selectedClientId,
      clientDetails: selectedClient,
      items,
      totalQuantity,
      totalEstimatedValue,
      status: editingChallan?.status || 'dispatched',
      convertedToBillId: editingChallan?.convertedToBillId,
      notes,
      terms,
      templateStyle: 'standard',
      createdAt: editingChallan?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!challanNumber.trim()) {
      alert('Please provide a challan number.');
      return;
    }
    const doc = constructChallanDoc();
    saveChallan(doc);
  };

  const handleOpenPreview = () => {
    const doc = constructChallanDoc();
    setPreviewDoc({ type: 'challan', doc });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setActiveTab('challans')}
            className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">
              {editingChallan
                ? `Edit Delivery Challan ${challanNumber}`
                : 'Create Delivery Challan'}
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Consignment dispatch documentation under Rule 55 of GST
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
            <span>Save Challan</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Basic Challan Details */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Challan Number *
              </label>
              <input
                type="text"
                value={challanNumber}
                onChange={(e) => setChallanNumber(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Challan Date *
              </label>
              <input
                type="date"
                value={challanDate}
                onChange={(e) => setChallanDate(e.target.value)}
                required
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nature / Purpose of Dispatch (চালানের ধরণ)
              </label>
              <select
                value={challanType}
                onChange={(e) => setChallanType(e.target.value as ChallanType)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
              >
                <option value="mushak-6.5">পণ্য স্থানান্তর চালান (Mushak-6.5 NBR)</option>
                <option value="delivery">পণ্য সরবরাহ / ডেলিভারি চালান (Commercial)</option>
                <option value="jobwork">জব ওয়ার্ক / প্রক্রিয়াকরণ (Job Work - Returnable)</option>
                <option value="approval">অনুমোদন বা ট্রায়ালের জন্য (Approval / Trial)</option>
                <option value="returnable">ফেরতযোগ্য যন্ত্রপাতি (Returnable Tooling)</option>
                <option value="transfer">শাখা বা ডিপো স্থানান্তর (Branch Transfer)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dispatch Mode (পরিবহন মাধ্যম)
              </label>
              <select
                value={dispatchMode}
                onChange={(e) => setDispatchMode(e.target.value as DispatchMode)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="road">Road Surface Cargo (সড়কপথ)</option>
                <option value="courier">Courier Express (সুন্দরবন / এস.এ. পরিবহন)</option>
                <option value="hand">Direct Hand Delivery (সরাসরি হস্তান্তর)</option>
                <option value="waterway">Waterways / River Cargo (নৌপথ)</option>
                <option value="rail">Railway Cargo (রেলপথ)</option>
                <option value="air">Air Cargo (বিমানপথ)</option>
              </select>
            </div>
          </div>

          {/* Consignee / Client Information Section (Name, Number, Address) */}
          <div className="pt-4 border-t border-slate-200 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
                  <User className="w-3.5 h-3.5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Recipient / Client Information (প্রাপক বা গ্রাহকের বিবরণ)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Recipient Name, Mobile Number & Delivery Destination Address
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
                  title="Clear and enter fresh consignee"
                >
                  <Plus className="w-3 h-3" />
                  <span>+ New Client</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveCurrentClient}
                  className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-lg transition-colors"
                  title="Save this recipient to contacts"
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
              {/* 1. Recipient Name */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Recipient / Client Name (প্রাপকের নাম) *</span>
                </label>
                <input
                  type="text"
                  value={selectedClient.name || ''}
                  onChange={(e) => handleClientFieldChange('name', e.target.value)}
                  placeholder="e.g. Kamrul Hasan / Zubair Ahmed"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold text-slate-900 bg-slate-50/50"
                />
              </div>

              {/* 2. Client Phone / Mobile */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center justify-between">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Contact Number (মোবাইল / ফোন) *</span>
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

              {/* 3. Company / Shop Name (Optional) */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-500" />
                  <span>Company / Organization (প্রতিষ্ঠান)</span>
                </label>
                <input
                  type="text"
                  value={selectedClient.company || ''}
                  onChange={(e) => handleClientFieldChange('company', e.target.value)}
                  placeholder="e.g. Mirpur Diagnostic / School Office"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>

            {/* Delivery Destination Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-800 mb-1 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span>Delivery Address (পৌঁছানোর ঠিকানা) *</span>
                </label>
                <input
                  type="text"
                  value={selectedClient.shippingAddress || selectedClient.billingAddress || ''}
                  onChange={(e) => {
                    handleClientFieldChange('shippingAddress', e.target.value);
                    handleClientFieldChange('billingAddress', e.target.value);
                  }}
                  placeholder="e.g. House 32, Block B, Section 11, Ave 7, Pallabi, Mirpur, Dhaka"
                  required
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-900 bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  City & District (শহর ও জেলা)
                </label>
                <input
                  type="text"
                  value={selectedClient.billingCity || ''}
                  onChange={(e) => {
                    handleClientFieldChange('billingCity', e.target.value);
                    handleClientFieldChange('shippingCity', e.target.value);
                  }}
                  placeholder="Mirpur, Dhaka"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none text-slate-900 bg-slate-50/50"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Transportation & Logistics Particulars */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
            <Truck className="w-4 h-4 text-indigo-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Transportation & Carrier Logistics
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                যানবাহন নম্বর (Vehicle Number)
              </label>
              <input
                type="text"
                value={vehicleNumber}
                onChange={(e) => setVehicleNumber(e.target.value)}
                placeholder="e.g. Dhaka Metro-Ta 14-8891"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ট্রান্সপোর্টার / ক্যারিয়ার (Transporter)
              </label>
              <input
                type="text"
                value={transporterName}
                onChange={(e) => setTransporterName(e.target.value)}
                placeholder="e.g. Sundarban Courier / S.A. Paribahan"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                L.R. / Consignment Tracking No
              </label>
              <input
                type="text"
                value={lrNumber}
                onChange={(e) => setLrNumber(e.target.value)}
                placeholder="e.g. LR-990182"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-Way Bill Number
              </label>
              <input
                type="text"
                value={ewayBillNo}
                onChange={(e) => setEwayBillNo(e.target.value)}
                placeholder="e.g. 241890283719"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driver Name
              </label>
              <input
                type="text"
                value={driverName}
                onChange={(e) => setDriverName(e.target.value)}
                placeholder="Driver full name"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Driver Phone / Mobile
              </label>
              <input
                type="text"
                value={driverContact}
                onChange={(e) => setDriverContact(e.target.value)}
                placeholder="+91 98200 00000"
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 font-mono-numbers focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Consignment Items */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between">
            <h3 className="text-sm font-bold text-slate-900">
              Consignment Items for Dispatch
            </h3>
            <span className="text-xs font-mono-numbers text-slate-500">
              Total Units: <strong className="text-indigo-600 font-semibold">{totalQuantity}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                  <th className="py-2.5 px-3 w-8">#</th>
                  <th className="py-2.5 px-3 min-w-[260px]">Description & Specifications</th>
                  <th className="py-2.5 px-2 w-28">HSN/SAC</th>
                  <th className="py-2.5 px-2 w-24 text-right">Quantity</th>
                  <th className="py-2.5 px-2 w-20">Unit</th>
                  <th className="py-2.5 px-2 w-28 text-right">Indicative Rate</th>
                  <th className="py-2.5 px-3 w-32 text-right">Est. Value</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((row, idx) => (
                  <tr key={row.id} className="hover:bg-slate-50/60">
                    <td className="py-2.5 px-3 text-slate-400 font-mono-numbers">{idx + 1}</td>
                    <td className="py-2 px-3">
                      <div className="space-y-1">
                        <div className="flex gap-1.5">
                          <input
                            type="text"
                            value={row.name}
                            onChange={(e) => handleRowChange(idx, 'name', e.target.value)}
                            placeholder="Material or item title..."
                            required
                            className="w-full px-2 py-1 text-xs border border-slate-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                          />
                          {products.length > 0 && (
                            <select
                              value={row.productId || ''}
                              onChange={(e) => handleSelectProduct(idx, e.target.value)}
                              className="w-32 px-1.5 py-1 text-[11px] border border-slate-200 rounded bg-slate-50 text-slate-600 focus:outline-none"
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
                          placeholder="Optional specifications..."
                          className="w-full px-2 py-0.5 text-[11px] text-slate-500 border border-slate-100 rounded focus:outline-none"
                        />
                      </div>
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="text"
                        value={row.hsnCode}
                        onChange={(e) => handleRowChange(idx, 'hsnCode', e.target.value)}
                        placeholder="8483"
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-center font-mono-numbers focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="1"
                        step="any"
                        value={row.quantity}
                        onChange={(e) => handleRowChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right font-mono-numbers focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-2">
                      <select
                        value={row.unit}
                        onChange={(e) => handleRowChange(idx, 'unit', e.target.value)}
                        className="w-full px-1 py-1 text-xs border border-slate-200 rounded bg-white focus:outline-none"
                      >
                        <option value="Pcs">Pcs</option>
                        <option value="Nos">Nos</option>
                        <option value="Box">Box</option>
                        <option value="Kg">Kg</option>
                        <option value="Mtr">Mtr</option>
                        <option value="Set">Set</option>
                      </select>
                    </td>

                    <td className="py-2 px-2">
                      <input
                        type="number"
                        min="0"
                        step="any"
                        value={row.unitPrice}
                        onChange={(e) => handleRowChange(idx, 'unitPrice', e.target.value)}
                        className="w-full px-2 py-1 text-xs border border-slate-200 rounded text-right font-mono-numbers focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-3 text-right font-mono-numbers font-semibold text-slate-900">
                      {formatCurrency(row.quantity * row.unitPrice, company.currencySymbol)}
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveRow(idx)}
                        disabled={items.length <= 1}
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
            <button
              type="button"
              onClick={handleAddRow}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Item</span>
            </button>

            <div className="flex items-center gap-6 text-xs text-slate-700">
              <span>
                Total Items: <strong className="text-slate-900 font-mono-numbers">{items.length}</strong>
              </span>
              <span>
                Total Units: <strong className="text-slate-900 font-mono-numbers">{totalQuantity}</strong>
              </span>
              <span>
                Estimated Total Value: <strong className="text-slate-900 font-mono-numbers">{formatCurrency(totalEstimatedValue, company.currencySymbol)}</strong>
              </span>
            </div>
          </div>
        </div>

        {/* Remarks & Terms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Dispatch Instructions & Package Marks
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none"
            />
          </div>

          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-2">
            <label className="block text-xs font-semibold text-slate-700">
              Transit Conditions & Terms
            </label>
            <textarea
              rows={3}
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-300 focus:outline-none text-slate-600"
            />
          </div>
        </div>
      </form>
    </div>
  );
};
