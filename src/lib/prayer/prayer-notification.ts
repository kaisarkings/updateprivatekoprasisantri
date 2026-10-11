import { AppSettings, PrayerSchedule } from '../../types';
import { getActivePrayerLocation } from './prayer-location-manager';

export const PRAYER_EVENT = 'koperasi:prayer_notif';
export const PRAYER_BANNER_EVENT = 'koperasi:prayer_banner';

export interface PrayerEventDetail {
  title: string;
  message: string;
}

export interface PrayerBannerDetail {
  type: 'prep' | 'adzan';
  prayerName: string;
  time: string;
  title: string;
  message: string;
  location: string;
}

export const PRAYER_NAMES = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'] as const;
export type PrayerName = typeof PRAYER_NAMES[number];

const NOTIFIED_KEY = 'koperasi_prayer_notified';

export interface PrayerStatus {
  name: PrayerName;
  time: string; // HH:mm
  passed: boolean;
  isNext: boolean;
  dateObj: Date;
}

export function getCurrentTimeInLocation(tzLabel?: string): Date {
  let targetTz = 'Asia/Jakarta';
  if (tzLabel === 'WIT') {
    targetTz = 'Asia/Jayapura';
  } else if (tzLabel === 'WITA') {
    targetTz = 'Asia/Makassar';
  } else {
    targetTz = 'Asia/Jakarta';
  }
  try {
    const str = new Date().toLocaleString('en-US', { timeZone: targetTz });
    return new Date(str);
  } catch {
    return new Date();
  }
}

export function getCurrentTimeInJakarta(tzLabel?: string): Date {
  return getCurrentTimeInLocation(tzLabel);
}

export function parsePrayerTime(dateStr: string, timeStr: string, tzLabel?: string): Date {
  const [year, month, day] = dateStr.split('-');
  const [hours, minutes] = timeStr.split(':');

  const date = getCurrentTimeInLocation(tzLabel);
  date.setFullYear(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10));
  date.setHours(parseInt(hours, 10), parseInt(minutes, 10), 0, 0);
  return date;
}

export function getPrayerStatuses(schedule: PrayerSchedule): PrayerStatus[] {
  const now = getCurrentTimeInLocation(schedule.timezone_label);

  const statuses: PrayerStatus[] = PRAYER_NAMES.map((name) => {
    const timeStr = schedule[name];
    const dateObj = parsePrayerTime(schedule.tanggal_lengkap, timeStr, schedule.timezone_label);
    return {
      name,
      time: timeStr,
      passed: now.getTime() >= dateObj.getTime(),
      isNext: false,
      dateObj,
    };
  });

  // Find the next one
  const nextPrayerIndex = statuses.findIndex((s) => !s.passed);
  if (nextPrayerIndex !== -1) {
    statuses[nextPrayerIndex].isNext = true;
  }

  return statuses;
}

export interface DetailedPrayerItem {
  id: string;
  name: string;
  label: string;
  time: string;
  badge: string;
  category: 'imsak' | 'sholat' | 'syuruq' | 'dhuha';
  passed: boolean;
  isNext: boolean;
  dateObj: Date;
}

