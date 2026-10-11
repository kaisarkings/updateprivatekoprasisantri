import re

with open('src/pages/DashboardPage.tsx', 'r') as f:
    content = f.read()

# Import the card
if 'PrayerScheduleCard' not in content:
    content = content.replace(
        "import { TopSantriTable } from '../components/dashboard/TopSantriTable';",
        "import { TopSantriTable } from '../components/dashboard/TopSantriTable';\nimport { PrayerScheduleCard } from '../components/prayer/PrayerScheduleCard';"
    )

# Insert the card into the UI
# Let's find a good place. After "Top Santri" or in the stats grid.
# There is a grid: <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
# But the user asked: "Tambahkan widget/card "Jadwal Shalat Hari Ini" pada dashboard utama."
# And the dashboard header has: "🌙 WAKTU OTOMATIS" Let's see what's in there.
