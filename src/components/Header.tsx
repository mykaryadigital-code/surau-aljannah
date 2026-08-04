import React, { useState, useRef } from 'react';
import { SurauInfo } from '../types';
import { 
  Building2, 
  PlusCircle, 
  FileText, 
  ShieldCheck, 
  Settings, 
  Landmark,
  Calendar,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronDown,
  Lock,
  LogOut,
  Sparkles,
  FileSpreadsheet
} from 'lucide-react';
import { formatDateMalay } from '../utils/formatters';

interface HeaderProps {
  surauInfo: SurauInfo;
  activeTab: 'dashboard' | 'transactions' | 'reports' | 'audit';
  setActiveTab: (tab: 'dashboard' | 'transactions' | 'reports' | 'audit') => void;
  onOpenAddModal: (type?: 'IN' | 'OUT') => void;
  onOpenSettings: () => void;
  onOpenGoogleSheets: () => void;
  isAdmin: boolean;
  onLogoutAdmin: () => void;
  onOpenAdminLogin: (reason?: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  surauInfo,
  activeTab,
  setActiveTab,
  onOpenAddModal,
  onOpenSettings,
  onOpenGoogleSheets,
  isAdmin,
  onLogoutAdmin,
  onOpenAdminLogin,
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [clickCount, setClickCount] = useState(0);
  const clickTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const todayMalay = formatDateMalay(new Date().toISOString().slice(0, 10));

  const handleTitleClick = () => {
    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
    }
    const nextCount = clickCount + 1;
    setClickCount(nextCount);

    if (nextCount >= 5) {
      setClickCount(0);
      onOpenAdminLogin('Dikesan 5 kali ketukan pada tajuk Surau. Sila masukkan kata laluan.');
    } else {
      clickTimeoutRef.current = setTimeout(() => {
        setClickCount(0);
      }, 3000);
    }
  };