export function getFullPrayerSchedule(schedule: PrayerSchedule): DetailedPrayerItem[] {
  const now = getCurrentTimeInLocation(schedule.timezone_label);

  const itemsConfig: Array<{
    id: string;
    name: string;
    label: string;
    timeKey: keyof PrayerSchedule;
    badge: string;
    category: 'imsak' | 'sholat' | 'syuruq' | 'dhuha';
  }> = [
    { id: 'imsak', name: 'imsak', label: 'Imsak', timeKey: 'imsak', badge: 'Batas Sahur', category: 'imsak' },
    { id: 'subuh', name: 'subuh', label: 'Subuh', timeKey: 'subuh', badge: 'Fardhu', category: 'sholat' },
    { id: 'terbit', name: 'terbit', label: 'Terbit', timeKey: 'terbit', badge: 'Syuruq', category: 'syuruq' },
    { id: 'dhuha', name: 'dhuha', label: 'Dhuha', timeKey: 'dhuha', badge: 'Sunnah', category: 'dhuha' },
    { id: 'dzuhur', name: 'dzuhur', label: 'Dzuhur', timeKey: 'dzuhur', badge: 'Fardhu', category: 'sholat' },
    { id: 'ashar', name: 'ashar', label: 'Ashar', timeKey: 'ashar', badge: 'Fardhu', category: 'sholat' },
    { id: 'maghrib', name: 'maghrib', label: 'Maghrib', timeKey: 'maghrib', badge: 'Buka Puasa', category: 'sholat' },
    { id: 'isya', name: 'isya', label: 'Isya', timeKey: 'isya', badge: 'Fardhu', category: 'sholat' },
  ];

  const fullItems: DetailedPrayerItem[] = itemsConfig.map((cfg) => {
    let timeStr = (schedule[cfg.timeKey] as string) || '00:00';
    if (cfg.id === 'imsak' && (!timeStr || timeStr === '00:00')) {
      const [sh, sm] = (schedule.subuh || '04:30').split(':').map((n) => parseInt(n, 10) || 0);
      let totalMins = sh * 60 + sm - 10;
      if (totalMins < 0) totalMins += 24 * 60;
      timeStr = `${String(Math.floor(totalMins / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
    }
    if (cfg.id === 'dhuha' && (!timeStr || timeStr === '00:00')) {
      const [th, tm] = (schedule.terbit || '05:45').split(':').map((n) => parseInt(n, 10) || 0);
      const totalMins = th * 60 + tm + 25;
      timeStr = `${String(Math.floor((totalMins % (24 * 60)) / 60)).padStart(2, '0')}:${String(totalMins % 60).padStart(2, '0')}`;
    }

    const dateObj = parsePrayerTime(schedule.tanggal_lengkap, timeStr, schedule.timezone_label);
    return {
      id: cfg.id,
      name: cfg.name,
      label: cfg.label,
      time: timeStr,
      badge: cfg.badge,
      category: cfg.category,
      passed: now.getTime() >= dateObj.getTime(),
      isNext: false,
      dateObj,
    };
  });

  const nextIdx = fullItems.findIndex((it) => !it.passed);
  if (nextIdx !== -1) {
    fullItems[nextIdx].isNext = true;
  }

  return fullItems;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!('Notification' in window)) return false;
  if (Notification.permission === 'granted') return true;

  try {
    const perm = await Notification.requestPermission();
    return perm === 'granted';
  } catch (e) {
    console.warn('Could not request notification permission:', e);
    return false;
  }
}

function hasBeenNotified(identifier: string): boolean {
  try {
    const records = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');
    return !!records[identifier];
  } catch {
    return false;
  }
}

function markAsNotified(identifier: string) {
  try {
    const records = JSON.parse(localStorage.getItem(NOTIFIED_KEY) || '{}');
    records[identifier] = true;

    // Cleanup old records (keep last 50)
    const keys = Object.keys(records);
    if (keys.length > 50) {
      const toDelete = keys.slice(0, keys.length - 50);
      toDelete.forEach((k) => delete records[k]);
    }

    localStorage.setItem(NOTIFIED_KEY, JSON.stringify(records));
  } catch (e) {
    console.error(e);
  }
}

/**
 * Audio disabled - focused purely on prayer schedule system and GPS coordinates.
 */
export function playSynthesizedAdzanChime(_volume: number = 80) {
  // Audio intentionally disabled per user request to focus on prayer time accuracy
  return;
}

export function playAdzanAudio(_volume: number = 80) {
  // Audio intentionally disabled per user request to focus on prayer time accuracy
  return;
}

export function checkAndTriggerNotifications(
  schedule: PrayerSchedule,
  settings: AppSettings
) {
  const tzLabel = schedule.timezone_label || settings.prayer_timezone_label || 'WIB';
  const now = getCurrentTimeInLocation(tzLabel);
  const statuses = getPrayerStatuses(schedule);
  const nextPrayer = statuses.find((s) => s.isNext);

  if (!nextPrayer) return; // All prayers passed today

  const diffMs = nextPrayer.dateObj.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  const dateStr = schedule.tanggal_lengkap;
  const prepId = `${dateStr}-${nextPrayer.name}-prep`;
  const adzanId = `${dateStr}-${nextPrayer.name}-adzan`;
  const activeLoc = getActivePrayerLocation(settings);
  const locationLabel = activeLoc.locationName || `${settings.prayer_kabkota || 'Kab. Banjarnegara'}, ${settings.prayer_provinsi || 'Jawa Tengah'}`;

  const canShowBrowserNotif = 'Notification' in window && Notification.permission === 'granted';
  const enableReminder = settings.prayer_enable_reminder ?? true;
  const enableAdzanNotif = settings.prayer_enable_adzan_notif ?? true;
  const enableAdzanAudio = settings.prayer_enable_adzan_audio ?? true;

  // 1. Check preparation notification (15 minutes before)
  if (enableReminder && diffMinutes <= 15 && diffMinutes > 0) {
    if (!hasBeenNotified(prepId)) {
      const title = `🕌 Persiapan Shalat ${capitalize(nextPrayer.name)}`;
      const msg = `15 menit lagi menuju waktu ${capitalize(nextPrayer.name)} (${nextPrayer.time} ${tzLabel}). Silakan bersiap mengambil wudhu.`;

      if (canShowBrowserNotif) {
        try {
          new Notification(title, {
            body: msg,
            icon: '/favicon.ico',
            tag: prepId,
          });
        } catch {}
      }

      window.dispatchEvent(
        new CustomEvent(PRAYER_EVENT, { detail: { title, message: msg } })
      );

      window.dispatchEvent(
        new CustomEvent<PrayerBannerDetail>(PRAYER_BANNER_EVENT, {
          detail: {
            type: 'prep',
            prayerName: capitalize(nextPrayer.name),
            time: `${nextPrayer.time} ${tzLabel}`,
            title,
            message: msg,
            location: locationLabel,
          },
        })
      );

      markAsNotified(prepId);
    }
  }

  // 2. Check adzan notification (exact time or up to 2 mins passed)
  if (diffMinutes <= 0 && diffMinutes > -3) {
    if (!hasBeenNotified(adzanId)) {
      const titleAdzan = `🔔 Waktu Shalat ${capitalize(nextPrayer.name)} Telah Tiba!`;
      const msgAdzan = `Telah masuk waktu shalat ${capitalize(nextPrayer.name)} pukul ${nextPrayer.time} ${tzLabel} untuk wilayah ${locationLabel}. Segera tunaikan shalat berjamaah.`;

      if (enableAdzanNotif) {
        if (canShowBrowserNotif) {
          try {
            new Notification(titleAdzan, {
              body: msgAdzan,
              icon: '/favicon.ico',
              tag: adzanId,
            });
          } catch {}
        }

        window.dispatchEvent(
          new CustomEvent(PRAYER_EVENT, {
            detail: { title: titleAdzan, message: msgAdzan },
          })
        );

        window.dispatchEvent(
          new CustomEvent<PrayerBannerDetail>(PRAYER_BANNER_EVENT, {
            detail: {
              type: 'adzan',
              prayerName: capitalize(nextPrayer.name),
              time: `${nextPrayer.time} ${tzLabel}`,
              title: titleAdzan,
              message: msgAdzan,
              location: locationLabel,
            },
          })
        );
      }

      markAsNotified(adzanId);
    }
  }
}

export function triggerPrayerTestNotification(
  settings: AppSettings,
  testPrayerName: string = 'Dzuhur',
  type: 'adzan' | 'prep' = 'adzan'
) {
  const activeLoc = getActivePrayerLocation(settings);
  const locationLabel = activeLoc.locationName || `${settings.prayer_kabkota || 'Kab. Banjarnegara'}, ${settings.prayer_provinsi || 'Jawa Tengah'}`;
  const tzLabel = activeLoc.timezoneLabel || 'WIB';
  const now = getCurrentTimeInLocation(tzLabel);
  const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

  const isAdzan = type === 'adzan';
  const title = isAdzan
    ? `🔔 Waktu Shalat ${testPrayerName} Telah Tiba!`
    : `🕌 Persiapan Shalat ${testPrayerName}`;
  const message = isAdzan
    ? `Telah masuk waktu shalat ${testPrayerName} pukul ${timeStr} ${tzLabel} untuk wilayah ${locationLabel}. Mari bersiap menunaikan shalat berjamaah.`
    : `15 menit lagi menuju waktu ${testPrayerName} (${timeStr} ${tzLabel}). Silakan bersiap mengambil wudhu.`;

  // Dispatch App Notification
  window.dispatchEvent(
    new CustomEvent(PRAYER_EVENT, { detail: { title, message } })
  );

  // Dispatch Open Handling Banner
  window.dispatchEvent(
    new CustomEvent<PrayerBannerDetail>(PRAYER_BANNER_EVENT, {
      detail: {
        type,
        prayerName: testPrayerName,
        time: `${timeStr} ${tzLabel}`,
        title,
        message,
        location: locationLabel,
      },
    })
  );
}

export function capitalize(s: string) {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
