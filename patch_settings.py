import re

with open('src/pages/SettingsPage.tsx', 'r') as f:
    content = f.read()

# Add import
if 'PrayerSettings' not in content:
    content = content.replace(
        "import { Modal } from '../components/common/Modal';",
        "import { Modal } from '../components/common/Modal';\nimport { PrayerSettings } from '../components/prayer/PrayerSettings';"
    )

# Inject PrayerSettings before the ending divs
# Look for: "</div>\n    </div>\n  );\n}"
content = re.sub(
    r'      </div>\n    </div>\n  \);\n};\n?$',
    '      </div>\n\n      <PrayerSettings />\n    </div>\n  );\n};\n',
    content
)

with open('src/pages/SettingsPage.tsx', 'w') as f:
    f.write(content)