  return (
    <header className="bg-emerald-950 text-white shadow-xl border-b border-emerald-800 relative">
      {/* Top Utility Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 border-b border-emerald-800/60 flex flex-wrap justify-between items-center text-xs text-emerald-200/90 gap-2">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="flex items-center gap-1.5 font-medium">
            <Landmark className="w-3.5 h-3.5 text-emerald-400" />
            No. Daftar: <span className="text-white">{surauInfo.registrationNo}</span>
          </span>
          <span className="hidden md:inline text-emerald-700">•</span>
          <span className="hidden md:flex items-center gap-1.5">
            <span className="text-emerald-400 font-semibold">Akaun Bank:</span> {surauInfo.bankName} ({surauInfo.accountNo})
          </span>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="hidden sm:flex items-center gap-1 bg-emerald-900/80 text-emerald-200 px-2.5 py-1 rounded-md border border-emerald-700/50">
            <Calendar className="w-3 h-3 text-amber-400" />
            <span>{todayMalay}</span>
          </span>

          {/* Admin status indicator */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <span className="flex items-center gap-1 bg-emerald-800 text-amber-300 font-extrabold px-2.5 py-1 rounded-md border border-emerald-600 shadow-sm text-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>Admin</span>
              </span>
              <button
                onClick={onLogoutAdmin}
                title="Log Keluar Admin"
                className="flex items-center gap-1 px-2.5 py-1 bg-rose-900/80 hover:bg-rose-800 text-rose-200 rounded text-xs font-bold transition border border-rose-700/50 cursor-pointer"
              >
                <LogOut className="w-3 h-3" />
                <span>Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenAdminLogin('Log masuk diperlukan untuk mod penyuntingan.')}
              title="Ketuk 'SURAU AL-JANNAH' 5x atau tekan di sini untuk log masuk Pentadbir"
              className="flex items-center gap-1 px-2.5 py-1 bg-emerald-900/60 hover:bg-emerald-900 text-emerald-200/90 rounded text-xs font-medium border border-emerald-700/50 transition cursor-pointer"
            >
              <Lock className="w-3 h-3 text-amber-400" />
              <span>Mod Awam</span>
            </button>
          )}

          <div className="flex items-center gap-1.5">
            <button
              onClick={onOpenGoogleSheets}
              title="Integrasi Google Sheets"
              className="flex items-center gap-1.5 px-3 py-1 bg-emerald-800 hover:bg-emerald-700 text-amber-300 rounded transition font-bold cursor-pointer border border-emerald-600/60 shadow-sm"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-amber-400" />
              <span>Google Sheets</span>
            </button>

            <button
              onClick={onOpenSettings}
              title="Tetapan Surau"
              className="flex items-center gap-1 px-3 py-1 bg-emerald-900/80 hover:bg-emerald-800 text-white rounded transition font-semibold cursor-pointer border border-emerald-700/50"
            >
              <Settings className="w-3.5 h-3.5 text-emerald-300" />
              <span>Tetapan</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Header Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            <h1 
              onClick={handleTitleClick}
              title="Ketuk 5x berturut-turut untuk log masuk Admin"
              className="text-2xl sm:text-3xl font-black tracking-tight text-white font-serif uppercase cursor-pointer select-none hover:text-amber-200 transition active:scale-98"
            >
              {surauInfo.name}
            </h1>

            {/* Click feedback badge */}
            {clickCount > 0 && (
              <div className="absolute -top-3 left-0 bg-amber-400 text-slate-950 font-black text-[10px] px-2 py-0.5 rounded-full shadow-lg animate-bounce flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-slate-900" />
                <span>Ketuk {clickCount}/5 untuk Log Masuk Admin</span>
              </div>
            )}

            <p className="text-sm font-bold text-amber-300 tracking-wide mt-0.5">
              {surauInfo.locationName || 'Kg.Padang Pulasan, Papar'}
            </p>
            <p className="text-xs text-emerald-200/90 line-clamp-1 max-w-xl mt-0.5">
              {surauInfo.address}
            </p>
          </div>
        </div>

        {/* Primary Action Button wrapping Duit Masuk and Duit Keluar */}
        <div className="relative">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold px-5 py-3 rounded-xl shadow-lg shadow-amber-600/20 transition transform active:scale-95 text-sm cursor-pointer"
          >
            <PlusCircle className="w-5 h-5 text-slate-950" />
            <span>Tambah Transaksi</span>
            <ChevronDown className={`w-4 h-4 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isMenuOpen && (
            <>
              {/* Click outside overlay */}
              <div 
                className="fixed inset-0 z-40" 
                onClick={() => setIsMenuOpen(false)} 
              />
              
              {/* Dropdown Menu */}
              <div className="absolute right-0 mt-2.5 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200/90 p-2.5 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider px-3 py-1.5 mb-1 border-b border-slate-100">
                  Pilih Jenis Transaksi
                </div>
                
                <div className="space-y-1.5 pt-1">
                  {/* Option 1: Duit Masuk */}
                  <button
                    onClick={() => {
                      onOpenAddModal('IN');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-emerald-50/90 hover:bg-emerald-100/90 text-emerald-950 font-bold text-sm transition text-left border border-emerald-200/80 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-emerald-600 text-white shadow-sm group-hover:scale-105 transition">
                      <ArrowDownLeft className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-emerald-900">+ Duit Masuk</div>
                      <div className="text-xs text-emerald-700 font-normal">Tabung Surau, Infaq, Derma Jumaat, Wakaf</div>
                    </div>
                  </button>

                  {/* Option 2: Duit Keluar */}
                  <button
                    onClick={() => {
                      onOpenAddModal('OUT');
                      setIsMenuOpen(false);
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl bg-rose-50/90 hover:bg-rose-100/90 text-rose-950 font-bold text-sm transition text-left border border-rose-200/80 group cursor-pointer"
                  >
                    <div className="p-2 rounded-lg bg-rose-600 text-white shadow-sm group-hover:scale-105 transition">
                      <ArrowUpRight className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-extrabold text-rose-900">- Duit Keluar</div>
                      <div className="text-xs text-rose-700 font-normal">Perbelanjaan Bil, Elaun, Penyelenggaraan</div>
                    </div>
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Navigation Tabs Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-2 sm:space-x-4 border-t border-emerald-800/80 pt-2 pb-0">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs sm:text-sm font-semibold transition border-t-2 ${
              activeTab === 'dashboard'
                ? 'bg-emerald-900/90 text-amber-300 border-amber-400 shadow-inner'
                : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/40 border-transparent'
            }`}
          >
            <Landmark className="w-4 h-4" />
            <span>Dashboard Utama</span>
          </button>

          <button
            onClick={() => setActiveTab('transactions')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs sm:text-sm font-semibold transition border-t-2 ${
              activeTab === 'transactions'
                ? 'bg-emerald-900/90 text-amber-300 border-amber-400 shadow-inner'
                : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/40 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Rekod & Transaksi</span>
          </button>

          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs sm:text-sm font-semibold transition border-t-2 ${
              activeTab === 'reports'
                ? 'bg-emerald-900/90 text-amber-300 border-amber-400 shadow-inner'
                : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/40 border-transparent'
            }`}
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Penyata AJK Bulanan</span>
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-3 rounded-t-xl text-xs sm:text-sm font-semibold transition border-t-2 ${
              activeTab === 'audit'
                ? 'bg-emerald-900/90 text-amber-300 border-amber-400 shadow-inner'
                : 'text-emerald-200/70 hover:text-white hover:bg-emerald-900/40 border-transparent'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-teal-300" />
            <span>Dokumen & Audit</span>
          </button>
        </nav>
      </div>
    </header>
  );
};
