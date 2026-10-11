import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  disableNetwork,
  enableNetwork,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const db = (() => {
  try {
    const databaseId = firebaseConfig.firestoreDatabaseId;
    return initializeFirestore(
      app,
      {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      },
      databaseId || undefined
    );
  } catch (e) {
    return firebaseConfig.firestoreDatabaseId
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  }
})();

export const disableFirestoreNetwork = async () => {
  try {
    await disableNetwork(db);
  } catch (e) {
    /* ignore if already disabled */
  }
};

export const enableFirestoreNetwork = async () => {
  try {
    await enableNetwork(db);
  } catch (e) {
    /* ignore if already enabled */
  }
};

// Check if daily quota was previously exceeded today; disable network only if true
if (typeof window !== 'undefined') {
  try {
    const raw = localStorage.getItem('koperasi_firestore_quota_exceeded');
    if (raw) {
      const parsed = JSON.parse(raw);
      const date = new Date(parsed.timestamp);
      const now = new Date();
      if (
        date.getUTCDate() === now.getUTCDate() &&
        date.getUTCMonth() === now.getUTCMonth() &&
        date.getUTCFullYear() === now.getUTCFullYear()
      ) {
        disableFirestoreNetwork();
      } else {
        localStorage.removeItem('koperasi_firestore_quota_exceeded');
        enableFirestoreNetwork();
      }
    }
  } catch (e) {
    /* ignore */
  }
}

export default app;
