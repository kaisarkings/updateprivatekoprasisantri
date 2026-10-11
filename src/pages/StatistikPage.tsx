import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatRupiah } from '../utils/formatters';
import { getCardPaddingClass } from '../utils/themeUtils';
import { ThirtyDayCashflowChart } from '../components/stats/ThirtyDayCashflowChart';
import {
  BarChart3,
  Clock,
  TrendingUp,
  Calendar,
  Sparkles,
  ArrowDownRight,
  ArrowUpRight,
  Activity,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  BrainCircuit,
  Loader2,
} from 'lucide-react';

const FormattedAnalysis: React.FC<{ content: string }> = ({ content }) => {
  const lines = content.split('\n');
  return (
    <div className="space-y-2.5 text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;
        
        if (trimmed.startsWith('### ')) {
          return (
            <h4 key={idx} className="text-base font-black text-emerald-400 mt-3 mb-1">
              {trimmed.replace('### ', '')}
            </h4>
          );
        }
        if (trimmed.startsWith('## ')) {
          return (
            <h3 key={idx} className="text-lg font-black text-white mt-4 mb-1">
              {trimmed.replace('## ', '')}
            </h3>
          );
        }
        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
          return (
            <p key={idx} className="font-bold text-white mt-2">
              {trimmed.slice(2, -2)}
            </p>
          );
        }
        if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
          const itemText = trimmed.slice(2);
          return (
            <div key={idx} className="flex items-start gap-2 ml-2">
              <span className="text-emerald-400 font-bold mt-0.5">•</span>
              <span className="flex-1">
                {itemText.split('**').map((part, pIdx) =>
                  pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{part}</strong> : part
                )}
              </span>
            </div>
          );
        }
        if (/^\d+\./.test(trimmed)) {
          return (
            <div key={idx} className="mt-3 font-semibold text-emerald-300">
              {trimmed.split('**').map((part, pIdx) =>
                pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{part}</strong> : part
              )}
            </div>
          );
        }
        return (
          <p key={idx}>
            {trimmed.split('**').map((part, pIdx) =>
              pIdx % 2 === 1 ? <strong key={pIdx} className="text-white font-bold">{part}</strong> : part
            )}
          </p>
        );
      })}
    </div>
  );
};

