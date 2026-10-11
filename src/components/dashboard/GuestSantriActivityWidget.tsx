import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { formatRupiah, formatDateTime } from '../../utils/formatters';
import {
  User,
  ShoppingBag,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Building2,
  Wallet,
  QrCode,
  GraduationCap,
  Home,
  UserCheck,
  CalendarDays,
  ArrowDownCircle,
} from 'lucide-react';
import { StudentAvatar } from '../common/StudentAvatar';
import { SantriQRModal } from '../santri/SantriQRModal';
import waliSantriAvatar from '../../assets/images/wali_santri_avatar_habibi_1790235608369.jpg';

function formatProperName(name: string) {
  if (!name) return '';
  return name
    .split(' ')
    .map((word) => {
      if (!word) return '';
      if (['smp', 'sma', 'sd', 'mts', 'ma', 'snt', 'nis'].includes(word.toLowerCase())) {
        return word.toUpperCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

export const GuestSantriActivityWidget: React.FC = () => {
  const { students, transactions, topups, settings, uiStyle } = useApp();
  const { user } = useAuth();
  const isNeo = uiStyle === 'neo-brutalism';
  const [activeTab, setActiveTab] = useState<'all' | 'jajan' | 'topup'>('all');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);

  const minBalanceAlert = settings.min_balance_alert || 10000;

  // The student strictly belonging to the logged-in Wali Santri
  const myChild = useMemo(() => {
    if (!students || students.length === 0) return null;

    if (user?.santri_id) {
      const matchById = students.find((s) => s.id === user.santri_id);
      if (matchById) return matchById;
    }

    if (user?.santri_nis) {
      const cleanedNis = user.santri_nis.toLowerCase().trim();
      const matchByNis = students.find((s) => s.nis.toLowerCase().trim() === cleanedNis);
      if (matchByNis) return matchByNis;
    }

    if (user?.santri_name) {
      const cleanedName = user.santri_name.toLowerCase().trim();
      const matchByName = students.find((s) => s.name.toLowerCase().trim() === cleanedName);
      if (matchByName) return matchByName;
    }

    return null;
  }, [students, user]);

  // Statistics for this specific child ONLY
  const studentStats = useMemo(() => {
    if (!myChild) return null;

    const now = new Date();
    const todayStr = now.toISOString().slice(0, 10);
    const thisMonthStr = now.toISOString().slice(0, 7);
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);

    const childTransactions = (transactions || []).filter(
      (t) => t.student_id === myChild.id
    );
    const childTopups = (topups || []).filter(
      (tp) => tp.student_id === myChild.id
    );

    const todaySpent = childTransactions
      .filter((t) => t.created_at.slice(0, 10) === todayStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const weekSpent = childTransactions
      .filter((t) => {
        const d = new Date(t.created_at);
        return !isNaN(d.getTime()) && d >= sevenDaysAgo;
      })
      .reduce((sum, t) => sum + t.amount, 0);

    const thisMonthSpent = childTransactions
      .filter((t) => t.created_at.slice(0, 7) === thisMonthStr)
      .reduce((sum, t) => sum + t.amount, 0);

    const totalTopUp = childTopups.reduce((sum, tp) => sum + tp.amount, 0);

    return {
      totalSpentAll: childTransactions.reduce((sum, t) => sum + t.amount, 0),
      todaySpent,
      weekSpent,
      thisMonthSpent,
      totalTopUp,
      transactionCount: childTransactions.length,
      topUpCount: childTopups.length,
    };
  }, [myChild, transactions, topups]);

  // Combined timeline of transactions & topups for this child only
  const childTimeline = useMemo(() => {
    if (!myChild) return [];

    const items: Array<{
      id: string;
      type: 'jajan' | 'topup';
      code: string;
      amount: number;
      label: string;
      notes?: string;
      created_at: string;
    }> = [];

    if (activeTab === 'all' || activeTab === 'jajan') {
      (transactions || [])
        .filter((t) => t.student_id === myChild.id)
        .forEach((t) => {
          items.push({
            id: t.id,
            type: 'jajan',
            code: t.transaction_code,
            amount: t.amount,
            label: t.category,
            notes: t.notes,
            created_at: t.created_at,
          });
        });
    }

    if (activeTab === 'all' || activeTab === 'topup') {
      (topups || [])
        .filter((tp) => tp.student_id === myChild.id)
        .forEach((tp) => {
          items.push({
            id: tp.id,
            type: 'topup',
            code: tp.topup_code,
            amount: tp.amount,
            label: tp.payment_method || 'Isi Saldo',
            notes: tp.notes,
            created_at: tp.created_at,
          });
        });
    }

    return items.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [myChild, transactions, topups, activeTab]);

  if (!myChild) {
    return (
      <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <AlertCircle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h3 className="text-base font-bold text-slate-800 dark:text-white">
          Data Santri Tidak Ditemukan
        </h3>
        <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
          Silakan logout dan masuk kembali dengan memilih santri yang valid agar data ananda dapat ditampilkan secara otomatis.
        </p>
      </div>
    );
  }

  const isLowBalance = myChild.balance <= minBalanceAlert && myChild.balance >= 0;
  const isDebt = myChild.balance < 0;

  const properChildName = formatProperName(myChild.name);

  return (
    <>
      <div
        className={`bg-white dark:bg-slate-900 rounded-3xl border ${
          isNeo
            ? 'border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
            : 'border-slate-200/90 dark:border-slate-800 shadow-sm'
        } p-4 sm:p-7 overflow-hidden`}
      >
        {/* Top Header Portal Badge */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                Aktivitas Jajan &amp; Tabungan Ananda
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Portal Khusus Wali Santri: Memantau sisa uang saku, riwayat jajan, dan setoran saldo ananda <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{properChildName}</strong>.
            </p>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            <img
              src={waliSantriAvatar}
              alt="Wali Santri"
              className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-500/40 shadow-xs shrink-0"
            />
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold inline-flex items-center gap-1.5 border border-emerald-300 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Portal Privat Santri
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* PROFILE BANNER ANANDA (Clean, Structured & Beautiful Buttons) */}
        {/* ============================================================== */}
        <div className="mt-5 space-y-5">
          <div
            className={`p-4 sm:p-6 rounded-3xl border ${
              isNeo
                ? 'border-3 border-black bg-yellow-50 dark:bg-slate-800 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
                : 'border-emerald-200/80 dark:border-emerald-900/40 bg-gradient-to-br from-emerald-50/70 via-white to-slate-50 dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-950 shadow-md relative overflow-hidden'
            }`}
          >
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/5 dark:bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Profile Identity Top Row */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-5 relative z-10">
              {/* Avatar with Status Pin */}
              <div className="relative shrink-0 self-start sm:self-center">
                <StudentAvatar
                  src={myChild.avatar_url}
                  name={myChild.name}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover ring-4 ring-emerald-500/30 shadow-md shrink-0"
                />
                <span
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-900 flex items-center justify-center text-white text-xs font-black shadow-xs"
                  title="Santri Aktif"
                >
                  ✓
                </span>
              </div>

              {/* Profile Details Column */}
              <div className="min-w-0 flex-1 space-y-2">
                {/* Status Badges */}
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-black uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    {myChild.status || 'Santri Aktif'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono text-[10px] font-bold border border-slate-200 dark:border-slate-700">
                    NIS: {myChild.nis}
                  </span>
                </div>

                {/* Name */}
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-tight leading-snug">
                  {properChildName}
                </h3>

                {/* Structured Metadata Chips */}
                <div className="flex items-center gap-2 flex-wrap pt-0.5 text-xs">
                  {/* Kelas */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200/80 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{myChild.class_name || 'Santri Aktif'}</span>
                  </span>

                  {/* Asrama */}
                  {myChild.dormitory && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-indigo-800 dark:text-indigo-300 font-bold">
                      <Home className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                      <span>Asrama: {myChild.dormitory}</span>
                    </span>
                  )}

                  {/* Wali Santri */}
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-900 dark:text-amber-200 font-semibold">
                    <UserCheck className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <span>
                      Wali: <strong>{user?.parent_name || myChild.parent_name || 'Wali Santri'}</strong>
                      {myChild.parent_phone && (
                        <span className="font-mono text-[11px] opacity-80"> ({myChild.parent_phone})</span>
                      )}
                    </span>
                  </span>
                </div>
              </div>
            </div>

            {/* ============================================================== */}
            {/* STATUS SALDO & COLORFUL ACTION BUTTONS BAR */}
            {/* ============================================================== */}
            <div className="mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3.5 relative z-10">
              {/* Status Saldo Badge */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 shrink-0">
                  Status Saldo:
                </span>
                <span
                  className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black shadow-xs ${
                    isDebt
                      ? 'bg-rose-500 text-white shadow-rose-500/25'
                      : isLowBalance
                      ? 'bg-amber-500 text-white shadow-amber-500/25'
                      : 'bg-emerald-500 text-white shadow-emerald-500/25'
                  }`}
                >
                  {isDebt ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> Saldo Minus / Berhutang
                    </>
                  ) : isLowBalance ? (
                    <>
                      <AlertCircle className="w-3.5 h-3.5" /> Saldo Kritis (Hampir Habis)
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-3.5 h-3.5" /> Saldo Aman &amp; Lancar
                    </>
                  )}
                </span>
              </div>

              {/* Action Button: Kartu Digital QR */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => setIsQrModalOpen(true)}
                  className="px-3.5 py-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-md shadow-blue-600/30 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Lihat dan cetak kartu digital QR Code santri"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Kartu QR</span>
                </button>
              </div>
            </div>

            {/* ============================================================== */}
            {/* 4 STATS CARDS (Vibrant Themed Colors & Distinctive Icons) */}
            {/* ============================================================== */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-5 pt-4 border-t border-slate-200/80 dark:border-slate-800">
              {/* Stat 1: Sisa Saldo Tabungan (Emerald Theme) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-white to-white dark:from-emerald-950/40 dark:via-slate-800/80 dark:to-slate-800/80 border-2 border-emerald-500/30 dark:border-emerald-500/40 shadow-xs relative overflow-hidden group hover:border-emerald-500/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Sisa Saldo Tabungan
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-emerald-500 text-white flex items-center justify-center shadow-xs">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div
                  className={`text-xl sm:text-2xl font-black font-mono tracking-tight ${
                    isDebt
                      ? 'text-rose-600 dark:text-rose-400'
                      : isLowBalance
                      ? 'text-amber-600 dark:text-amber-400'
                      : 'text-emerald-600 dark:text-emerald-400'
                  }`}
                >
                  {formatRupiah(myChild.balance)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Uang saku aktif ananda</p>
              </div>

              {/* Stat 2: Jajan Hari Ini (Amber / Orange Theme) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-white to-white dark:from-amber-950/40 dark:via-slate-800/80 dark:to-slate-800/80 border-2 border-amber-500/30 dark:border-amber-500/40 shadow-xs relative overflow-hidden group hover:border-amber-500/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Jajan Hari Ini
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
                    <ShoppingBag className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
                  {formatRupiah(studentStats?.todaySpent || 0)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Pengeluaran hari ini</p>
              </div>

              {/* Stat 3: Jajan Minggu Ini (Sky Blue Theme) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-500/10 via-white to-white dark:from-sky-950/40 dark:via-slate-800/80 dark:to-slate-800/80 border-2 border-sky-500/30 dark:border-sky-500/40 shadow-xs relative overflow-hidden group hover:border-sky-500/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Jajan Minggu Ini
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-sky-500 text-white flex items-center justify-center shadow-xs">
                    <CalendarDays className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-sky-600 dark:text-sky-400">
                  {formatRupiah(studentStats?.weekSpent || 0)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Total 7 hari terakhir</p>
              </div>

              {/* Stat 4: Total Top-Up Masuk (Indigo Theme) */}
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500/10 via-white to-white dark:from-indigo-950/40 dark:via-slate-800/80 dark:to-slate-800/80 border-2 border-indigo-500/30 dark:border-indigo-500/40 shadow-xs relative overflow-hidden group hover:border-indigo-500/60 transition-all">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Top-Up Masuk
                  </span>
                  <div className="w-7 h-7 rounded-xl bg-indigo-500 text-white flex items-center justify-center shadow-xs">
                    <ArrowDownCircle className="w-3.5 h-3.5" />
                  </div>
                </div>
                <div className="text-xl sm:text-2xl font-black font-mono tracking-tight text-indigo-600 dark:text-indigo-400">
                  {formatRupiah(studentStats?.totalTopUp || 0)}
                </div>
                <p className="text-[10px] text-slate-400 mt-1">Akumulasi setoran masuk</p>
              </div>
            </div>
          </div>

          {/* ============================================================== */}
          {/* TIMELINE HISTORI TRANSAKSI DENGAN TAB BERWARNA */}
          {/* ============================================================== */}
          <div className="space-y-3 pt-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-600" />
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                  Histori Transaksi Jajan &amp; Tabungan Ananda
                </h4>
              </div>

              {/* Filter Tabs dengan Warna Khusus saat Aktif */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'all'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Semua ({childTimeline.length})
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('jajan')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'jajan'
                      ? 'bg-rose-600 text-white shadow-md shadow-rose-600/25'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Jajan
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('topup')}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                    activeTab === 'topup'
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  Top-Up
                </button>
              </div>
            </div>

            {/* List Items */}
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {childTimeline.length > 0 ? (
                childTimeline.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3 hover:bg-slate-100/80 dark:hover:bg-slate-800 transition-colors"
                  >
                    <div className="flex items-center gap-3.5 min-w-0">
                      <div
                        className={`p-2.5 rounded-xl shrink-0 ${
                          item.type === 'topup'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {item.type === 'topup' ? (
                          <ArrowDownRight className="w-4 h-4" />
                        ) : (
                          <ArrowUpRight className="w-4 h-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
                            {item.type === 'topup' ? 'Isi Saldo' : item.label}
                          </span>
                          <span className="font-mono text-[10px] text-slate-400">
                            {item.code}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          {formatDateTime(item.created_at)}
                          {item.notes ? ` • ${item.notes}` : ''}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span
                        className={`font-black text-xs sm:text-base font-mono ${
                          item.type === 'topup'
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {item.type === 'topup' ? '+' : '-'}
                        {formatRupiah(item.amount)}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <ShoppingBag className="w-8 h-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                    Belum ada catatan transaksi untuk kategori ini.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODAL KARTU DIGITAL QR CODE SANTRI */}
      {/* ============================================================== */}
      <SantriQRModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        student={myChild}
      />
    </>
  );
};
