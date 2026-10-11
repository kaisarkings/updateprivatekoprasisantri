import re

with open('src/types/index.ts', 'r') as f:
    content = f.read()

replacement = """  max_debt_limit?: number;
  hero_slides?: HeroSlide[];
  prayer_provinsi?: string;
  prayer_kabkota?: string;
  prayer_enable_reminder?: boolean;
  prayer_enable_adzan_notif?: boolean;
  prayer_enable_adzan_audio?: boolean;
  prayer_adzan_volume?: number;
}"""

content = content.replace("  max_debt_limit?: number;\n  hero_slides?: HeroSlide[];\n}", replacement)

# Let's also add PrayerSchedule interface
interfaces = """

export interface PrayerSchedule {
  tanggal: number;
  tanggal_lengkap: string;
  hari: string;
  imsak: string;
  subuh: string;
  terbit: string;
  dhuha: string;
  dzuhur: string;
  ashar: string;
  maghrib: string;
  isya: string;
}
"""
content = content + interfaces

with open('src/types/index.ts', 'w') as f:
    f.write(content)

with open('src/constants/index.ts', 'r') as f:
    constants = f.read()

const_rep = """  allow_debt: false,
  max_debt_limit: 0,
  hero_slides: DEFAULT_HERO_SLIDES,
  prayer_provinsi: 'Jawa Tengah',
  prayer_kabkota: 'Kab. Banyumas',
  prayer_enable_reminder: true,
  prayer_enable_adzan_notif: true,
  prayer_enable_adzan_audio: true,
  prayer_adzan_volume: 80,
};"""

constants = re.sub(r'  allow_debt: false,\n  max_debt_limit: 0,\n  hero_slides: DEFAULT_HERO_SLIDES,\n};', const_rep, constants)

with open('src/constants/index.ts', 'w') as f:
    f.write(constants)
