import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { useApp } from './AppContext';
import {
  TRANSACTION_SUCCESS_EVENT,
  TOPUP_SUCCESS_EVENT,
  TransactionSuccessDetail,
  TopUpSuccessDetail,
} from '../services/storageService';
import { PRAYER_EVENT, PrayerEventDetail } from '../lib/prayer/prayer-notification';
import { formatRupiah } from '../utils/formatters';

export interface RealtimeNotifItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'jajan' | 'topup' | 'prayer';
  amount?: number;
  isRead?: boolean;
}

export interface BusinessFund {
  totalIncome: number;
  totalExpense: number;
  netCash: number;
}

interface NotificationContextType {
  notifications: RealtimeNotifItem[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAllNotifications: () => void;
  businessFund: BusinessFund;
  isNotifOpen: boolean;
  setIsNotifOpen: (open: boolean) => void;
  toggleNotif: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { topups, transactions } = useApp();
  const [realtimeNotifications, setRealtimeNotifications] = useState<RealtimeNotifItem[]>([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [readNotifIds, setReadNotifIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('koperasi_read_notifs');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const playNotificationSound = useCallback(() => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const playTone = (freq: number, startTime: number, duration: number) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(0.5, startTime + 0.05);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + duration);
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.4);
      playTone(698.46, now + 0.15, 0.6);
    } catch (e) {
      console.error('Audio play failed', e);
    }
  }, []);

  // Listen to live real-time transaction, topup & prayer events
  useEffect(() => {
    const handleTransaction = (e: Event) => {
      const detail = (e as CustomEvent<TransactionSuccessDetail>).detail;
      if (!detail) return;
      const newItem: RealtimeNotifItem = {
        id: 'rt-tr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: 'Transaksi Jajan Berhasil',
        message: `${detail.studentName} (${detail.studentNis}) jajan ${detail.category} sejumlah ${formatRupiah(detail.amount)}. Saldo sisa: ${formatRupiah(detail.updatedBalance)}.`,
        time: new Date().toISOString(),
        type: 'jajan',
        amount: detail.amount,
        isRead: false,
      };
      setRealtimeNotifications((prev) => [newItem, ...prev]);
      playNotificationSound();
    };

    const handleTopUp = (e: Event) => {
      const detail = (e as CustomEvent<TopUpSuccessDetail>).detail;
      if (!detail) return;
      const newItem: RealtimeNotifItem = {
        id: 'rt-tp-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: 'Top Up Berhasil',
        message: `Pengisian saldo ${formatRupiah(detail.amount)} (${detail.paymentMethod}) untuk ${detail.studentName} (${detail.studentNis}). Saldo baru: ${formatRupiah(detail.updatedBalance)}.`,
        time: new Date().toISOString(),
        type: 'topup',
        amount: detail.amount,
        isRead: false,
      };
      setRealtimeNotifications((prev) => [newItem, ...prev]);
      playNotificationSound();
    };

    const handlePrayerNotif = (e: Event) => {
      const detail = (e as CustomEvent<PrayerEventDetail>).detail;
      if (!detail) return;
      const newItem: RealtimeNotifItem = {
        id: 'rt-pr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 5),
        title: detail.title,
        message: detail.message,
        time: new Date().toISOString(),
        type: 'prayer',
        isRead: false,
      };
      setRealtimeNotifications((prev) => [newItem, ...prev]);
    };

    window.addEventListener(TRANSACTION_SUCCESS_EVENT, handleTransaction);
    window.addEventListener(TOPUP_SUCCESS_EVENT, handleTopUp);
    window.addEventListener(PRAYER_EVENT, handlePrayerNotif);

    return () => {
      window.removeEventListener(TRANSACTION_SUCCESS_EVENT, handleTransaction);
      window.removeEventListener(TOPUP_SUCCESS_EVENT, handleTopUp);
      window.removeEventListener(PRAYER_EVENT, handlePrayerNotif);
    };
  }, [playNotificationSound]);

  // Combine live notifications with recent topups & transactions
  const notifications = useMemo(() => {
    const items: RealtimeNotifItem[] = [...realtimeNotifications];

    (topups || []).forEach((tp) => {
      const id = `notif-tp-${tp.id}`;
      if (!items.some((i) => i.id === id)) {
        items.push({
          id,
          title: 'Top Up Berhasil',
          message: `Pengisian saldo ${formatRupiah(tp.amount)} (${tp.payment_method}) untuk ${tp.student_name || 'Santri'} (${tp.student_nis || '-'}).`,
          time: tp.created_at,
          type: 'topup',
          amount: tp.amount,
        });
      }
    });

    (transactions || []).forEach((tr) => {
      const id = `notif-tr-${tr.id}`;
      if (!items.some((i) => i.id === id)) {
        items.push({
          id,
          title: 'Transaksi Jajan Berhasil',
          message: `${tr.student_name || 'Santri'} (${tr.student_nis || '-'}) jajan ${tr.category} sejumlah ${formatRupiah(tr.amount)}.`,
          time: tr.created_at,
          type: 'jajan',
          amount: tr.amount,
        });
      }
    });

    return items
      .map((item) => ({
        ...item,
        isRead: item.isRead || readNotifIds.includes(item.id),
      }))
      .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
      .slice(0, 30);
  }, [realtimeNotifications, topups, transactions, readNotifIds]);

  const markAsRead = useCallback((id: string) => {
    setReadNotifIds((prev) => {
      if (prev.includes(id)) return prev;
      const updated = [...prev, id];
      localStorage.setItem('koperasi_read_notifs', JSON.stringify(updated.slice(-100)));
      return updated;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('koperasi_read_notifs', JSON.stringify(allIds.slice(-100)));
  }, [notifications]);

  const clearAllNotifications = useCallback(() => {
    const allIds = notifications.map((n) => n.id);
    setReadNotifIds(allIds);
    localStorage.setItem('koperasi_read_notifs', JSON.stringify(allIds));
    setRealtimeNotifications([]);
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  const businessFund = useMemo(() => {
    const totalIncome = (topups || []).reduce((sum, t) => sum + t.amount, 0);
    const totalExpense = (transactions || []).reduce((sum, t) => sum + t.amount, 0);
    const netCash = totalIncome - totalExpense;
    return { totalIncome, totalExpense, netCash };
  }, [topups, transactions]);

  const toggleNotif = useCallback(() => {
    setIsNotifOpen((prev) => !prev);
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        clearAllNotifications,
        businessFund,
        isNotifOpen,
        setIsNotifOpen,
        toggleNotif,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};
