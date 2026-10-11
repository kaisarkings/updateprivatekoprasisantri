import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Category } from '../../types';
import {
  CategoryIcon,
  AVAILABLE_CATEGORY_ICONS,
  AVAILABLE_CATEGORY_COLORS,
} from '../common/CategoryIcon';
import { CATEGORIES } from '../../constants';
import { Modal } from '../common/Modal';
import {
  Tags,
  Plus,
  Pencil,
  Trash2,
  RotateCcw,
  Check,
  Sparkles,
  Database,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

export const CategoryManagerSection: React.FC = () => {
  const { categories, updateCategories, addCategory, deleteCategory, showToast, uiStyle } = useApp();
  const isNeo = uiStyle === 'neo-brutalism';

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [iconName, setIconName] = useState('Utensils');
  const [color, setColor] = useState('bg-emerald-500');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Delete Confirmation Modal
  const [deleteConfirmCat, setDeleteConfirmCat] = useState<Category | null>(null);

  // Reset Confirmation Modal
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  const openAddModal = () => {
    setEditingCategory(null);
    setName('');
    setCode('');
    setIconName('Utensils');
    setColor('bg-emerald-500');
    setIsModalOpen(true);
  };

  const openEditModal = (cat: Category) => {
    setEditingCategory(cat);
    setName(cat.name);
    setCode(cat.code || '');
    setIconName(cat.icon_name || 'Utensils');
    setColor(cat.color || 'bg-emerald-500');
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = name.trim();
    if (!cleanName) {
      showToast('warning', 'Nama Diperlukan', 'Nama kategori jajan tidak boleh kosong.');
      return;
    }

    // Check duplicate name
    const isDuplicate = categories.some(
      (c) => c.name.toLowerCase() === cleanName.toLowerCase() && c.id !== editingCategory?.id
    );
    if (isDuplicate) {
      showToast('warning', 'Nama Duplikat', `Kategori dengan nama "${cleanName}" sudah ada.`);
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingCategory) {
        // Update existing category
        const updated = categories.map((c) =>
          c.id === editingCategory.id
            ? {
                ...c,
                name: cleanName,
                code: (code || cleanName.slice(0, 4)).toUpperCase().replace(/[^A-Z0-9]/g, ''),
                icon_name: iconName,
                color,
              }
            : c
        );
        await updateCategories(updated);
        showToast('success', 'Kategori Diperbarui', `Kategori "${cleanName}" berhasil diperbarui di database.`);
      } else {
        // Add new category
        const newCat: Omit<Category, 'id'> = {
          name: cleanName,
          code: (code || cleanName.slice(0, 4)).toUpperCase().replace(/[^A-Z0-9]/g, ''),
          icon_name: iconName,
          color,
        };
        await addCategory(newCat);
        showToast('success', 'Kategori Ditambahkan', `Kategori baru "${cleanName}" berhasil disimpan di database.`);
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showToast('error', 'Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan kategori.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteConfirmCat) return;

    if (categories.length <= 1) {
      showToast('warning', 'Tidak Dapat Dihapus', 'Minimal harus ada 1 kategori jajan yang aktif.');
      setDeleteConfirmCat(null);
      return;
    }

    try {
      await deleteCategory(deleteConfirmCat.id);
      showToast('success', 'Kategori Dihapus', `Kategori "${deleteConfirmCat.name}" telah dihapus dari database.`);
      setDeleteConfirmCat(null);
    } catch (err: any) {
      showToast('error', 'Gagal Menghapus', err.message);
    }
  };

  const handleConfirmReset = async () => {
    try {
      await updateCategories(CATEGORIES);
      showToast('success', 'Reset Berhasil', 'Kategori jajan telah dikembalikan ke 5 kategori default.');
      setIsResetConfirmOpen(false);
    } catch (err: any) {
      showToast('error', 'Gagal Reset', err.message);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 shrink-0">
            <Tags className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                Kustomisasi Kategori Jajan Santri
              </h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold text-[10px] border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
                <Database className="w-3 h-3 text-emerald-600" />
                DB Cloud & Lokal
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-relaxed">
              Kustomisasi daftar kategori jajan (Makanan, Minuman, Kitab, Laundry, ATK, dll) yang muncul pada halaman Kasir Transaksi Jajan & POS.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setIsResetConfirmOpen(true)}
            title="Kembalikan ke kategori default"
            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Default</span>
          </button>

          <button
            type="button"
            onClick={openAddModal}
            className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kategori</span>
          </button>
        </div>
      </div>

      {/* Category Cards List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
        {categories.map((cat, index) => {
          const catColor = cat.color || 'bg-emerald-500';
          return (
            <div
              key={cat.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/70 hover:border-emerald-500/50 hover:shadow-xs group ${
                isNeo ? 'border-2 border-black dark:border-white shadow-[2px_2px_0px_rgba(0,0,0,1)]' : ''
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl ${catColor} text-white flex items-center justify-center shrink-0 shadow-xs`}
                >
                  <CategoryIcon iconName={cat.icon_name} className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {cat.name}
                    </h4>
                    {cat.code && (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-slate-200/80 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                        {cat.code}
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                    Urutan #{index + 1} • Ikon: {cat.icon_name || 'Utensils'}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => openEditModal(cat)}
                  title="Edit Kategori"
                  className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 transition-colors cursor-pointer"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteConfirmCat(cat)}
                  title="Hapus Kategori"
                  disabled={categories.length <= 1}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Tip */}
      <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/30 border border-emerald-200/70 dark:border-emerald-800/40 rounded-2xl flex items-start gap-2.5 text-[11px] text-emerald-800 dark:text-emerald-200">
        <Sparkles className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Tip Admin:</strong> Kategori yang Anda tambahkan di sini akan langsung muncul sebagai tombol pilihan di layar <strong>Transaksi Jajan Koperasi</strong>, <strong>Widget POS Cepat Dashboard</strong>, dan filter <strong>Riwayat Transaksi</strong> secara realtime.
        </p>
      </div>

      {/* Modal Tambah / Edit Kategori */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCategory ? 'Edit Kategori Jajan' : 'Tambah Kategori Jajan Baru'}
        maxWidth="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Input Nama & Kode */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Nama Kategori *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="cth: Kitab & Buku, Laundry, dsb."
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1">
                Kode Singkat
              </label>
              <input
                type="text"
                maxLength={6}
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="cth: BOOK"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-mono font-bold text-slate-900 dark:text-white uppercase focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Color Swatches */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5">
              Warna Aksen Kategori
            </label>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_CATEGORY_COLORS.map((c) => (
                <button
                  key={c.bgClass}
                  type="button"
                  onClick={() => setColor(c.bgClass)}
                  className={`w-8 h-8 rounded-xl ${c.bgClass} flex items-center justify-center transition-transform cursor-pointer ${
                    color === c.bgClass
                      ? 'ring-3 ring-emerald-500 ring-offset-2 scale-110 shadow-xs'
                      : 'opacity-80 hover:opacity-100 hover:scale-105'
                  }`}
                  title={c.name}
                >
                  {color === c.bgClass && <Check className="w-4 h-4 text-white stroke-[3]" />}
                </button>
              ))}
            </div>
          </div>

          {/* Icon Selector Grid */}
          <div>
            <label className="block font-bold text-slate-800 dark:text-slate-200 mb-1.5 flex items-center justify-between">
              <span>Pilih Ikon Kategori</span>
              <span className="text-[10px] text-slate-400 font-normal">
                {AVAILABLE_CATEGORY_ICONS.length} Ikon Tersedia
              </span>
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-48 overflow-y-auto p-1 border border-slate-200 dark:border-slate-700/80 rounded-2xl bg-slate-50/50 dark:bg-slate-800/40">
              {AVAILABLE_CATEGORY_ICONS.map((icon) => (
                <button
                  key={icon.name}
                  type="button"
                  onClick={() => setIconName(icon.name)}
                  className={`p-2 rounded-xl flex flex-col items-center justify-center gap-1 text-center transition-all cursor-pointer ${
                    iconName === icon.name
                      ? 'bg-emerald-600 text-white shadow-xs font-bold'
                      : 'hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300'
                  }`}
                  title={icon.label}
                >
                  <CategoryIcon iconName={icon.name} className="w-5 h-5" />
                  <span className="text-[9px] truncate w-full">{icon.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Card */}
          <div className="p-3 bg-slate-100/80 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-bold text-slate-400 block mb-2">
              Pratinjau Tampilan Tombol Kasir:
            </span>
            <div className="flex items-center gap-3">
              <div
                className={`px-4 py-2.5 rounded-xl font-bold text-xs border text-center transition-all flex items-center gap-2 bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-500/20`}
              >
                <div className={`w-6 h-6 rounded-lg ${color} text-white flex items-center justify-center shrink-0`}>
                  <CategoryIcon iconName={iconName} className="w-3.5 h-3.5" />
                </div>
                <span>{name || 'Nama Kategori'}</span>
                {code && (
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-white/20 text-white">
                    {code}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-4 h-4" />
              <span>{isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deleteConfirmCat)}
        onClose={() => setDeleteConfirmCat(null)}
        title="Hapus Kategori Jajan"
        maxWidth="sm"
      >
        {deleteConfirmCat && (
          <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
            <div className="p-3 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900 rounded-xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-800 dark:text-rose-300 text-sm mb-0.5">
                  Konfirmasi Penghapusan
                </p>
                <p className="text-rose-700 dark:text-rose-400 font-medium leading-relaxed">
                  Apakah Anda yakin ingin menghapus kategori <strong>"{deleteConfirmCat.name}"</strong>?
                </p>
              </div>
            </div>

            <p className="text-[12px] leading-relaxed">
              Kategori ini tidak akan muncul lagi di halaman kasir transaksi jajan. Riwayat transaksi yang sudah lampau tetap tersimpan dengan nama kategori tersebut.
            </p>

            <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setDeleteConfirmCat(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold transition-colors shadow-xs"
              >
                Ya, Hapus Kategori
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        title="Reset Kategori ke Default"
        maxWidth="sm"
      >
        <div className="space-y-4 text-xs text-slate-600 dark:text-slate-300">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl flex items-start gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-bold text-amber-800 dark:text-amber-300 text-sm mb-0.5">
                Kembalikan ke Kategori Bawaan?
              </p>
              <p className="text-amber-700 dark:text-amber-400 font-medium leading-relaxed">
                Daftar kategori akan direset menjadi 5 kategori standar: Makanan, Minuman, Snack, ATK, dan Lainnya.
              </p>
            </div>
          </div>

          <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setIsResetConfirmOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleConfirmReset}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold transition-colors shadow-xs"
            >
              Ya, Reset Default
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
