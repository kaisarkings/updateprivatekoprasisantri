import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Student, Transaction, TopUp, AppSettings, DashboardStats, TopSantriStat, Category } from '../types';
import { CATEGORIES } from '../constants';
import { useAuth } from './AuthContext';
import {
  storageService,
  subscribeToDataChange,
  TRANSACTION_SUCCESS_EVENT,
  TOPUP_SUCCESS_EVENT,
  TransactionSuccessDetail,
  TopUpSuccessDetail,
} from '../services/storageService';
import { formatRupiah } from '../utils/formatters';
import { UIStyleMode } from '../utils/theme';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message?: string;
}

interface AppContextType {
  highContrast: boolean;
  toggleHighContrast: () => void;
  students: Student[];
  transactions: Transaction[];
  topups: TopUp[];
  categories: Category[];
  settings: AppSettings;
  stats: DashboardStats | null;
  topSantri: TopSantriStat[];
  isLoading: boolean;
  uiStyle: UIStyleMode;
  setUIStyle: (style: UIStyleMode) => void;
  toggleUIStyle: () => void;
  themeMode: 'light' | 'dark';
  toggleTheme: () => void;
  updateSettings: (newSettings: AppSettings) => Promise<void>;
  updateCategories: (newCategories: Category[]) => Promise<void>;
  addCategory: (category: Omit<Category, 'id'>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  showToast: (type: ToastMessage['type'], title: string, message?: string) => void;
  toasts: ToastMessage[];
  removeToast: (id: string) => void;
  refreshData: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  hasUnsyncedData: boolean;
  pendingSyncCount: number;
  isSyncing: boolean;
  syncOfflineData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [students, setStudents] = useState<Student[]>(() => storageService.getCachedStudents());
  const [transactions, setTransactions] = useState<Transaction[]>(() => storageService.getCachedTransactions());
  const [topups, setTopups] = useState<TopUp[]>([]);
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings as any);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [topSantri, setTopSantri] = useState<TopSantriStat[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [pendingSyncCount, setPendingSyncCount] = useState<number>(() => storageService.getPendingQueueCount());
  const [hasUnsyncedData, setHasUnsyncedData] = useState<boolean>(() => storageService.getPendingQueueCount() > 0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [highContrast, setHighContrast] = useState<boolean>(() => localStorage.getItem('koperasi_high_contrast') === 'true');

  const [uiStyle, setUIStyleState] = useState<UIStyleMode>(() => {
    const saved = localStorage.getItem('koperasi_ui_style');
    if (saved === 'neo-brutalism' || saved === 'standard') return saved;
    return 'standard';
  });

  const [themeMode, setThemeMode] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('koperasi_theme');
    if (saved === 'dark' || saved === 'light') return saved;
    return 'light';
  });

  const setUIStyle = useCallback((style: UIStyleMode) => {
    setUIStyleState(style);
    localStorage.setItem('koperasi_ui_style', style);
  }, []);

  const toggleUIStyle = useCallback(() => {
    setUIStyleState((prev) => {
      const next = prev === 'standard' ? 'neo-brutalism' : 'standard';
      localStorage.setItem('koperasi_ui_style', next);
      return next;
    });
  }, []);

  
  const toggleHighContrast = useCallback(() => {
    setHighContrast((prev) => {
      const next = !prev;
      localStorage.setItem('koperasi_high_contrast', String(next));
      return next;
    });
  }, []);

  const toggleTheme = useCallback(() => {
    setThemeMode((prev) => {
      const next = prev === 'light' ? 'dark' : 'light';
      localStorage.setItem('koperasi_theme', next);
      return next;
    });
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (themeMode === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (uiStyle === 'neo-brutalism') {
      root.classList.add('neo-brutalism');
      root.setAttribute('data-ui-style', 'neo-brutalism');
    } else {
      root.classList.remove('neo-brutalism');
      root.setAttribute('data-ui-style', 'standard');
    }
  }, [highContrast,
        toggleHighContrast,
        themeMode, uiStyle, highContrast]);

  const updateSettings = useCallback(async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await storageService.saveSettings(newSettings);
  }, []);

  const updateCategories = useCallback(async (newCategories: Category[]) => {
    setCategories(newCategories);
    await storageService.saveCategories(newCategories);
  }, []);

  const addCategory = useCallback(async (cat: Omit<Category, 'id'>) => {
    const newCat: Category = {
      ...cat,
      id: 'cat-' + Date.now().toString(36) + '-' + Math.random().toString(36).substring(2, 6),
    };
    const updated = [...categories, newCat];
    setCategories(updated);
    await storageService.saveCategories(updated);
  }, [categories]);

  const deleteCategory = useCallback(async (id: string) => {
    const updated = categories.filter((c) => c.id !== id);
    setCategories(updated);
    await storageService.saveCategories(updated);
  }, [categories]);

