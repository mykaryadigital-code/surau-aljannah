import React, { useState, useMemo } from 'react';
import { Transaction, SurauInfo } from '../types';
import { formatRM, formatDateMalay, formatMonthYearMalay } from '../utils/formatters';
import { Printer, Calendar, Download, FileText, CheckCircle2, Building2 } from 'lucide-react';

interface MonthlyReportViewProps {
  transactions: Transaction[];
  surauInfo: SurauInfo;
}

export const MonthlyReportView: React.FC<MonthlyReportViewProps> = ({
  transactions,
  surauInfo,
}) => {
  // Extract list of months
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    transactions.forEach((t) => {
      if (t.date) {
        set.add(t.date.slice(0, 7)); // YYYY-MM
      }
    });
    // Default to current month or latest available
    return Array.from(set).sort().reverse();
  }, [transactions]);

  const [selectedMonth, setSelectedMonth] = useState<string>(
    availableMonths[0] || new Date().toISOString().slice(0, 7)
  );

  // Filter transactions for selected month
  const monthTransactions = useMemo(() => {
    return transactions
      .filter((t) => t.date.startsWith(selectedMonth))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [transactions, selectedMonth]);

  // Compute opening balance prior to selected month
  const openingBalanceForMonth = useMemo(() => {
    let balance = surauInfo.bakiTerdahulu;
    transactions.forEach((t) => {
      if (t.date < `${selectedMonth}-01`) {
        if (t.type === 'IN') balance += t.amount;
        else balance -= t.amount;
      }
    });
    return balance;
  }, [transactions, surauInfo.bakiTerdahulu, selectedMonth]);

  // Monthly aggregates
  const totalIn = monthTransactions.filter((t) => t.type === 'IN').reduce((acc, t) => acc + t.amount, 0);
  const totalOut = monthTransactions.filter((t) => t.type === 'OUT').reduce((acc, t) => acc + t.amount, 0);
  const closingBalance = openingBalanceForMonth + totalIn - totalOut;

  // Inflow breakdown by Category
  const categoryInBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'IN')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([category, total]) => ({ category, total }));
  }, [monthTransactions]);

  // Outflow breakdown by Category
  const categoryOutBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    monthTransactions
      .filter((t) => t.type === 'OUT')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });
    return Object.entries(map).map(([category, total]) => ({ category, total }));
  }, [monthTransactions]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Month Selector Bar */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-base font-serif">
              Penyata Ringkasan Kewangan Bulanan AJK
            </h2>
            <p className="text-xs text-slate-500">
              Penyata kewangan rasmi untuk dibentangkan dalam Mesyuarat Ahli Jawatankuasa Surau
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="px-4 py-2 rounded-xl border border-slate-300 font-bold text-slate-800 text-xs bg-white focus:ring-2 focus:ring-emerald-500"
          >
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                Penyata {formatMonthYearMalay(m)}
              </option>
            ))}
          </select>

          <button
            onClick={handlePrint}
            className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow transition flex items-center gap-1.5 shrink-0"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Penyata AJK</span>
          </button>
        </div>
      </div>

      {/* Printable Statement Document */}
      <div id="printable-report" className="bg-white p-8 rounded-2xl shadow-md border border-slate-200 text-slate-900 space-y-6">
        {/* Document Header */}
        <div className="text-center space-y-1.5 border-b-2 border-slate-800 pb-5">
          <div className="flex flex-col items-center justify-center text-emerald-900">
            <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">{surauInfo.name}</h1>
            <p className="text-sm font-bold text-slate-800 tracking-wide mt-0.5">{surauInfo.locationName || 'Kg.Padang Pulasan, Papar'}</p>
          </div>
          <p className="text-xs font-medium text-slate-700 max-w-xl mx-auto">{surauInfo.address}</p>
          <p className="text-[11px] text-slate-500">
            No. Pendaftaran: {surauInfo.registrationNo} | Akaun Bank: {surauInfo.bankName} ({surauInfo.accountNo})
          </p>

          <div className="pt-3">
            <span className="inline-block px-4 py-1 rounded-full bg-emerald-950 text-amber-300 font-bold text-xs uppercase tracking-wider font-serif">
              PENYATA KEWANGAN BULANAN - {formatMonthYearMalay(selectedMonth).toUpperCase()}
            </span>
          </div>
        </div>

        {/* Section 1: Summary Overview */}
        <div className="space-y-3">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-100 p-2 rounded-lg border-l-4 border-emerald-800">
            1. Ringkasan Kedudukan Kewangan (Buku Tunai)
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
              <span className="text-slate-500 font-medium">Baki Awal Bulan:</span>
              <p className="text-base font-extrabold font-mono text-slate-900 mt-0.5">{formatRM(openingBalanceForMonth)}</p>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <span className="text-emerald-800 font-medium">+ Jumlah Duit Masuk:</span>
              <p className="text-base font-extrabold font-mono text-emerald-700 mt-0.5">+{formatRM(totalIn)}</p>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl border border-rose-200">
              <span className="text-rose-800 font-medium">- Jumlah Duit Keluar:</span>
              <p className="text-base font-extrabold font-mono text-rose-700 mt-0.5">-{formatRM(totalOut)}</p>
            </div>

            <div className="p-3 bg-emerald-950 text-white rounded-xl border border-emerald-800">
              <span className="text-emerald-300 font-medium">= Baki Akhir Bulan:</span>
              <p className="text-base font-extrabold font-mono text-amber-300 mt-0.5">{formatRM(closingBalance)}</p>
            </div>
          </div>
        </div>

        {/* Section 2: Detailed Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          {/* Income Breakdown */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-900 bg-emerald-50 p-2 rounded border border-emerald-200 flex justify-between">
              <span>2A. Duit Masuk (Koleksi / Infaq)</span>
              <span>{formatRM(totalIn)}</span>
            </h4>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-[10px] text-slate-500 uppercase">
                  <th className="py-1.5">Kategori Infaq</th>
                  <th className="py-1.5 text-right">Amaun (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryInBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-3 text-center text-slate-400">Tiada penerimaan dalam bulan ini.</td>
                  </tr>
                ) : (
                  categoryInBreakdown.map((item) => (
                    <tr key={item.category}>
                      <td className="py-2 font-medium text-slate-800">{item.category}</td>
                      <td className="py-2 text-right font-mono font-bold text-emerald-700">{formatRM(item.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Expense Breakdown */}
          <div className="space-y-2">
            <h4 className="font-bold text-xs uppercase tracking-wider text-rose-900 bg-rose-50 p-2 rounded border border-rose-200 flex justify-between">
              <span>2B. Duit Keluar (Perbelanjaan)</span>
              <span>{formatRM(totalOut)}</span>
            </h4>

            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b text-[10px] text-slate-500 uppercase">
                  <th className="py-1.5">Kategori Perbelanjaan</th>
                  <th className="py-1.5 text-right">Amaun (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {categoryOutBreakdown.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-3 text-center text-slate-400">Tiada perbelanjaan dalam bulan ini.</td>
                  </tr>
                ) : (
                  categoryOutBreakdown.map((item) => (
                    <tr key={item.category}>
                      <td className="py-2 font-medium text-slate-800">{item.category}</td>
                      <td className="py-2 text-right font-mono font-bold text-rose-600">{formatRM(item.total)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 3: Chronological Transaction Log for Month */}
        <div className="space-y-3 pt-2">
          <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 bg-slate-100 p-2 rounded-lg border-l-4 border-emerald-800">
            3. Penyata Transaksi Terperinci Bulanan ({monthTransactions.length} Transaksi)
          </h3>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 text-slate-700 text-[10px] uppercase font-bold border-b">
                  <th className="p-2">Tarikh</th>
                  <th className="p-2">No. Resit/Invois</th>
                  <th className="p-2">Kategori</th>
                  <th className="p-2">Pembayar / Penerima</th>
                  <th className="p-2 text-right">Masuk (RM)</th>
                  <th className="p-2 text-right">Keluar (RM)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {monthTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50">
                    <td className="p-2 font-medium">{formatDateMalay(t.date)}</td>
                    <td className="p-2 font-mono font-semibold text-slate-800">{t.receiptNo}</td>
                    <td className="p-2">{t.category}</td>
                    <td className="p-2 font-medium">{t.payerPayee}</td>
                    <td className="p-2 text-right font-mono text-emerald-700 font-bold">
                      {t.type === 'IN' ? formatRM(t.amount) : '-'}
                    </td>
                    <td className="p-2 text-right font-mono text-rose-600 font-bold">
                      {t.type === 'OUT' ? formatRM(t.amount) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Section 4: AJK Signatures Block */}
        <div className="pt-8 border-t-2 border-slate-800 space-y-6">
          <p className="text-xs text-slate-600 italic">
            Disediakan dan disahkan untuk dibentangkan dalam Mesyuarat Ahli Jawatankuasa (AJK) {surauInfo.name}:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center text-xs pt-2">
            {/* Bendahari */}
            <div className="flex flex-col items-center p-3 sm:p-0 bg-slate-50/70 sm:bg-transparent rounded-xl border border-slate-200 sm:border-0">
              <div className="h-10 sm:h-14 w-full max-w-[200px]" />
              <div className="w-full max-w-[200px] border-b border-slate-800 mb-2" />
              <p className="font-bold text-slate-900 text-xs sm:text-xs">
                {surauInfo.bendahariName || 'BENDAHARI'}
              </p>
              <p className="font-bold text-slate-800 text-[11px] mt-0.5">BENDAHARI</p>
              <p className="text-[10px] text-slate-500">{surauInfo.name}</p>
            </div>

            {/* Setiausaha */}
            <div className="flex flex-col items-center p-3 sm:p-0 bg-slate-50/70 sm:bg-transparent rounded-xl border border-slate-200 sm:border-0">
              <div className="h-10 sm:h-14 w-full max-w-[200px]" />
              <div className="w-full max-w-[200px] border-b border-slate-800 mb-2" />
              <p className="font-bold text-slate-900 text-xs sm:text-xs">
                {surauInfo.setiausahaName || 'SETIAUSAHA'}
              </p>
              <p className="font-bold text-slate-800 text-[11px] mt-0.5">SETIAUSAHA</p>
              <p className="text-[10px] text-slate-500">{surauInfo.name}</p>
            </div>

            {/* Pengerusi */}
            <div className="flex flex-col items-center p-3 sm:p-0 bg-slate-50/70 sm:bg-transparent rounded-xl border border-slate-200 sm:border-0">
              <div className="h-10 sm:h-14 w-full max-w-[200px]" />
              <div className="w-full max-w-[200px] border-b border-slate-800 mb-2" />
              <p className="font-bold text-slate-900 text-xs sm:text-xs">
                {surauInfo.pengerusiName || 'PENGERUSI'}
              </p>
              <p className="font-bold text-slate-800 text-[11px] mt-0.5">PENGERUSI</p>
              <p className="text-[10px] text-slate-500">{surauInfo.name}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
