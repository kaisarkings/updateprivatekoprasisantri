import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { storageService, subscribeToRealtimeLogs } from '../services/storageService';
import { ActivityLog } from '../types';
import { formatDateTime } from '../utils/formatters';
import { formatRelativeTime } from '../utils/deviceUtils';
import { Modal } from '../components/common/Modal';
import waliSantriAvatar from '../assets/images/wali_santri_avatar_habibi_1790235608369.jpg';
import defaultSantriAvatar from '../assets/images/login_santri_avatar_1785105854262.jpg';
import {
  Activity,
  Users,
  Search,
  RefreshCw,
  Trash2,
  Download,
  Calendar,
  Clock,
  Laptop,
  Smartphone,
  MessageCircle,
  HeartHandshake,
  GraduationCap,
  Eye,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Shield,
  CheckCircle2,
  ExternalLink,
  Copy,
  Info,
} from 'lucide-react';

export const ActivityLogPage: React.FC = () => {
  const { uiStyle, showToast } = useApp();
  const { user: currentUser } = useAuth();
  const isNeo = uiStyle === 'neo-brutalism';

  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'guest' | 'admin' | 'transaksi'>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 15;

  const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await storageService.getLogs();
      setLogs(data || []);
    } catch (e: any) {
      console.error('Error fetching logs:', e);
      showToast('error', 'Gagal Memuat Log', 'Tidak dapat memuat log aktivitas.');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    // Immediate cached logs
    const cached = storageService.getCachedLogs();
    if (cached.length > 0) {
      setLogs(cached);
      setIsLoading(false);
    } else {
      fetchLogs();
    }

    // Real-time Firestore onSnapshot & cross-tab sync
    const unsub = subscribeToRealtimeLogs((updatedLogs, latestNewLog) => {
      setLogs(updatedLogs || []);
      setIsLoading(false);
      if (latestNewLog) {
        showToast('info', 'Aktivitas Baru Terdeteksi', `${latestNewLog.user_name} (${latestNewLog.action})`);
      }
    });

    return () => unsub();
  }, [fetchLogs, showToast]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, categoryFilter, timeFilter]);

  // Statistics calculation
  const stats = useMemo(() => {
    const total = logs.length;
    const now = new Date();
    const todayYMD = now.toISOString().slice(0, 10);

    const guestLogs = logs.filter(
      (l) =>
        l.role === 'guest' ||
        l.role === 'viewer' ||
        (l.action && l.action.toLowerCase().includes('tamu')) ||
        (l.action && l.action.toLowerCase().includes('wali')) ||
        Boolean(l.santri_name)
    );

    const todayLogs = logs.filter((l) => l.created_at && l.created_at.slice(0, 10) === todayYMD);

    const adminLogs = logs.filter(
      (l) => l.role === 'admin' || l.role === 'administrator' || (l.action && l.action.toLowerCase().includes('admin'))
    );

    const lastGuest = guestLogs.length > 0 ? guestLogs[0] : null;

    return {
      total,
      guestCount: guestLogs.length,
      todayCount: todayLogs.length,
      adminCount: adminLogs.length,
      lastGuest,
    };
  }, [logs]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    const q = searchTerm.toLowerCase().trim();
    const now = new Date();
    const todayYMD = now.toISOString().slice(0, 10);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return logs.filter((item) => {
      // Category Filter
      if (categoryFilter === 'guest') {
        const isGuest =
          item.role === 'guest' ||
          item.role === 'viewer' ||
          (item.action && item.action.toLowerCase().includes('tamu')) ||
          (item.action && item.action.toLowerCase().includes('wali')) ||
          Boolean(item.santri_name);
        if (!isGuest) return false;
      } else if (categoryFilter === 'admin') {
        const isAdmin =
          item.role === 'admin' ||
          item.role === 'administrator' ||
          (item.action && item.action.toLowerCase().includes('admin'));
        if (!isAdmin) return false;
      } else if (categoryFilter === 'transaksi') {
        const isTrx =
          (item.action && item.action.toLowerCase().includes('saldo')) ||
          (item.action && item.action.toLowerCase().includes('jajan')) ||
          (item.action && item.action.toLowerCase().includes('santri'));
        if (!isTrx) return false;
      }

      // Time Filter
      if (timeFilter === 'today') {
        if (!item.created_at || item.created_at.slice(0, 10) !== todayYMD) return false;
      } else if (timeFilter === 'week') {
        const d = new Date(item.created_at);
        if (isNaN(d.getTime()) || d < sevenDaysAgo) return false;
      } else if (timeFilter === 'month') {
        const d = new Date(item.created_at);
        if (isNaN(d.getTime()) || d < startOfMonth) return false;
      }

      // Search Filter
      if (!q) return true;
      const userName = (item.user_name || '').toLowerCase();
      const action = (item.action || '').toLowerCase();
      const details = (item.details || '').toLowerCase();
      const santriName = (item.santri_name || '').toLowerCase();
      const santriNis = (item.santri_nis || '').toLowerCase();
      const phone = (item.phone || '').toLowerCase();
      const device = (item.device || '').toLowerCase();

      return (
        userName.includes(q) ||
        action.includes(q) ||
        details.includes(q) ||
        santriName.includes(q) ||
        santriNis.includes(q) ||
        phone.includes(q) ||
        device.includes(q)
      );
    });
  }, [logs, searchTerm, categoryFilter, timeFilter]);

  // Pagination calculation
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  // Export to CSV
  const handleExportCSV = () => {
    if (filteredLogs.length === 0) {
      showToast('warning', 'Tidak Ada Data', 'Tidak ada log aktivitas untuk diekspor.');
      return;
    }

    const headers = [
      'ID',
      'Waktu',
      'Nama Pengguna / Wali',
      'Peran (Role)',
      'Aktivitas',
      'Wali dari Santri',
      'Hubungan',
      'No. WhatsApp',
      'Perangkat / Browser',
      'Rincian / Keperluan',
    ];

    const rows = filteredLogs.map((l) => [
      `"${l.id || ''}"`,
      `"${formatDateTime(l.created_at)}"`,
      `"${l.user_name || ''}"`,
      `"${l.role || '-'}"`,
      `"${l.action || ''}"`,
      `"${l.santri_name || '-'}"`,
      `"${l.relationship || '-'}"`,
      `"${l.phone || '-'}"`,
      `"${l.device || '-'}"`,
      `"${(l.details || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `buku_tamu_log_aktivitas_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('success', 'Ekspor Berhasil', 'File CSV Log Aktivitas & Buku Tamu berhasil diunduh.');
  };

  // Clear all logs
  const handleClearLogs = async () => {
    setIsClearing(true);
    try {
      await storageService.clearLogs();
      setLogs([]);
      showToast('success', 'Log Dibersihkan', 'Seluruh catatan riwayat log aktivitas telah dihapus.');
      setIsClearModalOpen(false);
    } catch (e: any) {
      showToast('error', 'Gagal', 'Terjadi kesalahan saat membersihkan log.');
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <div className={`space-y-6 pb-12 w-full animate-in fade-in slide-in-from-bottom-3 duration-300 ${isNeo ? 'font-mono' : ''}`}>
      {/* Page Header */}
      <div
        className={`p-5 sm:p-6 rounded-2xl sm:rounded-3xl border transition-all ${
          isNeo
            ? 'bg-yellow-300 border-3 sm:border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`p-3 rounded-2xl flex items-center justify-center shrink-0 ${
                isNeo
                  ? 'bg-black text-lime-400 border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
              }`}
            >
              <Activity className="w-6 h-6 sm:w-7 sm:h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                  Log Aktivitas & Tamu
                </h1>
                <span
                  className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase ${
                    isNeo
                      ? 'bg-pink-400 text-black border-2 border-black'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Catatan rekam jejak kehadiran wali santri, aktivitas kasir & admin, serta jejak audit sistem
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={fetchLogs}
              disabled={isLoading}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isNeo
                  ? 'bg-white hover:bg-slate-100 border-2 sm:border-3 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white'
              }`}
              title="Segarkan data log"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>

            <button
              onClick={handleExportCSV}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                isNeo
                  ? 'bg-cyan-300 hover:bg-cyan-200 border-2 sm:border-3 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5'
                  : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
              }`}
              title="Unduh format spreadsheet CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Ekspor CSV</span>
            </button>

            {(currentUser?.role === 'admin' || currentUser?.role === 'administrator') && (
              <button
                onClick={() => setIsClearModalOpen(true)}
                className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isNeo
                    ? 'bg-rose-400 hover:bg-rose-300 border-2 sm:border-3 border-black text-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-y-0.5'
                    : 'bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                }`}
                title="Hapus riwayat log aktivitas"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Bersihkan</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Top 4 Metric Cards - Mobile 2-cols, Desktop 4-cols */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Total Log */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isNeo
              ? 'bg-white border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-slate-500 uppercase">Total Log</span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
            {stats.total}
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Seluruh aktivitas sistem</p>
        </div>

        {/* Card 2: Kunjungan Wali Santri */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isNeo
              ? 'bg-lime-300 border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-200/70 dark:border-emerald-800/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-emerald-900 dark:text-emerald-300 uppercase">
              Buku Tamu Wali
            </span>
            <div className="p-1.5 rounded-lg bg-emerald-600 text-white shadow-xs">
              <HeartHandshake className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-900 dark:text-emerald-200">
            {stats.guestCount}
          </div>
          <p className="text-[10px] text-emerald-800/80 dark:text-emerald-300/80 mt-0.5 font-semibold">
            Wali santri masuk
          </p>
        </div>

        {/* Card 3: Login Hari Ini */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isNeo
              ? 'bg-cyan-300 border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-indigo-50/70 dark:bg-indigo-950/30 border-indigo-200/70 dark:border-indigo-800/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-indigo-900 dark:text-indigo-300 uppercase">
              Hari Ini
            </span>
            <div className="p-1.5 rounded-lg bg-indigo-600 text-white shadow-xs">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-black text-indigo-900 dark:text-indigo-200">
            {stats.todayCount}
          </div>
          <p className="text-[10px] text-indigo-800/80 dark:text-indigo-300/80 mt-0.5 font-semibold">
            Sesi tercatat hari ini
          </p>
        </div>

        {/* Card 4: Tamu Terakhir */}
        <div
          className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
            isNeo
              ? 'bg-pink-300 border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-purple-50/70 dark:bg-purple-950/30 border-purple-200/70 dark:border-purple-800/40 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] font-bold text-purple-900 dark:text-purple-300 uppercase">
              Tamu Terakhir
            </span>
            <div className="p-1.5 rounded-lg bg-purple-600 text-white shadow-xs">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xs sm:text-sm font-black text-purple-950 dark:text-purple-100 truncate">
            {stats.lastGuest ? stats.lastGuest.user_name : 'Belum Ada'}
          </div>
          <p className="text-[10px] text-purple-800 dark:text-purple-300 mt-0.5 truncate">
            {stats.lastGuest ? formatRelativeTime(stats.lastGuest.created_at) : 'Menunggu kunjungan'}
          </p>
        </div>
      </div>

      {/* Filter, Search & Tabs */}
      <div
        className={`p-4 rounded-2xl border transition-all space-y-3 ${
          isNeo
            ? 'bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
            : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
        }`}
      >
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Cari wali santri, nama santri, NIS, atau aktivitas..."
              className={`w-full pl-9 pr-8 py-2.5 text-xs font-bold rounded-xl transition-all ${
                isNeo
                  ? 'bg-slate-50 border-2 border-black focus:outline-none focus:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500'
              }`}
            />
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 pointer-events-none" />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 font-bold p-1 cursor-pointer"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}
          </div>

          {/* Time Filter & View Toggle */}
          <div className="flex items-center gap-2 justify-between md:justify-end">
            <div className="flex items-center gap-1.5 text-xs flex-1 sm:flex-initial">
              <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as any)}
                className={`w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isNeo
                    ? 'border-2 border-black bg-yellow-200'
                    : 'bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                <option value="all">Semua Waktu</option>
                <option value="today">Hari Ini Saja</option>
                <option value="week">7 Hari Terakhir</option>
                <option value="month">Bulan Ini</option>
              </select>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden text-xs shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 font-bold transition-colors cursor-pointer ${
                  viewMode === 'card'
                    ? isNeo
                      ? 'bg-black text-white'
                      : 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Kartu
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`px-3 py-2 font-bold transition-colors cursor-pointer ${
                  viewMode === 'table'
                    ? isNeo
                      ? 'bg-black text-white'
                      : 'bg-emerald-600 text-white'
                    : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
                }`}
              >
                Tabel
              </button>
            </div>
          </div>
        </div>

        {/* Category Tabs - Scrollable on mobile */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setCategoryFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 cursor-pointer ${
              categoryFilter === 'all'
                ? isNeo
                  ? 'bg-black text-white border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-emerald-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            Semua ({logs.length})
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('guest')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              categoryFilter === 'guest'
                ? isNeo
                  ? 'bg-lime-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-100'
            }`}
          >
            <span>🤝 Buku Tamu Wali</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
              {stats.guestCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('admin')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              categoryFilter === 'admin'
                ? isNeo
                  ? 'bg-purple-400 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-purple-600 text-white shadow-xs'
                : 'bg-purple-50 dark:bg-purple-950/40 text-purple-800 dark:text-purple-300 hover:bg-purple-100'
            }`}
          >
            <span>🛡️ Admin & Kasir</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-black/10 dark:bg-white/20">
              {stats.adminCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setCategoryFilter('transaksi')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all shrink-0 flex items-center gap-1.5 cursor-pointer ${
              categoryFilter === 'transaksi'
                ? isNeo
                  ? 'bg-cyan-300 text-black border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]'
                  : 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 dark:bg-blue-950/40 text-blue-800 dark:text-blue-300 hover:bg-blue-100'
            }`}
          >
            <span>💳 Transaksi Santri</span>
          </button>
        </div>
      </div>

      {/* Main Log List / Table */}
      {isLoading ? (
        <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
          <div className="w-10 h-10 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-bold text-slate-500">Menyelaraskan log aktivitas real-time...</p>
        </div>
      ) : filteredLogs.length === 0 ? (
        <div
          className={`p-8 sm:p-12 text-center rounded-3xl border ${
            isNeo
              ? 'bg-white border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800'
          }`}
        >
          <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3 text-slate-400">
            <Search className="w-7 h-7" />
          </div>
          <h3 className="text-base font-black text-slate-800 dark:text-white uppercase mb-1">
            Tidak Ada Log yang Cocok
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mb-4">
            Tidak ditemukan riwayat aktivitas sesuai kata kunci atau filter waktu yang dipilih.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setCategoryFilter('all');
              setTimeFilter('all');
            }}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            Reset Semua Filter
          </button>
        </div>
      ) : viewMode === 'card' ? (
        /* CARD VIEW - Fully Responsive for Mobile & PC */
        <div className="space-y-3">
          {paginatedLogs.map((log) => {
            const isGuest =
              log.role === 'guest' ||
              log.role === 'viewer' ||
              (log.action && log.action.toLowerCase().includes('tamu')) ||
              (log.action && log.action.toLowerCase().includes('wali')) ||
              Boolean(log.santri_name);

            const isMobileDevice =
              (log.device || '').toLowerCase().includes('mobile') ||
              (log.device || '').toLowerCase().includes('iphone') ||
              (log.device || '').toLowerCase().includes('android');

            return (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer hover:border-emerald-500/80 ${
                  isNeo
                    ? isGuest
                      ? 'bg-amber-50 border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                      : 'bg-white border-2 sm:border-3 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-0.5'
                    : isGuest
                    ? 'bg-gradient-to-r from-emerald-50/70 via-white to-white dark:from-emerald-950/20 dark:via-slate-900 dark:to-slate-900 border-emerald-300/70 dark:border-emerald-800/40 shadow-xs'
                    : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  {/* Left: Avatar & Identity */}
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <div className="relative shrink-0 mt-0.5">
                      <img
                        src={isGuest ? waliSantriAvatar : defaultSantriAvatar}
                        alt={log.user_name}
                        className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border-2 shadow-xs ${
                          isGuest
                            ? 'border-emerald-500 ring-2 ring-emerald-200 dark:ring-emerald-900'
                            : 'border-purple-500 ring-2 ring-purple-200 dark:ring-purple-900'
                        }`}
                      />
                      <span
                        className={`absolute -bottom-1 -right-1 text-[8px] font-black px-1.5 py-0.2 rounded-full border border-black ${
                          isGuest ? 'bg-lime-400 text-black' : 'bg-purple-400 text-black'
                        }`}
                      >
                        {isGuest ? 'TAMU' : 'ADMIN'}
                      </span>
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                        <span className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                          {log.user_name}
                        </span>

                        {log.relationship && (
                          <span className="text-[10px] sm:text-[11px] font-bold px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                            {log.relationship}
                          </span>
                        )}

                        <span
                          className={`text-[9px] sm:text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                            isGuest
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-300 border border-emerald-400/60'
                              : 'bg-purple-100 text-purple-800 dark:bg-purple-900/60 dark:text-purple-300 border border-purple-400/60'
                          }`}
                        >
                          {log.action}
                        </span>
                      </div>

                      {/* Santri Association Highlight */}
                      {log.santri_name && (
                        <div className="inline-flex flex-wrap items-center gap-1.5 p-1.5 px-2.5 rounded-xl bg-emerald-100/80 dark:bg-emerald-950/60 border border-emerald-400/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold mb-2">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-700 dark:text-emerald-400 shrink-0" />
                          <span>Wali dari Santri:</span>
                          <span className="font-black text-emerald-950 dark:text-white underline decoration-emerald-500">
                            {log.santri_name}
                          </span>
                          {log.santri_class && (
                            <span className="text-[11px] text-emerald-800 dark:text-emerald-300 font-semibold">
                              ({log.santri_class})
                            </span>
                          )}
                          {log.santri_nis && (
                            <span className="text-[10px] text-emerald-700 dark:text-emerald-400 font-mono">
                              NIS: {log.santri_nis}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Activity Details / Notes */}
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium line-clamp-2">
                        {log.details}
                      </p>

                      {/* Phone or WhatsApp button if exists */}
                      {log.phone && (
                        <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                          <a
                            href={`https://wa.me/${log.phone.replace(/[^0-9]/g, '')}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold shadow-xs transition-colors"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span>WhatsApp ({log.phone})</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Timestamp & Device Info */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between shrink-0 text-left sm:text-right pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800 gap-1.5">
                    <div className="flex items-center gap-1 text-xs font-black text-slate-800 dark:text-slate-200">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{formatRelativeTime(log.created_at)}</span>
                    </div>

                    <div className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {formatDateTime(log.created_at)}
                    </div>

                    {log.device && (
                      <div className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                        {isMobileDevice ? (
                          <Smartphone className="w-3 h-3 text-slate-500 shrink-0" />
                        ) : (
                          <Laptop className="w-3 h-3 text-slate-500 shrink-0" />
                        )}
                        <span className="truncate max-w-[130px] sm:max-w-[160px]">{log.device}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* TABLE VIEW - Structured & Scrollable on Mobile */
        <div
          className={`rounded-2xl border overflow-hidden ${
            isNeo
              ? 'bg-white border-2 sm:border-3 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead
                className={`border-b ${
                  isNeo
                    ? 'bg-yellow-200 border-b-3 border-black text-black font-black'
                    : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold'
                }`}
              >
                <tr>
                  <th className="py-3 px-3 sm:px-4">Waktu</th>
                  <th className="py-3 px-3 sm:px-4">Pengguna / Wali</th>
                  <th className="py-3 px-3 sm:px-4">Wali dari Santri</th>
                  <th className="py-3 px-3 sm:px-4">Aktivitas</th>
                  <th className="py-3 px-3 sm:px-4">Perangkat</th>
                  <th className="py-3 px-3 sm:px-4">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {paginatedLogs.map((l) => (
                  <tr
                    key={l.id}
                    onClick={() => setSelectedLog(l)}
                    className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                  >
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {formatRelativeTime(l.created_at)}
                      </div>
                      <div className="text-[10px] text-slate-500">{formatDateTime(l.created_at)}</div>
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      <div className="font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                        <span>{l.user_name}</span>
                        {l.relationship && (
                          <span className="text-[10px] font-semibold text-slate-500">
                            ({l.relationship})
                          </span>
                        )}
                      </div>
                      {l.phone && <div className="text-[10px] text-emerald-600 font-bold">WA: {l.phone}</div>}
                    </td>
                    <td className="py-3 px-3 sm:px-4">
                      {l.santri_name ? (
                        <div className="font-bold text-emerald-700 dark:text-emerald-300">
                          {l.santri_name}
                          {l.santri_class && (
                            <span className="text-[10px] ml-1 text-slate-500 font-normal">
                              ({l.santri_class})
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          l.role === 'guest' || l.role === 'viewer'
                            ? 'bg-lime-100 text-lime-900 border border-lime-400'
                            : 'bg-purple-100 text-purple-900 border border-purple-400'
                        }`}
                      >
                        {l.action}
                      </span>
                    </td>
                    <td className="py-3 px-3 sm:px-4 text-slate-600 dark:text-slate-400 text-[11px] whitespace-nowrap">
                      {l.device || '-'}
                    </td>
                    <td className="py-3 px-3 sm:px-4 whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(l);
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors"
                        title="Lihat Rincian"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {filteredLogs.length > 0 && (
        <div
          className={`p-3 sm:p-4 rounded-2xl border flex flex-col sm:flex-row items-center justify-between gap-3 text-xs ${
            isNeo
              ? 'bg-white border-2 border-black shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]'
              : 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 shadow-xs'
          }`}
        >
          <div className="text-slate-500 dark:text-slate-400 font-medium text-center sm:text-left">
            Menampilkan <span className="font-bold text-slate-900 dark:text-white">{(currentPage - 1) * itemsPerPage + 1}</span> -{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {Math.min(currentPage * itemsPerPage, filteredLogs.length)}
            </span>{' '}
            dari <span className="font-bold text-slate-900 dark:text-white">{filteredLogs.length}</span> log aktivitas
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
                currentPage === 1
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Sebelumnya</span>
            </button>

            <span className="px-3 py-1.5 font-bold text-slate-700 dark:text-slate-300">
              {currentPage} / {totalPages}
            </span>

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-bold transition-all ${
                currentPage === totalPages
                  ? 'opacity-40 cursor-not-allowed bg-slate-100 dark:bg-slate-800 text-slate-400'
                  : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 cursor-pointer'
              }`}
            >
              <span>Selanjutnya</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* DETAIL MODAL - Structured & Clean for Mobile and PC */}
      <Modal
        isOpen={Boolean(selectedLog)}
        onClose={() => setSelectedLog(null)}
        title="Rincian Lengkap Log Aktivitas"
      >
        {selectedLog && (
          <div className="space-y-4">
            {/* Header Identity in Modal */}
            <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
              <img
                src={
                  selectedLog.role === 'guest' || selectedLog.role === 'viewer'
                    ? waliSantriAvatar
                    : defaultSantriAvatar
                }
                alt={selectedLog.user_name}
                className="w-12 h-12 rounded-full object-cover border-2 border-emerald-500 shadow-xs"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-sm sm:text-base text-slate-900 dark:text-white">
                    {selectedLog.user_name}
                  </h3>
                  <span
                    className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${
                      selectedLog.role === 'guest' || selectedLog.role === 'viewer'
                        ? 'bg-lime-400 text-black'
                        : 'bg-purple-500 text-white'
                    }`}
                  >
                    {selectedLog.role?.toUpperCase() || 'USER'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  ID: <span className="font-mono">{selectedLog.id}</span>
                </p>
              </div>
            </div>

            {/* Structured Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Waktu & Tanggal
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {formatDateTime(selectedLog.created_at)}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ({formatRelativeTime(selectedLog.created_at)})
                </p>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Jenis Aktivitas
                </span>
                <p className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedLog.action}
                </p>
                {selectedLog.relationship && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-0.5">
                    Hubungan: {selectedLog.relationship}
                  </p>
                )}
              </div>

              {selectedLog.santri_name && (
                <div className="sm:col-span-2 p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl border border-emerald-200 dark:border-emerald-800">
                  <span className="text-[10px] font-bold uppercase text-emerald-800 dark:text-emerald-300 block mb-1">
                    Santri Terkait
                  </span>
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-black text-emerald-900 dark:text-emerald-100 text-sm">
                      {selectedLog.santri_name}
                    </span>
                    {selectedLog.santri_class && (
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                        • {selectedLog.santri_class}
                      </span>
                    )}
                    {selectedLog.santri_nis && (
                      <span className="text-xs text-emerald-700 dark:text-emerald-300 font-mono">
                        (NIS: {selectedLog.santri_nis})
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Perangkat & Sistem Operasi
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200 break-words">
                  {selectedLog.device || 'Tidak tercatat'}
                </p>
              </div>

              <div className="sm:col-span-2 p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                  Catatan Rincian
                </span>
                <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed break-words whitespace-pre-wrap">
                  {selectedLog.details || '-'}
                </p>
              </div>
            </div>

            {/* Quick Actions in Modal */}
            <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              {selectedLog.phone ? (
                <a
                  href={`https://wa.me/${selectedLog.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors shadow-xs"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Hubungi via WhatsApp</span>
                </a>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Confirmation Modal to Clear Logs */}
      <Modal
        isOpen={isClearModalOpen}
        onClose={() => setIsClearModalOpen(false)}
        title="Konfirmasi Bersihkan Log"
      >
        <div className="space-y-4">
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 rounded-2xl flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-900 dark:text-rose-200">
              <p className="font-bold mb-1">Peringatan Penghapusan Riwayat Log</p>
              <p>
                Tindakan ini akan menghapus seluruh catatan riwayat kunjungan tamu, aktivitas login, dan jejak audit sistem dari Cloud Firestore dan penyimpanan lokal. Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2">
            <button
              type="button"
              onClick={() => setIsClearModalOpen(false)}
              disabled={isClearing}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-white transition-colors cursor-pointer"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleClearLogs}
              disabled={isClearing}
              className="px-4 py-2 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-4 h-4" />
              <span>{isClearing ? 'Menghapus...' : 'Ya, Bersihkan Seluruh Log'}</span>
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
