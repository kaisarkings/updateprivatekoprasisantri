import React, { useState, useEffect, useMemo } from 'react';
import { Student } from '../../types';
import { storageService } from '../../services/storageService';
import { GuestLoginInfo } from '../../context/AuthContext';
import { StudentAvatar } from '../common/StudentAvatar';
import defaultSantriAvatar from '../../assets/images/login_santri_avatar_1785105854262.jpg';
import pesantrenLogo from '../../assets/images/sirajuddin_logo.jpeg';
import {
  Search,
  X,
  ArrowRight,
  GraduationCap,
  Loader2,
  Lock,
  CheckCircle2,
  AlertCircle,
  ArrowLeft,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface GuestLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (info: GuestLoginInfo) => Promise<void>;
  onQuickEnter?: () => Promise<void>;
  isSubmitting: boolean;
}

export const GuestLoginModal: React.FC<GuestLoginModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isSubmitting,
}) => {
  const { settings, showToast } = useApp();

  const [allStudents, setAllStudents] = useState<Student[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState<string>('all');

  // Step 2 State: Selected Student & SNT Verification
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [sntInput, setSntInput] = useState('');
  const [sntError, setSntError] = useState<string | null>(null);

  // Fetch all students on modal open
  useEffect(() => {
    let isMounted = true;
    if (isOpen) {
      setIsLoadingStudents(true);
      setSelectedStudent(null);
      setSntInput('');
      setSntError(null);
      setSearchQuery('');
      setSelectedClass('all');

      storageService
        .getStudents()
        .then((res) => {
          if (isMounted) {
            setAllStudents(res || []);
            setIsLoadingStudents(false);
          }
        })
        .catch((err) => {
          console.warn('Gagal memuat data santri:', err);
          if (isMounted) {
            setIsLoadingStudents(false);
          }
        });
    }
    return () => {
      isMounted = false;
    };
  }, [isOpen, settings]);

  // Extract unique classes for quick filter chips with exact counts
  const availableClasses = useMemo(() => {
    const classSet = new Set<string>();
    allStudents.forEach((s) => {
      if (s.class_name && s.class_name.trim()) {
        classSet.add(s.class_name.trim());
      }
    });
    return Array.from(classSet).sort();
  }, [allStudents]);

  // Filter students based on search query and selected class (WITHOUT searching by SNT to preserve privacy)
  const filteredStudents = useMemo(() => {
    let list = allStudents;

    if (selectedClass !== 'all') {
      list = list.filter((s) => s.class_name === selectedClass);
    }

    const q = searchQuery.toLowerCase().trim();
    if (q) {
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.class_name && s.class_name.toLowerCase().includes(q)) ||
          (s.dormitory && s.dormitory.toLowerCase().includes(q)) ||
          (s.parent_name && s.parent_name.toLowerCase().includes(q))
      );
    }

    return list;
  }, [allStudents, searchQuery, selectedClass]);

  if (!isOpen) return null;

  // Step 1: Click a student from the list -> Enter Step 2 (SNT verification)
  const handleChooseStudent = (student: Student) => {
    setSelectedStudent(student);
    setSntInput('');
    setSntError(null);
  };

  // Step 2: Verify SNT & Proceed to Login
  const handleVerifySntAndLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || isSubmitting) return;

    const trimmedInput = sntInput.trim().toUpperCase();
    if (!trimmedInput) {
      setSntError('Silakan masukkan nomor SNT santri ananda.');
      return;
    }

    // Match validation: accepts SNT-XXXXXX, XXXXXX, or student ID
    const studentNis = (selectedStudent.nis || '').trim().toUpperCase();
    const studentId = (selectedStudent.id || '').trim().toUpperCase();

    const normalizedInput = trimmedInput.replace(/^SNT-?/, '');
    const normalizedNis = studentNis.replace(/^SNT-?/, '');

    const isMatch =
      trimmedInput === studentNis ||
      trimmedInput === studentId ||
      normalizedInput === normalizedNis;

    if (!isMatch) {
      setSntError(
        `Nomor SNT tidak sesuai dengan data ananda ${selectedStudent.name}. Pastikan nomor SNT yang dimasukkan benar sesuai kartu santri.`
      );
      return;
    }

    // If SNT is valid, clear error
    setSntError(null);

    // Set flag to prompt GPS location once entering web portal
    sessionStorage.setItem('koperasi_prompt_location_after_login', 'true');

    const parentTitle =
      selectedStudent.parent_name && selectedStudent.parent_name.trim()
        ? selectedStudent.parent_name
        : `Wali Santri ${selectedStudent.name}`;

    const guestPayload: GuestLoginInfo = {
      parent_name: parentTitle,
      santri_name: selectedStudent.name,
      santri_id: selectedStudent.id,
      santri_nis: selectedStudent.nis,
      santri_class: selectedStudent.class_name,
      relationship: 'Wali Santri',
      phone: selectedStudent.parent_phone || '',
      notes: `Akses Wali Santri terverifikasi SNT untuk ananda ${selectedStudent.name}`,
    };

    try {
      await onSubmit(guestPayload);
    } catch (e) {
      console.error('Error saat login wali santri:', e);
      setSntError('Gagal memverifikasi login. Silakan coba lagi.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2.5 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md select-none font-sans [font-family:var(--font-sans)] animate-in fade-in duration-200">
      {/* Modal Dialog Card */}
      <div className="w-full max-w-4xl h-[92vh] max-h-[850px] bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden">
        
        {/* ======================= STEP 2: SNT VERIFICATION & LOCATION VIEW ======================= */}
        {selectedStudent ? (
          <div className="flex-1 flex flex-col overflow-hidden bg-slate-50/50 dark:bg-slate-950/50">
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between shrink-0">
              <button
                type="button"
                onClick={() => {
                  setSelectedStudent(null);
                  setSntError(null);
                }}
                disabled={isSubmitting}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 py-1.5 px-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Pilih Santri Lain</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer"
                title="Tutup"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Verification Form Body */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 flex flex-col items-center">
              <div className="w-full max-w-md my-auto py-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
                
                {/* Santri Card Identity Banner */}
                <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-gradient-to-r from-emerald-50/90 via-emerald-50/40 to-slate-50/60 dark:from-emerald-950/50 dark:via-emerald-950/20 dark:to-slate-900/50 border border-emerald-200/80 dark:border-emerald-800/60 shadow-xs mb-5">
                  <StudentAvatar
                    src={selectedStudent.avatar_url}
                    name={selectedStudent.name}
                    className="w-13 h-13 rounded-2xl object-cover ring-2 ring-emerald-500/20 bg-emerald-100 dark:bg-emerald-900 shrink-0 shadow-xs"
                  />
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                      Konfirmasi Akun Santri
                    </span>
                    <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                      {selectedStudent.name}
                    </h3>
                    <div className="flex items-center gap-2 mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                      {selectedStudent.class_name && (
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {selectedStudent.class_name}
                        </span>
                      )}
                      {selectedStudent.dormitory && (
                        <span>• {selectedStudent.dormitory}</span>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleVerifySntAndLogin} className="space-y-4">
                  {/* SNT Input Field */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 mb-1">
                      Nomor SNT Santri:
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2 leading-relaxed">
                      Untuk memastikan akun Anda adalah wali santri yang sah, silakan masukkan nomor SNT terdaftar pada kartu santri.
                    </p>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Lock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <input
                        type="text"
                        autoFocus
                        value={sntInput}
                        onChange={(e) => {
                          setSntInput(e.target.value);
                          if (sntError) setSntError(null);
                        }}
                        placeholder="Contoh: SNT-264306 atau 264306"
                        className="w-full pl-10 pr-10 py-3 bg-white dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white font-mono font-bold text-sm sm:text-base rounded-2xl focus:outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/15 transition-all uppercase placeholder:normal-case placeholder:font-sans placeholder:font-normal placeholder:tracking-normal placeholder:text-slate-400 dark:placeholder:text-slate-500"
                      />
                      {sntInput && (
                        <button
                          type="button"
                          onClick={() => {
                            setSntInput('');
                            setSntError(null);
                          }}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {sntError && (
                      <div className="mt-2.5 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-200 flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                        <p className="font-semibold leading-relaxed">{sntError}</p>
                      </div>
                    )}

                    {/* SNT Guidance Info */}
                    <div className="mt-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800 flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                      <p className="text-[11px] leading-relaxed">
                        Nomor SNT tercantum pada kartu santri. Dapat diketik lengkap (cth: <strong className="font-mono text-slate-800 dark:text-slate-200">SNT-264306</strong>) atau hanya 6 angka saja.
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white rounded-2xl font-black text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all cursor-pointer disabled:opacity-60 pt-3"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Memverifikasi Akun...</span>
                      </>
                    ) : (
                      <>
                        <span>Verifikasi SNT &amp; Masuk Portal</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        ) : (
          /* ======================= STEP 1: BROWSE & SEARCH STUDENTS LIST ======================= */
          <>
            {/* Header: Logo, Judul, & Tombol Close */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 bg-white dark:bg-slate-900 shrink-0">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <img
                    src={pesantrenLogo}
                    alt="Logo Pesantren"
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover ring-2 ring-emerald-500/30 bg-white shadow-xs shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = defaultSantriAvatar;
                    }}
                  />
                  <div className="min-w-0">
                    <h3 className="font-bold text-base sm:text-lg text-slate-900 dark:text-white leading-snug tracking-tight">
                      Pilih Profil Santri Ananda
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
                      Cari atau scroll nama ananda, lalu klik untuk konfirmasi SNT &amp; masuk ke portal wali santri
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors cursor-pointer shrink-0"
                  title="Tutup / Kembali"
                  aria-label="Tutup"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* SEARCH BAR (Bisa Scroll & Search Cepat Tanpa Ribet) */}
              <div className="mt-3.5 relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari nama santri, kelas, atau wali ananda..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 text-slate-900 dark:text-white font-medium text-xs sm:text-sm rounded-xl focus:outline-none focus:border-emerald-500 focus:ring-3 focus:ring-emerald-500/15 transition-all placeholder:text-slate-400 dark:placeholder:text-slate-500"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* FILTER KELAS DENGAN JUMLAH SANTRI */}
              <div className="mt-3 flex items-center gap-1.5 overflow-x-auto pb-0.5 no-scrollbar text-xs">
                <button
                  type="button"
                  onClick={() => setSelectedClass('all')}
                  className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                    selectedClass === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60'
                  }`}
                >
                  Semua ({allStudents.length})
                </button>
                {availableClasses.map((cls) => {
                  const count = allStudents.filter((s) => s.class_name === cls).length;
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setSelectedClass(cls)}
                      className={`px-3 py-1.5 rounded-full font-semibold shrink-0 transition-all cursor-pointer ${
                        selectedClass === cls
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200/60 dark:border-slate-700/60'
                      }`}
                    >
                      {cls} ({count})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* DAFTAR DATA SANTRI (Cards TIDAK menampilkan SNT terbuka untuk menjaga privasi) */}
            <div className="flex-1 overflow-y-auto p-3.5 sm:p-5 space-y-2.5 sm:space-y-3 bg-slate-50/60 dark:bg-slate-950/50">
              {isLoadingStudents ? (
                <div className="py-24 flex flex-col items-center justify-center gap-2.5 text-slate-400">
                  <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
                  <p className="text-xs sm:text-sm font-medium">Memuat data santri pondok...</p>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="py-16 px-4 text-center bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800">
                  <GraduationCap className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                    Santri Tidak Ditemukan
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                    {searchQuery
                      ? `Tidak ada santri yang cocok dengan "${searchQuery}". Periksa kembali ejaan nama.`
                      : 'Belum ada data santri yang tercatat.'}
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="mt-3.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                    >
                      Tampilkan Semua Santri
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 sm:gap-3">
                  {filteredStudents.map((student) => {
                    return (
                      <div
                        key={student.id}
                        onClick={() => handleChooseStudent(student)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            handleChooseStudent(student);
                          }
                        }}
                        className="group bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-500/70 dark:hover:border-emerald-400/70 transition-all duration-150 p-3 sm:p-3.5 flex items-center justify-between gap-3 cursor-pointer select-none text-left shadow-xs hover:shadow-md active:scale-[0.99]"
                      >
                        {/* Avatar Foto Santri */}
                        <div className="relative shrink-0">
                          <StudentAvatar
                            src={student.avatar_url}
                            name={student.name}
                            className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-500/20 bg-emerald-50 shadow-xs"
                          />
                        </div>

                        {/* Detail Santri (NO SNT code exposed on card) */}
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors truncate tracking-tight">
                            {student.name}
                          </h4>

                          <div className="flex items-center gap-1.5 mt-0.5">
                            {student.class_name && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800/80">
                                {student.class_name}
                              </span>
                            )}
                            {student.dormitory && (
                              <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                {student.dormitory}
                              </span>
                            )}
                          </div>

                          {student.parent_name && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 truncate">
                              Wali:{' '}
                              <span className="font-medium text-slate-700 dark:text-slate-300">
                                {student.parent_name}
                              </span>
                            </p>
                          )}
                        </div>

                        {/* Tombol PILIH */}
                        <div className="shrink-0">
                          <button
                            type="button"
                            className="px-3 py-1.5 bg-emerald-600 group-hover:bg-emerald-500 text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-xs transition-all cursor-pointer group-hover:shadow-sm"
                          >
                            <span>PILIH</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 text-center shrink-0">
              <p className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
                Menampilkan {filteredStudents.length} dari {allStudents.length} santri terdaftar • Klik santri untuk memasukkan SNT &amp; login
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
