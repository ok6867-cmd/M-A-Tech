import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ProductItem } from '../types';
import { formatCurrency } from '../utils/calculations';
import {
  Package,
  Plus,
  Search,
  Edit2,
  Trash2,
  X,
  Boxes,
} from 'lucide-react';

export const InventoryManager: React.FC = () => {
  const { products, company, saveProduct, deleteProduct } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [editingProduct, setEditingProduct] = useState<ProductItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filteredProducts = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.hsnCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingProduct({
      id: `prd_${Date.now()}`,
      name: '',
      sku: '',
      hsnCode: '',
      unit: 'Pcs',
      unitPrice: 0,
      taxRate: 18,
      description: '',
      stock: 100,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: ProductItem) => {
    setEditingProduct({ ...p });
    setIsModalOpen(true);
  };

  const handleSaveModal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct || !editingProduct.name.trim()) return;
    saveProduct(editingProduct);
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Items & Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage material items, HSN/SAC codes, default rates, and stock units for rapid invoice line auto-fill
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>+ Add Catalog Item</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs flex items-center">
        <Search className="w-4 h-4 text-slate-400 mr-2.5" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by product name, SKU, HSN code, or description..."
          className="w-full text-xs border-none focus:outline-none"
        />
      </div>

      {/* Items Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold text-[11px]">
                <th className="py-3 px-4">Item & Description (পণ্যের বিবরণ)</th>
                <th className="py-3 px-3">SKU / Model</th>
                <th className="py-3 px-3 text-center">Warranty (ওয়ারেন্টি)</th>
                <th className="py-3 px-4 text-right">Unit Price (মূল্য)</th>
                <th className="py-3 px-3 text-right">Available Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-bold text-slate-900">{p.name}</div>
                    {p.description && (
                      <div className="text-[11px] text-slate-500 mt-0.5 max-w-md line-clamp-1">
                        {p.description}
                      </div>
                    )}
                  </td>

                  <td className="py-3 px-3 font-mono-numbers text-slate-600">
                    {p.sku || '—'}
                  </td>

                  <td className="py-3 px-3 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 text-[11px] font-semibold">
                      {p.warranty || '1 Year Warranty'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono-numbers font-bold text-slate-900">
                    {formatCurrency(p.unitPrice, company.currencySymbol)}
                    <span className="text-[10px] text-slate-400 font-normal ml-1">/ {p.unit}</span>
                  </td>

                  <td className="py-3 px-3 text-right font-mono-numbers text-slate-700">
                    {p.stock} {p.unit}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => handleOpenEdit(p)}
                        className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-md transition-colors"
                        title="Edit Item"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Delete catalog item "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                        title="Delete Item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {isModalOpen && editingProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <h3 className="text-sm font-bold text-slate-900">
                {editingProduct.name ? 'Edit Item' : 'New Catalog Item'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveModal} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Item / Product Name *
                </label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) =>
                    setEditingProduct({ ...editingProduct, name: e.target.value })
                  }
                  required
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    SKU / Part Number
                  </label>
                  <input
                    type="text"
                    value={editingProduct.sku}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, sku: e.target.value })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    HSN / SAC Code
                  </label>
                  <input
                    type="text"
                    value={editingProduct.hsnCode}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, hsnCode: e.target.value })
                    }
                    placeholder="e.g. 8483"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Default Unit
                  </label>
                  <select
                    value={editingProduct.unit}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, unit: e.target.value })
                    }
                    className="w-full px-2 py-1.5 rounded-lg border border-slate-300 bg-white focus:outline-none"
                  >
                    <option value="Pcs">Pcs</option>
                    <option value="Nos">Nos</option>
                    <option value="Box">Box</option>
                    <option value="Kg">Kg</option>
                    <option value="Mtr">Mtr</option>
                    <option value="Set">Set</option>
                    <option value="Ltr">Ltr</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Standard Rate ({company.currencySymbol})
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editingProduct.unitPrice}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        unitPrice: Number(e.target.value),
                      })
                    }
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 font-mono-numbers focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Warranty (ওয়ারেন্টি)
                  </label>
                  <input
                    type="text"
                    list="inventory-warranty-options"
                    value={editingProduct.warranty || ''}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        warranty: e.target.value,
                      })
                    }
                    placeholder="e.g. 2 Years Warranty"
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
                  />
                  <datalist id="inventory-warranty-options">
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
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Product Description / Specifications
                </label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) =>
                    setEditingProduct({
                      ...editingProduct,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs"
                >
                  Save Item
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
