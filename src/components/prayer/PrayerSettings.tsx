import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  requestNotificationPermission, 
  playAdzanAudio,
  PRAYER_BANNER_EVENT,
  PrayerBannerDetail
} from '../../lib/prayer/prayer-notification';
import { 
  setActivePrayerLocation,
  UserPrayerLocation 
} from '../../lib/prayer/prayer-location-manager';
import { 
  INDONESIAN_PROVINCES, 
  fetchCitiesForProvince, 
  reverseGeocodeGPS,
  getTimezoneFromLon 
} from '../../lib/prayer/prayer-api';
import { 
  Bell, 
  MapPin, 
  Volume2, 
  CheckCircle, 
  Compass, 
  Navigation, 
  Loader2, 
  VolumeX, 
  Sparkles 
} from 'lucide-react';

export const PrayerSettings: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();

  const [provinsi, setProvinsi] = useState(settings.prayer_provinsi || 'Jawa Tengah');
  const [kabkota, setKabkota] = useState(settings.prayer_kabkota || 'Kab. Banjarnegara');
  const [autoLocation, setAutoLocation] = useState(settings.prayer_auto_location ?? true);
  const [locationName, setLocationName] = useState(settings.prayer_location_name || '');
  const [enableReminder, setEnableReminder] = useState(settings.prayer_enable_reminder ?? true);
  const [enableAdzanNotif, setEnableAdzanNotif] = useState(settings.prayer_enable_adzan_notif ?? true);
  const [enableAdzanAudio, setEnableAdzanAudio] = useState(settings.prayer_enable_adzan_audio ?? true);
  const [volume, setVolume] = useState(settings.prayer_adzan_volume ?? 80);

  const [citiesList, setCitiesList] = useState<string[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [isDetectingGPS, setIsDetectingGPS] = useState(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number } | null>(
    settings.prayer_lat && settings.prayer_lon 
      ? { lat: settings.prayer_lat, lon: settings.prayer_lon } 
      : null
  );

  const [saving, setSaving] = useState(false);
  const [permStatus, setPermStatus] = useState<NotificationPermission>(
    'Notification' in window ? Notification.permission : 'denied'
  );

  // Load cities whenever province changes
  useEffect(() => {
    let isMounted = true;
    async function loadCities() {
      setIsLoadingCities(true);
      try {
        const list = await fetchCitiesForProvince(provinsi);
        if (isMounted) {
          setCitiesList(list);
          if (!list.includes(kabkota) && list.length > 0) {
            setKabkota(list[0]);
          }
        }
      } catch (e) {
        console.error('Failed to load cities:', e);
      } finally {
        if (isMounted) setIsLoadingCities(false);
      }
    }
    loadCities();
    return () => {
      isMounted = false;
    };
  }, [provinsi]);

  // Handle GPS detection
  const handleDetectGPS = () => {
    if (!('geolocation' in navigator)) {
      showToast('error', 'GPS Tidak Didukung', 'Browser Anda tidak mendukung Geolocation API.');
      return;
    }

    setIsDetectingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          setGpsCoords({ lat: latitude, lon: longitude });

          const detected = await reverseGeocodeGPS(latitude, longitude);
          setProvinsi(detected.provinsi);
          setKabkota(detected.kabkota);
          setLocationName(detected.locationName);

          showToast(
            'success',
            'Lokasi Berhasil Terdeteksi!',
            `Koordinat: ${latitude.toFixed(4)}, ${longitude.toFixed(4)} (${detected.locationName})`
          );
        } catch (e: any) {
          showToast('error', 'Gagal Deteksi Lokasi', e.message || 'Gagal mendeteksi lokasi');
        } finally {
          setIsDetectingGPS(false);
        }
      },
      (error) => {
        setIsDetectingGPS(false);
        showToast(
          'warning',
          'Izin Lokasi Belum Diberikan',
          'Harap izinkan akses lokasi (GPS) pada browser Anda untuk deteksi otomatis.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const tzInfo = gpsCoords?.lon
        ? getTimezoneFromLon(gpsCoords.lon)
        : { timezone: 'Asia/Jakarta', timezoneLabel: 'WIB' as const };

      const locPayload: UserPrayerLocation = {
        provinsi,
        kabkota,
        locationName: locationName || `${kabkota}, ${provinsi}`,
        lat: gpsCoords?.lat || -7.3987,
        lon: gpsCoords?.lon || 109.6974,
        timezoneLabel: tzInfo.timezoneLabel,
        timezone: tzInfo.timezone,
        isGps: Boolean(autoLocation),
      };
      setActivePrayerLocation(locPayload);

      await updateSettings({
        ...settings,
        prayer_provinsi: provinsi,
        prayer_kabkota: kabkota,
        prayer_auto_location: autoLocation,
        prayer_location_name: locationName || `${kabkota}, ${provinsi}`,
        prayer_lat: gpsCoords?.lat,
        prayer_lon: gpsCoords?.lon,
        prayer_timezone_label: tzInfo.timezoneLabel,
        prayer_enable_reminder: enableReminder,
        prayer_enable_adzan_notif: enableAdzanNotif,
        prayer_enable_adzan_audio: enableAdzanAudio,
        prayer_adzan_volume: volume,
      });

      window.dispatchEvent(new Event('koperasi_prayer_location_updated'));
      showToast('success', 'Pengaturan Disimpan', 'Jadwal shalat & lokasi real-time telah diperbarui.');
    } catch (e: any) {
      showToast('error', 'Gagal Menyimpan', e.message);
    } finally {
      setSaving(false);
    }
  };

  const handleRequestPerm = async () => {
    const granted = await requestNotificationPermission();
    setPermStatus(granted ? 'granted' : 'denied');
    if (granted) {
      showToast('success', 'Notifikasi Diizinkan', 'Pengingat adzan & jadwal shalat akan muncul di browser.');
    } else {
      showToast('warning', 'Notifikasi Ditolak', 'Notifikasi sistem in-app banner tetap akan muncul saat waktu shalat.');
    }
  };

  const testNotifAndAudio = () => {
    // 1. Play audio chime
    playAdzanAudio(volume);

    // 2. Trigger in-app banner
    const detail: PrayerBannerDetail = {
      type: 'adzan',
      prayerName: 'Dzuhur',
      time: '11:45',
      title: '🔔 [Uji Coba] Waktu Shalat Dzuhur Telah Tiba!',
      message: `Telah masuk waktu shalat Dzuhur untuk wilayah ${kabkota}, ${provinsi}. Mari bergegas ke masjid!`,
      location: `${kabkota}, ${provinsi}`,
    };
    window.dispatchEvent(new CustomEvent(PRAYER_BANNER_EVENT, { detail }));

    // 3. Browser native notification if allowed
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(detail.title, {
          body: detail.message,
          icon: '/favicon.ico',
        });
      } catch {}
    }

    showToast('info', 'Uji Coba Pengingat Shalat', 'Banner pengingat & nada adzan sedang dimainkan.');
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
      <div className="p-5 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
              Jadwal Shalat & Notifikasi Adzan
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                Real-Time GPS
              </span>
            </h2>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Konfigurasi deteksi wilayah otomatis, pilihan kabupaten/kota, dan pengingat waktu shalat
            </p>
          </div>
        </div>

        <button
          onClick={handleDetectGPS}
          disabled={isDetectingGPS}
          className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300 font-bold text-xs rounded-xl border border-emerald-200 dark:border-emerald-800 flex items-center gap-2 transition-all shadow-sm shrink-0"
        >
          {isDetectingGPS ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              Mendeteksi GPS...
            </>
          ) : (
            <>
              <Navigation className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              Deteksi Lokasi GPS Otomatis
            </>
          )}
        </button>
      </div>

      <div className="p-5 sm:p-6 space-y-6">
        {/* Permission Banner */}
        {permStatus !== 'granted' && (
          <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-start gap-3">
              <span className="text-xl">🔔</span>
              <div>
                <p className="font-bold text-amber-900 dark:text-amber-300 text-sm">Aktifkan Notifikasi Waktu Shalat</p>
                <p className="text-xs text-amber-800 dark:text-amber-400 mt-0.5">
                  Dapatkan pengingat 15 menit sebelum shalat dan notifikasi saat waktu adzan tiba (didukung in-app banner otomatis).
                </p>
              </div>
            </div>
            <button
              onClick={handleRequestPerm}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl whitespace-nowrap shadow-sm"
            >
              Izinkan Notifikasi Browser
            </button>
          </div>
        )}

        {permStatus === 'granted' && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold bg-emerald-50 dark:bg-emerald-900/20 p-3.5 rounded-2xl border border-emerald-100 dark:border-emerald-800">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Notifikasi browser telah diizinkan. Pengingat shalat akan berbunyi dan muncul otomatis.
          </div>
        )}

        {/* GPS Auto Location Switch */}
        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 font-bold text-sm text-slate-800 dark:text-slate-100">
              <Compass className="w-4 h-4 text-emerald-500" />
              Gunakan Deteksi Lokasi Otomatis (GPS Real-Time)
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Menyesuaikan jadwal shalat otomatis saat berpindah tempat (misal: Jakarta, Banjarnegara, dll.)
            </p>
            {gpsCoords && (
              <p className="text-[11px] font-mono text-emerald-600 dark:text-emerald-400 font-semibold mt-1">
                📍 Koordinat Terdeteksi: {gpsCoords.lat.toFixed(4)}, {gpsCoords.lon.toFixed(4)} {locationName ? `(${locationName})` : ''}
              </p>
            )}
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input
              type="checkbox"
              checked={autoLocation}
              onChange={(e) => setAutoLocation(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Location manual selection */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <MapPin className="w-4 h-4 text-emerald-500" />
              Pilih Wilayah (Database Kemenag RI)
            </h3>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Provinsi
              </label>
              <select
                value={provinsi}
                onChange={(e) => setProvinsi(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
              >
                {INDONESIAN_PROVINCES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Kabupaten / Kota</span>
                {isLoadingCities && <span className="text-[10px] text-emerald-500 font-normal">Memuat daftar...</span>}
              </label>
              <select
                value={kabkota}
                onChange={(e) => setKabkota(e.target.value)}
                disabled={isLoadingCities}
                className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all disabled:opacity-60"
              >
                {citiesList.length > 0 ? (
                  citiesList.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))
                ) : (
                  <option value={kabkota}>{kabkota}</option>
                )}
              </select>
            </div>

            <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-800/40 text-[11px] text-slate-600 dark:text-slate-300 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Wilayah aktif: <strong>{kabkota}, {provinsi}</strong></span>
            </div>
          </div>

          {/* Notifications & Sound Options */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Bell className="w-4 h-4 text-emerald-500" />
              Pengingat & Suara Adzan
            </h3>

            <div className="space-y-3 pt-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableReminder}
                  onChange={(e) => setEnableReminder(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Pengingat 15 menit sebelum shalat tiba
                </span>
              </label>

              <label className="flex items-center gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={enableAdzanNotif}
                  onChange={(e) => setEnableAdzanNotif(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Notifikasi popup banner visual saat waktu shalat tiba
                </span>
              </label>
            </div>

            <div className="pt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={testNotifAndAudio}
                className="px-3.5 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Bell className="w-3.5 h-3.5 text-emerald-500" />
                Uji Coba Notifikasi Jadwal Shalat
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-5 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-500/20 disabled:opacity-70 transition-all flex items-center gap-2"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            {saving ? 'Menyimpan ke DB...' : 'Simpan Pengaturan Jadwal & Lokasi'}
          </button>
        </div>
      </div>
    </div>
  );
};
