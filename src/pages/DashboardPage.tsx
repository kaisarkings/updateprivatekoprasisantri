import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah } from '../utils/formatters';
import { StatCard } from '../components/common/StatCard';
import { QuickPOSWidget } from '../components/dashboard/QuickPOSWidget';
import { GuestSantriActivityWidget } from '../components/dashboard/GuestSantriActivityWidget';
import { TopSantriTable } from '../components/dashboard/TopSantriTable';
import { PrayerScheduleCard } from '../components/prayer/PrayerScheduleCard';
import { TransactionChart } from '../components/dashboard/TransactionChart';
import { CategoryPieChart } from '../components/dashboard/CategoryPieChart';
import { HeroCarousel } from '../components/dashboard/HeroCarousel';
import { Link } from 'react-router-dom';
import { getCardPaddingClass, getCardClass, getHeaderClass } from '../utils/themeUtils';
import {
  Users,
  Wallet,
  ShoppingCart,
  TrendingUp,
  ArrowDownRight,
  ArrowRight,
  ArrowUpRight,
  Building2,
  Clock,
  Sparkles,
  FileSpreadsheet,
  AlertTriangle,
  AlertCircle,
  ShieldAlert,
  ChevronRight,
  Zap,
} from 'lucide-react';
import { motion } from 'motion/react';
import pemandanganPondokPhoto from '../assets/images/pemandangan_pesantren_1790382933652.jpg';
import pesantrenLogo from '../assets/images/sirajuddin_logo.jpeg';

