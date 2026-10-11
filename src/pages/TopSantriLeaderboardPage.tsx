import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';
import { useApp } from '../context/AppContext';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { formatRupiah, formatDateTime } from '../utils/formatters';
import {
  ArrowLeft,
  Search,
  FileSpreadsheet,
  Download,
  Printer,
  ChevronRight,
  RefreshCw,
  LayoutGrid,
  List,
  Wallet,
  Receipt,
  Users,
  Award,
} from 'lucide-react';
import {
  TopSantriPeriod,
  TopSantriSortBy,
  computeTopSantriList,
  getPeriodLabel,
} from '../utils/topSantriUtils';

export const TopSantriLeaderboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { transactions = [], students = [], refreshData, isLoading } = useApp();

  // State Filters
  const [period, setPeriod] = useState<TopSantriPeriod>('realtime');
  const [sortBy, setSortBy] = useState<TopSantriSortBy>('amount');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedDormitory, setSelectedDormitory] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Compute leaderboard
  const { list: fullList, totalPeriodSpent, totalPeriodTrxs, totalActiveSantri } = useMemo(() => {
    return computeTopSantriList(transactions, students, period, sortBy);
  }, [transactions, students, period, sortBy]);

  // Extract unique classes and dormitories
  const uniqueClasses = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.class_name && s.class_name.trim() !== '' && s.class_name !== '-') {
        set.add(s.class_name);
      }
    });
    return Array.from(set).sort();
  }, [students]);

  const uniqueDormitories = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => {
      if (s.dormitory && s.dormitory.trim() !== '' && s.dormitory !== '-') {
        set.add(s.dormitory);
      }
    });
    return Array.from(set).sort();
  }, [students]);

  // Filtered List
  const filteredList = useMemo(() => {
    return fullList.filter((item) => {
      const matchSearch =
        searchQuery === '' ||
        item.student_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.class_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = selectedClass === 'all' || item.class_name === selectedClass;
      const matchDorm = selectedDormitory === 'all' || item.dormitory === selectedDormitory;

      return matchSearch && matchClass && matchDorm;
    });
  }, [fullList, searchQuery, selectedClass, selectedDormitory]);

  // Top 3
  const rank1 = fullList[0];
  const rank2 = fullList[1];
  const rank3 = fullList[2];

  const maxSpent = fullList[0]?.total_spent || 1;
  const averageSpentOverall =
    totalActiveSantri > 0 ? Math.round(totalPeriodSpent / totalActiveSantri) : 0;

  // Export
  const handleExport = (format: 'xlsx' | 'csv') => {
    const filename = `Leaderboard_Santri_${period}_${new Date().toISOString().slice(0, 10)}`;
    const dataToExport = filteredList.map((item) => ({
      Peringkat: item.rank,
      'Nama Santri': item.student_name,
      NIS: item.nis,
      Kelas: item.class_name,
      Asrama: item.dormitory,
      'Total Pengeluaran (IDR)': item.total_spent,
      'Frekuensi Transaksi': item.transaction_count,
      'Rata-rata per Transaksi (IDR)': item.average_spent_per_trx,
      'Kategori Favorit': item.favorite_category,
      'Sisa Saldo (IDR)': item.current_balance,
      'Waktu Transaksi Terakhir': item.last_trx_time ? formatDateTime(item.last_trx_time) : '-',
      Periode: getPeriodLabel(period),
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Peringkat Santri');

    if (format === 'csv') {
      XLSX.writeFile(workbook, `${filename}.csv`, { bookType: 'csv' });
    } else {
      XLSX.writeFile(workbook, `${filename}.xlsx`, { bookType: 'xlsx' });
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const renderBadge = (rank: number) => {
    if (rank === 1) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/30 text-xs font-bold font-mono">
          1
        </span>
      );
    }
    if (rank === 2) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 text-xs font-bold font-mono">
          2
        </span>
      );
    }
    if (rank === 3) {
      return (
        <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-amber-700/15 text-amber-800 dark:text-amber-300 border border-amber-700/30 text-xs font-bold font-mono">
          3
        </span>
      );
    }
    return (
      <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-xs font-medium font-mono">
        {rank}
      </span>
    );
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Kembali ke Dashboard</span>
          </button>

          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
              Peringkat Pengeluaran Santri
            </h1>
            {period === 'realtime' && (
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Live Realtime
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Data transaksi santri di koperasi & kantin berdasarkan periode waktu terpilih.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => refreshData()}
            disabled={isLoading}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Muat ulang data transaksi"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Sinkronkan</span>
          </button>

          <button
            onClick={() => handleExport('xlsx')}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download file Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span>Excel</span>
          </button>

          <button
            onClick={() => handleExport('csv')}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-900 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Download file CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span>CSV</span>
          </button>

          <button
            onClick={handlePrint}
            className="h-9 px-3 rounded-lg text-xs font-semibold bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer"
            title="Cetak laporan"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Cetak</span>
          </button>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Santri Teratas */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Santri Teratas</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          {rank1 ? (
            <div>
              <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {rank1.student_name}
              </p>
              <div className="flex items-center justify-between mt-1 text-xs">
                <span className="text-slate-500 dark:text-slate-400 truncate">{rank1.class_name}</span>
                <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                  {formatRupiah(rank1.total_spent)}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">Tidak ada data</p>
          )}
        </div>

        {/* Card 2: Total Pengeluaran */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Total Pengeluaran</span>
            <Wallet className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono">
            {formatRupiah(totalPeriodSpent)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Periode: {getPeriodLabel(period)}
          </p>
        </div>

        {/* Card 3: Volume Transaksi */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Volume Transaksi</span>
            <Receipt className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono">
            {totalPeriodTrxs} Struk
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
            Total transaksi kasir
          </p>
        </div>

        {/* Card 4: Santri Berbelanja */}
        <div className="p-3.5 sm:p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 mb-1.5">
            <span className="text-xs font-medium">Santri Berbelanja</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-base sm:text-xl font-bold text-slate-900 dark:text-white tabular-nums font-mono">
            {totalActiveSantri} Santri
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 tabular-nums font-mono">
            Rata-rata: {formatRupiah(averageSpentOverall)}
          </p>
        </div>
      </div>

      {/* Top 3 Spotlight Cards (Clean, Pro, Responsive) */}
      {fullList.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">
              Tiga Besar Santri ({getPeriodLabel(period)})
            </h2>
            <span className="text-xs text-slate-400">Peringkat 1, 2, dan 3</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4 items-stretch">
            {/* Rank 2 (Silver) */}
            <div
              onClick={() => rank2 && navigate(`/santri/${rank2.student_id}`)}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between ${
                rank2 ? 'cursor-pointer' : 'opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Peringkat 2
                  </span>
                  <span className="w-6 h-6 rounded-md bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center justify-center font-mono">
                    2
                  </span>
                </div>

                {rank2 ? (
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      src={rank2.avatar_url}
                      name={rank2.student_name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {rank2.student_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{rank2.class_name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px]">NIS: {rank2.nis}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 my-4">Belum ada data</p>
                )}
              </div>

              {rank2 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Total Belanja</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                      {formatRupiah(rank2.total_spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Frekuensi</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      {rank2.transaction_count}x
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Rank 1 (Gold - Slightly Highlighted) */}
            <div
              onClick={() => rank1 && navigate(`/santri/${rank1.student_id}`)}
              className={`p-4 sm:p-5 rounded-xl bg-amber-50/20 dark:bg-amber-950/10 border-2 border-amber-400/80 dark:border-amber-500/60 hover:border-amber-500 transition-colors flex flex-col justify-between ${
                rank1 ? 'cursor-pointer' : 'opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-amber-800 dark:text-amber-400">
                    Peringkat 1 (Tertinggi)
                  </span>
                  <span className="w-6 h-6 rounded-md bg-amber-500 text-slate-950 font-bold text-xs flex items-center justify-center font-mono">
                    1
                  </span>
                </div>

                {rank1 ? (
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      src={rank1.avatar_url}
                      name={rank1.student_name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 ring-2 ring-amber-400/80"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-sm sm:text-base text-slate-900 dark:text-white truncate">
                        {rank1.student_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{rank1.class_name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px]">NIS: {rank1.nis}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 my-4">Belum ada data</p>
                )}
              </div>

              {rank1 && (
                <div className="mt-4 pt-3 border-t border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Total Belanja</span>
                    <span className="font-bold text-base text-slate-900 dark:text-white tabular-nums font-mono">
                      {formatRupiah(rank1.total_spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 dark:text-slate-400 text-[11px] block">Frekuensi &amp; Rata-rata</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      {rank1.transaction_count}x ({formatRupiah(rank1.average_spent_per_trx)})
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Rank 3 (Bronze) */}
            <div
              onClick={() => rank3 && navigate(`/santri/${rank3.student_id}`)}
              className={`p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors flex flex-col justify-between ${
                rank3 ? 'cursor-pointer' : 'opacity-60'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">
                    Peringkat 3
                  </span>
                  <span className="w-6 h-6 rounded-md bg-amber-700/20 text-amber-800 dark:text-amber-400 font-bold text-xs flex items-center justify-center font-mono">
                    3
                  </span>
                </div>

                {rank3 ? (
                  <div className="flex items-center gap-3">
                    <StudentAvatar
                      src={rank3.avatar_url}
                      name={rank3.student_name}
                      className="w-11 h-11 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                    />
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-900 dark:text-white truncate">
                        {rank3.student_name}
                      </p>
                      <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>{rank3.class_name}</span>
                        <span aria-hidden="true">·</span>
                        <span className="font-mono text-[11px]">NIS: {rank3.nis}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 my-4">Belum ada data</p>
                )}
              </div>

              {rank3 && (
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 text-[11px] block">Total Belanja</span>
                    <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                      {formatRupiah(rank3.total_spent)}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400 text-[11px] block">Frekuensi</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">
                      {rank3.transaction_count}x
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Filter and Control Bar */}
      <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-3.5">
        {/* Row 1: Period Segmented Controls & Sort By & View Mode */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          {/* Segmented Period Tabs */}
          <div className="inline-flex p-1 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs overflow-x-auto max-w-full">
            <button
              type="button"
              onClick={() => setPeriod('realtime')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                period === 'realtime'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Hari Ini
            </button>
            <button
              type="button"
              onClick={() => setPeriod('7days')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                period === '7days'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              7 Hari Terakhir
            </button>
            <button
              type="button"
              onClick={() => setPeriod('30days')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                period === '30days'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              30 Hari Terakhir
            </button>
            <button
              type="button"
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer whitespace-nowrap ${
                period === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Semua Waktu
            </button>
          </div>

          {/* Right Tools: Sort & View Mode */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sort */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setSortBy('amount')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  sortBy === 'amount'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Urutkan total pengeluaran"
              >
                Nominal
              </button>
              <button
                type="button"
                onClick={() => setSortBy('frequency')}
                className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer ${
                  sortBy === 'frequency'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-semibold'
                    : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                }`}
                title="Urutkan frekuensi transaksi"
              >
                Frekuensi
              </button>
            </div>

            {/* View Mode Switcher */}
            <div className="inline-flex p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60 text-xs">
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Tampilan Tabel"
              >
                <List className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('cards')}
                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                  viewMode === 'cards'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
                }`}
                title="Tampilan Kartu (Nyaman di Mobile)"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Search Box & Dropdown Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri, NIS, kelas..."
              className="w-full pl-9 pr-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Kelas</option>
              {uniqueClasses.map((cls) => (
                <option key={cls} value={cls}>
                  Kelas {cls}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedDormitory}
              onChange={(e) => setSelectedDormitory(e.target.value)}
              className="w-full px-3 py-2 rounded-lg text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-emerald-500"
            >
              <option value="all">Semua Asrama</option>
              {uniqueDormitories.map((dorm) => (
                <option key={dorm} value={dorm}>
                  Asrama {dorm}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        {/* Table/Card Header Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <div className="font-semibold text-slate-900 dark:text-white">
            Daftar Lengkap ({filteredList.length} Santri)
          </div>
          <div className="text-slate-500 dark:text-slate-400 tabular-nums font-mono">
            Total Perputaran: <strong className="text-slate-900 dark:text-white">{formatRupiah(totalPeriodSpent)}</strong>
          </div>
        </div>

        {filteredList.length === 0 ? (
          <div className="p-8 sm:p-12 text-center space-y-2">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              Tidak ada data transaksi santri ditemukan
            </p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              {searchQuery || selectedClass !== 'all' || selectedDormitory !== 'all'
                ? 'Coba ubah kata kunci pencarian atau sesuaikan filter kelas/asrama.'
                : period === 'realtime'
                ? 'Belum ada transaksi jajan hari ini. Data akan otomatis muncul seiring transaksi dicatat.'
                : 'Belum ada transaksi pada periode ini.'}
            </p>
            {period === 'realtime' && (
              <button
                type="button"
                onClick={() => setPeriod('7days')}
                className="mt-2 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 cursor-pointer"
              >
                Lihat 7 Hari Terakhir
              </button>
            )}
          </div>
        ) : viewMode === 'cards' ? (
          /* Mobile Card Grid View */
          <div className="p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredList.map((item) => {
              const percentOfMax = Math.min(100, Math.round((item.total_spent / maxSpent) * 100));

              return (
                <div
                  key={item.student_id}
                  onClick={() => navigate(`/santri/${item.student_id}`)}
                  className="p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer space-y-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {renderBadge(item.rank)}
                      <StudentAvatar
                        src={item.avatar_url}
                        name={item.student_name}
                        className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="min-w-0">
                        <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                          {item.student_name}
                        </p>
                        <p className="text-[11px] text-slate-400 font-mono">NIS: {item.nis}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div>
                      <span className="text-[11px] text-slate-400 block">Total Belanja</span>
                      <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                        {formatRupiah(item.total_spent)}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Frekuensi</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300 font-mono">
                        {item.transaction_count}x Transaksi
                      </span>
                    </div>
                    <div>
                      <span className="text-[11px] text-slate-400 block">Kelas / Asrama</span>
                      <span className="text-slate-600 dark:text-slate-300 truncate block">
                        {item.class_name} · {item.dormitory}
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Sisa Saldo</span>
                      <span className="font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                        {formatRupiah(item.current_balance)}
                      </span>
                    </div>
                  </div>

                  <div className="w-full h-1 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-slate-400 dark:bg-slate-500 rounded-full"
                      style={{ width: `${percentOfMax}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Desktop Table View with Clean Horizontal Scroll on Mobile */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold text-[11px] border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-3.5 w-14 text-center">Rank</th>
                  <th className="py-3 px-3.5">Santri</th>
                  <th className="py-3 px-3.5">Kelas &amp; Asrama</th>
                  <th className="py-3 px-3.5 text-right">Total Belanja</th>
                  <th className="py-3 px-3.5 text-center">Frekuensi</th>
                  <th className="py-3 px-3.5 text-right">Rata-rata</th>
                  <th className="py-3 px-3.5">Kategori Favorit</th>
                  <th className="py-3 px-3.5 text-right">Sisa Saldo</th>
                  <th className="py-3 px-3.5 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredList.map((item) => {
                  const percentOfMax = Math.min(100, Math.round((item.total_spent / maxSpent) * 100));

                  return (
                    <tr
                      key={item.student_id}
                      className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors group"
                    >
                      {/* Rank */}
                      <td className="py-3 px-3.5 text-center">
                        {renderBadge(item.rank)}
                      </td>

                      {/* Santri */}
                      <td className="py-3 px-3.5">
                        <div className="flex items-center gap-2.5">
                          <StudentAvatar
                            src={item.avatar_url}
                            name={item.student_name}
                            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                              {item.student_name}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono">NIS: {item.nis}</p>
                          </div>
                        </div>
                      </td>

                      {/* Kelas & Asrama */}
                      <td className="py-3 px-3.5">
                        <div className="text-slate-600 dark:text-slate-300">
                          <span className="font-medium">{item.class_name}</span>
                          <span className="text-[10px] text-slate-400 block truncate">{item.dormitory}</span>
                        </div>
                      </td>

                      {/* Total Belanja */}
                      <td className="py-3 px-3.5 text-right">
                        <span className="font-bold text-slate-900 dark:text-white tabular-nums font-mono">
                          {formatRupiah(item.total_spent)}
                        </span>
                        <div className="w-20 ml-auto h-1 rounded-full bg-slate-100 dark:bg-slate-800 mt-1 overflow-hidden">
                          <div
                            className="h-full bg-slate-400 dark:bg-slate-500 rounded-full"
                            style={{ width: `${percentOfMax}%` }}
                          />
                        </div>
                      </td>

                      {/* Frekuensi */}
                      <td className="py-3 px-3.5 text-center font-mono font-medium text-slate-700 dark:text-slate-300">
                        {item.transaction_count}x
                      </td>

                      {/* Rata-rata */}
                      <td className="py-3 px-3.5 text-right text-slate-600 dark:text-slate-300 tabular-nums font-mono">
                        {formatRupiah(item.average_spent_per_trx)}
                      </td>

                      {/* Kategori Favorit */}
                      <td className="py-3 px-3.5 text-slate-600 dark:text-slate-300">
                        {item.favorite_category}
                      </td>

                      {/* Sisa Saldo */}
                      <td className="py-3 px-3.5 text-right font-medium text-emerald-600 dark:text-emerald-400 tabular-nums font-mono">
                        {formatRupiah(item.current_balance)}
                      </td>

                      {/* Aksi */}
                      <td className="py-3 px-3.5 text-center">
                        <button
                          onClick={() => navigate(`/santri/${item.student_id}`)}
                          className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
                          title="Lihat profil santri"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
