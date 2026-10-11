import React, { useEffect, useState, useMemo, useRef } from 'react';
import { motion } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { fetchPrayerTimes, getTodayPrayer, reverseGeocodeGPS } from '../../lib/prayer/prayer-api';
import { 
  checkAndTriggerNotifications, 
  getFullPrayerSchedule,
  DetailedPrayerItem,
  getCurrentTimeInLocation,
  capitalize,
} from '../../lib/prayer/prayer-notification';
import { 
  getActivePrayerLocation, 
  setActivePrayerLocation,
  UserPrayerLocation 
} from '../../lib/prayer/prayer-location-manager';
import { 
  searchIndonesianRegions, 
  IndonesianRegion 
} from '../../lib/prayer/indonesia-regions';
import { PrayerSchedule } from '../../types';
import { 
  Clock, 
  MapPin, 
  RefreshCw, 
  Moon, 
  Sunrise, 
  Sun, 
  Sunset, 
  Sparkles,
  Compass,
  Navigation,
  Search,
  X,
  ArrowRight,
  Loader2,
  Check,
  Calendar,
  Info,
} from 'lucide-react';

export const PrayerScheduleCard: React.FC = () => {
  const { settings, updateSettings, showToast } = useApp();
  const [activeLoc, setActiveLoc] = useState<UserPrayerLocation>(() =>
    getActivePrayerLocation(settings)
  );
  const [schedule, setSchedule] = useState<PrayerSchedule | null>(null);
  const [fullItems, setFullItems] = useState<DetailedPrayerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Inline location picker states (langsung di kartu tanpa modal terpisah)
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const pickerRef = useRef<HTMLDivElement>(null);

  // Realtime countdown state
  const tzLabel = schedule?.timezone_label || activeLoc.timezoneLabel || 'WIB';
  const [now, setNow] = useState(getCurrentTimeInLocation(tzLabel));
  
  // Close inline dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setIsPickerOpen(false);
      }
    };
    if (isPickerOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isPickerOpen]);

  // Filtered regions for inline search (strictly search-only, no default template cities)
  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return searchIndonesianRegions(searchQuery).slice(0, 20);
  }, [searchQuery]);

  // Load Schedule
  const loadSchedule = async () => {
    setLoading(true);
    setError(null);
    try {
      const loc = getActivePrayerLocation(settings);
      setActiveLoc(loc);
      const activeTz = loc.timezoneLabel || 'WIB';
      const today = getCurrentTimeInLocation(activeTz);
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      
      const schedules = await fetchPrayerTimes(
        loc.provinsi,
        loc.kabkota,
        month,
        year,
        loc.lat,
        loc.lon
      );
      const todaySchedule = getTodayPrayer(schedules, today);
      
      if (todaySchedule) {
        setSchedule(todaySchedule);
        setFullItems(getFullPrayerSchedule(todaySchedule));
      } else {
        setError('Jadwal hari ini tidak tersedia');
      }
    } catch (err: any) {
      setError(err.message || 'Gagal memuat jadwal shalat');
    } finally {
      setLoading(false);
    }
  };

  // Initial load & settings sync
  useEffect(() => {
    loadSchedule();
  }, [settings.prayer_provinsi, settings.prayer_kabkota]);

  // Listen for location updates
  useEffect(() => {
    const handleLocationUpdate = () => {
      loadSchedule();
    };
    window.addEventListener('koperasi_prayer_location_updated', handleLocationUpdate);
    return () => {
      window.removeEventListener('koperasi_prayer_location_updated', handleLocationUpdate);
    };
  }, []);

  // Clock tick & notification trigger
  useEffect(() => {
    const interval = setInterval(() => {
      const currentTz = schedule?.timezone_label || activeLoc.timezoneLabel || 'WIB';
      const currentTime = getCurrentTimeInLocation(currentTz);
      setNow(currentTime);
      
      // Auto refresh on day change (00:00)
      if (schedule && schedule.tanggal_lengkap) {
        const year = currentTime.getFullYear();
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        const targetDate = `${year}-${month}-${day}`;
        
        if (targetDate !== schedule.tanggal_lengkap) {
          loadSchedule();
        } else {
          setFullItems(getFullPrayerSchedule(schedule));
          checkAndTriggerNotifications(schedule, settings);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [schedule, settings, activeLoc]);

  // 1-Click Direct GPS Detection (Izinkan Lokasi GPS langsung di halaman awal)
  const handleDirectGps = () => {
    if (!('geolocation' in navigator)) {
      showToast('error', 'GPS Tidak Didukung', 'Browser Anda tidak mendukung geolokasi.');
      return;
    }

    setIsDetectingGps(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude, accuracy } = pos.coords;
          const loc = await reverseGeocodeGPS(latitude, longitude);

          const newLoc: UserPrayerLocation = {
            provinsi: loc.provinsi,
            kabkota: loc.kabkota,
            locationName: loc.detailedAddress || loc.locationName,
            lat: latitude,
            lon: longitude,
            timezoneLabel: loc.timezoneLabel,
            timezone: loc.timezone,
            isGps: true,
            kampung: loc.kampung,
            subLocality: loc.subLocality,
            district: loc.district,
            detailedAddress: loc.detailedAddress,
            accuracy: Math.round(accuracy),
          };

          setActivePrayerLocation(newLoc);
          setActiveLoc(newLoc);

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
            'GPS Berhasil Terdeteksi',
            `Wilayah shalat disinkronkan ke ${loc.kabkota} (${loc.timezoneLabel}).`
          );

          setIsPickerOpen(false);
          loadSchedule();
        } catch (e: any) {
          showToast('error', 'Gagal Deteksi GPS', e.message || 'Gagal memproses titik koordinat.');
        } finally {
          setIsDetectingGps(false);
        }
      },
      (err) => {
        setIsDetectingGps(false);
        showToast(
          'error',
          'Izin Lokasi Ditolak',
          err.code === 1
            ? 'Izin lokasi GPS ditolak oleh browser. Silakan ketik nama kota langsung di kolom pencarian.'
            : 'Sinyal GPS tidak terdeteksi. Silakan ketik nama kota.'
        );
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  // Direct region selection from inline dropdown (misal: Tasikmalaya)
  const handleSelectRegion = async (region: IndonesianRegion) => {
    try {
      const newLoc: UserPrayerLocation = {
        provinsi: region.provinsi,
        kabkota: region.kabkota,
        locationName: `${region.kabkota}, ${region.provinsi}`,
        lat: region.lat,
        lon: region.lon,
        timezoneLabel: region.timezoneLabel,
        timezone: region.timezone,
        isGps: false,
        detailedAddress: `${region.kabkota}, Provinsi ${region.provinsi}, Indonesia`,
      };

      setActivePrayerLocation(newLoc);
      setActiveLoc(newLoc);

      await updateSettings({
        ...settings,
        prayer_provinsi: region.provinsi,
        prayer_kabkota: region.kabkota,
        prayer_lat: region.lat,
        prayer_lon: region.lon,
        prayer_location_name: `${region.kabkota}, ${region.provinsi}`,
        prayer_timezone_label: region.timezoneLabel,
        prayer_auto_location: false,
      });

      window.dispatchEvent(new Event('koperasi_prayer_location_updated'));

      showToast(
        'success',
        'Wilayah Diperbarui',
        `Jadwal shalat kini aktif untuk ${region.kabkota} (${region.timezoneLabel}).`
      );

      setIsPickerOpen(false);
      loadSchedule();
    } catch (e: any) {
      showToast('error', 'Gagal Memperbarui Lokasi', e.message || 'Terjadi kesalahan.');
    }
  };

  const nextPrayer = fullItems.find(s => s.isNext);
  
  // Format Countdown
  const countdownText = useMemo(() => {
    if (!nextPrayer) return 'Selesai hari ini';
    
    const diffMs = nextPrayer.dateObj.getTime() - now.getTime();
    if (diffMs <= 0) return 'Masuk Waktu';
    
    const hours = Math.floor(diffMs / 3600000);
    const mins = Math.floor((diffMs % 3600000) / 60000);
    const secs = Math.floor((diffMs % 60000) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }, [nextPrayer, now]);

  // Aesthetic color & icon theme per prayer event (8 Waktu Lengkap Standar Kemenag RI)
  const getPrayerTheme = (id: string, active: boolean) => {
    switch (id) {
      case 'imsak':
        return {
          icon: <Moon className="w-4 h-4 text-amber-400" />,
          iconBg: 'bg-amber-500/20 text-amber-400',
          titleColor: active ? 'text-amber-300 font-black' : 'text-amber-200 font-bold',
          timeColor: active ? 'text-amber-300 font-black' : 'text-amber-100 font-extrabold',
          badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          borderClass: active 
            ? 'border-amber-400 ring-2 ring-amber-400/50 bg-gradient-to-b from-amber-950/70 to-slate-900 shadow-lg shadow-amber-950/40' 
            : 'border-slate-800/90 bg-slate-900/90 hover:border-amber-500/50',
          dotColor: 'bg-amber-400',
        };
      case 'subuh':
        return {
          icon: <Sunrise className="w-4 h-4 text-sky-400" />,
          iconBg: 'bg-sky-500/20 text-sky-400',
          titleColor: active ? 'text-sky-300 font-black' : 'text-sky-200 font-bold',
          timeColor: active ? 'text-sky-300 font-black' : 'text-sky-100 font-extrabold',
          badgeClass: 'bg-sky-500/20 text-sky-300 border-sky-500/40',
          borderClass: active 
            ? 'border-sky-400 ring-2 ring-sky-400/50 bg-gradient-to-b from-sky-950/70 to-slate-900 shadow-lg shadow-sky-950/40' 
            : 'border-slate-800/90 bg-slate-900/90 hover:border-sky-500/50',
          dotColor: 'bg-sky-400',
        };
      case 'terbit':
        return {
          icon: <Sun className="w-4 h-4 text-orange-400" />,
          iconBg: 'bg-orange-500/20 text-orange-400',
          titleColor: active ? 'text-orange-300 font-black' : 'text-orange-200 font-bold',
          timeColor: active ? 'text-orange-300 font-black' : 'text-orange-100 font-extrabold',
          badgeClass: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
          borderClass: active 
            ? 'border-orange-400 ring-2 ring-orange-400/50 bg-gradient-to-b from-orange-950/70 to-slate-900 shadow-lg shadow-orange-950/40' 
            : 'border-slate-800/90 bg-slate-900/90 hover:border-orange-500/50',
          dotColor: 'bg-orange-400',
        };
      case 'dhuha':
        return {
          icon: <Sparkles className="w-4 h-4 text-yellow-400" />,
          iconBg: 'bg-yellow-500/20 text-yellow-400',
          titleColor: active ? 'text-yellow-300 font-black' : 'text-yellow-200 font-bold',
          timeColor: active ? 'text-yellow-300 font-black' : 'text-yellow-100 font-extrabold',
          badgeClass: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/40',
          borderClass: active 
            ? 'border-yellow-400 ring-2 ring-yellow-400/50 bg-gradient-to-b from-yellow-950/70 to-slate-900 shadow-lg shadow-yellow-950/40' 
            : 'border-slate-800/90 bg-slate-900/90 hover:border-yellow-500/50',
          dotColor: 'bg-yellow-400',
        };
      case 'dzuhur':
        return {
          icon: <Sun className="w-4 h-4 text-cyan-400" />,
          iconBg: 'bg-cyan-500/20 text-cyan-400',
          titleColor: active ? 'text-cyan-300 font-black' : 'text-cyan-200 font-bold',
          timeColor: active ? 'text-cyan-300 font-black' : 'text-cyan-100 font-extrabold',
          badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40',
          borderClass: active 
            ? 'border-cyan-400 ring-2 ring-cyan-400/50 bg-gradient-to-b from-cyan-950/70 to-slate-900 shadow-lg shadow-cyan-950/40' 
            : 'border-slate-800/90 bg-slate-900/90 hover:border-cyan-500/50',
          dotColor: 'bg-cyan-400',
        };
      case 'ashar':
        return {
          icon: <Sun className="w-4 h-4 text-teal-400" />,
          iconBg: 'bg-teal-500/20 text-teal-400',
          titleColor: active ? 'text-teal-300 font-black' : 'text-teal-200 font-bold',
          timeColor: active ? 'text-teal-300 font-black' : 'text-teal-100 font-extrabold',
          badgeClass: 'bg-teal-500/20 text-teal-300 border-teal-500/40',
          borderClass: active 
            ? 'border-teal-400 ring-2 ring-teal-400/50 bg-gradient-to-b from-teal-950/70 to-slate-900 shadow-lg shadow-teal-950/40' 
            : 'border-slate-800/90 bg-slate-900/90 hover:border-teal-500/50',
          dotColor: 'bg-teal-400',
        };
      case 'maghrib':
        return {
          icon: <Sunset className="w-4 h-4 text-rose-400" />,
          iconBg: 'bg-rose-500/20 text-rose-400',
          titleColor: active ? 'text-rose-300 font-black' : 'text-rose-200 font-bold',
          timeColor: active ? 'text-rose-300 font-black' : 'text-rose-100 font-extrabold',
          badgeClass: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          borderClass: active 
            ? 'border-rose-400 ring-2 ring-rose-400/50 bg-gradient-to-b from-rose-950/70 to-slate-900 shadow-lg shadow-rose-950/40' 
            : 'border-slate-800/90 bg-slate-900/90 hover:border-rose-500/50',
          dotColor: 'bg-rose-400',
        };
      case 'isya':
        return {
          icon: <Moon className="w-4 h-4 text-indigo-400" />,
          iconBg: 'bg-indigo-500/20 text-indigo-400',
          titleColor: active ? 'text-indigo-300 font-black' : 'text-indigo-200 font-bold',
          timeColor: active ? 'text-indigo-300 font-black' : 'text-indigo-100 font-extrabold',
          badgeClass: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40',
          borderClass: active 
            ? 'border-indigo-400 ring-2 ring-indigo-400/50 bg-gradient-to-b from-indigo-950/70 to-slate-900 shadow-lg shadow-indigo-950/40' 
            : 'border-slate-800/90 bg-slate-900/90 hover:border-indigo-500/50',
          dotColor: 'bg-indigo-400',
        };
      default:
        return {
          icon: <Clock className="w-4 h-4 text-slate-400" />,
          iconBg: 'bg-slate-700/50 text-slate-300',
          titleColor: 'text-white',
          timeColor: 'text-white',
          badgeClass: 'bg-slate-700 text-slate-300 border-slate-600',
          borderClass: 'border-slate-800 bg-slate-900/90',
          dotColor: 'bg-slate-400',
        };
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex items-center justify-center min-h-[220px]">
        <div className="flex flex-col items-center gap-2 text-sky-400">
          <RefreshCw className="w-6 h-6 animate-spin" />
          <p className="text-xs sm:text-sm font-bold text-slate-300">Memuat jadwal shalat real-time...</p>
        </div>
      </div>
    );
  }

  if (error || !schedule) {
    return (
      <div className="bg-slate-900 rounded-3xl border border-slate-800 p-6 shadow-xl flex flex-col items-center justify-center min-h-[220px] gap-3 text-center">
        <p className="text-xs sm:text-sm font-medium text-slate-400">{error || 'Jadwal shalat belum tersedia.'}</p>
        <button 
          onClick={loadSchedule}
          className="px-4 py-2 rounded-xl bg-sky-500/20 text-sky-300 hover:bg-sky-500/30 font-bold text-xs transition-colors cursor-pointer"
        >
          Muat Ulang
        </button>
      </div>
    );
  }

  return (
    <div className="bg-slate-900 rounded-3xl border border-slate-800/90 p-4 sm:p-6 shadow-2xl relative overflow-visible flex flex-col h-full text-white space-y-4">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Clock className="w-36 h-36 text-sky-400" />
      </div>

      {/* Header: Title & Direct Location / GPS Controls (Langsung di Halaman Awal, Bersih Tanpa Icon Notif Ganda) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-20 pb-1 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0 shadow-xs shadow-emerald-400" />
            <h2 className="text-white font-black uppercase tracking-wider text-xs sm:text-sm flex items-center gap-1.5">
              <span>Jadwal Shalat Standar Kemenag RI</span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                8 Waktu Lengkap
              </span>
            </h2>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5 flex items-center gap-1.5">
            <Calendar className="w-3 h-3 text-slate-500" />
            <span>{schedule.hari}, {schedule.tanggal_lengkap}</span>
            <span className="text-slate-600">•</span>
            <span className="text-emerald-400/90 font-medium">{activeLoc.kabkota} ({activeLoc.timezoneLabel})</span>
          </p>
        </div>

        {/* Header Actions: Tombol Izinkan GPS & Pemilih Kota Dropdown Langsung di Kartu */}
        <div className="flex items-center gap-2 flex-wrap relative" ref={pickerRef}>
          {/* Button Tembak Izinkan Lokasi GPS Otomatis */}
          <button
            type="button"
            onClick={handleDirectGps}
            disabled={isDetectingGps}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500/20 to-cyan-500/20 hover:from-sky-500/30 hover:to-cyan-500/30 text-sky-300 hover:text-white border border-sky-500/40 transition-all cursor-pointer shadow-xs active:scale-95 disabled:opacity-60 text-xs font-bold"
            title="Tembak langsung izinkan lokasi GPS perangkat Anda"
          >
            {isDetectingGps ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-400" />
            ) : (
              <Navigation className="w-3.5 h-3.5 fill-sky-400 text-sky-400" />
            )}
            <span>{isDetectingGps ? 'Mendeteksi...' : 'Izinkan GPS'}</span>
          </button>

          {/* Button Pilih / Cari Kota (Ketik Nama Daerah Langsung di Kartu) */}
          <button
            type="button"
            onClick={() => setIsPickerOpen((prev) => !prev)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white border border-slate-700 hover:border-sky-500/60 shadow-xs transition-all cursor-pointer group active:scale-95 text-left"
            title="Klik untuk ketik atau pilih kabupaten/kota se-Indonesia"
          >
            <div className="w-5 h-5 rounded-lg bg-sky-500/20 flex items-center justify-center text-sky-400 group-hover:scale-110 transition-transform shrink-0">
              <MapPin className="w-3 h-3" />
            </div>
            <div className="truncate max-w-[130px] sm:max-w-[180px]">
              <span className="block text-[11px] font-extrabold truncate text-white group-hover:text-sky-300">
                {activeLoc.locationName}
              </span>
            </div>
            <span className="px-1.5 py-0.5 bg-sky-500/20 text-sky-300 rounded font-mono font-bold text-[9px] shrink-0">
              {activeLoc.timezoneLabel}
            </span>
          </button>

          {/* INLINE SEARCH & SELECTION DROPDOWN (Langsung nempel di kartu tanpa modal terpisah) */}
          {isPickerOpen && (
            <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700/90 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150 text-white space-y-2.5">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Search className="w-3.5 h-3.5 text-sky-400" />
                  <span>Ketik Nama Kota / Kabupaten:</span>
                </span>
                <button
                  type="button"
                  onClick={() => setIsPickerOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Input Pencarian Langsung */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-3 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik kota... (contoh: Tasikmalaya)"
                  className="w-full pl-8 pr-8 py-2 bg-slate-800 border border-slate-700 focus:border-sky-500 rounded-xl text-xs text-white placeholder:text-slate-400 focus:outline-none transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Hasil Pencarian Real-Time (Hanya muncul saat user mengetik) */}
              <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                {!searchQuery.trim() ? (
                  <div className="py-5 px-3 text-center rounded-xl bg-slate-800/40 border border-dashed border-slate-750 text-slate-400">
                    <Search className="w-4 h-4 mx-auto mb-1.5 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-300">
                      Mulai ketik nama daerah
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Contoh: <span className="text-sky-400 font-medium">Tasikmalaya</span>, <span className="text-sky-400 font-medium">Bandung</span>, <span className="text-sky-400 font-medium">Surabaya</span>
                    </p>
                  </div>
                ) : filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => {
                    const isCurrent =
                      activeLoc.kabkota.toLowerCase() === region.kabkota.toLowerCase();
                    const isKota = region.kabkota.toLowerCase().startsWith('kota');

                    return (
                      <div
                        key={region.id}
                        onClick={() => handleSelectRegion(region)}
                        className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-left ${
                          isCurrent
                            ? 'bg-sky-950/80 border-sky-400 text-white shadow-xs'
                            : 'bg-slate-850 hover:bg-slate-800 border-slate-800 hover:border-sky-500/50 text-slate-200 hover:text-white'
                        }`}
                      >
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-xs truncate">
                              {region.kabkota}
                            </span>
                            <span className={`text-[9px] font-bold px-1 py-0.2 rounded ${
                              isKota ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                            }`}>
                              {isKota ? 'Kota' : 'Kab'}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 truncate mt-0.5">
                            {region.provinsi}
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <span className="px-1.5 py-0.2 rounded font-mono font-bold text-[9px] bg-slate-800 text-sky-300 border border-slate-700">
                            {region.timezoneLabel}
                          </span>
                          {isCurrent ? (
                            <Check className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                          ) : (
                            <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-sky-400 shrink-0" />
                          )}
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-4 rounded-xl bg-slate-850 text-center text-[11px] text-slate-400">
                    Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;. Coba periksa ejaan nama kota/kabupaten.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Next Prayer Highlight Card */}
      <div className="bg-gradient-to-r from-slate-850 via-indigo-950/40 to-slate-850 rounded-2xl p-3.5 sm:p-4 border border-indigo-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-sky-400 shrink-0 shadow-md">
            <Compass className="w-5 h-5 animate-spin-slow text-sky-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/20 text-sky-300 font-mono">
                Waktu Shalat Berikutnya
              </span>
              {nextPrayer && (
                <span className="text-[11px] font-bold text-amber-300">
                  {nextPrayer.badge}
                </span>
              )}
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white mt-0.5 tracking-wide">
              {nextPrayer ? capitalize(nextPrayer.label) : 'Waktu Shalat Hari Ini Selesai'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-center">
          {nextPrayer && (
            <div className="text-right">
              <span className="text-xl sm:text-2xl font-mono font-black text-sky-300">
                {nextPrayer.time}
              </span>
              <span className="text-[10px] text-slate-400 block font-medium">
                {activeLoc.timezoneLabel}
              </span>
            </div>
          )}
          <div className="px-3.5 py-1.5 rounded-xl bg-slate-950 border border-slate-700 text-center shadow-inner">
            <span className="text-[10px] text-slate-400 block uppercase font-bold tracking-wider">
              Hitung Mundur
            </span>
            <span className="text-xs sm:text-sm font-mono font-black text-amber-300">
              {countdownText}
            </span>
          </div>
        </div>
      </div>

      {/* Tata Letak Rapi: 8 Waktu Lengkap Standar Kemenag RI */}
      <div className="space-y-2 relative z-10">
        <div className="flex items-center justify-between px-0.5">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-slate-300">
              Tata Letak 8 Waktu Shalat Standar Kemenag RI
            </span>
            <span className="hidden sm:inline-block text-[10px] text-amber-300 font-bold bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded-full">
              Imsakiah &amp; Sahur Aktif
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Zona Waktu: <strong className="text-white font-mono">{activeLoc.timezoneLabel}</strong>
          </span>
        </div>

        {/* Responsive Grid: 2 Kolom di Mobile, 4 Kolom di Tablet, 8 Kolom Lengkap di Desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 xl:grid-cols-8 gap-2.5 sm:gap-3">
          {fullItems.map((item) => {
            const active = item.isNext;
            const theme = getPrayerTheme(item.id, active);

            return (
              <motion.div
                key={item.id}
                whileHover={{ y: -3, scale: 1.02 }}
                transition={{ duration: 0.2 }}
                className={`p-3 rounded-2xl border transition-all flex flex-col justify-between shadow-xs cursor-default ${
                  item.passed
                    ? 'opacity-60 bg-slate-850/60 border-slate-800 text-slate-400'
                    : theme.borderClass
                }`}
              >
                {/* Header Tiap Kartu: Icon, Nama Waktu & Badge */}
                <div className="flex items-center justify-between gap-1 mb-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div className={`p-1 rounded-lg ${theme.iconBg} shrink-0`}>
                      {theme.icon}
                    </div>
                    <span className={`text-xs sm:text-sm truncate ${theme.titleColor}`}>
                      {item.label}
                    </span>
                  </div>
                  <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase border shrink-0 ${theme.badgeClass}`}>
                    {item.badge}
                  </span>
                </div>

                {/* Jam Waktu Shalat Real-Time */}
                <div className="my-1">
                  <span className={`font-mono text-base sm:text-lg xl:text-xl block tracking-tight ${theme.timeColor}`}>
                    {item.time}
                  </span>
                </div>

                {/* Status Indikator di Bagian Bawah Kartu */}
                <div className="flex items-center justify-between pt-1.5 border-t border-slate-800/80 mt-1 text-[10px]">
                  {active ? (
                    <span className="font-bold text-amber-300 flex items-center gap-1 animate-pulse">
                      <span className={`w-1.5 h-1.5 rounded-full ${theme.dotColor}`} />
                      Mendekat
                    </span>
                  ) : item.passed ? (
                    <span className="text-slate-400 font-semibold flex items-center gap-0.5">
                      <Check className="w-3 h-3 text-emerald-500/80" />
                      Lewat
                    </span>
                  ) : (
                    <span className="text-slate-400 font-medium">
                      ○ Menunggu
                    </span>
                  )}
                  <span className="font-mono text-[9px] text-slate-400 uppercase">
                    {activeLoc.timezoneLabel}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Info Footnote Resmi Standar Kemenag RI */}
      <div className="pt-2 border-t border-slate-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-400 relative z-10">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
          <span>
            Standar hisab Kemenag RI (Bimas Islam). Sudut Subuh 20°, Isya 18°, Imsak 10 mnt sebelum Subuh.
          </span>
        </div>
        <div className="text-[10px] text-slate-400">
          Otomatis sinkron ke 517 kota se-Indonesia
        </div>
      </div>
    </div>
  );
};
