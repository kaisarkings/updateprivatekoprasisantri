with open('src/components/common/Navbar.tsx', 'r') as f:
    content = f.read()

# Add imports
content = content.replace(
    "import { ProfileModal } from './ProfileModal';",
    "import { ProfileModal } from './ProfileModal';\nimport { PRAYER_EVENT, PrayerEventDetail } from '../../lib/prayer/prayer-notification';"
)

# Add event listener
listener_code = """    const handleTopUp = (e: Event) => {
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
      // audio is handled by prayer module
    };

    window.addEventListener(TRANSACTION_SUCCESS_EVENT, handleTransaction);
    window.addEventListener(TOPUP_SUCCESS_EVENT, handleTopUp);
    window.addEventListener(PRAYER_EVENT, handlePrayerNotif);

    return () => {
      window.removeEventListener(TRANSACTION_SUCCESS_EVENT, handleTransaction);
      window.removeEventListener(TOPUP_SUCCESS_EVENT, handleTopUp);
      window.removeEventListener(PRAYER_EVENT, handlePrayerNotif);
    };"""

content = content.replace("""    const handleTopUp = (e: Event) => {
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

    window.addEventListener(TRANSACTION_SUCCESS_EVENT, handleTransaction);
    window.addEventListener(TOPUP_SUCCESS_EVENT, handleTopUp);

    return () => {
      window.removeEventListener(TRANSACTION_SUCCESS_EVENT, handleTransaction);
      window.removeEventListener(TOPUP_SUCCESS_EVENT, handleTopUp);
    };""", listener_code)

# Update UI for prayer icon
content = content.replace(
    "{notif.type === 'jajan' ? (",
    "{notif.type === 'prayer' ? (\n                            <div className=\"p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400 rounded-full shrink-0\">\n                              <Bell className=\"w-4 h-4\" />\n                            </div>\n                          ) : notif.type === 'jajan' ? ("
)

with open('src/components/common/Navbar.tsx', 'w') as f:
    f.write(content)