export const StatistikPage: React.FC = () => {
  const { transactions, topups, stats, students, uiStyle, refreshData } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const [isAnalyzingAI, setIsAnalyzingAI] = useState(false);
  const [aiAnalysisResult, setAiAnalysisResult] = useState<string | null>(null);
  const [aiSource, setAiSource] = useState<string | null>(null);
  const [tableDays, setTableDays] = useState<30 | 14>(30);

  // Helper for consistent local YYYY-MM-DD
  const getLocalYMD = (d: Date | string): string => {
    const dt = typeof d === 'string' ? new Date(d) : d;
    if (isNaN(dt.getTime())) return '';
    const year = dt.getFullYear();
    const month = String(dt.getMonth() + 1).padStart(2, '0');
    const day = String(dt.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const now = new Date();
  const todayYMD = getLocalYMD(now);

  // Realtime Today metrics (calculated strictly from 00:00:00 midnight today)
  const todayMetrics = useMemo(() => {
    const todayTrxs = (transactions || []).filter((t) => getLocalYMD(t.created_at) === todayYMD);
    const todayTopUps = (topups || []).filter((tp) => getLocalYMD(tp.created_at) === todayYMD);

    const todayExpense = todayTrxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    const todayIncome = todayTopUps.reduce((sum, tp) => sum + (tp.amount || 0), 0);
    const netFlow = todayIncome - todayExpense;

    return {
      trxsCount: todayTrxs.length,
      todayExpense,
      topupsCount: todayTopUps.length,
      todayIncome,
      netFlow,
      todayTrxs,
      todayTopUps,
    };
  }, [transactions, topups, todayYMD]);

  // Time of Day Peak Distribution (Pagi, Siang, Sore, Malam)
  const timePeriodStats = useMemo(() => {
    const map = { pagi: 0, siang: 0, sore: 0, malam: 0 };
    (transactions || []).forEach((t) => {
      if (map[t.time_period] !== undefined) {
        map[t.time_period] += t.amount;
      }
    });

    return [
      { name: 'Pagi (05:00 - 11:00)', amount: map.pagi, icon: '🌅', desc: 'Sarapan & Perlengkapan' },
      { name: 'Siang (11:00 - 15:00)', amount: map.siang, icon: '☀️', desc: 'Makan Siang & Istirahat' },
      { name: 'Sore (15:00 - 18:00)', amount: map.sore, icon: '🌆', desc: 'Snack Ba\'da Ashar' },
      { name: 'Malam (18:00 - 05:00)', amount: map.malam, icon: '🌙', desc: 'Makan Malam & Belajar' },
    ];
  }, [transactions]);

  // Daily Trend Data for History Table (Dynamically calculated for 30 or 14 days)
  const dailyTrendData = useMemo(() => {
    const list = [];
    const count = tableDays;
    for (let i = count - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const ymd = getLocalYMD(d);
      const isToday = ymd === todayYMD;

      const dayTrxs = (transactions || []).filter((t) => getLocalYMD(t.created_at) === ymd);
      const dayTopUps = (topups || []).filter((tp) => getLocalYMD(tp.created_at) === ymd);

      const jajan = dayTrxs.reduce((sum, t) => sum + t.amount, 0);
      const topup = dayTopUps.reduce((sum, tp) => sum + tp.amount, 0);
      const diff = topup - jajan;

      const dayLabel = isToday
        ? 'Hari Ini'
        : d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });

      list.push({
        date: dayLabel,
        rawDate: ymd,
        isToday,
        jajan,
        topup,
        diff,
        trxsCount: dayTrxs.length,
        topupsCount: dayTopUps.length,
      });
    }
    return list;
  }, [transactions, topups, todayYMD, tableDays]);

  // Run Gemini AI Financial Analysis
  const handleRunAiAnalysis = async () => {
    setIsAnalyzingAI(true);
    setAiAnalysisResult(null);
    try {
      // Calculate debt info
      const indebtedStudents = (students || []).filter((s) => (s.balance || 0) < 0);
      const totalDebt = Math.abs(
        indebtedStudents.reduce((sum, s) => sum + (s.balance || 0), 0)
      );

      const payload = {
        statsData: {
          total_students: students.length,
          active_students: students.filter((s) => s.status === 'aktif').length,
          total_balance_all: students.reduce((sum, s) => sum + (s.balance || 0), 0),
          today_transactions_count: todayMetrics.trxsCount,
          today_expense: todayMetrics.todayExpense,
          today_income: todayMetrics.todayIncome,
          yesterday_expense: stats.yesterday_expense || 0,
          this_month_expense: stats.this_month_expense || 0,
        },
        timePeriods: timePeriodStats,
        debtInfo: {
          count: indebtedStudents.length,
          totalDebt,
        },
      };

      const res = await fetch('/api/ai/analyze-finance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      if (json.success && json.analysis) {
        setAiAnalysisResult(json.analysis);
        setAiSource(json.source || 'gemini-3.8-flash');
      } else {
        throw new Error(json.error || 'Gagal memuat analisis');
      }
    } catch (e: any) {
      console.error('Error running AI analysis:', e);
      setAiAnalysisResult(
        `Gagal memproses analisis AI: ${e.message}. Silakan periksa koneksi atau API key di server.`
      );
    } finally {
      setIsAnalyzingAI(false);
    }
  };

  return (
    <div className={`space-y-6 pb-12 ${isNeo ? 'font-mono' : ''}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-emerald-600" />
              Statistik & Arus Kas Real-Time
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
              Live (00:00 WIB)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Data transaksi jajan & top-up tercatat otomatis per transaksi tanpa menunggu pergantian hari.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => refreshData()}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs flex items-center gap-2 transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            Refresh Data
          </button>
          <button
            onClick={handleRunAiAnalysis}
            disabled={isAnalyzingAI}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-md shadow-emerald-600/20 disabled:opacity-60"
          >
            {isAnalyzingAI ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Menganalisis...
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                Analisis Gemini AI
              </>
            )}
          </button>
        </div>
      </div>

      {/* Realtime Today KPI Banner */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-emerald-900 via-slate-900 to-slate-950 text-white shadow-xl border border-emerald-500/30 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Activity className="w-48 h-48 text-emerald-400" />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4 relative z-10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <h2 className="text-base font-black tracking-wide uppercase text-emerald-400">
                Aktivitas Keuangan Hari Ini
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Siklus berjalan sejak pukul 00:00:00 WIB • Langsung terupdate tiap ada transaksi / top up masuk
            </p>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-mono text-slate-400">Tanggal Kalender Lokal</span>
            <div className="text-sm font-bold text-white font-mono">
              {now.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 relative z-10">
          {/* Today Expense */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Transaksi Jajan (Keluar)</span>
              <ArrowDownRight className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-black text-rose-300 tracking-tight">
              {formatRupiah(todayMetrics.todayExpense)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                {todayMetrics.trxsCount} transaksi tercatat
              </span>
            </div>
          </div>

          {/* Today Income */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Pemasukan Top-Up (Masuk)</span>
              <ArrowUpRight className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-black text-emerald-300 tracking-tight">
              {formatRupiah(todayMetrics.todayIncome)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                {todayMetrics.topupsCount} top-up tercatat
              </span>
            </div>
          </div>

          {/* Today Net Cash Flow */}
          <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
            <div className="flex items-center justify-between text-xs text-slate-300 mb-1">
              <span>Arus Kas Bersih Hari Ini</span>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
            </div>
            <div className={`text-2xl font-black tracking-tight ${todayMetrics.netFlow >= 0 ? 'text-cyan-300' : 'text-amber-300'}`}>
              {todayMetrics.netFlow > 0 ? '+' : ''}{formatRupiah(todayMetrics.netFlow)}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold text-slate-400">
              <span className="px-2 py-0.5 rounded-md bg-white/10 text-slate-300">
                {todayMetrics.netFlow >= 0 ? 'Surplus Kas Positif' : 'Defisit Pengeluaran Santri'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* AI Analysis Result Panel (if generated) */}
      {aiAnalysisResult && (
        <div className="p-6 rounded-3xl bg-slate-900 border border-emerald-500/40 text-white shadow-xl relative animate-in fade-in slide-in-from-top-4">
          <div className="flex items-center justify-between gap-4 mb-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500 text-white">
                <BrainCircuit className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black flex items-center gap-2">
                  Hasil Analisis Cerdas Gemini AI
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    {aiSource}
                  </span>
                </h3>
                <p className="text-xs text-slate-400">
                  Evaluasi otomatis tren keuangan, jam sibuk, dan rekomendasi operasional koperasi
                </p>
              </div>
            </div>
            <button
              onClick={() => setAiAnalysisResult(null)}
              className="text-xs text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10"
            >
              Tutup
            </button>
          </div>

          <div className="max-w-none text-slate-200 leading-relaxed">
            <FormattedAnalysis content={aiAnalysisResult} />
          </div>
        </div>
      )}

      {/* Time-of-Day Peak Cards */}
      <div>
        <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2 mb-3">
          <Clock className="w-4 h-4 text-emerald-500" />
          Pola Waktu Jajan Santri (Peak Hours)
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {timePeriodStats.map((period) => (
            <div
              key={period.name}
              className={getCardPaddingClass(uiStyle, 'p-5 flex flex-col justify-between')}
            >
              <div className="flex items-start justify-between">
                <span className="text-3xl">{period.icon}</span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {period.desc}
                </span>
              </div>
              <div className="mt-4">
                <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{period.name}</p>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mt-0.5">
                  {formatRupiah(period.amount)}
                </h3>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 30-Day Cashflow & Transaction Bar Chart Component */}
      <ThirtyDayCashflowChart
        transactions={transactions}
        topups={topups}
        uiStyle={uiStyle}
      />

      {/* Daily History Table */}
      <div className={getCardPaddingClass(uiStyle, 'p-6')}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-500" />
              Tabel Rincian Harian ({tableDays} Hari Terakhir)
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Merekam setiap nominal masuk & keluar tanpa jeda (Siklus reset 00:00 WIB)
            </p>
          </div>

          <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold shrink-0 self-start sm:self-auto">
            <button
              onClick={() => setTableDays(30)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tableDays === 30
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Hari
            </button>
            <button
              onClick={() => setTableDays(14)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tableDays === 14
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              14 Hari
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Tanggal Siklus</th>
                <th className="py-3 px-4">Trx Jajan</th>
                <th className="py-3 px-4">Top-Up (Masuk)</th>
                <th className="py-3 px-4">Jajan (Keluar)</th>
                <th className="py-3 px-4 text-right">Selisih Bersih</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs font-medium">
              {[...dailyTrendData].reverse().map((day, idx) => (
                <tr
                  key={idx}
                  className={`transition-colors ${
                    day.isToday
                      ? 'bg-emerald-50/50 dark:bg-emerald-950/30 font-semibold'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <td className="py-3.5 px-4 text-slate-800 dark:text-slate-200 flex items-center gap-2">
                    {day.isToday && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    )}
                    <span>{day.date}</span>
                    {day.isToday && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                        Hari Ini
                      </span>
                    )}
                    <span className="text-[10px] text-slate-400 font-mono">({day.rawDate})</span>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                    <span className="font-bold text-slate-900 dark:text-white">{day.trxsCount}</span> trx
                  </td>
                  <td className="py-3.5 px-4 text-emerald-600 dark:text-emerald-400 font-semibold">
                    {formatRupiah(day.topup)}
                  </td>
                  <td className="py-3.5 px-4 text-rose-600 dark:text-rose-400 font-semibold">
                    {formatRupiah(day.jajan)}
                  </td>
                  <td
                    className={`py-3.5 px-4 text-right font-bold ${
                      day.diff >= 0
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-rose-600 dark:text-rose-400'
                    }`}
                  >
                    {day.diff > 0 ? '+' : ''}
                    {formatRupiah(day.diff)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
