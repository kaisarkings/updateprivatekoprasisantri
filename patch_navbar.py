import re

with open('src/components/common/Navbar.tsx', 'r') as f:
    content = f.read()

# Modify RealtimeNotifItem
content = content.replace(
    "type: 'jajan' | 'topup';",
    "type: 'jajan' | 'topup' | 'prayer';"
)
content = content.replace(
    "amount: number;",
    "amount?: number;"
)

# Export an event name for prayer notifications
with open('src/lib/prayer/prayer-notification.ts', 'r') as f:
    prayer_content = f.read()

if "export const PRAYER_EVENT" not in prayer_content:
    prayer_content = prayer_content.replace(
        "export const PRAYER_NAMES",
        "export const PRAYER_EVENT = 'koperasi:prayer_notif';\nexport interface PrayerEventDetail {\n  title: string;\n  message: string;\n}\n\nexport const PRAYER_NAMES"
    )
    
    # Check and trigger notifications -> dispatch event
    # First, let's inject a dispatchEvent inside checkAndTriggerNotifications.
    prayer_content = prayer_content.replace(
        "new Notification(`Persiapan Shalat ${capitalize(nextPrayer.name)}`, {",
        "const title = `Persiapan Shalat ${capitalize(nextPrayer.name)}`;\n      const msg = `15 menit lagi menuju waktu ${capitalize(nextPrayer.name)}. Silakan bersiap.`;\n      new Notification(title, {\n        body: msg,"
    )
    prayer_content = prayer_content.replace(
        "tag: prepId\n      });",
        "tag: prepId\n      });\n      window.dispatchEvent(new CustomEvent(PRAYER_EVENT, { detail: { title, message: msg } }));"
    )
    
    prayer_content = prayer_content.replace(
        "new Notification(`🔔 Waktu Adzan ${capitalize(nextPrayer.name)}`, {",
        "const titleAdzan = `🔔 Waktu Adzan ${capitalize(nextPrayer.name)}`;\n        const msgAdzan = `Telah masuk waktu shalat ${capitalize(nextPrayer.name)} - ${nextPrayer.time}`;\n        new Notification(titleAdzan, {\n          body: msgAdzan,"
    )
    prayer_content = prayer_content.replace(
        "tag: adzanId\n        });\n      }\n      \n      if (settings.prayer_enable_adzan_audio)",
        "tag: adzanId\n        });\n      }\n      window.dispatchEvent(new CustomEvent(PRAYER_EVENT, { detail: { title: titleAdzan, message: msgAdzan } }));\n      if (settings.prayer_enable_adzan_audio)"
    )

    # In case titleAdzan is not defined if prayer_enable_adzan_notif is false, we should make sure dispatch event works regardless of browser notification.
    # Actually, let's redefine the Adzan block:
    #   if (!hasBeenNotified(adzanId)) {
    #     const titleAdzan = `🔔 Waktu Adzan ${capitalize(nextPrayer.name)}`;
    #     const msgAdzan = `Telah masuk waktu shalat ${capitalize(nextPrayer.name)} - ${nextPrayer.time}`;
    #     if (settings.prayer_enable_adzan_notif) { ... }
    
    # I'll just rewrite the checkAndTriggerNotifications completely.
    with open('src/lib/prayer/prayer-notification.ts', 'w') as f2:
        f2.write(prayer_content)