export const DashboardPage: React.FC = () => {
  const { stats, topSantri, transactions, topups, settings, students, isLoading, uiStyle } = useApp();
  const { user } = useAuth();
  
  const isGuest = user?.role === 'guest' || user?.role === 'viewer';
  const minBalanceAlert = settings.min_balance_alert || 10000;

  const debtStudents = (students || []).filter((s) => s.balance < 0);
  const warningStudents = (students || []).filter((s) => s.balance >= 0 && s.balance <= minBalanceAlert);
  const totalDebt = debtStudents.reduce((acc, s) => acc + Math.abs(s.balance), 0);

  const safeStats = stats || { total_students: 0, active_students: 0, total_balance_all: 0, today_transactions_count: 0, today_income: 0, today_expense: 0, yesterday_income: 0, yesterday_expense: 0, this_month_expense: 0, this_month_topup: 0 };
  
  const isNeo = uiStyle === 'neo-brutalism';

  // Helper for consistent local YMD
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

  // Real-time Today Metrics
  const todayTrxs = useMemo(() => {
    return (transactions || []).filter((t) => getLocalYMD(t.created_at) === todayYMD);
  }, [transactions, todayYMD]);

  const todayTopUps = useMemo(() => {
    return (topups || []).filter((tp) => getLocalYMD(tp.created_at) === todayYMD);
  }, [topups, todayYMD]);

  const todayExpense = todayTrxs.length > 0
    ? todayTrxs.reduce((sum, t) => sum + (t.amount || 0), 0)
    : (safeStats.today_expense || 0);

  const todayIncome = todayTopUps.length > 0
    ? todayTopUps.reduce((sum, tp) => sum + (tp.amount || 0), 0)
    : (safeStats.today_income || 0);

  const todayTransactionsCount = todayTrxs.length > 0
    ? todayTrxs.length
    : (safeStats.today_transactions_count || 0);

  // This Week Jajan (Last 7 Days)
  const thisWeekExpense = useMemo(() => {
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const recent = (transactions || []).filter((t) => {
      const dt = new Date(t.created_at);
      return !isNaN(dt.getTime()) && dt >= sevenDaysAgo;
    });
    if (recent.length > 0) {
      return recent.reduce((sum, t) => sum + (t.amount || 0), 0);
    }
    return todayExpense;
  }, [transactions, todayExpense, now]);

  // This Month Jajan
  const thisMonthExpense = useMemo(() => {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    const monthTrxs = (transactions || []).filter((t) => {
      const dt = new Date(t.created_at);
      return !isNaN(dt.getTime()) && dt.getFullYear() === curYear && dt.getMonth() === curMonth;
    });
    if (monthTrxs.length > 0) {
      return monthTrxs.reduce((sum, t) => sum + (t.amount || 0), 0);
    }
    return safeStats.this_month_expense || thisWeekExpense || todayExpense;
  }, [transactions, safeStats.this_month_expense, thisWeekExpense, todayExpense, now]);

  const totalStudentsCount = students && students.length > 0 ? students.length : (safeStats.total_students || 0);
  const activeStudentsCount = students && students.length > 0 
    ? students.filter((s) => s.status === 'aktif').length 
    : (safeStats.active_students || totalStudentsCount);

  const totalBalanceAll = students && students.length > 0
    ? students.reduce((sum, s) => sum + (s.balance || 0), 0)
    : (safeStats.total_balance_all || 0);

  // The child belonging to logged-in Wali Santri
  const myChild = useMemo(() => {
    if (!isGuest || !students || students.length === 0) return null;
    if (user?.santri_id) {
      const match = students.find((s) => s.id === user.santri_id);
      if (match) return match;
    }
    if (user?.santri_nis) {
      const cleanedNis = user.santri_nis.toLowerCase().trim();
      const match = students.find((s) => s.nis.toLowerCase().trim() === cleanedNis);
      if (match) return match;
    }
    if (user?.santri_name) {
      const cleanedName = user.santri_name.toLowerCase().trim();
      const match = students.find((s) => s.name.toLowerCase().trim() === cleanedName);
      if (match) return match;
    }
    return null;
  }, [isGuest, students, user]);

  // Child's specific transactions & topups
  const childTransactions = useMemo(() => {
    if (!myChild) return [];
    return (transactions || []).filter((t) => t.student_id === myChild.id);
  }, [myChild, transactions]);

  const childTopups = useMemo(() => {
    if (!myChild) return [];
    return (topups || []).filter((tp) => tp.student_id === myChild.id);
  }, [myChild, topups]);

  const childTodayTrxs = useMemo(() => {
    return childTransactions.filter((t) => getLocalYMD(t.created_at) === todayYMD);
  }, [childTransactions, todayYMD]);

  const childTodayExpense = childTodayTrxs.reduce((sum, t) => sum + (t.amount || 0), 0);
  const childTotalTopup = childTopups.reduce((sum, tp) => sum + (tp.amount || 0), 0);

  const childWeekExpense = useMemo(() => {
    const sevenDaysAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    return childTransactions
      .filter((t) => {
        const dt = new Date(t.created_at);
        return !isNaN(dt.getTime()) && dt >= sevenDaysAgo;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [childTransactions, now]);

  const childMonthExpense = useMemo(() => {
    const curYear = now.getFullYear();
    const curMonth = now.getMonth();
    return childTransactions
      .filter((t) => {
        const dt = new Date(t.created_at);
        return !isNaN(dt.getTime()) && dt.getFullYear() === curYear && dt.getMonth() === curMonth;
      })
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [childTransactions, now]);

  return (
    <div className={`space-y-6 pb-8 ${isNeo ? 'font-mono' : ''}`}>
      
      {/* HERO SECTION */}
      {isNeo ? (
        <div className="relative w-full rounded-3xl overflow-hidden border-2 border-amber-500/40 bg-gradient-to-br from-[#064e3b] via-[#043428] to-[#021f18] shadow-2xl p-6 sm:p-9 z-10 transition-all">
          {/* Subtle Islamic Arabesque Geometric Background Motif */}
          <div 
            className="absolute inset-0 opacity-15 pointer-events-none" 
            style={{ 
              backgroundImage: 'radial-gradient(circle at 2px 2px, #f59e0b 1px, transparent 0)', 
              backgroundSize: '24px 24px' 
            }}
          />
          <div className="absolute -top-16 -right-16 w-56 h-56 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-16 -left-16 w-56 h-56 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 flex flex-col sm:flex-row gap-6 sm:gap-8 items-center justify-between">
            <div className="max-w-xl text-center sm:text-left">
              {/* Islamic Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-emerald-950/90 border border-amber-400/50 text-amber-300 font-semibold rounded-full text-xs sm:text-sm mb-3.5 shadow-sm">
                <span className="font-serif">بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ</span>
                <span className="text-amber-400/50">·</span>
                <span>{isGuest ? 'Portal Amanah Wali Santri' : 'Sistem Keuangan Syariah'}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight mb-2.5">
                {isGuest ? 'PANTAU JAJAN & SALDO SANTRI' : 'TOP-UP & KASIR KOPERASI'}
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base font-medium text-emerald-100/90 mb-5 leading-relaxed">
                {isGuest 
                  ? 'Transparan, Barokah, dan Amanah dalam Memantau Keuangan Ananda.' 
                  : 'Layanan Keuangan Koperasi Pesantren Cepat, Aman, dan Akuntabel.'}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 justify-center sm:justify-start">
                {!isGuest ? (
                  <>
                    <Link 
                      to="/topup" 
                      className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                      <Wallet className="w-4 h-4" />
                      Isi Saldo Santri
                    </Link>
                    <Link 
                      to="/kasir" 
                      className="px-5 py-2.5 bg-emerald-700/80 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm rounded-xl border border-emerald-500/40 shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Kasir Transaksi (POS)
                    </Link>
                  </>
                ) : (
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-950/80 border border-emerald-700/60 rounded-xl text-emerald-200 text-xs sm:text-sm font-medium">
                    <Building2 className="w-4 h-4 text-amber-400" />
                    <span>{settings.pesantren_name || 'Pondok Pesantren Darul Mukhlasin'}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Islamic Photo Frame */}
            <div className="shrink-0 relative">
              <div className="w-44 h-36 sm:w-52 sm:h-40 lg:w-60 lg:h-44 rounded-2xl bg-gradient-to-br from-emerald-950 to-slate-950 border-2 border-amber-400/50 shadow-2xl p-1 relative z-10 overflow-hidden ring-4 ring-amber-400/20">
                <img 
                  src={pemandanganPondokPhoto} 
                  alt="Pemandangan Asri Kompleks Pondok Pesantren" 
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.src = settings.login_image_url || pesantrenLogo;
                  }}
                  className="w-full h-full object-cover rounded-xl shadow-inner transition-transform duration-500 hover:scale-105" 
                />
              </div>

              {/* Islamic Value Ribbon */}
              <div className="absolute -bottom-2 -right-2 px-3 py-1 bg-amber-500 text-slate-950 font-bold rounded-lg shadow-md border border-amber-300 text-xs z-20 flex items-center gap-1">
                <span>Pemandangan Pondok 🍃</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <HeroCarousel />
      )}

      {/* Prayer Schedule */}
      <div className="mb-6">
        <PrayerScheduleCard />
      </div>

      {/* Debt & Low Balance Alert Notice (If Any) */}
      {!isGuest && (debtStudents.length > 0 || warningStudents.length > 0) && (
        <div className={isNeo 
          ? "p-4 bg-orange-400 border-[4px] border-black rounded-xl shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 animate-pulse"
          : "p-4 rounded-2xl bg-gradient-to-r from-rose-50 via-amber-50 to-rose-50 dark:from-rose-950/40 dark:via-amber-950/30 dark:to-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
        }>
          <div className="flex items-start gap-3">
            <div className={isNeo ? "p-2 bg-red-600 border-[3px] border-black text-white shrink-0 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]" : "p-2 rounded-xl bg-rose-600 text-white shrink-0 mt-0.5 animate-pulse"}>
              <ShieldAlert className={isNeo ? "w-6 h-6" : "w-5 h-5"} />
            </div>
            <div>
              <h4 className={isNeo ? "font-black text-lg text-black uppercase tracking-tight" : "font-extrabold text-sm text-slate-900 dark:text-white flex items-center gap-2"}>
                Warning: Monitoring Saldo
              </h4>
              <p className={isNeo ? "text-sm font-bold text-black mt-1" : "text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1"}>
                Terdapat {debtStudents.length} santri berhutang (total {formatRupiah(totalDebt)}) dan {warningStudents.length} santri saldo kritis / hampir habis.
              </p>
            </div>
          </div>
          <Link
            to="/santri"
            className={isNeo 
              ? "shrink-0 px-4 py-2 bg-white border-[3px] border-black text-black font-black text-sm uppercase flex items-center gap-1.5 hover:bg-slate-100 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] transition-all"
              : "shrink-0 px-4 py-2 rounded-xl bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-sm hover:shadow-md transition-all flex items-center gap-1.5 border border-slate-200 dark:border-slate-700"
            }
          >
            Lihat Data
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}

      {/* Quick Operational Action Bar with vibrant gradients and motion */}
      {!isGuest && (
        <div className="p-3.5 sm:p-4 rounded-3xl bg-slate-900/90 dark:bg-slate-900/90 border border-slate-800/90 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500 shadow-[0_0_10px_#10b981]"></span>
            </span>
            <span className="text-sm font-extrabold text-white tracking-wide flex items-center gap-2">
              <span>Aksi Cepat Operasional:</span>
              <span className="hidden sm:inline-block text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Live POS
              </span>
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/kasir"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-emerald-500/25 transition-all cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Kasir POS (Jajan)</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/topup"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-blue-500/25 transition-all cursor-pointer"
              >
                <Wallet className="w-4 h-4" />
                <span>Isi Saldo Santri</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/santri"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-400 hover:to-pink-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-purple-500/25 transition-all cursor-pointer"
              >
                <Users className="w-4 h-4" />
                <span>Data Santri</span>
              </Link>
            </motion.div>
            <motion.div whileHover={{ y: -2, scale: 1.02 }} whileTap={{ scale: 0.97 }}>
              <Link
                to="/laporan"
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-amber-500/25 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>Cetak Laporan</span>
              </Link>
            </motion.div>
          </div>
        </div>
      )}

      {/* 6 Stat Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
        {isGuest && myChild ? (
          <>
            <StatCard
              title="SALDO TABUNGAN ANANDA"
              value={formatRupiah(myChild.balance)}
              subtitle={`Uang Saku ${myChild.name}`}
              badgeText="TABUNGAN SANTRI"
              icon={Wallet}
              colorScheme={myChild.balance < 0 ? 'rose' : myChild.balance <= minBalanceAlert ? 'amber' : 'emerald'}
              delayIndex={0}
            />
            <StatCard
              title="STATUS & KELAS ANANDA"
              value={myChild.class_name || 'Santri Aktif'}
              subtitle={`Asrama: ${myChild.dormitory || '-'}`}
              badgeText={myChild.status.toUpperCase()}
              icon={Users}
              colorScheme="blue"
              delayIndex={1}
            />
            <StatCard
              title="JAJAN ANANDA HARI INI"
              value={formatRupiah(childTodayExpense)}
              subtitle={`${childTodayTrxs.length} Kali Transaksi Hari Ini`}
              badgeText="Hari Ini"
              icon={ShoppingCart}
              colorScheme="amber"
              delayIndex={2}
            />
            <StatCard
              title="TOTAL TOP-UP (SALDO MASUK)"
              value={formatRupiah(childTotalTopup)}
              subtitle={`${childTopups.length} Kali Pengisian Saldo`}
              badgeText="Total Setoran"
              icon={ArrowDownRight}
              colorScheme="teal"
              delayIndex={3}
            />
            <StatCard
              title="JAJAN ANANDA MINGGU INI"
              value={formatRupiah(childWeekExpense)}
              subtitle="Pengeluaran 7 Hari Terakhir"
              badgeText="Minggu Ini"
              icon={ArrowUpRight}
              colorScheme="purple"
              delayIndex={4}
            />
            <StatCard
              title="JAJAN ANANDA BULAN INI"
              value={formatRupiah(childMonthExpense)}
              subtitle="Pengeluaran Bulan Berjalan"
              badgeText="Bulan Ini"
              icon={TrendingUp}
              colorScheme="rose"
              delayIndex={5}
            />
          </>
        ) : (
          <>
            <StatCard
              title="JUMLAH SANTRI SMP"
              value={`${totalStudentsCount} Santri`}
              subtitle={`${activeStudentsCount} Santri Aktif`}
              badgeText="Total Terdaftar"
              icon={Users}
              colorScheme="emerald"
              delayIndex={0}
            />
            <StatCard
              title="SALDO KESELURUHAN"
              value={formatRupiah(totalBalanceAll)}
              subtitle="Tabungan Seluruh Santri"
              badgeText="Simpanan Koperasi"
              icon={Wallet}
              colorScheme="blue"
              delayIndex={1}
            />
            <StatCard
              title="TRANSAKSI JAJAN HARI INI"
              value={`${todayTransactionsCount} Transaksi`}
              subtitle={`Total Jajan: ${formatRupiah(todayExpense)}`}
              badgeText="Kasir Aktif"
              icon={ShoppingCart}
              colorScheme="amber"
              delayIndex={2}
            />
            <StatCard
              title="ISI SALDO (TOPUP) HARI INI"
              value={formatRupiah(todayIncome)}
              subtitle="Pemasukan Kasir Hari Ini"
              badgeText="Saldo Masuk"
              icon={ArrowDownRight}
              colorScheme="teal"
              delayIndex={3}
            />
            <StatCard
              title="JAJAN MINGGU INI"
              value={formatRupiah(thisWeekExpense)}
              subtitle="Total Pengeluaran Minggu Ini"
              badgeText="Omset Mingguan"
              icon={ArrowUpRight}
              colorScheme="purple"
              delayIndex={4}
            />
            <StatCard
              title="JAJAN BULAN INI"
              value={formatRupiah(thisMonthExpense)}
              subtitle="Total Pengeluaran Bulan Ini"
              badgeText="Omset Bulanan"
              icon={TrendingUp}
              colorScheme="rose"
              delayIndex={5}
            />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {!isGuest ? (
            <div className={getCardPaddingClass(uiStyle, "p-6 overflow-hidden relative")}>
              <h2 className={isNeo ? "text-2xl font-black uppercase mb-6 flex items-center gap-2" : "text-lg font-extrabold text-slate-800 dark:text-white mb-4 flex items-center gap-2.5"}>
                {isNeo && <span className="bg-purple-400 px-2 border-[2px] border-black -rotate-3">🚀 QUICK</span>}
                {!isNeo && (
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-emerald-400 to-teal-500 text-slate-950 shadow-xs">
                    <Zap className="w-4 h-4" />
                  </div>
                )}
                <span>POS KASIR CEPAT</span>
                <span className="ml-auto text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  Realtime Offline-Ready
                </span>
              </h2>
              <QuickPOSWidget />
            </div>
          ) : (
            <GuestSantriActivityWidget />
          )}

          <div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6")}>
             <div className={getHeaderClass(uiStyle, "cyan-400")}>
              <h2 className="text-xl font-black uppercase">
                {isGuest ? '📈 Grafik Pengeluaran Ananda' : '📈 Grafik Transaksi'}
              </h2>
             </div>
            {!isNeo && (
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-extrabold text-slate-800 dark:text-white flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xs">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <span>{isGuest ? 'Grafik Pengeluaran Jajan Ananda' : 'Grafik Transaksi Koperasi'}</span>
                </h2>
              </div>
            )}
            <div className={isNeo ? "p-6" : ""}>
              <TransactionChart
                transactions={isGuest ? childTransactions : (transactions || [])}
                topups={isGuest ? childTopups : (topups || [])}
              />
            </div>
          </div>
        </div>

        {/* Sidebar Widgets */}
        <div className="space-y-6 sm:space-y-8 pb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
          {!isGuest ? (
            <div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6 space-y-6")}>
               <div className={getHeaderClass(uiStyle, "rose-400")}>
                <h2 className="text-lg font-black uppercase">Top Pengeluaran Santri</h2>
               </div>
               <div className={isNeo ? "p-4" : ""}>
                 <TopSantriTable topSantri={topSantri || []} />
               </div>
            </div>
          ) : (
            /* Card Informasi & Kontak Layanan Koperasi untuk Wali Santri */
            <div className={getCardPaddingClass(uiStyle, isNeo ? "p-4 space-y-3" : "p-5 sm:p-6 space-y-3 bg-gradient-to-br from-emerald-950/20 via-slate-900 to-slate-900 rounded-3xl border border-emerald-800/40")}>
              <div className="flex items-center gap-2 pb-2 border-b border-slate-700/60">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-extrabold text-sm sm:text-base text-white">
                  Layanan Koperasi &amp; Top-Up
                </h3>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Untuk menambah saldo tabungan uang saku ananda <strong className="text-emerald-400">{myChild?.name}</strong> via transfer bank atau ingin berkonsultasi, silakan hubungi pengurus koperasi pesantren:
              </p>
              <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Pengurus:</span>
                  <span className="font-bold text-white">{settings.treasurer_name || 'Ustadz Ahmad Hidayat'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">WhatsApp / Telp:</span>
                  <span className="font-mono font-bold text-emerald-400">{settings.phone || '0812-3456-7890'}</span>
                </div>
              </div>
            </div>
          )}
          
          <div className={getCardPaddingClass(uiStyle, isNeo ? "p-0" : "p-6")}>
             <div className={getHeaderClass(uiStyle, "lime-400")}>
              <h2 className="text-lg font-black uppercase">
                {isGuest ? '📊 Kategori Jajan Ananda' : '📊 Kategori Jajan'}
              </h2>
             </div>
             <div className={isNeo ? "p-4" : ""}>
               <CategoryPieChart transactions={isGuest ? childTransactions : (transactions || [])} />
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};
