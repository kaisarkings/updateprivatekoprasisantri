import re

with open('src/pages/RiwayatPage.tsx', 'r') as f:
    content = f.read()

# Replace the plain action span with a dynamic color badge
badge_logic = """                    <span className={`px-2 py-1 rounded font-bold text-[10px] uppercase ${
                      log.action.includes('Hapus') || log.action.includes('Reset') 
                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300' 
                        : log.action.includes('Isi Saldo')
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : log.action.includes('Transaksi')
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                    }`}>"""

content = re.sub(
    r'<span className="px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 text-\[10px\] uppercase">',
    badge_logic,
    content
)

with open('src/pages/RiwayatPage.tsx', 'w') as f:
    f.write(content)

