import re

with open('src/pages/SantriDetailPage.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    '''            <button
              onClick={() => setIsTopUpOpen(true)}
              className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
            >
              <Wallet className="w-4 h-4" />
              Isi Saldo Santri
            </button>''',
    '''            {user?.role !== 'viewer' && user?.role !== 'guest' && (
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <Wallet className="w-4 h-4" />
                Isi Saldo Santri
              </button>
            )}'''
)

with open('src/pages/SantriDetailPage.tsx', 'w') as f:
    f.write(content)