  const showToast = useCallback((type: ToastMessage['type'], title: string, message?: string) => {
    const id = 'toast-' + Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sData, tData, topData, setRes, dashRes, catData] = await Promise.all([
        storageService.getStudents(),
        storageService.getTransactions(),
        storageService.getTopUps(),
        storageService.getSettings(),
        storageService.getDashboardStats(),
        storageService.getCategories(),
      ]);

      setStudents(sData || []);
      setTransactions(tData || []);
      setTopups(topData || []);
      setSettings(setRes);
      setCategories(catData || setRes?.categories || CATEGORIES);
      setStats(dashRes.stats);
      setTopSantri(dashRes?.topSantri || []);
      const count = storageService.getPendingQueueCount();
      setPendingSyncCount(count);
      setHasUnsyncedData(count > 0 || localStorage.getItem('koperasi_unsynced') === 'true');
    } catch (e) {
      console.error('Error refreshing data:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const syncOfflineData = useCallback(async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    try {
      const queueCount = storageService.getPendingQueueCount();
      if (queueCount === 0) {
        showToast('info', 'Sinkronisasi Selesai', 'Semua data transaksi sudah tersinkronisasi sempurna.');
        return;
      }
      showToast('info', 'Menyinkronkan...', `Memproses ${queueCount} data transaksi tersimpan di pesantren ke cloud server.`);
      const result = await storageService.syncPendingQueue();
      if (result.synced > 0) {
        showToast('success', 'Sinkronisasi Berhasil', `${result.synced} transaksi berhasil diunggah.`);
      }
      if (result.remaining > 0) {
        showToast('warning', 'Sebagian Tertunda', `${result.remaining} transaksi belum tersinkronisasi karena koneksi.`);
      }
      await refreshData();
    } catch (err: any) {
      showToast('error', 'Gagal Sinkronisasi', err?.message || 'Terjadi kesalahan jaringan.');
    } finally {
      setIsSyncing(false);
      setPendingSyncCount(storageService.getPendingQueueCount());
    }
  }, [isSyncing, refreshData, showToast]);

  // Auto-sync whenever internet is restored or periodically when online
  useEffect(() => {
    const handleOnline = async () => {
      const count = storageService.getPendingQueueCount();
      if (count > 0) {
        showToast('info', 'Koneksi Terhubung', `Jaringan online kembali. Menyinkronkan ${count} transaksi tersimpan...`);
        const res = await storageService.syncPendingQueue();
        if (res.synced > 0) {
          showToast('success', 'Data Tersinkron', `${res.synced} transaksi berhasil disinkronkan ke cloud.`);
        }
      }
      refreshData();
    };

    window.addEventListener('online', handleOnline);

    const periodicSync = setInterval(() => {
      if (typeof navigator !== 'undefined' && navigator.onLine) {
        const count = storageService.getPendingQueueCount();
        setPendingSyncCount(count);
        if (count > 0 && !isSyncing) {
          storageService.syncPendingQueue().then((res) => {
            if (res.synced > 0) refreshData();
          });
        }
      }
    }, 25000);

    return () => {
      window.removeEventListener('online', handleOnline);
      clearInterval(periodicSync);
    };
  }, [isSyncing, refreshData, showToast]);

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeToDataChange(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, [refreshData]);

  // Event listener to monitor transaction and topup status and trigger toast notification with updated balance
  useEffect(() => {
    const handleTransactionSuccess = (event: Event) => {
      const customEvent = event as CustomEvent<TransactionSuccessDetail>;
      if (customEvent.detail) {
        const { studentName, updatedBalance, amount, category } = customEvent.detail;
        showToast(
          'success',
          'Transaksi Jajan Berhasil',
          `Pembelian ${category} (${formatRupiah(amount)}) oleh ${studentName} berhasil. Saldo Terbaru: ${formatRupiah(updatedBalance)}`
        );
      }
    };

    const handleTopUpSuccess = (event: Event) => {
      const customEvent = event as CustomEvent<TopUpSuccessDetail>;
      if (customEvent.detail) {
        const { studentName, updatedBalance, amount, paymentMethod } = customEvent.detail;
        showToast(
          'success',
          'Pengisian Saldo Berhasil',
          `Pengisian saldo ${formatRupiah(amount)} (${paymentMethod}) untuk ${studentName} berhasil. Saldo Terbaru: ${formatRupiah(updatedBalance)}`
        );
      }
    };

    window.addEventListener(TRANSACTION_SUCCESS_EVENT, handleTransactionSuccess as EventListener);
    window.addEventListener(TOPUP_SUCCESS_EVENT, handleTopUpSuccess as EventListener);
    return () => {
      window.removeEventListener(TRANSACTION_SUCCESS_EVENT, handleTransactionSuccess as EventListener);
      window.removeEventListener(TOPUP_SUCCESS_EVENT, handleTopUpSuccess as EventListener);
    };
  }, [showToast]);

  return (
    <AppContext.Provider
      value={{
        students,
        transactions,
        topups,
        categories,
        settings,
        stats,
        topSantri,
        isLoading,
        uiStyle,
        setUIStyle,
        toggleUIStyle,
        highContrast,
        toggleHighContrast,
        themeMode,
        toggleTheme,
        updateSettings,
        updateCategories,
        addCategory,
        deleteCategory,
        showToast,
        toasts,
        removeToast,
        refreshData,
        searchQuery,
        setSearchQuery,
        hasUnsyncedData,
        pendingSyncCount,
        isSyncing,
        syncOfflineData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useApp;
