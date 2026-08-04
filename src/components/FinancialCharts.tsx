import React, { useMemo } from 'react';
import { Transaction } from '../types';
import { formatRM } from '../utils/formatters';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, PieChart as PieChartIcon, TrendingUp } from 'lucide-react';

interface FinancialChartsProps {
  transactions: Transaction[];
}

const COLORS_EXPENSE = [
  '#0d9488', '#0284c7', '#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f97316', '#eab308'
];

export const FinancialCharts: React.FC<FinancialChartsProps> = ({ transactions }) => {
  // Monthly cashflow data
  const monthlyData = useMemo(() => {
    const map: Record<string, { month: string; masuk: number; keluar: number }> = {};

    // Group transactions by month (YYYY-MM)
    transactions.forEach((t) => {
      const monthKey = t.date.slice(0, 7);
      if (!map[monthKey]) {
        const date = new Date(t.date);
        const monthName = date.toLocaleString('ms-MY', { month: 'short', year: '2-digit' });
        map[monthKey] = { month: monthName, masuk: 0, keluar: 0 };
      }
      if (t.type === 'IN') {
        map[monthKey].masuk += t.amount;
      } else {
        map[monthKey].keluar += t.amount;
      }
    });

    return Object.keys(map)
      .sort()
      .map((key) => map[key]);
  }, [transactions]);

  // Expense breakdown by category
  const expenseCategoryData = useMemo(() => {
    const map: Record<string, number> = {};
    transactions
      .filter((t) => t.type === 'OUT')
      .forEach((t) => {
        map[t.category] = (map[t.category] || 0) + t.amount;
      });

    return Object.keys(map).map((key) => ({
      name: key,
      value: map[key],
    })).sort((a, b) => b.value - a.value);
  }, [transactions]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Monthly Cashflow Bar Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700">
              <BarChart3 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Aliran Tunai Bulanan (Masuk vs Keluar)</h3>
              <p className="text-xs text-slate-500">Perbandingan jumlah debit & kredit</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            Analisis Bulanan
          </span>
        </div>

        <div className="h-64 w-full">
          {monthlyData.length === 0 ? (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Tiada data grafik transaksi.
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `RM${v}`} />
                <Tooltip
                  formatter={(value: any) => [formatRM(Number(value)), '']}
                  contentStyle={{ borderRadius: '12px', fontSize: '12px', border: '1px solid #e2e8f0' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="masuk" name="Duit Masuk (Debit)" fill="#059669" radius={[6, 6, 0, 0]} />
                <Bar dataKey="keluar" name="Duit Keluar (Kredit)" fill="#e11d48" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Expense Category Pie Chart */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
              <PieChartIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Pecahan Perbelanjaan Mengikut Kategori</h3>
              <p className="text-xs text-slate-500">Agihan perbelanjaan utama surau</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200">
            Kredit
          </span>
        </div>

        {expenseCategoryData.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-xs text-slate-400">
            Tiada rekod perbelanjaan lagi.
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center gap-4">
            <div className="h-52 w-full sm:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={expenseCategoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {expenseCategoryData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS_EXPENSE[index % COLORS_EXPENSE.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatRM(Number(val)), 'Amaun']} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Custom Legend List */}
            <div className="w-full sm:w-1/2 space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {expenseCategoryData.map((item, idx) => (
                <div key={item.name} className="flex items-center justify-between text-xs p-1.5 rounded hover:bg-slate-50">
                  <div className="flex items-center gap-2 truncate">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: COLORS_EXPENSE[idx % COLORS_EXPENSE.length] }}
                    />
                    <span className="text-slate-700 font-medium truncate">{item.name}</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900 ml-2">{formatRM(item.value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
