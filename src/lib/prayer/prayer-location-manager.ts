import { AppSettings } from '../../types';
import { CITY_COORDINATES, CityCoordinate, getTimezoneFromLon } from './prayer-api';

export interface UserPrayerLocation {
  provinsi: string;
  kabkota: string;
  locationName: string;
  lat: number;
  lon: number;
  timezoneLabel: 'WIB' | 'WITA' | 'WIT';
  timezone: string;
  isGps?: boolean;
  updatedAt?: string;
  // Detail administrative levels requested by user
  kampung?: string;
  subLocality?: string;
  district?: string;
  detailedAddress?: string;
  accuracy?: number;
}

export const USER_PRAYER_LOCATION_KEY = 'koperasi_user_prayer_location';
export const LOCATION_PROMPT_KEY = 'koperasi_prayer_prompt_shown';

export const DEFAULT_BANJARNEGARA_LOCATION: UserPrayerLocation = {
  provinsi: 'Jawa Tengah',
  kabkota: 'Kab. Banjarnegara',
  locationName: 'Semampir, Banjarnegara',
  subLocality: 'Semampir (Serempu)',
  district: 'Kec. Banjarnegara',
  detailedAddress: 'Dusun Serempu, Kel. Semampir, Kec. Banjarnegara, Kab. Banjarnegara, Jawa Tengah',
  lat: -7.3987,
  lon: 109.6974,
  timezoneLabel: 'WIB',
  timezone: 'Asia/Jakarta',
  isGps: false,
};

/**
 * Retrieve the active prayer location for the current device/user.
 * Prioritizes local device GPS/selected location, then falls back to pesantren settings.
 */
export function getActivePrayerLocation(settings?: Partial<AppSettings>): UserPrayerLocation {
  try {
    const raw = localStorage.getItem(USER_PRAYER_LOCATION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.lat !== undefined && parsed.lon !== undefined && parsed.kabkota) {
        return {
          provinsi: parsed.provinsi || 'Jawa Tengah',
          kabkota: parsed.kabkota || 'Kab. Banjarnegara',
          locationName: parsed.locationName || `${parsed.kabkota}, ${parsed.provinsi}`,
          lat: Number(parsed.lat),
          lon: Number(parsed.lon),
          timezoneLabel: parsed.timezoneLabel || 'WIB',
          timezone: parsed.timezone || (parsed.timezoneLabel === 'WIT' ? 'Asia/Jayapura' : parsed.timezoneLabel === 'WITA' ? 'Asia/Makassar' : 'Asia/Jakarta'),
          isGps: Boolean(parsed.isGps),
          updatedAt: parsed.updatedAt,
          kampung: parsed.kampung,
          subLocality: parsed.subLocality,
          district: parsed.district,
          detailedAddress: parsed.detailedAddress,
          accuracy: parsed.accuracy,
        };
      }
    }
  } catch (e) {
    console.warn('Error reading saved user prayer location:', e);
  }

  // Fallback to app settings if available
  if (settings && settings.prayer_lat !== undefined && settings.prayer_lon !== undefined && settings.prayer_kabkota) {
    const tz = getTimezoneFromLon(settings.prayer_lon);
    return {
      provinsi: settings.prayer_provinsi || 'Jawa Tengah',
      kabkota: settings.prayer_kabkota,
      locationName: settings.prayer_location_name || `${settings.prayer_kabkota}, ${settings.prayer_provinsi || 'Jawa Tengah'}`,
      lat: settings.prayer_lat,
      lon: settings.prayer_lon,
      timezoneLabel: (settings.prayer_timezone_label as 'WIB' | 'WITA' | 'WIT') || tz.timezoneLabel,
      timezone: tz.timezone,
      isGps: Boolean(settings.prayer_auto_location),
      detailedAddress: `${settings.prayer_kabkota}, ${settings.prayer_provinsi || 'Jawa Tengah'}`,
    };
  }

  return DEFAULT_BANJARNEGARA_LOCATION;
}

/**
 * Save user's detected/selected prayer location and notify all active watchers.
 */
export function setActivePrayerLocation(loc: UserPrayerLocation) {
  try {
    const payload = {
      ...loc,
      updatedAt: new Date().toISOString(),
    };
    localStorage.setItem(USER_PRAYER_LOCATION_KEY, JSON.stringify(payload));
    // Also mark prompt as answered for this browser
    sessionStorage.setItem(LOCATION_PROMPT_KEY, 'done');
  } catch (e) {
    console.error('Error saving user prayer location:', e);
  }

  // Dispatch custom event to notify all components
  window.dispatchEvent(
    new CustomEvent('koperasi_prayer_location_updated', {
      detail: loc,
    })
  );
}

/**
 * Check if the current user device has already set a prayer location.
 */
export function hasUserPrayerLocation(): boolean {
  try {
    return Boolean(localStorage.getItem(USER_PRAYER_LOCATION_KEY));
  } catch {
    return false;
  }
}

/**
 * Check if the location prompt was already dismissed in the current session.
 */
export function wasLocationPromptShown(): boolean {
  try {
    return sessionStorage.getItem(LOCATION_PROMPT_KEY) === 'done';
  } catch {
    return false;
  }
}

/**
 * Mark location prompt as seen in the current session.
 */
export function markLocationPromptShown() {
  try {
    sessionStorage.setItem(LOCATION_PROMPT_KEY, 'done');
  } catch {}
}
