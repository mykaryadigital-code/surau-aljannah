import React, { useState, useMemo } from 'react';
import { Transaction, TransactionType } from '../types';
import { formatRM, formatDateMalay } from '../utils/formatters';
import { 
  Search, 
  Filter, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Printer, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  Trash2, 
  Edit3, 
  Download, 
  Calendar,
  FileSpreadsheet
} from 'lucide-react';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onPrintReceipt: (transaction: Transaction) => void;
  onViewAttachment: (transaction: Transaction) => void;
  isAdmin?: boolean;
  onRequireAdminLogin?: (reason: string) => void;
}

export const TransactionTable: React.FC<TransactionTableProps> = ({
  transactions,
  onEdit,
  onDelete,
  onPrintReceipt,
  onViewAttachment,
  isAdmin = false,
  onRequireAdminLogin,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | TransactionType>('ALL');
  const [monthFilter, setMonthFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC'>('DATE_DESC');

  // Extract unique month-years for filter
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.date) {
        set.add(t.date.slice(0, 7)); // YYYY-MM
      }
    });
    return Array.from(set).sort().reverse();
  }, [transactions]);

  // Filtered & sorted transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      // Type filter
      if (typeFilter !== 'ALL' && t.type !== typeFilter) return false;

      // Month filter
      if (monthFilter !== 'ALL' && !t.date.startsWith(monthFilter)) return false;

      // Category filter
      if (categoryFilter !== 'ALL' && t.category !== categoryFilter) return false;

      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchReceipt = t.receiptNo.toLowerCase().includes(query);
        const matchPayer = t.payerPayee.toLowerCase().includes(query);
        const matchDesc = t.description.toLowerCase().includes(query);
        const matchCat = t.category.toLowerCase().includes(query);
        const matchFund = t.fundCategory.toLowerCase().includes(query);
        return matchReceipt || matchPayer || matchDesc || matchCat || matchFund;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'DATE_DESC') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortBy === 'DATE_ASC') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount;
      return 0;
    });
  }, [transactions, typeFilter, monthFilter, categoryFilter, searchTerm, sortBy]);

  // CSV Export function
  const exportToCSV = () => {
    const headers = ['Tarikh', 'Jenis', 'No Resit/Invois', 'Kategori', 'Tabung Dana', 'Pembayar/Penerima', 'Kaedah', 'Amaun (RM)', 'Catatan'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      t.type === 'IN' ? 'Duit Masuk' : 'Duit Keluar',
      `"${t.receiptNo}"`,
      `"${t.category}"`,
      `"${t.fundCategory}"`,
      `"${t.payerPayee}"`,
      t.paymentMethod,
      t.amount.toFixed(2),
      `"${t.description.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Laporan_Transaksi_Surau_Al_Jannah_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden space-y-4">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 font-serif">
              Senarai Transaksi & Buku Tunai
            </h2>
            <p className="text-xs text-slate-500">
              Menunjukkan {filteredTransactions.length} daripada {transactions.length} rekod transaksi
            </p>
          </div>

          <button
            onClick={exportToCSV}
            className="inline-flex items-center gap-2 bg-emerald-800 hover:bg-emerald-900 text-white font-semibold text-xs px-3.5 py-2 rounded-xl shadow-sm transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
            <span>Muat Turun CSV / Excel</span>
          </button>
        </div>

        {/* Filter Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari no resit, pembayar, catatan..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          {/* Type filter */}
          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-700"
            >
              <option value="ALL">Semua Jenis Transaksi</option>
              <option value="IN">Duit Masuk (Debit)</option>
              <option value="OUT">Duit Keluar (Kredit)</option>
            </select>
          </div>

          {/* Month filter */}
          <div>
            <select
              value={monthFilter}
              onChange={(e) => setMonthFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-700"
            >
              <option value="ALL">Semua Bulan / Tahun</option>
              {availableMonths.map((m) => {
                const [year, month] = m.split('-');
                const monthNames = ['Jan', 'Feb', 'Mac', 'Apr', 'Mei', 'Jun', 'Jul', 'Ogos', 'Sep', 'Okt', 'Nov', 'Dis'];
                return (
                  <option key={m} value={m}>
                    {monthNames[parseInt(month, 10) - 1]} {year}
                  </option>
                );
              })}
            </select>
          </div>

          {/* Sorting */}
          <div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 bg-white font-medium text-slate-700"
            >
              <option value="DATE_DESC">Tarikh: Terbaharu Dahulu</option>
              <option value="DATE_ASC">Tarikh: Terlama Dahulu</option>
              <option value="AMOUNT_DESC">Amaun: Tertinggi Dahulu</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-600 text-[11px] uppercase font-bold tracking-wider border-b border-slate-200">
              <th className="py-3 px-4">Tarikh & No. Resit</th>
              <th className="py-3 px-4">Jenis</th>
              <th className="py-3 px-4">Kategori Transaksi</th>
              <th className="py-3 px-4">Pembayar / Penerima</th>
              <th className="py-3 px-4 text-right">Amaun (RM)</th>
              <th className="py-3 px-4 text-center">Bukti Audit</th>
              <th className="py-3 px-4 text-right">Tindakan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
                  Tiada rekod transaksi dijumpai padanan penapis anda.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((t) => (
                <tr key={t.id} className="hover:bg-slate-50/80 transition group">
                  {/* Tarikh & Receipt */}
                  <td className="py-3.5 px-4 font-medium">
                    <div className="font-semibold text-slate-900">{formatDateMalay(t.date)}</div>
                    <div className="font-mono text-[11px] text-emerald-700 font-bold">{t.receiptNo}</div>
                  </td>

                  {/* Jenis */}
                  <td className="py-3.5 px-4">
                    {t.type === 'IN' ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ArrowDownLeft className="w-3 h-3" />
                        Masuk
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                        <ArrowUpRight className="w-3 h-3" />
                        Keluar
                      </span>
                    )}
                  </td>

                  {/* Kategori */}
                  <td className="py-3.5 px-4">
                    <div className="font-semibold text-slate-900">{t.category}</div>
                  </td>

                  {/* Pembayar / Penerima */}
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-medium text-slate-900 truncate">{t.payerPayee}</div>
                    <div className="text-[11px] text-slate-400 truncate">{t.description}</div>
                  </td>

                  {/* Amaun */}
                  <td className="py-3.5 px-4 text-right font-mono font-bold text-sm">
                    <span className={t.type === 'IN' ? 'text-emerald-700' : 'text-rose-600'}>
                      {t.type === 'IN' ? '+' : '-'}{formatRM(t.amount)}
                    </span>
                    <div className="text-[10px] text-slate-400 font-sans font-normal">{t.paymentMethod}</div>
                  </td>

                  {/* Bukti Audit Status */}
                  <td className="py-3.5 px-4 text-center">
                    {t.attachmentUrl ? (
                      <button
                        onClick={() => onViewAttachment(t)}
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded bg-teal-50 text-teal-800 border border-teal-200 hover:bg-teal-100 transition"
                        title="Lihat Gambar Bil/Resit Asal"
                      >
                        <Paperclip className="w-3 h-3 text-teal-600" />
                        <span>Ada Bil</span>
                      </button>
                    ) : t.type === 'OUT' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                        <AlertCircle className="w-3 h-3 text-amber-600" />
                        <span>Semak Bil</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-500">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Sah</span>
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {t.type === 'IN' && (
                        <button
                          onClick={() => onPrintReceipt(t)}
                          title="Cetak Resit Rasmi Surau"
                          className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 transition border border-emerald-200"
                        >
                          <Printer className="w-3.5 h-3.5" />
                        </button>
                      )}

                      <button
                        onClick={() => {
                          if (isAdmin) {
                            onEdit(t);
                          } else if (onRequireAdminLogin) {
                            onRequireAdminLogin('Log masuk Pentadbir (Admin) diperlukan untuk mengedit rekod transaksi.');
                          }
                        }}
                        title={isAdmin ? "Edit Transaksi" : "Log Masuk Admin untuk Edit"}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        onClick={() => {
                          if (!isAdmin) {
                            if (onRequireAdminLogin) {
                              onRequireAdminLogin('Log masuk Pentadbir (Admin) diperlukan untuk memadam rekod transaksi.');
                            }
                            return;
                          }
                          if (confirm(`Adakah anda pasti mahu memadam transaksi ${t.receiptNo}?`)) {
                            onDelete(t.id);
                          }
                        }}
                        title={isAdmin ? "Padam Transaksi" : "Log Masuk Admin untuk Padam"}
                        className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
