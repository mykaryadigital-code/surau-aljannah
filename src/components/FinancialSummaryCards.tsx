import React from 'react';
import { FinancialSummary, Transaction } from '../types';
import { formatRM } from '../utils/formatters';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle,
  PiggyBank,
  HeartHandshake,
  Wrench,
  Sparkles
} from 'lucide-react';

interface FinancialSummaryCardsProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  onOpenAddModal: () => void;
}

export const FinancialSummaryCards: React.FC<FinancialSummaryCardsProps> = ({
  summary,
  transactions,
  onOpenAddModal,
}) => {
  // Calculate breakdown per FundCategory
  const fundTotals = React.useMemo(() => {
    const map: Record<string, { in: number; out: number }> = {
      'Tabung Am / Pengurusan': { in: 0, out: 0 },
      'Tabung Wakaf': { in: 0, out: 0 },
      'Tabung Kebajikan & Bantuan': { in: 0, out: 0 },
      'Tabung Pembangunan & Pembaikan': { in: 0, out: 0 },
      'Tabung Imarah & Aktiviti': { in: 0, out: 0 },
    };

    transactions.forEach((t) => {
      if (!map[t.fundCategory]) {
        map[t.fundCategory] = { in: 0, out: 0 };
      }
      if (t.type === 'IN') {
        map[t.fundCategory].in += t.amount;
      } else {
        map[t.fundCategory].out += t.amount;
      }
    });

    return map;
  }, [transactions]);

  // Determine indicator style
  const getStatusBadge = () => {
    switch (summary.healthStatus) {
      case 'SIHAT':
        return {
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
          icon: <CheckCircle2 className="w-5 h-5 text-emerald-600" />,
          title: 'Status Kewangan: Kukuh & Sihat',
          desc: 'Akaun mempunyai lebihan positif dan aliran tunai stabil.',
        };
      case 'SEDERHANA':
        return {
          bg: 'bg-amber-50 text-amber-800 border-amber-300',
          icon: <AlertTriangle className="w-5 h-5 text-amber-600" />,
          title: 'Status Kewangan: Sederhana',
          desc: 'Perbelanjaan menghampiri jumlah pendapatan. Sila pantau perbelanjaan.',
        };
      case 'DEFISIT':
        return {
          bg: 'bg-rose-50 text-rose-800 border-rose-300',
          icon: <XCircle className="w-5 h-5 text-rose-600" />,
          title: 'Status Kewangan: Defisit Akaun',
          desc: 'Jumlah perbelanjaan melebihi pendapatan atau baki semasa negatif!',
        };
    }
  };

  const statusBadge = getStatusBadge();

  return (
    <div className="space-y-6">
      {/* Financial Health Banner */}
      <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm ${statusBadge.bg}`}>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-white shadow-sm">
            {statusBadge.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-slate-900">{statusBadge.title}</h3>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 border border-current">
                Real-Time Indikator
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">{statusBadge.desc}</p>
          </div>
        </div>

        <div className="text-right flex items-center gap-2 self-end sm:self-center">
          <span className="text-xs font-medium text-slate-600">Nisbah Kredit/Debit:</span>
          <span className="text-sm font-bold text-slate-900">
            {summary.totalIncome > 0 
              ? `${((summary.totalExpense / summary.totalIncome) * 100).toFixed(1)}%` 
              : '0%'}
          </span>
        </div>
      </div>

      {/* Main 3 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: BAKI SEMASA */}
        <div className="relative bg-gradient-to-br from-emerald-900 to-teal-950 text-white rounded-2xl p-6 shadow-xl border border-emerald-800/80 overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-800/60 border border-emerald-700/50">
                  <Wallet className="w-5 h-5 text-amber-400" />
                </div>
                <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
                  Baki Semasa Real-Time
                </span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-800 text-emerald-200 border border-emerald-700">
                Akaun Surau
              </span>
            </div>

            <div className="mt-3">
              <p className="text-3xl sm:text-4xl font-extrabold text-amber-300 font-mono tracking-tight">
                {formatRM(summary.currentBalance)}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-emerald-800/80 text-xs text-emerald-200/90 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-emerald-300/80">Baki Awal Terdahulu:</span>
              <span className="font-semibold text-white">{formatRM(summary.bakiTerdahulu)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-300/80">+ Jumlah Duit Masuk:</span>
              <span className="font-semibold text-emerald-300">+{formatRM(summary.totalIncome)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-emerald-300/80">- Jumlah Duit Keluar:</span>
              <span className="font-semibold text-rose-300">-{formatRM(summary.totalExpense)}</span>
            </div>
          </div>
        </div>

        {/* Card 2: JUMLAH DUIT MASUK (DEBIT) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
                  <ArrowDownLeft className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Jumlah Duit Masuk (Debit)
                </span>
              </div>
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                {summary.incomeCount} Transaksi
              </span>
            </div>

            <div className="mt-3">
              <p className="text-3xl sm:text-4xl font-extrabold text-emerald-700 font-mono tracking-tight">
                {formatRM(summary.totalIncome)}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Derma Jumaat, Wakaf, Infaq</span>
            <span className="font-medium text-slate-700">
              Purata: {summary.incomeCount > 0 ? formatRM(summary.totalIncome / summary.incomeCount) : 'RM 0.00'}
            </span>
          </div>
        </div>

        {/* Card 3: JUMLAH DUIT KELUAR (KREDIT) */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/80 flex flex-col justify-between hover:shadow-md transition">
          <div>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-rose-50 text-rose-700">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Jumlah Duit Keluar (Kredit)
                </span>
              </div>
              <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">
                {summary.expenseCount} Transaksi
              </span>
            </div>

            <div className="mt-3">
              <p className="text-3xl sm:text-4xl font-extrabold text-rose-600 font-mono tracking-tight">
                {formatRM(summary.totalExpense)}
              </p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 text-xs text-slate-500 flex justify-between items-center">
            <span>Utiliti, Penyelenggaraan, Elaun</span>
            <span className="font-medium text-slate-700">
              Bersih: <span className={summary.netSurplus >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>
                {summary.netSurplus >= 0 ? '+' : ''}{formatRM(summary.netSurplus)}
              </span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
