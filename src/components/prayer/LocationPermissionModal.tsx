import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { reverseGeocodeGPS } from '../../lib/prayer/prayer-api';
import {
  getActivePrayerLocation,
  setActivePrayerLocation,
  UserPrayerLocation,
} from '../../lib/prayer/prayer-location-manager';
import {
  searchIndonesianRegions,
  IndonesianRegion,
} from '../../lib/prayer/indonesia-regions';
import {
  MapPin,
  Compass,
  X,
  Loader2,
  Navigation,
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Search,
  Sparkles,
  Map,
} from 'lucide-react';

interface LocationPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
}

export const LocationPermissionModal: React.FC<LocationPermissionModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
}) => {
  const { settings, updateSettings, showToast } = useApp();

  // GPS Detection State
  const [isDetecting, setIsDetecting] = useState(false);
  const [gpsErrorMsg, setGpsErrorMsg] = useState<string | null>(null);

  // Current active location from app/device
  const [currentActiveLoc, setCurrentActiveLoc] = useState<UserPrayerLocation>(() =>
    getActivePrayerLocation(settings)
  );

  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [isApplying, setIsApplying] = useState(false);

  // Filtered regions based on search (strictly search-only, no default template cities)
  const filteredRegions = useMemo(() => {
    if (!searchQuery.trim()) {
      return [];
    }
    return searchIndonesianRegions(searchQuery).slice(0, 25);
  }, [searchQuery]);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Sync state on open
  useEffect(() => {
    if (isOpen) {
      const loc = getActivePrayerLocation(settings);
      setCurrentActiveLoc(loc);
      setGpsErrorMsg(null);
      setSearchQuery('');
    }
  }, [isOpen, settings]);

  if (!isOpen) return null;

  // Real-time GPS detection with high accuracy
  const handleDetectGPS = () => {
    setGpsErrorMsg(null);
    if (!('geolocation' in navigator)) {
      setGpsErrorMsg('Perangkat Anda tidak mendukung fitur Geolocation GPS.');
      return;
    }

    setIsDetecting(true);
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

          // Save to local device store & notify listeners
          setActivePrayerLocation(newLoc);
          setCurrentActiveLoc(newLoc);

          // Update app settings state
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

          // Trigger custom event so watchers reload schedule immediately
          window.dispatchEvent(new Event('koperasi_prayer_location_updated'));

          showToast(
            'success',
            'GPS Berhasil Terdeteksi',
            `Wilayah shalat berhasil disinkronkan ke ${loc.kabkota} (${loc.timezoneLabel}).`
          );

          onClose();
        } catch (e: any) {
          setGpsErrorMsg(e.message || 'Gagal memproses titik koordinat lokasi.');
        } finally {
          setIsDetecting(false);
        }
      },
      (err) => {
        setIsDetecting(false);
        if (err.code === 1) {
          setGpsErrorMsg(
            'Izin lokasi GPS ditolak oleh browser/perangkat. Silakan aktifkan izin lokasi di ikon gembok browser atau ketik nama kota Anda di kolom pencarian di bawah.'
          );
        } else {
          setGpsErrorMsg(`Gagal mendeteksi sinyal GPS: ${err.message}. Silakan ketik nama kota di bawah.`);
        }
      },
      { timeout: 12000, enableHighAccuracy: true }
    );
  };

  // Apply selected Indonesian Region as active prayer location
  const handleApplyRegion = async (region: IndonesianRegion) => {
    setIsApplying(true);
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

      // Save to local device storage and notify
      setActivePrayerLocation(newLoc);
      setCurrentActiveLoc(newLoc);

      // Also persist to settings
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

      // Notify GlobalPrayerWatcher and card immediately
      window.dispatchEvent(new Event('koperasi_prayer_location_updated'));

      showToast(
        'success',
        'Wilayah Shalat Diperbarui',
        `Jadwal waktu shalat kini aktif untuk ${region.kabkota}, ${region.provinsi} (${region.timezoneLabel}).`
      );

      onClose();
    } catch (e: any) {
      showToast('error', 'Gagal Mengubah Lokasi', e.message || 'Terjadi kesalahan.');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-xl animate-in fade-in duration-200"
    >
      {/* Full-screen container on mobile, expansive centered frame on desktop */}
      <div className="w-full h-full sm:h-auto sm:max-h-[92vh] sm:max-w-2xl bg-slate-900 border-0 sm:border sm:border-slate-800 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden text-white relative">
        {/* Top Navigation Bar with Back Button */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3">
            {/* Tombol Kembali yang Jelas */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold text-xs sm:text-sm border border-slate-700 transition-all cursor-pointer shadow-xs shrink-0"
              title="Kembali ke halaman utama"
            >
              <ArrowLeft className="w-4 h-4 text-sky-400" />
              <span>Kembali</span>
            </button>

            <div>
              <h3 className="font-black text-sm sm:text-base text-white leading-tight flex items-center gap-2">
                <span>{title || 'Pilih Lokasi & Jadwal Shalat'}</span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-full bg-sky-500/10 border border-sky-500/30 text-sky-300 font-mono text-[10px]">
                  Real-Time
                </span>
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-400 truncate max-w-[220px] sm:max-w-md">
                {subtitle || 'Sinkronkan jadwal shalat otomatis sesuai wilayah Anda'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
            title="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* Active Location Info Pill */}
          <div className="flex items-center justify-between gap-2 p-3 rounded-2xl bg-slate-800/60 border border-slate-700/60 text-xs">
            <div className="flex items-center gap-2 truncate">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <span className="text-slate-400">Wilayah Aktif:</span>
              <span className="font-bold text-white truncate">{currentActiveLoc.locationName}</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-sky-500/20 border border-sky-500/30 text-sky-300 font-mono font-bold text-[10px] shrink-0">
              {currentActiveLoc.timezoneLabel}
            </span>
          </div>

          {/* SECTION 1: Izinkan Lokasi Saya (GPS Otomatis) with Aesthetic Gradient */}
          <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-br from-indigo-950/70 via-slate-850 to-slate-900 border border-indigo-500/40 shadow-lg shadow-indigo-950/40 flex flex-col sm:flex-row items-center sm:items-start gap-4 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-indigo-500/20 border border-indigo-400/50 flex items-center justify-center text-sky-400 shadow-md shadow-indigo-500/20 shrink-0">
              <Compass className="w-8 h-8 text-sky-400 animate-spin-slow" />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h4 className="font-black text-base sm:text-lg text-white">
                  Izinkan Lokasi Saya (GPS Otomatis)
                </h4>
                <span className="px-1.5 py-0.5 bg-sky-500/20 border border-sky-500/30 text-sky-300 text-[10px] font-bold rounded">
                  Presisi
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Deteksi otomatis titik koordinat GPS perangkat Anda untuk melihat jadwal shalat 100% presisi secara real-time di manapun Anda berada.
              </p>

              {gpsErrorMsg && (
                <div className="mt-2.5 p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-200 text-xs text-left flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{gpsErrorMsg}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleDetectGPS}
                  disabled={isDetecting}
                  className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 active:scale-95 text-slate-950 font-black text-xs sm:text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-sky-950 transition-all cursor-pointer disabled:opacity-60"
                >
                  {isDetecting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Mendeteksi Koordinat GPS...</span>
                    </>
                  ) : (
                    <>
                      <Navigation className="w-4 h-4 fill-slate-950" />
                      <span>Tembak Izinkan Lokasi Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-800"></div>
            <span className="flex-shrink mx-3 text-[11px] font-extrabold uppercase tracking-widest text-slate-400 bg-slate-900 px-2">
              Atau Cari Kota / Kabupaten di Indonesia
            </span>
            <div className="flex-grow border-t border-slate-800"></div>
          </div>

          {/* SECTION 2: Search Input & Results (Tanpa Template Chips!) */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Ketik nama daerah untuk melihat jadwal sholat di daerah Anda:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ketik nama kota atau kabupaten... (contoh: Tasikmalaya)"
                  className="w-full pl-10 pr-10 py-3 bg-slate-800 border-2 border-slate-700 focus:border-sky-500 rounded-2xl text-sm text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all font-medium"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    title="Hapus pencarian"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Instant Search Results List */}
            <div className="space-y-2 pt-1">
              {searchQuery.trim() && (
                <div className="flex items-center justify-between text-xs text-slate-400 font-bold px-1">
                  <span>
                    Hasil Pencarian ({filteredRegions.length} wilayah):
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Total 514+ Kabupaten/Kota
                  </span>
                </div>
              )}

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {!searchQuery.trim() ? (
                  <div className="py-8 px-4 text-center rounded-2xl bg-slate-800/40 border border-dashed border-slate-750 text-slate-400">
                    <Search className="w-6 h-6 mx-auto mb-2 text-slate-500" />
                    <p className="text-sm font-semibold text-slate-300">
                      Mulai ketik nama kabupaten atau kota
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      Daftar daerah akan muncul otomatis saat Anda mengetik (contoh: <span className="text-sky-400 font-medium">Tasikmalaya</span>, <span className="text-sky-400 font-medium">Bandung</span>, dll.)
                    </p>
                  </div>
                ) : filteredRegions.length > 0 ? (
                  filteredRegions.map((region) => {
                    const isCurrent =
                      currentActiveLoc.kabkota.toLowerCase() === region.kabkota.toLowerCase();
                    const isKota = region.kabkota.toLowerCase().startsWith('kota');

                    return (
                      <div
                        key={region.id}
                        onClick={() => handleApplyRegion(region)}
                        className={`p-3 sm:p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          isCurrent
                            ? 'bg-sky-950/70 border-sky-400 text-white shadow-md shadow-sky-950 ring-1 ring-sky-400/50'
                            : 'bg-slate-800/80 hover:bg-slate-800 border-slate-700/80 hover:border-sky-500/60 text-slate-200 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3 truncate">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                              isCurrent
                                ? 'bg-sky-500 text-slate-950 font-bold'
                                : isKota
                                ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                            }`}
                          >
                            <MapPin className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <h5 className="font-extrabold text-sm sm:text-base text-white truncate flex items-center gap-2">
                              <span>{region.kabkota}</span>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                                isKota ? 'bg-cyan-500/20 text-cyan-300' : 'bg-amber-500/20 text-amber-300'
                              }`}>
                                {isKota ? 'Kota' : 'Kabupaten'}
                              </span>
                            </h5>
                            <p className="text-xs text-slate-400 truncate mt-0.5">
                              Provinsi {region.provinsi}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className={`px-2 py-0.5 rounded-md font-mono font-bold text-[10px] ${
                            region.timezoneLabel === 'WIB'
                              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                              : region.timezoneLabel === 'WITA'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                          }`}>
                            {region.timezoneLabel}
                          </span>
                          <span className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-black text-xs flex items-center gap-1 transition-all shadow-xs">
                            <span>Pilih</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 text-center text-xs text-slate-400 space-y-1">
                    <p className="font-bold text-slate-300">
                      Tidak ditemukan hasil untuk &quot;{searchQuery}&quot;
                    </p>
                    <p>
                      Pastikan ejaan benar, contoh: &quot;Tasikmalaya&quot;, &quot;Bandung&quot;, atau &quot;Banjarnegara&quot;.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
