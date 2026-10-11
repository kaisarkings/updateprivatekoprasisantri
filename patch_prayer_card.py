import re

with open('src/components/prayer/PrayerScheduleCard.tsx', 'r') as f:
    content = f.read()

replacement = """
      // Auto refresh on day change (00:00)
      if (schedule && schedule.tanggal_lengkap) {
        // currentTime is already a Date object constructed to reflect Jakarta time in its local methods
        const year = currentTime.getFullYear();
        const month = String(currentTime.getMonth() + 1).padStart(2, '0');
        const day = String(currentTime.getDate()).padStart(2, '0');
        const targetDate = `${year}-${month}-${day}`;
        
        if (targetDate !== schedule.tanggal_lengkap) {
"""

content = re.sub(
    r'// Auto refresh on day change.*?if \(targetDate !== schedule\.tanggal_lengkap\) \{',
    replacement.strip(),
    content,
    flags=re.DOTALL
)

with open('src/components/prayer/PrayerScheduleCard.tsx', 'w') as f:
    f.write(content)
