with open('src/lib/prayer/prayer-notification.ts', 'r') as f:
    content = f.read()

import re

# Rewrite checkAndTriggerNotifications
content = re.sub(
    r'export function checkAndTriggerNotifications.*',
    '''export function checkAndTriggerNotifications(
  schedule: PrayerSchedule, 
  settings: AppSettings
) {
  const now = getCurrentTimeInJakarta();
  const statuses = getPrayerStatuses(schedule);
  const nextPrayer = statuses.find(s => s.isNext);
  
  if (!nextPrayer) return; // All prayers passed today

  const diffMs = nextPrayer.dateObj.getTime() - now.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  
  const dateStr = schedule.tanggal_lengkap;
  const prepId = `${dateStr}-${nextPrayer.name}-prep`;
  const adzanId = `${dateStr}-${nextPrayer.name}-adzan`;

  const canShowBrowserNotif = ('Notification' in window) && Notification.permission === 'granted';

  // 1. Check preparation notification (15 minutes before)
  if (settings.prayer_enable_reminder && diffMinutes <= 15 && diffMinutes > 0) {
    if (!hasBeenNotified(prepId)) {
      const title = `🕌 Persiapan ${capitalize(nextPrayer.name)}`;
      const msg = `15 menit lagi menuju ${capitalize(nextPrayer.name)}. Silakan bersiap.`;
      
      if (canShowBrowserNotif) {
        new Notification(title, {
          body: msg,
          icon: '/favicon.ico',
          tag: prepId
        });
      }
      
      window.dispatchEvent(new CustomEvent(PRAYER_EVENT, { detail: { title, message: msg } }));
      markAsNotified(prepId);
    }
  }

  // 2. Check adzan notification (exact time or up to 2 mins passed)
  if (diffMinutes <= 0 && diffMinutes > -2) {
    if (!hasBeenNotified(adzanId)) {
      const titleAdzan = `🔔 Waktu Adzan ${capitalize(nextPrayer.name)}`;
      const msgAdzan = `Telah masuk waktu shalat ${capitalize(nextPrayer.name)} - ${nextPrayer.time}`;
      
      if (settings.prayer_enable_adzan_notif) {
        if (canShowBrowserNotif) {
          new Notification(titleAdzan, {
            body: msgAdzan,
            icon: '/favicon.ico',
            tag: adzanId
          });
        }
        window.dispatchEvent(new CustomEvent(PRAYER_EVENT, { detail: { title: titleAdzan, message: msgAdzan } }));
      }
      
      if (settings.prayer_enable_adzan_audio) {
        playAdzanAudio(settings.prayer_adzan_volume || 80);
      }
      
      markAsNotified(adzanId);
    }
  }
}

export function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
''',
    content,
    flags=re.DOTALL
)

with open('src/lib/prayer/prayer-notification.ts', 'w') as f:
    f.write(content)

