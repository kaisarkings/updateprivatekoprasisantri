import re

with open('src/pages/UserManagementPage.tsx', 'r') as f:
    content = f.read()

# Add state
content = content.replace(
    '  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);',
    '  const [deleteConfirmUser, setDeleteConfirmUser] = useState<AdminUser | null>(null);\n  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);\n  const [profileEmail, setProfileEmail] = useState(currentUser?.email || "");\n  const [profilePassword, setProfilePassword] = useState("");'
)

# Add viewer badge
content = content.replace(
    '      case \'administrator\':',
    '''      case 'viewer':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <BookOpen className="w-3 h-3" />
            Viewer Biasa
          </span>
        );
      case 'administrator':'''
)

# Add handleUpdateProfile
content = content.replace(
    '  return (',
    '''  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateProfile({ email: profileEmail, password: profilePassword || undefined });
      showToast('success', 'Profil Diperbarui', 'Email / Password berhasil diubah.');
      setIsProfileModalOpen(false);
    } catch(err: any) {
      showToast('error', 'Gagal Memperbarui Profil', err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return ('''
)

# Add Edit Profile button
content = content.replace(
    '''        {currentUser?.role === 'admin' && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
        )}''',
    '''        <div className="flex gap-3">
          <button
            onClick={() => {
              setProfileEmail(currentUser?.email || '');
              setProfilePassword('');
              setIsProfileModalOpen(true);
            }}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-white font-bold text-sm transition-all shadow-sm shrink-0"
          >
            <User className="w-4 h-4" />
            <span>Ubah Profil Saya</span>
          </button>
          {currentUser?.role === 'admin' && (
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm transition-all shadow-md shadow-emerald-500/20 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Tambah Pengguna Baru</span>
          </button>
          )}
        </div>'''
)

# Add viewer card and change grid cols
content = content.replace(
    '<div className="grid grid-cols-1 md:grid-cols-2 gap-4">',
    '<div className="grid grid-cols-1 md:grid-cols-3 gap-4">'
)
content = content.replace(
    '        </div>\n\n\n      </div>\n\n      {/* Filter and Search */}',
    '''        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/40">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300 text-xs mb-1">
            <BookOpen className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            <span>Role Viewer Biasa</span>
          </div>
          <p className="text-[11px] text-amber-800/80 dark:text-amber-300/80 leading-relaxed">
            Sekedar login melihat semua data santri, nominal saldo, dan log aktivitas.
          </p>
        </div>

      </div>

      {/* Filter and Search */}'''
)

# Add viewer to filter
content = content.replace(
    "{['all', 'admin', 'administrator'].map((r) => (",
    "{['all', 'admin', 'administrator', 'viewer'].map((r) => ("
)

# Add viewer option to select
content = content.replace(
    '<option value="admin">Admin (Akses Penuh)</option>',
    '<option value="admin">Admin (Akses Penuh)</option>\n                <option value="viewer">Viewer Biasa</option>'
)

# Add Profile Modal
content = content.replace(
    '      {/* Delete Confirmation Modal */}',
    '''      {/* Modal Ubah Profil */}
      <Modal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        title="Ubah Profil Saya"
      >
        <form onSubmit={handleUpdateProfile} className="space-y-4 pt-2">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Email Akses (Baru)
            </label>
            <div className="relative">
              <input
                type="email"
                required
                value={profileEmail}
                onChange={(e) => setProfileEmail(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <Mail className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Kata Sandi Baru (Opsional)
            </label>
            <div className="relative">
              <input
                type="text"
                value={profilePassword}
                onChange={(e) => setProfilePassword(e.target.value)}
                placeholder="Biarkan kosong jika tidak diubah"
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
              <KeyRound className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-4">
            <button type="button" onClick={() => setIsProfileModalOpen(false)} className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50">Batal</button>
            <button type="submit" disabled={isSubmitting} className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20">{isSubmitting ? 'Menyimpan...' : 'Simpan Perubahan'}</button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}'''
)

# Also need to destructure updateProfile from useAuth()
content = content.replace(
    'const { user: currentUser, users, addUser, updateUserStatus, deleteUser } = useAuth();',
    'const { user: currentUser, users, addUser, updateUserStatus, deleteUser, updateProfile } = useAuth();'
)

with open('src/pages/UserManagementPage.tsx', 'w') as f:
    f.write(content)
