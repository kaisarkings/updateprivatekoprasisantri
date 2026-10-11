import re

with open('src/pages/SantriDetailPage.tsx', 'r') as f:
    content = f.read()

# Replace the Main Student Header Card
old_header = '''      {/* Main Student Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <StudentAvatar
              src={student.avatar_url}
              name={student.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-emerald-500/20 shadow-md shrink-0"
            />
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-black text-slate-900 dark:text-white">{student.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold text-[10px]">
                  {student.status.toUpperCase()}
                </span>
              </div>
              <p className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {student.nis}
              </p>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-3.5 h-3.5" />
                  {student.class_name}
                </span>
                <span className="flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5" />
                  {student.dormitory}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Masuk: {formatDate(student.joined_date)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {user?.role !== 'viewer' && user?.role !== 'guest' && (
              <button
                onClick={() => setIsTopUpOpen(true)}
                className="flex-1 md:flex-none px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-500/20"
              >
                <Wallet className="w-4 h-4" />
                Isi Saldo Santri
              </button>
            )}
            <button
              onClick={() => setIsQrModalOpen(true)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5"
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              Kartu QR
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold text-xs flex items-center gap-1.5 hover:bg-emerald-100 transition-colors"
            >
              <MessageSquare className="w-4 h-4" />
              WhatsApp Wali
            </a>
            {user?.role === 'admin' && (
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
              >
                <Edit className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-slate-800">
          <div className="p-4 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-800/40">
            <p className="text-[11px] font-semibold text-slate-500">Saldo Utama Saat Ini</p>
            <p className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-0.5">
              {formatRupiah(student.balance)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500">Input (Top Up Masuk)</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {formatRupiah(totalTopUp)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500">Output (Pengeluaran Jajan)</p>
            <p className="text-lg font-bold text-rose-600 dark:text-rose-400 mt-0.5">
              {formatRupiah(totalSpent)}
            </p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
            <p className="text-[11px] font-semibold text-slate-500">Total Transaksi</p>
            <p className="text-lg font-bold text-slate-900 dark:text-white mt-0.5">
              {studentTrxs.length + studentTopups.length} Transaksi
            </p>
          </div>
        </div>
      </div>'''

new_header = '''      {/* Main Student Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        {/* Top Decorative Banner */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-10 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 dark:opacity-10 hidden md:block">
          <Building2 className="w-32 h-32 text-emerald-600 transform translate-x-8 -translate-y-8" />
        </div>
        
        <div className="p-6 sm:p-8 relative z-10">
          {/* Institutional Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800/60 pb-5 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-black text-sm uppercase tracking-wide text-slate-900 dark:text-white">
                  {settings.koperasi_name || 'KOPERASI SANTRI'}
                </h3>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  {settings.pesantren_name}
                </p>
              </div>
            </div>
            
            <span className="hidden sm:inline-flex mt-4 sm:mt-0 px-3 py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold text-xs tracking-wider border border-slate-200 dark:border-slate-700">
              PROFIL SANTRI
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Student Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 w-full lg:w-auto">
              <StudentAvatar
                src={student.avatar_url}
                name={student.name}
                className="w-24 h-24 sm:w-28 sm:h-28 rounded-[2rem] object-cover ring-4 ring-white dark:ring-slate-900 shadow-xl shrink-0"
              />
              <div className="space-y-2.5">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{student.name}</h1>
                    <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[10px] tracking-wide">
                      {student.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-sm font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block">
                    NIS: {student.nis}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-3 sm:gap-5 text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-500" />
                    Kelas {student.class_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-emerald-500" />
                    Asrama {student.dormitory}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-4 h-4" />
                    Masuk: {formatDate(student.joined_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto mt-2 lg:mt-0">
              {user?.role !== 'viewer' && user?.role !== 'guest' && (
                <button
                  onClick={() => setIsTopUpOpen(true)}
                  className="flex-1 lg:flex-none px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Wallet className="w-4 h-4" />
                  Isi Saldo
                </button>
              )}
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="flex-1 lg:flex-none px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                Kartu QR
              </button>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 lg:flex-none px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                Hubungi Wali
              </a>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Data Santri"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 mt-8 pt-8 border-t border-slate-100 dark:border-slate-800/60">
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50">
              <p className="text-[11px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide">Saldo Utama Saat Ini</p>
              <p className="text-2xl sm:text-3xl font-black text-emerald-700 dark:text-emerald-300 mt-1">
                {formatRupiah(student.balance)}
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Top Up Masuk</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {formatRupiah(totalTopUp)}
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <p className="text-[11px] sm:text-xs font-bold text-rose-600/80 uppercase tracking-wide">Pengeluaran Jajan</p>
              <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">
                {formatRupiah(totalSpent)}
              </p>
            </div>
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[11px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide">Total Transaksi</p>
              <p className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {studentTrxs.length + studentTopups.length} <span className="text-sm font-semibold text-slate-400">Kali</span>
              </p>
            </div>
          </div>
        </div>
      </div>'''

content = content.replace(old_header, new_header)

with open('src/pages/SantriDetailPage.tsx', 'w') as f:
    f.write(content)
