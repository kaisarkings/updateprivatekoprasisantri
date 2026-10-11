import React, { useState, useMemo } from 'react';
import { motion } from 'motion/react';
import { TopSantriStat } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  ExternalLink,
  ChevronRight,
  TrendingDown,
  ArrowUpDown,
  ShoppingBag,
  Trophy,
  Crown,
  Medal,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StudentAvatar } from '../common/StudentAvatar';
import { useApp } from '../../context/AppContext';
import {
  TopSantriPeriod,
  TopSantriSortBy,
  computeTopSantriList,
} from '../../utils/topSantriUtils';

interface TopSantriTableProps {
  topSantri?: TopSantriStat[];
}

export const TopSantriTable: React.FC<TopSantriTableProps> = ({ topSantri: initialFallback = [] }) => {
  const navigate = useNavigate();
  const { transactions = [], students = [] } = useApp();

  // State filters
  const [period, setPeriod] = useState<TopSantriPeriod>('realtime');
  const [sortBy, setSortBy] = useState<TopSantriSortBy>('amount');

  // Compute real-time filtered leaderboard
  const { list: computedList, totalPeriodSpent, totalPeriodTrxs } = useMemo(() => {
    return computeTopSantriList(transactions, students, period, sortBy);
  }, [transactions, students, period, sortBy]);

  // Fallback to initial if all-time and computed is empty
  const activeList = useMemo(() => {
    if (computedList.length > 0) return computedList;
    if (period === 'all' && initialFallback.length > 0) {
      return initialFallback.map((s, idx) => ({
        ...s,
        rank: idx + 1,
        average_spent_per_trx: s.transaction_count > 0 ? Math.round(s.total_spent / s.transaction_count) : 0,
        percentage_of_total: 0,
      }));
    }
    return [];
  }, [computedList, period, initialFallback]);

  const top7 = activeList.slice(0, 7);
  const maxSpent = activeList[0]?.total_spent || 1;

  const renderRankBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-300 via-amber-400 to-amber-500 text-slate-950 font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-amber-400/40 ring-1 ring-amber-300">
          👑
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-slate-200 via-slate-300 to-slate-400 text-slate-900 font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-slate-300/40 ring-1 ring-slate-200">
          🥈
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="w-7 h-7 rounded-xl bg-gradient-to-br from-amber-600 via-amber-700 to-orange-800 text-white font-black text-xs flex items-center justify-center shrink-0 shadow-md shadow-amber-700/40 ring-1 ring-amber-600">
          🥉
        </span>
      );
    }
    return (
      <span className="w-7 h-7 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center shrink-0 font-mono border border-slate-200 dark:border-slate-700">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-3.5">
      {/* Header bar with period segmented tabs and full-page link */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-2 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-slate-950 shadow-xs">
              <Trophy className="w-3.5 h-3.5" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900 dark:text-white">
              Peringkat Santri
            </h3>
            {period === 'realtime' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Total {totalPeriodTrxs} transaksi ({formatRupiah(totalPeriodSpent)})
          </p>
        </div>

        <button
          onClick={() => navigate('/top-santri')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors cursor-pointer self-start sm:self-auto hover:underline"
        >
          <span>Buka Leaderboard</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Segmented Period Tabs Bar with colorful pills */}
      <div className="flex items-center justify-between gap-2">
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-xs">
          <button
            type="button"
            onClick={() => setPeriod('realtime')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              period === 'realtime'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Hari Ini
          </button>
          <button
            type="button"
            onClick={() => setPeriod('7days')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              period === '7days'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => setPeriod('30days')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              period === '30days'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            30 Hari
          </button>
          <button
            type="button"
            onClick={() => setPeriod('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              period === 'all'
                ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua
          </button>
        </div>

        {/* Sort Toggle */}
        <div className="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-700/60 text-[11px]">
          <button
            type="button"
            onClick={() => setSortBy('amount')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              sortBy === 'amount'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Urutkan total pengeluaran rupiah"
          >
            Rp
          </button>
          <button
            type="button"
            onClick={() => setSortBy('frequency')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              sortBy === 'frequency'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
            title="Urutkan frekuensi transaksi"
          >
            Qty
          </button>
        </div>
      </div>

      {/* List Content */}
      {top7.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-6 text-center">
          <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {period === 'realtime'
              ? 'Belum ada transaksi jajan hari ini'
              : 'Tidak ada transaksi pada periode ini'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Data diperbarui secara langsung saat kasir mencatat pembelian.
          </p>
          {period === 'realtime' && (
            <button
              type="button"
              onClick={() => setPeriod('7days')}
              className="mt-2.5 px-3 py-1 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 cursor-pointer"
            >
              Lihat 7 Hari Terakhir
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-xs">
          {top7.map((item, idx) => {
            const rank = idx + 1;
            const percentOfMax = Math.min(100, Math.round((item.total_spent / maxSpent) * 100));

            const progressBarColor =
              rank === 1
                ? 'from-amber-400 to-orange-500'
                : rank === 2
                ? 'from-sky-400 to-blue-500'
                : rank === 3
                ? 'from-purple-400 to-pink-500'
                : 'from-emerald-400 to-teal-500';

            return (
              <motion.div
                key={item.student_id ? `widget-${period}-${item.student_id}` : `widget-${period}-${idx}`}
                whileHover={{ x: 2 }}
                onClick={() => navigate(`/santri/${item.student_id}`)}
                className="group p-3 sm:p-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/60 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderRankBadge(rank)}
                  <StudentAvatar
                    src={item.avatar_url}
                    name={item.student_name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-slate-200 dark:ring-slate-700 group-hover:ring-emerald-400 transition-all"
                  />
                  <div className="min-w-0">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                      {item.student_name}
                    </p>
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      <span>{item.class_name || 'Santri'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{item.transaction_count}x jajan</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white tabular-nums font-mono">
                      {formatRupiah(item.total_spent)}
                    </p>
                    <div className="w-20 ml-auto h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 mt-1 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentOfMax}%` }}
                        transition={{ duration: 0.6, ease: 'easeOut', delay: idx * 0.05 }}
                        className={`h-full bg-gradient-to-r ${progressBarColor} rounded-full`}
                      />
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-transform" />
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Footer link */}
      {top7.length > 0 && (
        <button
          onClick={() => navigate('/top-santri')}
          className="w-full py-2.5 px-3 rounded-xl text-center text-xs font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 bg-slate-50 hover:bg-emerald-50/50 dark:bg-slate-800/50 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs active:scale-[0.99]"
        >
          <span>Lihat Seluruh Peringkat Santri</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
};

