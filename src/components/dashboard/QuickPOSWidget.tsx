import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp } from '../../context/AppContext';
import { useAuth } from '../../context/AuthContext';
import { storageService } from '../../services/storageService';
import { CATEGORIES } from '../../constants';
import { TransactionCategory } from '../../types';
import { formatRupiah } from '../../utils/formatters';
import {
  ShoppingCart,
  Wallet,
  Search,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldAlert,
  AlertCircle,
  Sparkles,
  X,
  User,
  Zap,
} from 'lucide-react';
import { ReceiptModal } from '../common/ReceiptModal';
import { StudentAvatar } from '../common/StudentAvatar';

export const QuickPOSWidget: React.FC = () => {
  const { students, showToast, refreshData, settings, categories: appCategories } = useApp();
  const categoriesList = appCategories && appCategories.length > 0 ? appCategories : CATEGORIES;
  const { user } = useAuth();
  const isGuest = user?.role === 'guest' || user?.role === 'viewer';

  const [activeTab, setActiveTab] = useState<'jajan' | 'topup'>('jajan');

  if (isGuest) {
    return null;
  }

  const minBalanceAlert = settings.min_balance_alert || 10000;
  const allowDebt = settings.allow_debt !== false;
  const maxDebtLimit = settings.max_debt_limit || 50000;

  const [selectedStudentId, setSelectedStudentId] = useState<string>('');
  const [studentSearch, setStudentSearch] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [category, setCategory] = useState<TransactionCategory>('Makanan');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  React.useEffect(() => {
    if (categoriesList.length > 0 && !categoriesList.some((c) => c.name === category)) {
      setCategory(categoriesList[0].name);
    }
  }, [categoriesList, category]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    if (val) {
      setAmount(val.replace(/\B(?=(\d{3})+(?!\d))/g, "."));
    } else {
      setAmount('');
    }
  };

  // Receipt Modal State
  const [receiptData, setReceiptData] = useState<{
    isOpen: boolean;
    type: 'jajan' | 'topup';
    code: string;
    studentName: string;
    studentNis: string;
    amount: number;
    categoryOrMethod: string;
    notes?: string;
    timePeriod?: string;
  } | null>(null);

  const filteredStudents = students.filter(
    (s) =>
      s.status === 'aktif' &&
      (s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
        s.nis.toLowerCase().includes(studentSearch.toLowerCase()))
  );

  const selectedStudent = students.find((s) => s.id === selectedStudentId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) {
      showToast('warning', 'Pilih Santri', 'Silakan pilih santri terlebih dahulu.');
      return;
    }

    const numAmount = parseFloat(amount.replace(/[^0-9]/g, ''));
    if (!numAmount || numAmount <= 0) {
      showToast('warning', 'Nominal Tidak Valid', 'Silakan masukkan nominal yang benar.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (activeTab === 'jajan') {
        const newBalance = selectedStudent.balance - numAmount;
        if (newBalance < 0) {
          if (!allowDebt) {
            showToast(
              'error',
              'Kasbon Ditolak',
              `Saldo ${selectedStudent.name} (${formatRupiah(selectedStudent.balance)}) tidak cukup. Fitur hutang/kasbon sedang dinonaktifkan.`
            );
            setIsSubmitting(false);
            return;
          }
          if (newBalance < -maxDebtLimit) {
            showToast(
              'error',
              'Melebihi Batas Kasbon',
              `Saldo santri akan menjadi ${formatRupiah(newBalance)}, melebihi batas maksimal hutang ${formatRupiah(maxDebtLimit)}.`
            );
            setIsSubmitting(false);
            return;
          }
        }

        const trx = await storageService.addTransaction({
          transaction_code: `TRX-${Date.now().toString().slice(-8)}`,
          student_id: selectedStudent.id,
          amount: numAmount,
          category,
          notes: notes || `Jajan ${category}`,
          created_by: 'Admin Kasir',
        });

        setReceiptData({
          isOpen: true,
          type: 'jajan',
          code: trx.transaction_code,
          studentName: selectedStudent.name,
          studentNis: selectedStudent.nis,
          amount: numAmount,
          categoryOrMethod: category,
          notes: trx.notes,
          timePeriod: trx.time_period,
        });
      } else {
        // Top Up
        const topup = await storageService.addTopUp({
          topup_code: `TOP-${Date.now().toString().slice(-8)}`,
          student_id: selectedStudent.id,
          amount: numAmount,
          notes: notes || 'Isi Saldo Kasir Dashboard',
          payment_method: 'Tunai',
          created_by: 'Admin Kasir',
        });

        setReceiptData({
          isOpen: true,
          type: 'topup',
          code: topup.topup_code,
          studentName: selectedStudent.name,
          studentNis: selectedStudent.nis,
          amount: numAmount,
          categoryOrMethod: 'Tunai',
          notes: topup.notes,
        });
      }

      // Reset form
      setAmount('');
      setNotes('');
      await refreshData();
    } catch (err: any) {
      showToast('error', 'Gagal Transaksi', err.message || 'Terjadi kesalahan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const presetAmounts = [5000, 10000, 15000, 20000, 50000];

  const categoryColorMap: Record<string, string> = {
    Makanan: 'hover:border-amber-400 hover:text-amber-500',
    Minuman: 'hover:border-sky-400 hover:text-sky-500',
    Snack: 'hover:border-orange-400 hover:text-orange-500',
    ATK: 'hover:border-purple-400 hover:text-purple-500',
    Kitab: 'hover:border-emerald-400 hover:text-emerald-500',
    Seragam: 'hover:border-blue-400 hover:text-blue-500',
  };

  return (
    <div className="space-y-4">
      {/* Tab Selector with Smooth Active Pill */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="inline-flex p-1 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            onClick={() => setActiveTab('jajan')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'jajan'
                ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-md shadow-emerald-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Kasir Jajan</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('topup')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'topup'
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Wallet className="w-4 h-4" />
            <span>Isi Saldo (Top-Up)</span>
          </button>
        </div>
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/50">
          <Zap className="w-3.5 h-3.5" />
          <span>Transaksi Cepat</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Select Student */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Pilih Santri</span>
            {selectedStudent && (
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                Santri Terpilih
              </span>
            )}
          </label>
          <div className="relative">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => {
                setStudentSearch(e.target.value);
                setSelectedStudentId('');
              }}
              placeholder="Ketik Nama atau NIS Santri..."
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
            />
            {studentSearch ? (
              <button
                type="button"
                onClick={() => {
                  setStudentSearch('');
                  setSelectedStudentId('');
                }}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            ) : (
              <Search className="w-4 h-4 absolute right-3 top-3 text-slate-400 pointer-events-none" />
            )}
          </div>

          {/* Search Dropdown / List */}
          {studentSearch && !selectedStudent && (
            <div className="mt-1.5 max-h-44 overflow-y-auto bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl divide-y divide-slate-100 dark:divide-slate-700 z-30 relative animate-in fade-in duration-150">
              {filteredStudents.length > 0 ? (
                filteredStudents.map((s, idx) => (
                  <button
                    key={`qp-st-${s.id || idx}`}
                    type="button"
                    onClick={() => {
                      setSelectedStudentId(s.id);
                      setStudentSearch(`${s.name} (${s.nis})`);
                    }}
                    className="w-full text-left px-3.5 py-2.5 text-xs hover:bg-emerald-50/80 dark:hover:bg-emerald-950/40 flex items-center justify-between transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <StudentAvatar
                        src={s.avatar_url}
                        name={s.name}
                        className="w-7 h-7 rounded-full shrink-0 ring-1 ring-slate-200 dark:ring-slate-700"
                      />
                      <div className="truncate">
                        <p className="font-bold text-slate-800 dark:text-slate-200 truncate">{s.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{s.nis} • {s.class_name}</p>
                      </div>
                    </div>
                    {s.balance < 0 ? (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-600 text-white font-extrabold text-[10px] shrink-0">
                        🚨 HUTANG {formatRupiah(s.balance)}
                      </span>
                    ) : s.balance <= minBalanceAlert ? (
                      <span className="px-2 py-0.5 rounded-lg bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 font-bold text-[10px] border border-rose-300 dark:border-rose-800 shrink-0">
                        ⚠️ KRITIS {formatRupiah(s.balance)}
                      </span>
                    ) : (
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 shrink-0">
                        {formatRupiah(s.balance)}
                      </span>
                    )}
                  </button>
                ))
              ) : (
                <div className="p-4 text-xs text-slate-400 text-center">
                  Santri tidak ditemukan dengan kata kunci &quot;{studentSearch}&quot;
                </div>
              )}
            </div>
          )}

          {/* Selected Student Info Badge with Danger Alerts */}
          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2"
            >
              {selectedStudent.balance < 0 ? (
                /* Debt Box */
                <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-600 to-red-700 text-white shadow-md flex items-center justify-between text-xs animate-pulse">
                  <div className="flex items-center gap-2.5">
                    <StudentAvatar
                      src={selectedStudent.avatar_url}
                      name={selectedStudent.name}
                      className="w-9 h-9 rounded-full ring-2 ring-white/60 shrink-0"
                    />
                    <div>
                      <span className="font-black text-white text-sm block">{selectedStudent.name} (BERHUTANG)</span>
                      <p className="text-[10px] text-rose-100 font-mono">{selectedStudent.nis} • {selectedStudent.class_name}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-rose-200 uppercase font-bold block">Total Hutang</span>
                    <span className="font-black text-white text-base">
                      {formatRupiah(selectedStudent.balance)}
                    </span>
                  </div>
                </div>
              ) : selectedStudent.balance <= minBalanceAlert ? (
                /* Low Balance Danger Box */
                <div className="p-3 rounded-2xl bg-gradient-to-r from-rose-50 to-amber-50 dark:from-rose-950/60 dark:to-amber-950/40 border border-rose-300 dark:border-rose-800 text-rose-900 dark:text-rose-100 flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <StudentAvatar
                      src={selectedStudent.avatar_url}
                      name={selectedStudent.name}
                      className="w-9 h-9 rounded-full ring-2 ring-rose-400 shrink-0"
                    />
                    <div>
                      <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-1.5">
                        {selectedStudent.name}
                        <span className="px-1.5 py-0.2 rounded bg-rose-600 text-white text-[9px] font-bold">SALDO KRITIS</span>
                      </span>
                      <p className="text-[10px] text-rose-600 dark:text-rose-300">Uang saku hampir habis (≤ {formatRupiah(minBalanceAlert)})</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-rose-600 dark:text-rose-400 block font-semibold">Sisa Saldo</span>
                    <span className="font-black text-rose-700 dark:text-rose-300 text-base font-mono">
                      {formatRupiah(selectedStudent.balance)}
                    </span>
                  </div>
                </div>
              ) : (
                /* Normal Healthy Box */
                <div className="p-3 rounded-2xl bg-gradient-to-r from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/40 dark:to-teal-950/30 border border-emerald-200/90 dark:border-emerald-800/60 flex items-center justify-between text-xs shadow-xs">
                  <div className="flex items-center gap-2.5">
                    <StudentAvatar
                      src={selectedStudent.avatar_url}
                      name={selectedStudent.name}
                      className="w-9 h-9 rounded-full ring-2 ring-emerald-500/50 shrink-0"
                    />
                    <div>
                      <span className="font-bold text-slate-900 dark:text-white block">{selectedStudent.name}</span>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">{selectedStudent.nis} • {selectedStudent.class_name} • {selectedStudent.dormitory}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block font-medium">Saldo Tabungan</span>
                    <span className="font-black text-emerald-600 dark:text-emerald-400 text-base font-mono">
                      {formatRupiah(selectedStudent.balance)}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Category (For Jajan Only) */}
        {activeTab === 'jajan' && (
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Kategori Jajan
            </label>
            <div className="flex flex-wrap gap-1.5">
              {categoriesList.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <motion.button
                    key={cat.id}
                    type="button"
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setCategory(cat.name)}
                    className={`py-1.5 px-3 rounded-xl text-xs font-bold text-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white border-transparent shadow-sm shadow-emerald-500/25'
                        : 'bg-slate-100/80 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat.name}
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Amount */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            Nominal Transaksi (Rp)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-2.5 text-sm font-extrabold text-slate-400 font-mono">Rp</span>
            <input
              type="text"
              inputMode="numeric"
              value={amount}
              onChange={handleAmountChange}
              placeholder="0"
              className="w-full pl-11 pr-3.5 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black font-mono text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Preset Buttons with colorful chips and animations */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {presetAmounts.map((p) => (
              <motion.button
                key={p}
                type="button"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAmount(p.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "."))}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-emerald-500 hover:text-white dark:bg-slate-800 dark:hover:bg-emerald-600 text-slate-700 dark:text-slate-300 font-bold text-xs transition-all border border-slate-200/80 dark:border-slate-700/80 shadow-2xs cursor-pointer font-mono"
              >
                +{formatRupiah(p)}
              </motion.button>
            ))}
          </div>
        </div>

        {/* Notes */}
        <div>
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Catatan opsional (mis. Nasi goreng, Es Teh, Kitab Taqrib)..."
            className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
          />
        </div>

        {/* Debt / Minus Alert Preview (For Jajan) */}
        {activeTab === 'jajan' && selectedStudent && parseFloat(amount.replace(/[^0-9]/g, '') || '0') > selectedStudent.balance && (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {!allowDebt ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Saldo tidak cukup dan fitur hutang/kasbon sedang dinonaktifkan.</span>
              </div>
            ) : (selectedStudent.balance - parseFloat(amount.replace(/[^0-9]/g, '') || '0')) < -maxDebtLimit ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-500 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>Melebihi limit kasbon maksimal ({formatRupiah(maxDebtLimit)}).</span>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-200 text-xs flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Kasbon diizinkan:</strong> Saldo santri akan menjadi <strong className="text-rose-600 dark:text-rose-400">{formatRupiah(selectedStudent.balance - parseFloat(amount.replace(/[^0-9]/g, '') || '0'))} (MINUS)</strong>.
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* Submit Button */}
        {(() => {
          const numVal = parseFloat(amount.replace(/[^0-9]/g, '') || '0');
          const isJajanMinus = activeTab === 'jajan' && selectedStudent && numVal > selectedStudent.balance;
          const isOverLimit = isJajanMinus && (selectedStudent.balance - numVal) < -maxDebtLimit;
          const isBlocked = isJajanMinus && (!allowDebt || isOverLimit);

          return (
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isSubmitting || !selectedStudent || numVal <= 0 || isBlocked}
              className={`w-full py-3 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer ${
                isJajanMinus && !isBlocked
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 shadow-amber-500/25'
                  : activeTab === 'jajan'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 shadow-emerald-500/25'
                  : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-400 hover:to-indigo-500 shadow-blue-500/25'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? (
                <span>Memproses Transaksi...</span>
              ) : isJajanMinus && !isBlocked ? (
                <>
                  <span>Proses Jajan (Kasbon / Saldo Minus)</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>
                    {activeTab === 'jajan' ? 'Proses Transaksi Jajan Santri' : 'Proses Isi Saldo Santri'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </motion.button>
          );
        })()}
      </form>

      {/* Receipt Modal Popup */}
      {receiptData && (
        <ReceiptModal
          isOpen={receiptData.isOpen}
          onClose={() => setReceiptData(null)}
          title={receiptData.type === 'jajan' ? 'Struk Transaksi Jajan' : 'Struk Isi Saldo'}
          type={receiptData.type}
          receiptCode={receiptData.code}
          studentName={receiptData.studentName}
          studentNis={receiptData.studentNis}
          amount={receiptData.amount}
          categoryOrMethod={receiptData.categoryOrMethod}
          notes={receiptData.notes}
          timePeriod={receiptData.timePeriod}
        />
      )}
    </div>
  );
};

