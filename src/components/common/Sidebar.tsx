import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import pesantrenLogo from '../../assets/images/sirajuddin_logo.jpeg';
import {
  LayoutDashboard,
  ShoppingCart,
  Wallet,
  Users,
  History,
  FileSpreadsheet,
  BarChart3,
  Settings,
  Building2,
  X,
  CreditCard,
  UserCheck,
  Activity,
  Trophy,
  LogOut,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { settings, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';
  const { user, logout } = useAuth();

  const userRole = user?.role || 'admin';

  const allNavItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard, roles: ['admin', 'administrator', 'viewer', 'guest'] },
    { label: 'Data Santri', path: '/santri', icon: Users, roles: ['admin', 'administrator'] },
    { label: 'Transaksi (POS)', path: '/kasir', icon: ShoppingCart, badge: 'Kasir', roles: ['admin', 'administrator'] },
    { label: 'Isi Saldo Santri', path: '/topup', icon: Wallet, badge: 'TopUp', roles: ['admin', 'administrator'] },
    { label: 'Riwayat Transaksi', path: '/riwayat', icon: History, roles: ['admin', 'administrator', 'viewer', 'guest'] },
    { label: 'Log Aktivitas & Tamu', path: '/aktivitas', icon: Activity, badge: 'Live', roles: ['admin', 'administrator'] },
    { label: 'Laporan PDF & Excel', path: '/laporan', icon: FileSpreadsheet, roles: ['admin', 'administrator'] },
    { label: 'Top Jajan Santri', path: '/top-santri', icon: Trophy, badge: 'Leaderboard', roles: ['admin', 'administrator'] },
    { label: 'Statistik & Analitik', path: '/statistik', icon: BarChart3, roles: ['admin', 'administrator'] },
    { label: 'Pengguna & Role', path: '/pengguna', icon: UserCheck, badge: 'Admin', roles: ['admin'] },
    { label: 'Pengaturan & DB', path: '/pengaturan', icon: Settings, roles: ['admin'] },
  ];

  const visibleNavItems = allNavItems.filter((item) => item.roles.includes(userRole));

  const sidebarContent = (
    <div className={`flex flex-col h-full w-64 transition-colors ${isNeo ? "bg-white border-r-[4px] border-black font-mono shadow-[6px_0px_0px_0px_rgba(0,0,0,1)] z-10 relative" : "bg-[#0c1322] border-r border-slate-800"}`}>
      {/* Brand Header */}
      <div className={`p-4 sm:p-5 flex items-center justify-between border-b ${isNeo ? "border-black bg-cyan-300 border-b-[4px]" : "border-slate-800/80 bg-[#0c1322]"}`}>
        <Link
          to="/"
          onClick={onClose}
          className="flex items-center gap-3 group min-w-0 flex-1"
        >
          {settings.login_image_url && settings.login_image_url.trim() !== '' ? (
            <img
              src={settings.login_image_url}
              alt="Logo Koperasi"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.src = pesantrenLogo;
              }}
              className="w-11 h-11 rounded-xl object-cover ring-1 ring-slate-700/80 shadow-sm bg-slate-900 shrink-0 transition-transform duration-200 ease-out group-hover:scale-105"
            />
          ) : (
            <div className="w-11 h-11 rounded-xl bg-[#00c48c] text-slate-950 flex items-center justify-center font-bold text-xl shrink-0 transition-transform duration-200 ease-out group-hover:scale-105">
              <Building2 className="w-6 h-6" />
            </div>
          )}

          <div className="flex flex-col min-w-0">
            <h1 className="font-extrabold text-base tracking-wide uppercase text-white leading-none truncate group-hover:text-slate-100 transition-colors">
              {settings.koperasi_name || 'KOPDES'}
            </h1>
            <p className="text-xs font-semibold text-[#00c48c] mt-1.5 leading-tight truncate">
              {settings.pesantren_name || 'Pondok Pesantren Darul Mukhlasin'}
            </p>
          </div>
        </Link>

        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0 cursor-pointer ml-1"
          title="Tutup Menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          MENU UTAMA ({userRole.toUpperCase()})
        </div>
        {visibleNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                isNeo ? `flex items-center justify-between px-3.5 py-2.5 rounded-none border-[3px] border-transparent font-bold text-sm transition-all ${isActive ? "bg-pink-400 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] -translate-y-1" : "hover:bg-yellow-300 hover:border-black hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1 text-black"}` :
                `flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-sm transition-all duration-200 group ${
                  isActive
                    ? 'bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 shadow-md shadow-emerald-500/25 scale-[1.01]'
                    : 'text-slate-400 hover:bg-slate-800/80 hover:text-white hover:translate-x-1'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 shrink-0 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-slate-950' : 'text-slate-400 group-hover:text-emerald-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold tracking-wide ${
                      isActive ? 'bg-black/15 text-slate-950' : 'bg-emerald-950/80 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </NavLink>
          );
        })}
      </div>

      {/* Logout & App Info */}
      <div className={`p-4 space-y-3 ${isNeo ? "border-t-[4px] border-black bg-white" : "border-t border-slate-800/80 bg-[#090e1a]"}`}>
        <button
          onClick={logout}
          className={isNeo ? "w-full flex items-center justify-center gap-2 px-3 py-2 border-[3px] border-black bg-rose-400 text-black text-xs font-black uppercase hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all" : "w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl border border-rose-800/40 bg-rose-950/30 text-rose-400 text-xs font-bold hover:bg-rose-900/50 hover:text-rose-200 transition-colors cursor-pointer"}
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar (Logout)</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
          <CreditCard className="w-4 h-4 text-[#00c48c] shrink-0" />
          <div className="flex flex-col">
            <span className="font-semibold text-slate-200">Sistem Kasir POS</span>
            <span className="text-[10px] text-slate-400">Pondok Pesantren Aktif</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Permanent Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-0 h-screen z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs" onClick={onClose} />
          <div className="fixed inset-y-0 left-0 w-64 shadow-2xl z-10 animate-in slide-in-from-left">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
