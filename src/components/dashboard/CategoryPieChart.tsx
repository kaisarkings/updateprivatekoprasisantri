import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion } from 'motion/react';
import { Transaction } from '../../types';
import { CATEGORIES } from '../../constants';
import { useApp } from '../../context/AppContext';
import { formatRupiah } from '../../utils/formatters';
import { PieChart as PieIcon, Sparkles } from 'lucide-react';

interface CategoryPieChartProps {
  transactions: Transaction[];
}

const COLORS = [
  '#10b981', // Emerald
  '#3b82f6', // Blue
  '#f59e0b', // Amber
  '#a855f7', // Purple
  '#ec4899', // Pink
  '#14b8a6', // Teal
  '#f97316', // Orange
  '#6366f1', // Indigo
  '#64748b', // Slate
];

export const CategoryPieChart: React.FC<CategoryPieChartProps> = ({ transactions }) => {
  const { categories } = useApp();
  const activeCats = categories && categories.length > 0 ? categories : CATEGORIES;

  const pieData = React.useMemo(() => {
    const map = new Map<string, number>();

    activeCats.forEach((c) => map.set(c.name, 0));

    (transactions || []).forEach((t) => {
      const cat = t.category || 'Lainnya';
      const current = map.get(cat) || 0;
      map.set(cat, current + t.amount);
    });

    return Array.from(map.entries())
      .map(([name, value]) => ({
        name,
        value,
      }))
      .filter((item) => item.value > 0);
  }, [transactions, activeCats]);

  const totalExpense = pieData.reduce((acc, curr) => acc + curr.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, value } = payload[0];
      const percentage = totalExpense > 0 ? ((value / totalExpense) * 100).toFixed(1) : '0';
      return (
        <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-2xl shadow-2xl border border-slate-700/80 text-xs">
          <p className="font-extrabold text-white flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>{name}</span>
          </p>
          <p className="text-emerald-400 font-black mt-1 font-mono text-sm">
            {formatRupiah(value)}
          </p>
          <p className="text-[10px] text-slate-400 mt-0.5">
            Kontribusi: {percentage}% dari total jajan
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
        <h3 className="font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-xs">
            <PieIcon className="w-3.5 h-3.5" />
          </div>
          <span>Statistik Jajanan Terlaris</span>
        </h3>
        <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 font-mono">
          Total: {formatRupiah(totalExpense)}
        </span>
      </div>

      <div className="h-64 w-full relative flex items-center justify-center">
        {totalExpense > 0 ? (
          <>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={58}
                  outerRadius={88}
                  paddingAngle={5}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="#0f172a"
                >
                  {pieData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                      className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  formatter={(value: string) => (
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300 mr-2">
                      {value}
                    </span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Donut Center Label */}
            <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Total Jajan
              </span>
              <span className="text-xs font-black text-slate-900 dark:text-white font-mono">
                {formatRupiah(totalExpense)}
              </span>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-xs gap-1.5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 w-full">
            <PieIcon className="w-8 h-8 text-slate-300 dark:text-slate-600" />
            <span className="font-semibold">Belum ada data transaksi jajanan</span>
          </div>
        )}
      </div>

      {/* Top Categories Mini Badges */}
      {pieData.length > 0 && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {pieData.slice(0, 4).map((cat, idx) => (
            <div
              key={cat.name}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 text-[11px] font-bold text-slate-700 dark:text-slate-300 shadow-2xs"
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: COLORS[idx % COLORS.length] }}
              />
              <span>{cat.name}:</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-extrabold">
                {formatRupiah(cat.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

