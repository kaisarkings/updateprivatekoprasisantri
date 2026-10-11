import React, { useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from 'recharts';
import {
  TrendingUp,
  ArrowDownRight,
  ArrowUpRight,
  Scale,
  Activity,
  Layers,
  CalendarDays,
  Sparkles,
  Info,
  Download,
} from 'lucide-react';
import { Transaction, TopUp } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import { getCardPaddingClass } from '../../utils/themeUtils';

interface ThirtyDayCashflowChartProps {
  transactions: Transaction[];
  topups: TopUp[];
  uiStyle?: string;
}

type ChartViewMode = 'comparison' | 'net' | 'volume';
type DayRange = 30 | 14 | 7;

export const ThirtyDayCashflowChart: React.FC<ThirtyDayCashflowChartProps> = ({
  transactions = [],
  topups = [],
  uiStyle = 'standard',
}) => {
  const [viewMode, setViewMode] = useState<ChartViewMode>('comparison');
  const [dayRange, setDayRange] = useState<DayRange>(30);

  // Helper local YMD string
  const getLocalYMD = (dateInput: Date | string) => {
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const now = new Date();
  const todayYMD = getLocalYMD(now);

  // Calculate day-by-day cashflow data for the chosen range (up to 30 days)
  const chartData = useMemo(() => {
    const dataList = [];
    const daysToCount = dayRange;

    for (let i = daysToCount - 1; i >= 0; i--) {
      const targetDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const ymd = getLocalYMD(targetDate);
      const isToday = ymd === todayYMD;

      // Filter transactions and topups by matching local date
      const dayTrxs = transactions.filter((t) => getLocalYMD(t.created_at) === ymd);
      const dayTopups = topups.filter((tp) => getLocalYMD(tp.created_at) === ymd);

      const jajanNominal = dayTrxs.reduce((sum, t) => sum + (t.amount || 0), 0);
      const topupNominal = dayTopups.reduce((sum, tp) => sum + (tp.amount || 0), 0);
      const netFlow = topupNominal - jajanNominal;
      const totalFlow = topupNominal + jajanNominal;

      const dateShort = targetDate.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: daysToCount > 14 ? 'numeric' : 'short',
      });

      const fullDateLabel = targetDate.toLocaleDateString('id-ID', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      });

      dataList.push({
        date: isToday ? 'Hari Ini' : dateShort,
        rawDate: ymd,
        fullDateLabel,
        isToday,
        topup: topupNominal,
        jajan: jajanNominal,
        netFlow,
        totalFlow,
        jajanCount: dayTrxs.length,
        topupCount: dayTopups.length,
        totalCount: dayTrxs.length + dayTopups.length,
      });
    }

    return dataList;
  }, [transactions, topups, dayRange, todayYMD]);

  // Aggregate metrics across the entire 30-day (or selected) window
  const summaryMetrics = useMemo(() => {
    const totalTopup = chartData.reduce((sum, d) => sum + d.topup, 0);
    const totalJajan = chartData.reduce((sum, d) => sum + d.jajan, 0);
    const totalNet = totalTopup - totalJajan;
    const totalTrxCount = chartData.reduce((sum, d) => sum + d.totalCount, 0);
    const totalJajanCount = chartData.reduce((sum, d) => sum + d.jajanCount, 0);
    const totalTopupCount = chartData.reduce((sum, d) => sum + d.topupCount, 0);
    const avgDailyJajan = totalJajan / chartData.length;
    const avgDailyTopup = totalTopup / chartData.length;

    // Peak days
    let peakTopupDay = chartData[0];
    let peakJajanDay = chartData[0];
    chartData.forEach((d) => {
      if (d.topup > (peakTopupDay?.topup || 0)) peakTopupDay = d;
      if (d.jajan > (peakJajanDay?.jajan || 0)) peakJajanDay = d;
    });

    return {
      totalTopup,
      totalJajan,
      totalNet,
      totalTrxCount,
      totalJajanCount,
      totalTopupCount,
      avgDailyJajan,
      avgDailyTopup,
      peakTopupDay,
      peakJajanDay,
    };
  }, [chartData]);

  // Export to CSV
  const handleExportCSV = () => {
    const headers = [
      'Tanggal',
      'Kode Tanggal',
      'Pemasukan Top-Up (Rp)',
      'Frekuensi Top-Up',
      'Pengeluaran Jajan (Rp)',
      'Frekuensi Jajan',
      'Arus Kas Bersih (Rp)',
      'Total Perputaran (Rp)',
    ];

    const rows = chartData.map((d) => [
      `"${d.fullDateLabel}"`,
      `"${d.rawDate}"`,
      d.topup,
      d.topupCount,
      d.jajan,
      d.jajanCount,
      d.netFlow,
      d.totalFlow,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `laporan-arus-kas-${dayRange}-hari-${todayYMD}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Custom Chart Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-900/95 backdrop-blur-md border border-slate-700/80 p-3.5 rounded-2xl shadow-xl text-white text-xs space-y-2 min-w-[210px] z-50">
          <div className="flex items-center justify-between border-b border-slate-700/60 pb-1.5">
            <span className="font-bold text-slate-200">{data.fullDateLabel}</span>
            {data.isToday && (
              <span className="px-1.5 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                Hari Ini
              </span>
            )}
          </div>

          <div className="space-y-1.5 font-sans">
            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Pemasukan Top-Up:
              </span>
              <div className="text-right">
                <span className="font-black text-white">{formatRupiah(data.topup)}</span>
                <span className="text-[10px] text-slate-400 ml-1">({data.topupCount}x)</span>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-rose-400 font-medium">
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Pengeluaran Jajan:
              </span>
              <div className="text-right">
                <span className="font-black text-white">{formatRupiah(data.jajan)}</span>
                <span className="text-[10px] text-slate-400 ml-1">({data.jajanCount}x)</span>
              </div>
            </div>

            <div className="pt-1.5 border-t border-slate-700/60 flex items-center justify-between font-bold">
              <span className="text-slate-300">Arus Kas Bersih:</span>
              <span
                className={
                  data.netFlow >= 0 ? 'text-emerald-400 font-black' : 'text-rose-400 font-black'
                }
              >
                {data.netFlow > 0 ? '+' : ''}
                {formatRupiah(data.netFlow)}
              </span>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
              <span>Total Frekuensi:</span>
              <span className="font-semibold text-slate-200">{data.totalCount} transaksi</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className={getCardPaddingClass(uiStyle, 'p-6 space-y-6')}>
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-black text-base sm:text-lg text-slate-900 dark:text-white tracking-tight">
              Grafik Batang Perbandingan Transaksi & Arus Kas ({dayRange} Hari Terakhir)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>
              Pantau perbandingan total arus kas masuk (Top-Up) dan belanja santri (Jajan) harian secara akurat
            </span>
          </p>
        </div>

        {/* Filter & View Mode Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Day Range Tabs */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            {( [30, 14, 7] as DayRange[] ).map((range) => (
              <button
                key={range}
                onClick={() => setDayRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  dayRange === range
                    ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                {range} Hari
              </button>
            ))}
          </div>

          {/* View Mode Selector */}
          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs font-bold">
            <button
              onClick={() => setViewMode('comparison')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'comparison'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Perbandingan Pemasukan vs Pengeluaran"
            >
              <Scale className="w-3.5 h-3.5" />
              <span>Arus Kas (Rp)</span>
            </button>
            <button
              onClick={() => setViewMode('net')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'net'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Arus Kas Bersih (Surplus / Defisit)"
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Selisih Bersih</span>
            </button>
            <button
              onClick={() => setViewMode('volume')}
              className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                viewMode === 'volume'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
              title="Jumlah Frekuensi Transaksi"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Volume (Trx)</span>
            </button>
          </div>

          {/* Export CSV Button */}
          <button
            onClick={handleExportCSV}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
            title={`Unduh Data ${dayRange} Hari (.CSV)`}
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 30-Day Key Metric Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Top-up Inflow Card */}
        <div className="p-4 rounded-2xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider">
              Total Pemasukan Top-Up
            </span>
            <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ArrowDownRight className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {formatRupiah(summaryMetrics.totalTopup)}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {summaryMetrics.totalTopupCount} transaksi • Rata-rata:{' '}
            <strong className="text-emerald-600 dark:text-emerald-400 font-bold">
              {formatRupiah(summaryMetrics.avgDailyTopup)}/hari
            </strong>
          </p>
        </div>

        {/* Jajan Outflow Card */}
        <div className="p-4 rounded-2xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider">
              Total Pengeluaran Jajan
            </span>
            <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
              <ArrowUpRight className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {formatRupiah(summaryMetrics.totalJajan)}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            {summaryMetrics.totalJajanCount} transaksi • Rata-rata:{' '}
            <strong className="text-rose-600 dark:text-rose-400 font-bold">
              {formatRupiah(summaryMetrics.avgDailyJajan)}/hari
            </strong>
          </p>
        </div>

        {/* Net Flow Card */}
        <div
          className={`p-4 rounded-2xl border transition-all hover:shadow-sm ${
            summaryMetrics.totalNet >= 0
              ? 'bg-blue-500/5 dark:bg-blue-950/20 border-blue-500/20'
              : 'bg-amber-500/5 dark:bg-amber-950/20 border-amber-500/20'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-[11px] font-bold uppercase tracking-wider ${
                summaryMetrics.totalNet >= 0
                  ? 'text-blue-700 dark:text-blue-400'
                  : 'text-amber-700 dark:text-amber-400'
              }`}
            >
              Arus Kas Bersih ({dayRange} Hari)
            </span>
            <span
              className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                summaryMetrics.totalNet >= 0
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-300'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-300'
              }`}
            >
              {summaryMetrics.totalNet >= 0 ? 'Surplus' : 'Defisit'}
            </span>
          </div>
          <h4 className="text-xl font-black text-slate-900 dark:text-white mt-1.5 tracking-tight">
            {summaryMetrics.totalNet > 0 ? '+' : ''}
            {formatRupiah(summaryMetrics.totalNet)}
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Selisih saldo kas masuk vs belanja santri
          </p>
        </div>

        {/* Peak Activity Card */}
        <div className="p-4 rounded-2xl bg-purple-500/5 dark:bg-purple-950/20 border border-purple-500/20 transition-all hover:shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-purple-700 dark:text-purple-400 uppercase tracking-wider">
              Puncak Arus Transaksi
            </span>
            <span className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <CalendarDays className="w-4 h-4" />
            </span>
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white mt-1.5 truncate">
            {summaryMetrics.peakJajanDay?.date || '-'} ({formatRupiah(summaryMetrics.peakJajanDay?.jajan || 0)})
          </h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total {summaryMetrics.totalTrxCount} transaksi dalam rentang waktu ini
          </p>
        </div>
      </div>

      {/* Main Bar Chart Container */}
      <div className="w-full">
        <div className="h-80 sm:h-96 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {viewMode === 'comparison' ? (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: dayRange > 14 ? 10 : 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={dayRange === 30 ? 1 : 0}
                  angle={dayRange === 30 ? -45 : 0}
                  textAnchor={dayRange === 30 ? 'end' : 'middle'}
                  height={dayRange === 30 ? 45 : 30}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `Rp${v >= 1000 ? Math.round(v / 1000) + 'k' : v}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                  isAnimationActive={false}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="topup"
                  name="Pemasukan Kas (Top-Up)"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={dayRange === 30 ? 18 : 32}
                  cursor="pointer"
                />
                <Bar
                  dataKey="jajan"
                  name="Pengeluaran Belanja (Jajan)"
                  fill="#f43f5e"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={dayRange === 30 ? 18 : 32}
                  cursor="pointer"
                />
              </BarChart>
            ) : viewMode === 'net' ? (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: dayRange > 14 ? 10 : 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={dayRange === 30 ? 1 : 0}
                  angle={dayRange === 30 ? -45 : 0}
                  textAnchor={dayRange === 30 ? 'end' : 'middle'}
                  height={dayRange === 30 ? 45 : 30}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) => `Rp${v !== 0 ? Math.round(v / 1000) + 'k' : 0}`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                  isAnimationActive={false}
                />
                <ReferenceLine y={0} stroke="#64748b" strokeWidth={1.5} />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="netFlow"
                  name="Arus Kas Bersih (TopUp - Jajan)"
                  fill="#0ea5e9"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={dayRange === 30 ? 24 : 40}
                  cursor="pointer"
                />
              </BarChart>
            ) : (
              <BarChart
                data={chartData}
                margin={{ top: 15, right: 10, left: -5, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.2} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: dayRange > 14 ? 10 : 11 }}
                  axisLine={false}
                  tickLine={false}
                  interval={dayRange === 30 ? 1 : 0}
                  angle={dayRange === 30 ? -45 : 0}
                  textAnchor={dayRange === 30 ? 'end' : 'middle'}
                  height={dayRange === 30 ? 45 : 30}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                  allowDecimals={false}
                  tickFormatter={(v) => `${v} trx`}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ fill: 'rgba(255, 255, 255, 0.08)' }}
                  isAnimationActive={false}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  wrapperStyle={{ paddingBottom: '16px', fontSize: '12px' }}
                />
                <Bar
                  dataKey="topupCount"
                  name="Frekuensi Top-Up"
                  fill="#10b981"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={dayRange === 30 ? 18 : 32}
                  cursor="pointer"
                />
                <Bar
                  dataKey="jajanCount"
                  name="Frekuensi Jajan Santri"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={dayRange === 30 ? 18 : 32}
                  cursor="pointer"
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Legend / Info Helper below chart */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              Pemasukan (Top-Up Kas Masuk)
            </span>
            <span className="flex items-center gap-1.5 font-medium">
              <span className="w-3 h-3 rounded bg-rose-500"></span>
              Pengeluaran (Belanja Jajan Santri)
            </span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px]">
            <Info className="w-3.5 h-3.5 text-slate-400" />
            <span>Siklus harian dihitung per tanggal kalender mulai pukul 00:00:00 WIB</span>
          </div>
        </div>
      </div>
    </div>
  );
};
export default ThirtyDayCashflowChart;
