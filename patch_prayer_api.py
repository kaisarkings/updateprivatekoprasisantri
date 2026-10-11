import re

with open('src/lib/prayer/prayer-api.ts', 'r') as f:
    content = f.read()

replacement = """export function getTodayPrayer(jadwalBulanan: PrayerSchedule[], date: Date): PrayerSchedule | null {
  // date is expected to be a shifted Date object (from getCurrentTimeInJakarta)
  // so its local methods give the correct Jakarta time.
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const targetDate = `${year}-${month}-${day}`;

  return jadwalBulanan.find(j => j.tanggal_lengkap === targetDate) || null;
}"""

content = re.sub(
    r'export function getTodayPrayer.*?^\}',
    replacement,
    content,
    flags=re.DOTALL | re.MULTILINE
)

with open('src/lib/prayer/prayer-api.ts', 'w') as f:
    f.write(content)
