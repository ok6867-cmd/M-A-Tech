import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Client } from '../types';
import {
  Users,
  Plus,
  Search,
  Edit2,
  Trash2,
  MapPin,
  Building2,
  X,
  Check,
  Phone,
  MessageCircle,
  User,
  Mail,
} from 'lucide-react';

export const ClientsManager: React.FC = () => {
  const { clients, saveClient, deleteClient } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.phone && c.phone.includes(searchQuery)) ||
      (c.company && c.company.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.billingAddress && c.billingAddress.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.bin && c.bin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (c.gstin && c.gstin.toLowerCase().includes(searchQuery.toLowerCase())) ||
      c.billingCity.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.billingState.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setEditingClient({
      id: `cli_${Date.now()}`,
      name: '',
      company: '',
      email: '',
      phone: '',
      bin: '',
      gstin: '',
      billingAddress: '',
      billingCity: 'Dhaka',
      billingState: 'Dhaka Division',
      billingPincode: '1216',
      shippingSameAsBilling: true,
      shippingAddress: '',
      shippingCity: 'Dhaka',
      shippingState: 'Dhaka Division',
      shippingPincode: '1216',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (client: Client) => {
    setEditingClient({ ...client });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingClient || !editingClient.name.trim()) return;
    saveClient(editingClient);
    setIsModalOpen(false);
    setEditingClient(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Clients & Address Directory
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage customer names, mobile numbers, delivery addresses, and organization profiles
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add New Client</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center">
        <Search className="w-4 h-4 text-slate-400 mr-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by client name, mobile number (017...), address, or shop..."
          className="w-full text-xs border-none focus:outline-none"
        />
      </div>

      {/* Client Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <div
            key={client.id}
            className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <User className="w-4 h-4 text-indigo-600" />
                    <h3 className="font-bold text-slate-900 text-sm">
                      {client.name}
                    </h3>
                  </div>
                  {client.company && (
                    <div className="text-xs text-slate-600 font-medium mt-0.5 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>{client.company}</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleOpenEdit(client)}
                    className="p-1.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                    title="Edit Client"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => {
                      if (confirm(`Delete client "${client.name}"?`)) {
                        deleteClient(client.id);
                      }
                    }}
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                    title="Delete Client"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Number / Contact with WhatsApp Action */}
              <div className="mt-3 p-2.5 rounded-lg bg-slate-50 border border-slate-200/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="font-mono-numbers">{client.phone || 'No phone added'}</span>
                  </div>
                  {client.phone && (
                    <a
                      href={`https://wa.me/88${client.phone.replace(/[^0-9]/g, '').replace(/^88/, '').replace(/^0/, '880')}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold hover:bg-emerald-200 transition-colors"
                      title="Open WhatsApp Chat"
                    >
                      <MessageCircle className="w-2.5 h-2.5" />
                      <span>WhatsApp</span>
                    </a>
                  )}
                </div>

                {client.email && (
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Mail className="w-3 h-3 text-slate-400" />
                    <span className="truncate">{client.email}</span>
                  </div>
                )}
              </div>

              {/* Address */}
              <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                <div className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">
                      {client.billingCity || 'Dhaka'}, {client.billingState}
                    </span>
                    <p className="text-[11px] text-slate-600 leading-normal mt-0.5">
                      {client.billingAddress} {client.billingPincode ? `- ${client.billingPincode}` : ''}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>BIN: <strong className="font-mono-numbers text-slate-700">{client.bin || client.gstin || 'Unregistered'}</strong></span>
              <span className="font-medium text-indigo-600">{client.billingCity}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Client Modal */}
      {isModalOpen && editingClient && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-xl w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingClient.name ? 'Edit Client Details' : 'Add New Client'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-600" />
                    <span>Client Name (গ্রাহকের নাম) *</span>
                  </label>
                  <input
                    type="text"
                    value={editingClient.name}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, name: e.target.value })
                    }
                    placeholder="e.g. Kamrul Hasan / Rafiqul Islam"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-semibold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Mobile / WhatsApp Number (ফোন নম্বর) *</span>
                  </label>
                  <input
                    type="text"
                    value={editingClient.phone}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, phone: e.target.value })
                    }
                    placeholder="e.g. 01712-458921 / 01628491979"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Full Address */}
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div>
                  <label className="block font-semibold text-slate-800 mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    <span>Full Address (ঠিকানা - বাসা/রোড/এলাকা/মার্কেট) *</span>
                  </label>
                  <textarea
                    rows={2}
                    value={editingClient.billingAddress}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        billingAddress: e.target.value,
                        shippingAddress: editingClient.shippingSameAsBilling ? e.target.value : editingClient.shippingAddress,
                      })
                    }
                    placeholder="e.g. House 32, Block B, Section 11, Ave 7, Pallabi, Mirpur"
                    required
                    className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">City / District</label>
                    <input
                      type="text"
                      value={editingClient.billingCity}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          billingCity: e.target.value,
                          shippingCity: editingClient.shippingSameAsBilling ? e.target.value : editingClient.shippingCity,
                        })
                      }
                      placeholder="Mirpur, Dhaka"
                      className="w-full px-2 py-1 rounded border border-slate-300 bg-white focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Division (বিভাগ)</label>
                    <input
                      type="text"
                      value={editingClient.billingState}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          billingState: e.target.value,
                          shippingState: editingClient.shippingSameAsBilling ? e.target.value : editingClient.shippingState,
                        })
                      }
                      className="w-full px-2 py-1 rounded border border-slate-300 bg-white focus:outline-none font-medium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-600 mb-0.5">Postal Code</label>
                    <input
                      type="text"
                      value={editingClient.billingPincode}
                      onChange={(e) =>
                        setEditingClient({
                          ...editingClient,
                          billingPincode: e.target.value,
                          shippingPincode: editingClient.shippingSameAsBilling ? e.target.value : editingClient.shippingPincode,
                        })
                      }
                      placeholder="1216"
                      className="w-full px-2 py-1 rounded border border-slate-300 bg-white focus:outline-none font-mono-numbers"
                    />
                  </div>
                </div>
              </div>

              {/* Optional Company & Identifiers */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    <span>Company / Shop</span>
                  </label>
                  <input
                    type="text"
                    value={editingClient.company}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, company: e.target.value })
                    }
                    placeholder="e.g. Diagnostic / Store"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    BIN (ভ্যাট নং)
                  </label>
                  <input
                    type="text"
                    value={editingClient.bin || editingClient.gstin || ''}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        bin: e.target.value,
                        gstin: e.target.value,
                      })
                    }
                    placeholder="001928374-0101"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingClient.email}
                    onChange={(e) =>
                      setEditingClient({ ...editingClient, email: e.target.value })
                    }
                    placeholder="client@gmail.com"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Client
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
