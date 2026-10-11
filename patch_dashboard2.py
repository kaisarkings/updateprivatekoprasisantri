import re

with open('src/pages/DashboardPage.tsx', 'r') as f:
    content = f.read()

# Insert the prayer card in the right place.
# Let's insert it right after the Hero section, before "Sisa Saldo Seluruh Santri"
replacement = """      )}

      {/* Prayer Schedule */}
      <div className="mb-6">
        <PrayerScheduleCard />
      </div>

      {/* Debt & Low Balance Alert Notice (If Any) */}"""

content = content.replace("      )}\n\n      {/* Debt & Low Balance Alert Notice (If Any) */}", replacement)

with open('src/pages/DashboardPage.tsx', 'w') as f:
    f.write(content)
