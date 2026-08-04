import React, { useState } from 'react';
import { Transaction } from '../types';
import { formatDateMalay, formatRM } from '../utils/formatters';
import { 
  ShieldCheck, 
  AlertTriangle, 
  Paperclip, 
  Eye, 
  CheckCircle, 
  FileCheck, 
  Upload, 
  Search,
  ExternalLink,
  HelpCircle
} from 'lucide-react';

interface AuditModuleProps {
  transactions: Transaction[];
  onVerifyAudit: (id: string, notes?: string) => void;
  onViewAttachment: (transaction: Transaction) => void;
  onOpenAddModal: () => void;
  isAdmin?: boolean;
  onRequireAdminLogin?: (reason: string) => void;
}

export const AuditModule: React.FC<AuditModuleProps> = ({
  transactions,
  onVerifyAudit,
  onViewAttachment,
  onOpenAddModal,
  isAdmin = false,
  onRequireAdminLogin,
}) => {
  const [filter, setFilter] = useState<'ALL' | 'MISSING_BILL' | 'VERIFIED'>('ALL');
  const [search, setSearch] = useState('');

  // Expenses specifically
  const expenses = transactions.filter((t) => t.type === 'OUT');

  // Stats
  const totalExpenseCount = expenses.length;
  const withBillCount = expenses.filter((t) => t.attachmentUrl).length;
  const missingBillCount = totalExpenseCount - withBillCount;
  const verifiedCount = expenses.filter((t) => t.auditStatus === 'DISAHKAN').length;

  const filteredExpenses = expenses.filter((t) => {
    if (filter === 'MISSING_BILL' && t.attachmentUrl) return false;
    if (filter === 'VERIFIED' && t.auditStatus !== 'DISAHKAN') return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        t.receiptNo.toLowerCase().includes(q) ||
        t.payerPayee.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900 to-emerald-950 text-white rounded-2xl p-6 shadow-lg border border-teal-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="p-3 bg-teal-500/20 text-teal-300 rounded-2xl border border-teal-400/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-teal-300 uppercase tracking-widest bg-teal-800/80 px-2.5 py-0.5 rounded border border-teal-700">
              Modul Kawalan Integriti & Audit
            </span>
            <h2 className="text-2xl font-bold font-serif text-white mt-1">
              Dokumen Sokongan & Semakan Pemeriksa Kira-Kira
            </h2>
            <p className="text-xs text-teal-200/80 max-w-xl mt-0.5">
              Semua bil, invois, dan resit perbelanjaan surau perlu disertakan bukti asal bagi mematuhi piawaian tadbir urus dan audit kewangan masjid/surau.
            </p>
          </div>
        </div>

        <button
          onClick={onOpenAddModal}
          className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2.5 rounded-xl shadow transition shrink-0"
        >
          + Tambah Transaksi & Muat Naik Bil
        </button>
      </div>

      {/* 3 Status Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Expenses */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
            <span className="font-semibold text-slate-700">Jumlah Perbelanjaan (Kredit)</span>
            <FileCheck className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900 font-mono">
            {totalExpenseCount} Transaksi
          </div>
          <div className="text-xs text-slate-500 mt-1">
            Status pengesahan fail audit
          </div>
        </div>

        {/* With Bill Proof */}
        <div className="bg-white p-5 rounded-2xl border border-emerald-200 shadow-sm bg-emerald-50/20">
          <div className="flex items-center justify-between text-xs text-emerald-800 mb-1">
            <span className="font-semibold">Lengkap Fail Bil / Invois</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-emerald-700 font-mono">
            {withBillCount} <span className="text-sm text-slate-500 font-normal">/ {totalExpenseCount}</span>
          </div>
          <div className="text-xs text-emerald-600 font-medium mt-1">
            {totalExpenseCount > 0 ? `${((withBillCount / totalExpenseCount) * 100).toFixed(0)}% telah muat naik bukti` : '0%'}
          </div>
        </div>

        {/* Missing Bill Alert */}
        <div className={`p-5 rounded-2xl border shadow-sm ${missingBillCount > 0 ? 'bg-amber-50/80 border-amber-300' : 'bg-white border-slate-200'}`}>
          <div className="flex items-center justify-between text-xs text-amber-900 mb-1">
            <span className="font-semibold">Memerlukan Semakan Bil</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-extrabold text-amber-700 font-mono">
            {missingBillCount} Transaksi
          </div>
          <div className="text-xs text-amber-800 font-medium mt-1">
            {missingBillCount > 0 ? 'Sila muat naik foto resit/bil asal' : 'Semua perbelanjaan mempunyai bil!'}
          </div>
        </div>
      </div>

      {/* Filter & Audit Checklist Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
        <div className="p-5 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">Penapis Audit:</span>
            <div className="flex gap-1.5 p-1 bg-slate-200/80 rounded-xl">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === 'ALL' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Semua ({expenses.length})
              </button>

              <button
                onClick={() => setFilter('MISSING_BILL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === 'MISSING_BILL' ? 'bg-amber-500 text-slate-950 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Tiada Bil ({missingBillCount})
              </button>

              <button
                onClick={() => setFilter('VERIFIED')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  filter === 'VERIFIED' ? 'bg-emerald-700 text-white shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Disahkan Audit ({verifiedCount})
              </button>
            </div>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari transaksi audit..."
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500"
            />
          </div>
        </div>

        {/* Audit List */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
                <th className="py-3 px-4">Tarikh & Invois</th>
                <th className="py-3 px-4">Penerima & Kategori</th>
                <th className="py-3 px-4 text-right">Amaun (RM)</th>
                <th className="py-3 px-4 text-center">Fail Dokumen Bil</th>
                <th className="py-3 px-4 text-center">Status Audit</th>
                <th className="py-3 px-4 text-right">Pengesahan AJK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Tiada rekod perbelanjaan dijumpai untuk padanan penapis ini.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{formatDateMalay(t.date)}</div>
                      <div className="font-mono text-[11px] text-teal-700 font-bold">{t.receiptNo}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-900">{t.payerPayee}</div>
                      <div className="text-[11px] text-slate-500">{t.category} ({t.fundCategory})</div>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-rose-600">
                      -{formatRM(t.amount)}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {t.attachmentUrl ? (
                        <button
                          onClick={() => onViewAttachment(t)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 font-semibold transition text-xs"
                        >
                          <Eye className="w-3.5 h-3.5 text-teal-600" />
                          <span>Pratonton Bil</span>
                        </button>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 font-medium text-xs">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Belum Muat Naik</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      {t.auditStatus === 'DISAHKAN' ? (
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Telah Disahkan
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-[11px] px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                          <HelpCircle className="w-3 h-3 text-amber-600" />
                          Perlu Semakan
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {t.auditStatus !== 'DISAHKAN' ? (
                        <button
                          onClick={() => {
                            if (isAdmin) {
                              onVerifyAudit(t.id, 'Disahkan oleh Pemeriksa Kira-kira Surau Al Jannah');
                            } else if (onRequireAdminLogin) {
                              onRequireAdminLogin('Log masuk Pentadbir (Admin) diperlukan untuk mengesahkan rekod audit.');
                            }
                          }}
                          className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
                        >
                          Sahkan Audit
                        </button>
                      ) : (
                        <span className="text-[11px] text-emerald-700 font-semibold italic">
                          Lulus Audit
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
