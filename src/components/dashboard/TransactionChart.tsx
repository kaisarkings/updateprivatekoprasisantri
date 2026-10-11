import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { Transaction, TopUp } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { TrendingUp, BarChart3, LineChart, Sparkles } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface TransactionChartProps {
  transactions?: Transaction[];
  topups?: TopUp[];
}

export const TransactionChart: React.FC<TransactionChartProps> = ({
  transactions: propTransactions,
  topups: propTopups,
}) => {
  const appContext = useApp();
  const transactions = propTransactions || appContext?.transactions || [];
  const topups = propTopups || appContext?.topups || [];

  const [chartType, setChartType] = useState<'bar' | 'area'>('bar');

  // Helper local YMD string
  const getLocalYMD = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Aggregate for the current month
  const chartData = useMemo(() => {
    const map = new Map<
      string,
      {
        date: string;
        displayDate: string;
        fullDateLabel: string;
        isToday: boolean;
        jajan: number;
        topup: number;
        jajanCount: number;
        topupCount: number;
        netFlow: number;
        totalFlow: number;
      }
    >();

    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const todayYMD = getLocalYMD(now);

    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
      const displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      const fullDateLabel = d.toLocaleDateString('id-ID', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      });
      const isToday = iso === todayYMD;

      map.set(iso, {
        date: iso,
        displayDate,
        fullDateLabel,
        isToday,
        jajan: 0,
        topup: 0,
        jajanCount: 0,
        topupCount: 0,
        netFlow: 0,
        totalFlow: 0,
      });
    }

    (transactions || []).forEach((t) => {
      const iso = getLocalYMD(t.created_at);
      if (map.has(iso)) {
        const item = map.get(iso)!;
        item.jajan += t.amount || 0;
        item.jajanCount += 1;
      }
    });

    (topups || []).forEach((tp) => {
      const iso = getLocalYMD(tp.created_at);
      if (map.has(iso)) {
        const item = map.get(iso)!;
        item.topup += tp.amount || 0;
        item.topupCount += 1;
      }
    });

    // Compute net & total flow
    map.forEach((item) => {
      item.netFlow = item.topup - item.jajan;
      item.totalFlow = item.topup + item.jajan;
    });

    return Array.from(map.values());
  }, [transactions, topups]);

  // Interactive Detailed Tooltip on Hover
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isSurplus = data.netFlow >= 0;

      return (
        <div className="bg-[#0c1322]/95 backdrop-blur-md border border-slate-700/90 text-white p-4 rounded-2xl shadow-2xl text-xs space-y-2.5 min-w-[230px] z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 border-b border-slate-700/60">
            <div>
              <p className="font-bold text-white text-xs">{data.fullDateLabel}</p>
              <p className="text-[10px] text-slate-400">Rekap Transaksi Harian</p>
            </div>
            {data.isToday && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#00c48c]/20 text-[#00c48c] border border-[#00c48c]/40 shadow-xs">
                Hari Ini
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-sans">
            {/* Top-Up Inflow */}
            <div className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5 text-[#00c48c] font-medium">
                <span className="w-2 h-2 rounded-full bg-[#00c48c] shadow-[0_0_6px_#00c48c]"></span>
                Pemasukan (TopUp):
              </span>
              <div className="text-right">
                <span className="text-[#00c48c] font-black">{formatRupiah(data.topup)}</span>
                <span className="text-[10px] text-slate-400 ml-1">({data.topupCount}x)</span>
              </div>
            </div>

            {/* Jajan Outflow */}
            <div className="flex justify-between items-center gap-4">
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_rgba(244,63,94,0.6)]"></span>
                Pengeluaran (Jajan):
              </span>
              <div className="text-right">
                <span className="text-rose-400 font-black">{formatRupiah(data.jajan)}</span>
                <span className="text-[10px] text-slate-400 ml-1">({data.jajanCount}x)</span>
              </div>
            </div>

            {/* Net Cash Flow */}
            <div className="pt-2 border-t border-slate-700/60 flex items-center justify-between font-bold">
              <span className="text-slate-300">Arus Kas Bersih:</span>
              <span className={isSurplus ? 'text-[#00c48c] font-black' : 'text-rose-400 font-black'}>
                {isSurplus ? '+' : ''}
                {formatRupiah(data.netFlow)}
              </span>
            </div>

            {/* Total Trx Count */}
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Total Frekuensi:</span>
              <span className="font-semibold text-white">
                {data.jajanCount + data.topupCount} transaksi
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full">
      {/* Chart Subheader & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#00c48c]" />
            Grafik Batang Transaksi & Arus Kas Bulan Ini
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Arahkan kursor ke batang tanggal untuk melihat detail nominal tepat</span>
          </p>
        </div>

        <div className="flex items-center gap-3 text-xs">
          {/* Legend Badges */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-[#00c48c] shadow-[0_0_6px_#00c48c]" />
              <span className="text-emerald-600 dark:text-emerald-400 font-bold">Top-Up (Masuk)</span>
            </div>
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
              <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_6px_#f43f5e]" />
              <span className="text-rose-600 dark:text-rose-400 font-bold">Jajan (Keluar)</span>
            </div>
          </div>

          {/* Toggle View Type */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              title="Tampilan Grafik Batang"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              title="Tampilan Grafik Area / Garis"
              className={`p-1.5 rounded-lg transition-all cursor-pointer ${
                chartType === 'area'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs font-bold'
                  : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
              }`}
            >
              <LineChart className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Chart */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 10, left: -15, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickMargin={8}
                minTickGap={25}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `Rp${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`}
                dx={-5}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                isAnimationActive={false}
              />
              <Bar
                dataKey="topup"
                name="Pemasukan Kas (TopUp)"
                fill="#00c48c"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
                cursor="pointer"
              />
              <Bar
                dataKey="jajan"
                name="Pengeluaran Belanja (Jajan)"
                fill="#f43f5e"
                radius={[4, 4, 0, 0]}
                maxBarSize={16}
                cursor="pointer"
              />
            </BarChart>
          ) : (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorTopUp" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c48c" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#00c48c" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorJajan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#f43f5e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.15} />
              <XAxis
                dataKey="displayDate"
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickMargin={10}
                minTickGap={30}
              />
              <YAxis
                tick={{ fontSize: 10, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `Rp${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`}
                dx={-10}
              />
              <Tooltip
                content={<CustomTooltip />}
                cursor={{ stroke: '#94a3b8', strokeWidth: 1, strokeDasharray: '3 3' }}
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                activeDot={{ r: 6, strokeWidth: 0 }}
                dataKey="topup"
                stroke="#00c48c"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorTopUp)"
              />
              <Area
                type="monotone"
                activeDot={{ r: 6, strokeWidth: 0 }}
                dataKey="jajan"
                stroke="#f43f5e"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#colorJajan)"
              />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
export default TransactionChart;
