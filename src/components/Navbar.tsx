import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab } from '../types';
import { BrandLogo } from '../assets/logo';
import { BackupRestoreModal } from './BackupRestoreModal';
import {
  FileText,
  Truck,
  LayoutDashboard,
  Users,
  Package,
  Settings,
  Plus,
  Phone,
  MessageCircle,
  Database,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { activeTab, setActiveTab, setEditingBill, setEditingChallan, company } = useApp();
  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  const handleCreateNewBill = () => {
    setEditingBill(null);
    setActiveTab('new-bill');
  };

  const handleCreateNewChallan = () => {
    setEditingChallan(null);
    setActiveTab('new-challan');
  };

  const navLinks: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'bills', label: 'Invoices & Bills', icon: <FileText className="w-4 h-4" /> },
    { id: 'challans', label: 'Delivery Challans', icon: <Truck className="w-4 h-4" /> },
    { id: 'inventory', label: 'Items & Stock', icon: <Package className="w-4 h-4" /> },
    { id: 'clients', label: 'Clients', icon: <Users className="w-4 h-4" /> },
    { id: 'settings', label: 'Shop Profile', icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <header className="no-print sticky top-0 z-30 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Single text element Brand Wordmark with Logo */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="flex items-center gap-2.5 text-left group"
            >
              {company.logoUrl ? (
                <img
                  src={company.logoUrl}
                  alt={company.name}
                  className="w-9 h-9 object-contain rounded-md"
                />
              ) : (
                <BrandLogo size={36} />
              )}
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors leading-tight">
                  {company.name}
                </span>
                <span className="text-[10px] text-slate-500 font-medium truncate max-w-[150px] sm:max-w-[240px]">
                  CCTV · Computer & Mobile Accessories
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Navigation Links (Clean text with subtle underline/active state) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${
                    isActive
                      ? 'bg-slate-100 text-slate-900 font-semibold'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Primary Actions & WhatsApp Contact */}
          <div className="flex items-center gap-2">
            {company.whatsapp && (
              <a
                href={`https://wa.me/88${company.whatsapp.replace(/[^0-9]/g, '').replace(/^88/, '')}`}
                target="_blank"
                rel="noreferrer"
                className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
                title={`WhatsApp: ${company.whatsapp}`}
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>WA: {company.whatsapp}</span>
              </a>
            )}

            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap"
              title="Backup or Restore JSON Data"
            >
              <Database className="w-3.5 h-3.5 text-indigo-600" />
              <span className="hidden xl:inline">Backup & Restore</span>
            </button>

            <button
              onClick={handleCreateNewChallan}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors whitespace-nowrap"
            >
              <Truck className="w-3.5 h-3.5 text-slate-500" />
              <span>+ New Challan</span>
            </button>
            <button
              onClick={handleCreateNewBill}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors shadow-xs whitespace-nowrap"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ New Invoice</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="md:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 scrollbar-none">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Backup & Restore Interactive Modal */}
      <BackupRestoreModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
      />
    </header>
  );
};
