import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { LocationPermissionModal } from './LocationPermissionModal';
import {
  getActivePrayerLocation,
  wasLocationPromptShown,
  markLocationPromptShown,
  setActivePrayerLocation,
  UserPrayerLocation,
} from '../../lib/prayer/prayer-location-manager';
import { reverseGeocodeGPS } from '../../lib/prayer/prayer-api';
import {
  MapPin,
  Compass,
  Navigation,
  X,
  Loader2,
  CheckCircle2,
  Radio,
} from 'lucide-react';

export const LoginLocationPromptWatcher: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { settings, updateSettings, showToast } = useApp();

  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Check if prompted flag was set explicitly upon login or first visit without GPS
    const justLoggedIn =
      sessionStorage.getItem('koperasi_prompt_location_after_login') === 'true';
    const activeLoc = getActivePrayerLocation(settings);
    const hasGps = Boolean(activeLoc.isGps);
    const promptShown = wasLocationPromptShown();

    if (justLoggedIn || (!hasGps && !promptShown)) {
      const timer = setTimeout(() => {
        setShowNotificationBanner(true);
        sessionStorage.removeItem('koperasi_prompt_location_after_login');
        markLocationPromptShown();
      }, 600);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, user, settings]);

  if (!isAuthenticated && !showNotificationBanner) return null;

  // Direct 1-click GPS detection from the notification banner
  const handleQuickAllowLocation = () => {
    if (!('geolocation' in navigator)) {
      setIsModalOpen(true);
      setShowNotificationBanner(false);
      return;
    }

    setIsDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const loc = await reverseGeocodeGPS(latitude, longitude);

          const newLoc: UserPrayerLocation = {
            provinsi: loc.provinsi,
            kabkota: loc.kabkota,
            locationName: loc.locationName,
            lat: latitude,
            lon: longitude,
            timezoneLabel: loc.timezoneLabel,
            timezone: loc.timezone,
            isGps: true,
          };

          setActivePrayerLocation(newLoc);

          await updateSettings({
            ...settings,
            prayer_provinsi: loc.provinsi,
            prayer_kabkota: loc.kabkota,
            prayer_lat: latitude,
            prayer_lon: longitude,
            prayer_location_name: loc.locationName,
            prayer_timezone_label: loc.timezoneLabel,
            prayer_auto_location: true,
          });

          window.dispatchEvent(new Event('koperasi_prayer_location_updated'));

          showToast(
            'success',
            'Lokasi GPS Berhasil Diaktifkan',
            `Titik koordinat terdeteksi di ${loc.locationName} (${loc.timezoneLabel}). Jadwal shalat otomatis disinkronkan.`
          );

          setShowNotificationBanner(false);
        } catch (e: any) {
          setIsModalOpen(true);
          setShowNotificationBanner(false);
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        // Open the modal dialog if browser asks for manual interaction or blocked
        setIsModalOpen(true);
        setShowNotificationBanner(false);
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  const handleDismissBanner = () => {
    setShowNotificationBanner(false);
  };

  return (
    <>
      {/* Sleek Floating In-App Location Notification ("notif di halaman web untuk mengaktifkan GPS") */}
      {showNotificationBanner && (
        <div className="fixed top-4 right-4 sm:right-6 z-50 max-w-md w-full bg-slate-900/95 dark:bg-slate-950/95 text-white p-4 sm:p-5 rounded-3xl shadow-2xl border-2 border-emerald-500/50 backdrop-blur-md animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="flex items-start gap-3.5">
            {/* Glowing GPS Radar Pin */}
            <div className="p-3 bg-emerald-500 text-slate-950 rounded-2xl shadow-lg shadow-emerald-500/30 shrink-0 mt-0.5 relative">
              <Compass className="w-5 h-5 animate-spin-slow" />
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 absolute -top-1 -right-1 animate-ping" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                  <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
                  <span>Akurasi Jadwal Shalat GPS</span>
                </span>
                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer"
                  title="Tutup Notifikasi"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <h4 className="font-extrabold text-sm text-white mt-1.5 leading-snug">
                Aktifkan GPS Lokasi Anda
              </h4>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Izinkan akses lokasi agar sistem mendeteksi titik koordinat Anda secara presisi (Banjarnegara, Tasikmalaya, Papua, dll.) dan menyinkronkan jadwal shalat otomatis.
              </p>

              {/* Action Buttons */}
              <div className="mt-3.5 flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleQuickAllowLocation}
                  disabled={isDetecting}
                  className="flex-1 py-2.5 px-3 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendeteksi Koordinat GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4" />
                      <span>Izinkan &amp; Deteksi GPS</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleDismissBanner}
                  className="py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Nanti Saja
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Fallback Location Permission Modal if opened */}
      <LocationPermissionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Izin Lokasi Google Maps untuk Waktu Shalat"
        subtitle="Mohon izinkan akses Google Maps GPS agar jadwal shalat aktif akurat real-time sesuai koordinat Anda."
      />
    </>
  );
};
