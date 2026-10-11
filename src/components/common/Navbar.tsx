import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useNotifications, RealtimeNotifItem } from '../../context/NotificationContext';
export type { RealtimeNotifItem };
import { getTimePeriod, getTimePeriodLabel, formatRupiah, formatDateTime } from '../../utils/formatters';
import { CloudOff, Cloud, RefreshCw, Search, Sun, Moon, LogOut, Menu, UserCheck, Shield, Clock, Bell, Wallet, ArrowDownRight, ArrowUpRight, ShoppingBag, X, Trash2, Check, Palette, Lock, User, WifiOff } from 'lucide-react';

import { ProfileModal } from './ProfileModal';
import { ThemeSelectorModal } from './ThemeSelectorModal';
import { ThemeToggleSwitch } from './ThemeToggleSwitch';
import { PWAInstallButton } from './PWAInstallButton';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import defaultSantriAvatar from '../../assets/images/login_santri_avatar_1785105854262.jpg';
import waliSantriAvatar from '../../assets/images/wali_santri_avatar_habibi_1790235608369.jpg';
import pesantrenLogo from '../../assets/images/sirajuddin_logo.jpeg';

interface NavbarProps {
  onToggleSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const isOnline = useOnlineStatus();
  const {
    themeMode,
    toggleTheme,
    searchQuery,
    setSearchQuery,
    settings,
    hasUnsyncedData,
    students,
    pendingSyncCount,
    isSyncing,
    syncOfflineData,
  } = useApp();
  const {
    notifications: allNotifications,
    unreadCount,
    markAsRead,
    clearAllNotifications,
    businessFund,
  } = useNotifications();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isThemeModalOpen, setIsThemeModalOpen] = useState(false);
  const navbarRef = React.useRef<HTMLHeadingElement>(null);

  const isGuest = user?.role === 'guest' || user?.role === 'viewer' || user?.id === 'guest';

  // Find linked santri for Wali Santri if logged in
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

  // Notifications relevant to current viewer:
  // If Wali Santri / guest: show prayer notifications + transactions & topups specifically related to their child
  const visibleNotifications = useMemo(() => {
    if (!isGuest) return allNotifications;
    return allNotifications.filter((n) => {
      if (n.type === 'prayer') return true;
      if (!myChild) return false;
      const lowerMsg = (n.message + ' ' + n.title).toLowerCase();
      const matchName = myChild.name ? lowerMsg.includes(myChild.name.toLowerCase()) : false;
      const matchNis = myChild.nis ? lowerMsg.includes(myChild.nis.toLowerCase()) : false;
      return matchName || matchNis;
    });
  }, [isGuest, allNotifications, myChild]);

  const visibleUnreadCount = useMemo(() => {
    return visibleNotifications.filter((n) => !n.isRead).length;
  }, [visibleNotifications]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node)) {
        setShowNotifMenu(false);
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const currentPeriod = getTimePeriod(currentTime);
  const periodInfo = getTimePeriodLabel(currentPeriod);

  return (
    <header ref={navbarRef} className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Title/Search */}
        <div className="flex items-center gap-3 flex-1 max-w-xl">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Buka Menu Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Optional Brand Logo Badge on Navbar Header */}
          {settings.login_image_url && settings.login_image_url.trim() !== '' && (
            <img
              src={settings.login_image_url}
              alt="Logo Koperasi"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = pesantrenLogo;
              }}
              className="w-8 h-8 rounded-xl object-cover ring-2 ring-emerald-500/30 shadow-xs bg-white shrink-0 hidden sm:block"
            />
          )}

          {/* Quick Instant Search */}
          <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari santri, NIS, transaksi..."
              className="w-full pl-9 sm:pl-10 pr-4 py-1.5 sm:py-2 bg-slate-100 dark:bg-slate-800 border-none rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: Time Indicator, Theme Toggle & User Menu */}
        <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
          {/* Offline Status Badge */}
          {!isOnline && (
            <div
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold"
              title="Koneksi terputus. Sistem menggunakan cache transaksi lokal."
            >
              <WifiOff className="w-3.5 h-3.5 animate-pulse" />
              <span className="hidden sm:inline">Mode Offline</span>
            </div>
          )}

          {/* Pending Sync Trigger Button */}
          {pendingSyncCount > 0 && (
            <button
              type="button"
              onClick={syncOfflineData}
              disabled={isSyncing || !isOnline}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-500/15 hover:bg-blue-500/25 border border-blue-500/30 text-blue-600 dark:text-blue-400 text-xs font-bold transition-all cursor-pointer"
              title={!isOnline ? "Transaksi tersimpan offline, akan otomatis disinkronkan saat terhubung" : "Klik untuk sinkronkan transaksi lokal ke cloud sekarang"}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>{pendingSyncCount} <span className="hidden sm:inline">Sinkron</span></span>
            </button>
          )}

          {/* PWA In-App Install Button */}
          <PWAInstallButton />

          {/* Automatic Time Period Detector Tag */}
          <div className="hidden md:flex items-center gap-2 px-4 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.2)] text-xs font-medium transition-all hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]">
            <span className="text-lg drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]">{periodInfo.icon}</span>
            <div className="flex flex-col">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase tracking-wider font-bold">Waktu Otomatis</span>
              <span className="font-black text-emerald-700 dark:text-emerald-300 capitalize drop-shadow-[0_0_5px_rgba(16,185,129,0.5)] tracking-wide">
                {currentTime.toLocaleDateString('id-ID', { weekday: 'long' })}, {currentPeriod} jam {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }).replace(':', '.')}
              </span>
            </div>
          </div>

          {/* Notification & Business Fund Bell Button */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifMenu((prev) => !prev);
                setShowProfileMenu(false);
              }}
              className="relative p-2 sm:p-2.5 rounded-xl text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title={isGuest ? "Notifikasi Real-Time Ananda & Jadwal Sholat" : "Notifikasi Aktivitas Real-Time & Kas Koperasi"}
            >
              <Bell className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              {visibleUnreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-5 h-5 px-1 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                  {visibleUnreadCount}
                </span>
              )}
            </button>

            {/* Notification Popover */}
            {showNotifMenu && (
              <div className="fixed sm:absolute inset-x-3 sm:inset-x-auto sm:right-0 top-16 sm:top-auto sm:mt-2 max-w-sm sm:w-96 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200/80 dark:border-slate-800 p-4 z-50 animate-in fade-in slide-in-from-top-2 mx-auto sm:mx-0">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2 font-bold text-sm text-slate-900 dark:text-white">
                    <Bell className="w-4 h-4 text-emerald-500" />
                    <span>{isGuest ? 'Notifikasi Ananda & Sholat' : 'Notifikasi Real-Time'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {visibleNotifications.length > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        title="Bersihkan Notifikasi"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        Bersihkan
                      </button>
                    )}
                    <button
                      onClick={() => setShowNotifMenu(false)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Dana Kas / Ringkasan Widget: Privat untuk Wali Santri (Hanya Hak Admin) */}
                {!isGuest ? (
                  /* Khusus Admin / Kasir: Kas Koperasi Keseluruhan */
                  <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-2xl p-3.5 text-white shadow-md mb-4">
                    <div className="flex items-center justify-between text-xs opacity-90 mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" /> Kas Koperasi (Hak Admin)
                      </span>
                      <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-mono">Live</span>
                    </div>
                    <div className="text-xl font-black mb-2">
                      {formatRupiah(businessFund.netCash)}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] pt-2 border-t border-white/20">
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-white/20">
                          <ArrowDownRight className="w-3 h-3 text-emerald-200" />
                        </div>
                        <div>
                          <span className="block opacity-80 text-[9px]">Pemasukan</span>
                          <span className="font-bold">{formatRupiah(businessFund.totalIncome)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <div className="p-1 rounded bg-white/20">
                          <ArrowUpRight className="w-3 h-3 text-rose-200" />
                        </div>
                        <div>
                          <span className="block opacity-80 text-[9px]">Pengeluaran</span>
                          <span className="font-bold">{formatRupiah(businessFund.totalExpense)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : myChild ? (
                  /* Khusus Wali Santri: Menampilkan Saldo Tabungan Ananda Sendiri (Privat & Aman) */
                  <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-2xl p-3.5 text-white shadow-md mb-4 border border-emerald-600/30">
                    <div className="flex items-center justify-between text-xs opacity-90 mb-1">
                      <span className="font-semibold flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5 text-amber-300" /> Saldo Tabungan Ananda
                      </span>
                      <span className="text-[10px] bg-emerald-500/30 text-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Privat
                      </span>
                    </div>
                    <div className="text-xl font-black mb-1 text-amber-300">
                      {formatRupiah(myChild.balance)}
                    </div>
                    <div className="flex items-center justify-between text-[11px] pt-1.5 border-t border-white/15 opacity-90">
                      <span className="font-medium truncate flex items-center gap-1">
                        <User className="w-3 h-3 text-emerald-300" /> {myChild.name} ({myChild.nis})
                      </span>
                      <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded font-mono">
                        {myChild.class_name || 'Santri'}
                      </span>
                    </div>
                  </div>
                ) : (
                  /* Wali Santri tanpa ananda terikat: Informasi Privasi */
                  <div className="bg-slate-100 dark:bg-slate-800/80 rounded-2xl p-3 text-slate-700 dark:text-slate-300 shadow-sm mb-4 border border-slate-200 dark:border-slate-700 flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 shrink-0">
                      <Lock className="w-4 h-4" />
                    </div>
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 dark:text-slate-200">Saldo Koperasi Dilindungi</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">Total kas koperasi diprivat khusus wewenang admin.</p>
                    </div>
                  </div>
                )}

                {/* Real-time Activity List */}
                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  <div className="flex items-center justify-between">
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Notifikasi Terkini ({visibleNotifications.length})
                    </p>
                  </div>

                  {visibleNotifications.length === 0 ? (
                    <div className="py-6 text-center space-y-1 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-4">
                      <Bell className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2 opacity-60" />
                      <p className="text-xs font-bold text-slate-600 dark:text-slate-300">
                        Tidak Ada Notifikasi
                      </p>
                      <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-relaxed">
                        {isGuest
                          ? 'Notifikasi transaksi jajan atau top-up ananda serta pengingat waktu sholat akan muncul di sini secara real-time.'
                          : 'Notifikasi baru akan muncul secara otomatis ketika transaksi jajan atau pengisian saldo dilakukan.'}
                      </p>
                    </div>
                  ) : (
                    visibleNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => markAsRead(notif.id)}
                        className={`p-3 rounded-2xl border flex items-start gap-2.5 text-xs transition-all cursor-pointer animate-in fade-in ${
                          notif.isRead
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-100 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800 opacity-70'
                            : 'bg-white dark:bg-slate-900 border-emerald-200 dark:border-emerald-800 shadow-sm hover:shadow-md'
                        }`}
                      >
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            notif.type === 'topup'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : notif.type === 'prayer'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          }`}
                        >
                          {notif.type === 'topup' ? (
                            <ArrowDownRight className="w-3.5 h-3.5" />
                          ) : notif.type === 'prayer' ? (
                            <Clock className="w-3.5 h-3.5" />
                          ) : (
                            <ShoppingBag className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="font-bold text-slate-800 dark:text-slate-100 text-[11px] flex items-center gap-1.5">
                              {notif.title}
                              {notif.isRead && <span className="text-[9px] font-medium text-emerald-500 bg-emerald-50 dark:bg-emerald-900/30 px-1.5 py-0.5 rounded-md flex items-center gap-1"><Check className="w-3 h-3"/> Dibaca</span>}
                              {!notif.isRead && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatDateTime(notif.time).split(',')[1] || formatDateTime(notif.time)}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-snug font-medium">
                            {notif.message}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>


          {/* Theme Customizer Palette Trigger */}
          <button
            onClick={() => setIsThemeModalOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            title="Kustomisasi Tema Warna & Mode Gelap"
          >
            <Palette className="w-5 h-5" />
          </button>

          {/* Light / Dark Mode Toggle Switch */}
          <ThemeToggleSwitch />

          {/* Admin User Profile Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setShowProfileMenu((prev) => !prev)}
              className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors shrink-0"
            >
              <img
                src={
                  (user?.avatar_url && user.avatar_url.trim() !== '')
                    ? user.avatar_url
                    : (user?.role === 'viewer' || user?.role === 'guest' || user?.id === 'guest')
                      ? waliSantriAvatar
                      : defaultSantriAvatar
                }
                alt={user?.name || 'Admin'}
                className="w-8 h-8 rounded-full object-cover ring-2 ring-emerald-500/30"
              />
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-100 truncate max-w-[120px]">
                  {user?.name || 'Admin Koperasi'}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                  {user?.role?.toUpperCase() || 'ADMIN'}
                </span>
              </div>
            </button>

            {/* Profile Menu Popup */}
            {showProfileMenu && (
              <div
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                onClick={() => setShowProfileMenu(false)}
              >
                <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-800 dark:text-slate-100">{user?.name}</p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">{user?.email}</p>
                </div>
                <div className="py-1">
                  <div className="px-4 py-1.5 text-[11px] text-slate-400 flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="capitalize">Role: {user?.role}</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      setIsProfileModalOpen(true);
                    }}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-2 transition-colors"
                  >
                    <UserCheck className="w-4 h-4" />
                    Profil Saya
                  </button>
                </div>
                <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                  <button
                    onClick={logout}
                    className="w-full text-left px-4 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 flex items-center gap-2 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    Keluar Sesi
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <ProfileModal 
        isOpen={isProfileModalOpen} 
        onClose={() => setIsProfileModalOpen(false)} 
      />

      <ThemeSelectorModal
        isOpen={isThemeModalOpen}
        onClose={() => setIsThemeModalOpen(false)}
      />
    </header>
  );
};
