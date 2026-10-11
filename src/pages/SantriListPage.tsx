import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { storageService } from '../services/storageService';
import { Student } from '../types';
import { DEFAULT_CLASSES, DEFAULT_DORMITORIES } from '../constants';
import { formatRupiah, formatDate } from '../utils/formatters';
import { SantriFormModal } from '../components/santri/SantriFormModal';
import { SantriQRModal } from '../components/santri/SantriQRModal';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { Modal } from '../components/common/Modal';
import { useNavigate, Link } from 'react-router-dom';
import { getCardPaddingClass, getCardClass, getButtonClass, getInputClass } from '../utils/themeUtils';
import {
  Users,
  Plus,
  Search,
  Filter,
  QrCode,
  Edit,
  Trash2,
  Wallet,
  Phone,
  LayoutGrid,
  List,
  CheckCircle2,
  XCircle,
} from 'lucide-react';

export const SantriListPage: React.FC = () => {
  const { user } = useAuth();
  const { students, searchQuery, setSearchQuery, showToast, refreshData, settings, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';
  const navigate = useNavigate();

  const minBalanceAlert = settings.min_balance_alert || 10000;

  const [filterClass, setFilterClass] = useState<string>('all');
  const [filterDormitory, setFilterDormitory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterBalance, setFilterBalance] = useState<'all' | 'debt' | 'warning' | 'safe'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');

  // Modals state
  const [isFormModalOpen, setIsFormModalOpen] = useState<boolean>(false);
  const [studentToEdit, setStudentToEdit] = useState<Student | null>(null);

  const [qrModalStudent, setQrModalStudent] = useState<Student | null>(null);

  const [quickTopUpStudent, setQuickTopUpStudent] = useState<Student | null>(null);
  const [quickTopUpAmount, setQuickTopUpAmount] = useState<string>('');
  const [quickTopUpNotes, setQuickTopUpNotes] = useState<string>('');

  const handleQuickTopUpAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      setQuickTopUpAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    } else {
      setQuickTopUpAmount('');
    }
  };

  const [deleteConfirmStudent, setDeleteConfirmStudent] = useState<Student | null>(null);

  const debtCount = useMemo(() => (students || []).filter((s) => s.balance < 0).length, [students]);
  const warningCount = useMemo(
    () => (students || []).filter((s) => s.balance >= 0 && s.balance <= minBalanceAlert).length,
    [students, minBalanceAlert]
  );

  // Filtered Students
  const filteredStudents = useMemo(() => {
    return (students || []).filter((s) => {
      const matchSearch =
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.nis.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.parent_name.toLowerCase().includes(searchQuery.toLowerCase());

      const matchClass = filterClass === 'all' || s.class_name === filterClass;
      const matchDormitory = filterDormitory === 'all' || s.dormitory === filterDormitory;
      const matchStatus = filterStatus === 'all' || s.status === filterStatus;

      let matchBalance = true;
      if (filterBalance === 'debt') {
        matchBalance = s.balance < 0;
      } else if (filterBalance === 'warning') {
        matchBalance = s.balance >= 0 && s.balance <= minBalanceAlert;
      } else if (filterBalance === 'safe') {
        matchBalance = s.balance > minBalanceAlert;
      }

      return matchSearch && matchClass && matchDormitory && matchStatus && matchBalance;
    });
  }, [students, searchQuery, filterClass, filterDormitory, filterStatus, filterBalance, minBalanceAlert]);

  const handleSaveStudent = async (studentData: Partial<Student>) => {
    if (user?.role === 'guest' || user?.role === 'viewer') {
      showToast('error', 'Akses Dibatasi', 'Wali Santri / Tamu hanya memiliki hak akses melihat.');
      return;
    }
    try {
      await storageService.saveStudent(studentData as any);
      showToast(
        'success',
        studentData.id ? 'Data Diperbarui' : 'Santri Ditambahkan',
        `Data santri ${studentData.name} berhasil disimpan.`
      );
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Menyimpan', e.message);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmStudent) return;
    if (user?.role !== 'admin') {
      showToast('error', 'Akses Dibatasi', 'Hanya administrator yang dapat menghapus data santri.');
      return;
    }
    try {
      await storageService.deleteStudent(deleteConfirmStudent.id);
      showToast('info', 'Santri Dihapus', `Data santri ${deleteConfirmStudent.name} telah dihapus.`);
      setDeleteConfirmStudent(null);
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Menghapus', e.message);
    }
  };

  const handleQuickTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickTopUpStudent) return;
    if (user?.role === 'guest' || user?.role === 'viewer') {
      showToast('error', 'Akses Dibatasi', 'Wali Santri / Tamu tidak dapat melakukan transaksi isi saldo.');
      return;
    }

    const num = parseFloat(quickTopUpAmount.replace(/[^0-9]/g, ''));
    if (!num || num <= 0) {
      showToast('warning', 'Nominal Tidak Valid', 'Masukkan nominal top up yang benar.');
      return;
    }

    try {
      await storageService.addTopUp({
        topup_code: `TOP-${Date.now().toString().slice(-8)}`,
        student_id: quickTopUpStudent.id,
        amount: num,
        notes: quickTopUpNotes || 'Isi Saldo Cepat Data Santri',
        payment_method: 'Tunai',
        created_by: 'Admin Koperasi',
      });

      showToast('success', 'Isi Saldo Berhasil', `Saldo ${quickTopUpStudent.name} bertambah ${formatRupiah(num)}.`);
      setQuickTopUpStudent(null);
      setQuickTopUpAmount('');
      setQuickTopUpNotes('');
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Top Up', e.message);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-2.5 tracking-tight">
            <Users className="w-7 h-7 text-[#00c48c]" />
            Data Santri Pondok
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Kelola profil, kelas, asrama, dan saldo seluruh santri terdaftar
          </p>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={() => {
              setStudentToEdit(null);
              setIsFormModalOpen(true);
            }}
            className="px-5 py-2.5 rounded-xl bg-[#00c48c] hover:bg-[#00ad7b] text-white font-bold text-sm flex items-center gap-2 shadow-lg shadow-[#00c48c]/25 transition-all active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            Tambah Santri Baru
          </button>
        )}
      </div>

      {/* Filters Bar Card (Matching User's Reference Design) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#0c1322] border border-slate-800/90 shadow-lg space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari Nama, NIS, Orang Tua..."
              className="w-full pl-10 pr-3.5 py-2.5 bg-[#131d2f] border border-slate-700/60 rounded-xl text-xs font-medium text-white placeholder-slate-400 focus:outline-none focus:border-[#00c48c] transition-colors"
            />
          </div>

          {/* Filter Kelas */}
          <select
            value={filterClass}
            onChange={(e) => setFilterClass(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#131d2f] border border-slate-700/60 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#00c48c] transition-colors cursor-pointer"
          >
            <option value="all" className="bg-[#0c1322] text-white">Semua Kelas</option>
            {DEFAULT_CLASSES.map((c) => (
              <option key={c} value={c} className="bg-[#0c1322] text-white">
                {c}
              </option>
            ))}
          </select>

          {/* Filter Asrama */}
          <select
            value={filterDormitory}
            onChange={(e) => setFilterDormitory(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#131d2f] border border-slate-700/60 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#00c48c] transition-colors cursor-pointer"
          >
            <option value="all" className="bg-[#0c1322] text-white">Semua Asrama</option>
            {DEFAULT_DORMITORIES.map((d) => (
              <option key={d} value={d} className="bg-[#0c1322] text-white">
                {d}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-3.5 py-2.5 bg-[#131d2f] border border-slate-700/60 rounded-xl text-xs font-medium text-white focus:outline-none focus:border-[#00c48c] transition-colors cursor-pointer"
          >
            <option value="all" className="bg-[#0c1322] text-white">Semua Status</option>
            <option value="aktif" className="bg-[#0c1322] text-white">Aktif</option>
            <option value="nonaktif" className="bg-[#0c1322] text-white">Non-Aktif</option>
          </select>
        </div>

        {/* Row 2: Count & View Mode Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          <div className="text-xs text-slate-400 font-medium">
            Menampilkan <strong className="text-white font-bold">{filteredStudents.length}</strong> dari {students.length} Santri
          </div>

          <div className="inline-flex items-center p-1 rounded-xl bg-[#131d2f] border border-slate-700/60">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'table'
                  ? 'bg-[#1c2940] text-[#00c48c] shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tabel</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                viewMode === 'cards'
                  ? 'bg-[#1c2940] text-[#00c48c] shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kartu</span>
            </button>
          </div>
        </div>

        {/* Balance Status Quick Filter Tabs */}
        <div className="flex flex-wrap items-center gap-2 pt-3 border-t border-slate-800/80 text-xs">
          <span className="text-[11px] font-semibold text-slate-400 mr-1">Status Saldo:</span>
          <button
            type="button"
            onClick={() => setFilterBalance('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterBalance === 'all'
                ? 'bg-[#1c2940] text-white border border-slate-600 shadow-xs'
                : 'bg-[#131d2f] text-slate-400 border border-slate-800/80 hover:bg-[#18243a]'
            }`}
          >
            Semua ({students.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterBalance('debt')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterBalance === 'debt'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-950/30 text-rose-400 border border-rose-900/60 hover:bg-rose-950/50'
            }`}
          >
            <span>🚨 Berhutang</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterBalance === 'debt' ? 'bg-white text-rose-700' : 'bg-rose-600 text-white'
              }`}
            >
              {debtCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterBalance('warning')}
            className={`px-3 py-1 rounded-lg font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              filterBalance === 'warning'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-950/30 text-amber-400 border border-amber-900/60 hover:bg-amber-950/50'
            }`}
            title="Santri dengan saldo kritis / hampir habis"
          >
            <span>⚠️ Saldo Kritis (Hampir Habis)</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                filterBalance === 'warning' ? 'bg-white text-amber-800' : 'bg-amber-600 text-white'
              }`}
            >
              {warningCount}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setFilterBalance('safe')}
            className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
              filterBalance === 'safe'
                ? 'bg-[#00c48c] text-white shadow-xs'
                : 'bg-emerald-950/30 text-[#00c48c] border border-emerald-900/60 hover:bg-emerald-950/50'
            }`}
          >
            ✓ Saldo Aman
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {viewMode === 'table' ? (
        <div className="bg-[#0c1322] rounded-2xl border border-slate-800/90 shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#10192d] border-b border-slate-800 text-xs font-bold text-slate-400 tracking-wider">
                  <th className="py-4 px-5">Santri</th>
                  <th className="py-4 px-5">NIS</th>
                  <th className="py-4 px-5">Kelas / Asrama</th>
                  <th className="py-4 px-5">Orang Tua / HP</th>
                  <th className="py-4 px-5">Status</th>
                  <th className="py-4 px-5 text-right">Saldo Saat Ini</th>
                  <th className="py-4 px-5 text-center">
                    {user?.role !== 'viewer' && user?.role !== 'guest' ? 'Aksi Cepat' : 'Aktivitas'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70 text-xs">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student, idx) => (
                    <tr key={`${student.id}-${idx}`} className="hover:bg-[#131d33] transition-colors">
                      <td className="py-4 px-5">
                        <div
                          onClick={() => navigate(`/santri/${student.id}`)}
                          className="flex items-center gap-3 cursor-pointer group"
                        >
                          <StudentAvatar
                            src={student.avatar_url}
                            name={student.name}
                            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-700"
                          />
                          <div>
                            <p className="font-bold text-white group-hover:text-[#00c48c] transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-slate-400">Masuk: {formatDate(student.joined_date)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5 font-mono font-bold text-slate-300">
                        {student.nis}
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-slate-200">{student.class_name}</p>
                        <p className="text-[10px] text-slate-400">{student.dormitory}</p>
                      </td>
                      <td className="py-4 px-5">
                        <p className="font-semibold text-slate-200">{student.parent_name}</p>
                        <a
                          href={`https://wa.me/${student.parent_phone.replace(/[^0-9]/g, '')}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] text-[#00c48c] hover:underline inline-flex items-center gap-1 font-mono"
                        >
                          <Phone className="w-3 h-3" />
                          {student.parent_phone}
                        </a>
                      </td>
                      <td className="py-4 px-5">
                        {student.status === 'aktif' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-950/60 text-[#00c48c] border border-emerald-800/50 font-semibold text-[10px]">
                            <CheckCircle2 className="w-3 h-3" />
                            Aktif
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700 font-semibold text-[10px]">
                            <XCircle className="w-3 h-3" />
                            Non-Aktif
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-right">
                        {student.balance < 0 ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="font-black text-rose-400 text-sm tracking-tight">
                              {formatRupiah(student.balance)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white text-[9px] font-black uppercase tracking-wider animate-pulse">
                              HUTANG MINUS
                            </span>
                          </div>
                        ) : student.balance <= minBalanceAlert ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className="font-black text-rose-400 text-sm tracking-tight">
                              {formatRupiah(student.balance)}
                            </span>
                            <span className="px-1.5 py-0.5 rounded bg-rose-950/60 text-rose-300 text-[9px] font-extrabold border border-rose-800">
                              SALDO KRITIS
                            </span>
                          </div>
                        ) : (
                          <span className="font-extrabold text-[#00c48c] text-sm">
                            {formatRupiah(student.balance)}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-5 text-center">
                        {user?.role !== 'viewer' && user?.role !== 'guest' ? (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setQuickTopUpStudent(student)}
                              title="Isi Saldo Cepat"
                              className="p-2 rounded-xl bg-emerald-950/50 hover:bg-emerald-900/60 text-[#00c48c] border border-emerald-800/40 text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <Wallet className="w-3.5 h-3.5" />
                              <span>TopUp</span>
                            </button>
                            <button
                              onClick={() => setQrModalStudent(student)}
                              title="Kartu QR Santri"
                              className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                            >
                              <QrCode className="w-4 h-4 text-indigo-400" />
                            </button>
                            {user?.role === 'admin' && (
                              <>
                                <button
                                  onClick={() => {
                                    setStudentToEdit(student);
                                    setIsFormModalOpen(true);
                                  }}
                                  title="Edit Santri"
                                  className="p-2 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                                >
                                  <Edit className="w-4 h-4 text-amber-400" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirmStudent(student)}
                                  title="Hapus Santri"
                                  className="p-2 rounded-xl hover:bg-rose-950/40 text-rose-400 transition-colors cursor-pointer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => navigate(`/santri/${student.id}`)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-950/60 hover:bg-emerald-900/60 text-[#00c48c] border border-emerald-800/50 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Lihat Detail
                            </button>
                            <button
                              onClick={() => setQrModalStudent(student)}
                              title="Kartu QR Santri"
                              className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-300 transition-colors cursor-pointer"
                            >
                              <QrCode className="w-4 h-4 text-indigo-400" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                      Tidak ada santri yang sesuai dengan kriteria pencarian
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Card Layout View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredStudents.map((student, idx) => (
            <div
              key={`${student.id}-${idx}`}
              className="bg-[#0c1322] rounded-2xl border border-slate-800/90 p-5 space-y-4 hover:border-slate-700 hover:shadow-lg transition-all relative group cursor-pointer"
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  onClick={() => navigate(`/santri/${student.id}`)}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <StudentAvatar
                    src={student.avatar_url}
                    name={student.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-[#00c48c]/30 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-sm text-white group-hover:text-[#00c48c] transition-colors">
                      {student.name}
                    </h3>
                    <p className="text-xs font-mono text-[#00c48c] font-bold">
                      {student.nis}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setQrModalStudent(student)}
                  className="p-2 rounded-xl bg-[#131d2f] hover:bg-slate-800 text-slate-300 transition-colors"
                >
                  <QrCode className="w-4 h-4 text-[#00c48c]" />
                </button>
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] space-y-1">
                <div className="flex justify-between text-slate-300">
                  <span>Kelas / Asrama:</span>
                  <span className="font-semibold text-white">{student.class_name} • {student.dormitory}</span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Wali:</span>
                  <span className="font-semibold text-white">{student.parent_name}</span>
                </div>
              </div>

              {student.balance < 0 ? (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-400 font-bold uppercase block">Hutang Santri:</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-black uppercase">STATUS MINUS</span>
                  </div>
                  <span className="font-black text-rose-400 text-base">
                    {formatRupiah(student.balance)}
                  </span>
                </div>
              ) : student.balance <= minBalanceAlert ? (
                <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-rose-400 font-bold uppercase block">Sisa Saldo:</span>
                    <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold uppercase tracking-wide">SALDO KRITIS</span>
                  </div>
                  <span className="font-black text-rose-400 text-base">
                    {formatRupiah(student.balance)}
                  </span>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-800/40 flex items-center justify-between">
                  <span className="text-xs text-slate-300 font-medium">Saldo Tabungan:</span>
                  <span className="font-black text-[#00c48c] text-base">
                    {formatRupiah(student.balance)}
                  </span>
                </div>
              )}

              {user?.role !== 'viewer' && user?.role !== 'guest' ? (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={() => setQuickTopUpStudent(student)}
                    className={getButtonClass(uiStyle, "primary", "flex-1 py-1.5 text-xs")}
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    Isi Saldo
                  </button>
                  <div className="flex gap-1.5">
                    {user?.role === 'admin' && (
                      <>
                        <button
                          onClick={() => {
                            setStudentToEdit(student);
                            setIsFormModalOpen(true);
                          }}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
                        >
                          <Edit className="w-4 h-4 text-amber-500" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmStudent(student)}
                          className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="pt-1">
                  <button
                    onClick={() => navigate(`/santri/${student.id}`)}
                    className="w-full py-2 px-3 text-xs font-bold rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    Lihat Aktivitas & Detail Santri
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Form Modal */}
      <SantriFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveStudent}
        studentToEdit={studentToEdit}
      />

      {/* QR Code Modal */}
      <SantriQRModal
        isOpen={Boolean(qrModalStudent)}
        onClose={() => setQrModalStudent(null)}
        student={qrModalStudent}
      />

      {/* Quick TopUp Modal */}
      <Modal
        isOpen={Boolean(quickTopUpStudent)}
        onClose={() => setQuickTopUpStudent(null)}
        title="Isi Saldo Cepat Santri"
        subtitle={`Pengisian saldo tunai untuk ${quickTopUpStudent?.name}`}
        maxWidth="md"
      >
        {quickTopUpStudent && (
          <form onSubmit={handleQuickTopUpSubmit} className="space-y-4 text-xs">
            <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
              <div>
                <p className="font-bold text-slate-900 dark:text-white text-sm">{quickTopUpStudent.name}</p>
                <p className="text-slate-500 font-mono">{quickTopUpStudent.nis}</p>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block">Saldo Saat Ini</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300 text-sm">
                  {formatRupiah(quickTopUpStudent.balance)}
                </span>
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nominal Top Up (Rp) *
              </label>
              <input
                type="text"
                inputMode="numeric"
                required
                value={quickTopUpAmount}
                onChange={handleQuickTopUpAmountChange}
                placeholder="50.000"
                className={getInputClass(uiStyle)}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {[10000, 20000, 50000, 100000, 200000].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setQuickTopUpAmount(num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 font-bold text-[10px]"
                  >
                    +{formatRupiah(num)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Catatan</label>
              <input
                type="text"
                value={quickTopUpNotes}
                onChange={(e) => setQuickTopUpNotes(e.target.value)}
                placeholder="mis. Titipan Orang Tua"
                className={getInputClass(uiStyle)}
              />
            </div>

            <div className="flex justify-end gap-3 pt-3">
              <button
                type="button"
                onClick={() => setQuickTopUpStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold"
              >
                Proses Top Up
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmStudent)}
        onClose={() => setDeleteConfirmStudent(null)}
        title="Konfirmasi Hapus Santri"
        maxWidth="sm"
      >
        {deleteConfirmStudent && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <p>
              Apakah Anda yakin ingin menghapus santri{' '}
              <strong className="text-slate-900 dark:text-white">{deleteConfirmStudent.name}</strong> ({deleteConfirmStudent.nis})?
            </p>
            <p className="text-rose-500 font-semibold text-[11px]">
              Tindakan ini tidak dapat dibatalkan. Riwayat transaksi santri ini akan dihapus.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmStudent(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800"
              >
                Batal
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 text-white font-bold"
              >
                Ya, Hapus Data
              </button>
            </div>
          </div>
        )}
      </Modal>

      
    </div>
  );
};

