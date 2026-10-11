import React, { useState, useEffect } from 'react';
import { 
  PRAYER_BANNER_EVENT, 
  PrayerBannerDetail, 
} from '../../lib/prayer/prayer-notification';
import { useApp } from '../../context/AppContext';
import { Bell, X, MapPin, CheckCircle2, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export const PrayerNotificationBanner: React.FC = () => {
  const { settings } = useApp();
  const [activeBanner, setActiveBanner] = useState<PrayerBannerDetail | null>(null);

  useEffect(() => {
    const handleBanner = (event: Event) => {
      const custom = event as CustomEvent<PrayerBannerDetail>;
      if (custom.detail) {
        setActiveBanner(custom.detail);
      }
    };

    window.addEventListener(PRAYER_BANNER_EVENT, handleBanner as EventListener);
    return () => {
      window.removeEventListener(PRAYER_BANNER_EVENT, handleBanner as EventListener);
    };
  }, []);

  if (!activeBanner) return null;

  const isAdzan = activeBanner.type === 'adzan';

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-300">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: -20 }}
          className="w-full max-w-lg bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl border-2 border-emerald-500/50 shadow-2xl overflow-hidden relative"
        >
          {/* Top Decorative Islamic Glow Header */}
          <div className="relative p-6 bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-800/40 text-center overflow-hidden">
            <div className="absolute inset-0 opacity-15 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #10b981 1px, transparent 0)', backgroundSize: '20px 20px' }} />
            <button
              onClick={() => setActiveBanner(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 rounded-full transition-colors cursor-pointer"
              title="Tutup"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="inline-flex items-center justify-center p-3.5 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/30 mb-3 animate-bounce">
              <Bell className="w-8 h-8" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-black uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>{isAdzan ? 'WAKTU SHALAT TELAH TIBA' : 'PENGINGAT SHALAT (15 MENIT LAGI)'}</span>
            </div>

            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {activeBanner.title}
            </h3>

            <p className="text-xs text-emerald-200/90 mt-1 max-w-md mx-auto">
              {activeBanner.message}
            </p>
          </div>

          {/* Body Content */}
          <div className="p-5 sm:p-6 space-y-4">
            {/* Info Waktu & Wilayah Card */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Waktu Shalat
                </span>
                <span className="text-lg font-black text-emerald-400 font-mono mt-0.5 block">
                  {activeBanner.time.includes('WI') ? activeBanner.time : `${activeBanner.time} WIB`}
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  Shalat {activeBanner.prayerName}
                </span>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Wilayah Koordinat
                </span>
                <div className="flex items-center justify-center gap-1 mt-1 text-xs font-bold text-white truncate">
                  <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span className="truncate">{activeBanner.location}</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 font-medium mt-0.5 block">
                  Kemenag RI Resmi
                </span>
              </div>
            </div>

            {/* Doa / Ajakan Shalat Berjamaah */}
            <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-100 space-y-1.5 text-center">
              <p className="font-serif text-sm sm:text-base text-emerald-300 leading-relaxed font-semibold">
                حَيَّ عَلَى الصَّلَاةِ • حَيَّ عَلَى الْفَلَاحِ
              </p>
              <p className="text-xs text-slate-300">
                &ldquo;Mari bersama-sama menunaikan ibadah shalat berjamaah tepat pada waktunya di Masjid Pondok Pesantren.&rdquo;
              </p>
            </div>

            {/* Tombol Aksi */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setActiveBanner(null)}
                className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer active:scale-95"
              >
                <CheckCircle2 className="w-5 h-5" />
                <span>Saya Mengerti / Ambil Wudhu</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
