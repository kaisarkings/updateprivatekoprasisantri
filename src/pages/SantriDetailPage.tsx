import React, { useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useAuth } from '../context/AuthContext';
import { formatRupiah, formatDate, formatDateTime, getWhatsAppLink } from '../utils/formatters';
import { SantriQRModal } from '../components/santri/SantriQRModal';
import { SantriFormModal } from '../components/santri/SantriFormModal';
import { Modal } from '../components/common/Modal';
import { storageService } from '../services/storageService';
import { StudentAvatar } from '../components/common/StudentAvatar';
import { compressAndReadFileAsDataURL } from '../utils/fileHelpers';
import {
  User,
  Wallet,
  ShoppingCart,
  Phone,
  QrCode,
  ArrowLeft,
  Edit,
  TrendingUp,
  History,
  CheckCircle2,
  Calendar,
  Building2,
  BookOpen,
  MessageSquare,
  Camera,
  Upload,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export const SantriDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { students, transactions, topups, showToast, refreshData, settings, isLoading } = useApp();

  const decodedId = id ? decodeURIComponent(id) : '';
  const student = students.find(
    (s) => s.id === id || s.id === decodedId || s.nis === id || s.nis === decodedId
  );

  const [activeTab, setActiveTab] = useState<'jajan' | 'topup'>('jajan');
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Quick TopUp Modal
  const [isTopUpOpen, setIsTopUpOpen] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState('');
  const [topUpNotes, setTopUpNotes] = useState('');

  const handleTopUpAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      setTopUpAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    } else {
      setTopUpAmount('');
    }
  };

  const studentTrxs = React.useMemo(
    () => (student ? transactions.filter((t) => t.student_id === student.id) : []),
    [student, transactions]
  );
  const studentTopups = React.useMemo(
    () => (student ? topups.filter((tp) => tp.student_id === student.id) : []),
    [student, topups]
  );

  const totalSpent = studentTrxs.reduce((sum, t) => sum + t.amount, 0);
  const totalTopUp = studentTopups.reduce((sum, tp) => sum + tp.amount, 0);

  // Personal Spending Trend Chart
  const personalChartData = React.useMemo(() => {
    if (!student) return [];
    const map = new Map<string, { date: string; displayDate: string; jajan: number; topup: number }>();
    const now = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const displayDate = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
      map.set(iso, { date: iso, displayDate, jajan: 0, topup: 0 });
    }

    (studentTrxs || []).forEach((t) => {
      const iso = t.created_at.slice(0, 10);
      if (map.has(iso)) map.get(iso)!.jajan += t.amount;
    });

    (studentTopups || []).forEach((tp) => {
      const iso = tp.created_at.slice(0, 10);
      if (map.has(iso)) map.get(iso)!.topup += tp.amount;
    });

    return Array.from(map.values());
  }, [student, studentTrxs, studentTopups]);

  if (!student) {
    if (isLoading) {
      return (
        <div className="p-12 text-center space-y-4 animate-pulse">
          <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 mx-auto"></div>
          <p className="text-slate-400 text-xs font-semibold">Memuat profil santri...</p>
        </div>
      );
    }

    return (
      <div className="p-8 text-center space-y-4 max-w-md mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <User className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto" />
        <h2 className="text-base font-bold text-slate-800 dark:text-slate-100">Data Santri Tidak Ditemukan</h2>
        <p className="text-xs text-slate-500">Santri dengan ID or NIS "{id}" tidak terdaftar atau telah dihapus.</p>
        <button
          onClick={() => navigate('/santri')}
          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition-all"
        >
          Kembali ke Data Santri
        </button>
      </div>
    );
  }

  const handleTopUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.role === 'guest' || user?.role === 'viewer') {
      showToast('error', 'Akses Dibatasi', 'Akun tamu / wali santri hanya memiliki akses lihat.');
      return;
    }
    const num = parseFloat(topUpAmount.replace(/[^0-9]/g, ''));
    if (!num || num <= 0) {
      showToast('warning', 'Nominal Tidak Valid', 'Silakan masukkan nominal top up.');
      return;
    }

    try {
      await storageService.addTopUp({
        topup_code: `TOP-${Date.now().toString().slice(-8)}`,
        student_id: student.id,
        amount: num,
        notes: topUpNotes || 'Top Up Halaman Detail Santri',
        payment_method: 'Tunai',
        created_by: 'Admin Koperasi',
      });

      showToast('success', 'Isi Saldo Berhasil', `Saldo ${student.name} bertambah ${formatRupiah(num)}.`);
      setIsTopUpOpen(false);
      setTopUpAmount('');
      setTopUpNotes('');
      await refreshData();
    } catch (e: any) {
      showToast('error', 'Gagal Top Up', e.message);
    }
  };

  const isGuest = user?.role === 'viewer' || user?.role === 'guest';
  const waMessage = isGuest
    ? `Assalamu'alaikum Admin ${settings.koperasi_name || 'Koperasi'}, saya wali dari ananda ${student?.name} (NIS: ${student?.nis}). Ingin menanyakan perihal saldo dan aktivitas santri. Terima kasih.`
    : `Assalamu'alaikum Bpk/Ibu ${student?.parent_name}, menginformasikan saldo Koperasi Santri an. ${student?.name} saat ini adalah ${formatRupiah(student?.balance || 0)}. Terima kasih.`;
  const waTargetPhone = isGuest ? (settings.phone || '081234567890') : student?.parent_phone;
  const waLink = getWhatsAppLink(waTargetPhone, waMessage);

  return (
    <div className="space-y-5 sm:space-y-8 pb-12 w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Back Button */}
      <button
        onClick={() => navigate('/santri')}
        className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Kembali ke Data Santri
      </button>

      {/* Main Student Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        {/* Top Decorative Banner */}
        <div className="absolute top-0 left-0 right-0 h-24 sm:h-28 bg-gradient-to-r from-emerald-600 to-teal-500 opacity-10 dark:opacity-20 pointer-events-none"></div>
        <div className="absolute top-0 right-0 p-6 pointer-events-none opacity-20 dark:opacity-10 hidden md:block">
          <Building2 className="w-32 h-32 text-emerald-600 transform translate-x-8 -translate-y-8" />
        </div>
        
        <div className="p-4 sm:p-8 relative z-10">
          {/* Institutional Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 dark:border-slate-800/60 pb-4 sm:pb-5 mb-5 sm:mb-6 gap-3">
            <div className="flex items-center gap-2.5 sm:gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shrink-0">
                <Building2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="min-w-0">
                <h3 className="font-black text-xs sm:text-sm uppercase tracking-wide text-slate-900 dark:text-white truncate">
                  {settings.koperasi_name || 'KOPERASI SANTRI'}
                </h3>
                <p className="text-[11px] sm:text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                  {settings.pesantren_name}
                </p>
              </div>
            </div>
            
            <span className="inline-flex px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-lg bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300 font-bold text-[10px] sm:text-xs tracking-wider border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
              PROFIL SANTRI
            </span>
          </div>

          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 sm:gap-8">
            {/* Student Identity */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-6 w-full lg:w-auto">
              <StudentAvatar
                src={student.avatar_url}
                name={student.name}
                className="w-20 h-20 sm:w-28 sm:h-28 rounded-2xl sm:rounded-[2rem] object-cover ring-4 ring-white dark:ring-slate-900 shadow-lg sm:shadow-xl shrink-0"
              />
              <div className="space-y-2 sm:space-y-2.5 w-full sm:w-auto">
                <div>
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-1">
                    <h1 className="text-xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">{student.name}</h1>
                    <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-black text-[9px] sm:text-[10px] tracking-wide">
                      {student.status.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-mono font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md inline-block">
                    NIS: {student.nis}
                  </p>
                </div>
                
                <div className="flex flex-wrap gap-2.5 sm:gap-5 text-xs sm:text-sm text-slate-600 dark:text-slate-300 font-medium">
                  <span className="flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                    Kelas {student.class_name}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-500 shrink-0" />
                    Asrama {student.dormitory}
                  </span>
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                    Masuk: {formatDate(student.joined_date)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 w-full lg:w-auto mt-2 lg:mt-0">
              {!isGuest && (
                <button
                  onClick={() => setIsTopUpOpen(true)}
                  className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-500/20"
                >
                  <Wallet className="w-4 h-4" />
                  Isi Saldo
                </button>
              )}
              <button
                onClick={() => setIsQrModalOpen(true)}
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors"
              >
                <QrCode className="w-4 h-4 text-emerald-600" />
                Kartu QR
              </button>
              <a
                href={waLink}
                target="_blank"
                rel="noreferrer"
                className="flex-1 sm:flex-none px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 border border-emerald-100 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 hover:bg-emerald-100 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                {isGuest ? 'Hubungi Koperasi' : 'Hubungi Wali'}
              </a>
              {user?.role === 'admin' && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="p-2.5 sm:p-3 rounded-xl border-2 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="Edit Data Santri"
                >
                  <Edit className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Stats Strip */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-slate-100 dark:border-slate-800/60">
            <div className="p-3 sm:p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-800/50">
              <p className="text-[10px] sm:text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wide truncate">Saldo Utama Saat Ini</p>
              <p className="text-lg sm:text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1 truncate">
                {formatRupiah(student.balance)}
              </p>
            </div>
            <div className="p-3 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide truncate">Top Up Masuk</p>
              <p className="text-base sm:text-2xl font-black text-slate-900 dark:text-white mt-1 truncate">
                {formatRupiah(totalTopUp)}
              </p>
            </div>
            <div className="p-3 sm:p-5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30">
              <p className="text-[10px] sm:text-xs font-bold text-rose-600/80 uppercase tracking-wide truncate">Pengeluaran Jajan</p>
              <p className="text-base sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1 truncate">
                {formatRupiah(totalSpent)}
              </p>
            </div>
            <div className="p-3 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
              <p className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-wide truncate">Total Transaksi</p>
              <p className="text-base sm:text-2xl font-black text-slate-900 dark:text-white mt-1">
                {studentTrxs.length + studentTopups.length} <span className="text-xs sm:text-sm font-semibold text-slate-400">Kali</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Spending Chart */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 mb-4">
          <TrendingUp className="w-4 h-4 text-emerald-500" />
          Grafik Transaksi Personal (14 Hari Terakhir)
        </h3>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={personalChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" opacity={0.5} />
              <XAxis dataKey="displayDate" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="topup" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
              <Area type="monotone" dataKey="jajan" stroke="#f43f5e" fill="#f43f5e" fillOpacity={0.2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* History Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <div className="flex items-center gap-4 mb-4 border-b border-slate-100 dark:border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('jajan')}
            className={`font-bold text-xs pb-2 border-b-2 transition-all ${
              activeTab === 'jajan'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Riwayat Jajan ({studentTrxs.length})
          </button>
          <button
            onClick={() => setActiveTab('topup')}
            className={`font-bold text-xs pb-2 border-b-2 transition-all ${
              activeTab === 'topup'
                ? 'border-emerald-600 text-emerald-600 dark:text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            Riwayat Top Up ({studentTopups.length})
          </button>
        </div>

        {activeTab === 'jajan' ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {studentTrxs.length > 0 ? (
              studentTrxs.map((t, idx) => (
                <div key={t.id || `sd-trx-${idx}`} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{t.category}</span>
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 font-mono text-[10px]">
                        {t.time_period.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{t.notes} • {formatDateTime(t.created_at)}</p>
                  </div>
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm">
                    -{formatRupiah(t.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-slate-400">Belum ada riwayat jajan</p>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {studentTopups.length > 0 ? (
              studentTopups.map((tp, idx) => (
                <div key={tp.id || `sd-tp-${idx}`} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">Isi Saldo ({tp.payment_method})</span>
                      <span className="font-mono text-[10px] text-slate-400">{tp.topup_code}</span>
                    </div>
                    <p className="text-slate-400 text-[11px]">{tp.notes} • {formatDateTime(tp.created_at)}</p>
                  </div>
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                    +{formatRupiah(tp.amount)}
                  </span>
                </div>
              ))
            ) : (
              <p className="py-6 text-center text-slate-400">Belum ada riwayat top up</p>
            )}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <SantriFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={async (data) => {
          await storageService.saveStudent(data as any);
          showToast('success', 'Data Diperbarui', 'Profil santri berhasil diperbarui.');
          await refreshData();
        }}
        studentToEdit={student}
      />

      {/* QR Code Modal */}
      <SantriQRModal
        isOpen={isQrModalOpen}
        onClose={() => setIsQrModalOpen(false)}
        student={student}
      />

      {/* TopUp Modal */}
      <Modal
        isOpen={isTopUpOpen}
        onClose={() => setIsTopUpOpen(false)}
        title="Isi Saldo Santri"
        subtitle={`Top up saldo untuk ${student.name}`}
      >
        <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold mb-1">Nominal Top Up (Rp)</label>
            <input
              type="text"
              inputMode="numeric"
              required
              value={topUpAmount}
              onChange={handleTopUpAmountChange}
              placeholder="50.000"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border rounded-xl text-base font-bold"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1">Catatan</label>
            <input
              type="text"
              value={topUpNotes}
              onChange={(e) => setTopUpNotes(e.target.value)}
              placeholder="mis. Kiriman Orang Tua"
              className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800 border rounded-xl"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button type="button" onClick={() => setIsTopUpOpen(false)} className="px-4 py-2 border rounded-xl">
              Batal
            </button>
            <button type="submit" className="px-5 py-2 bg-emerald-600 text-white font-bold rounded-xl">
              Proses Isi Saldo
            </button>
          </div>
        </form>
      </Modal>

      
    </div>
  );
};

