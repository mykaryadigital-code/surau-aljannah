import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  setDoc, 
  deleteDoc, 
  writeBatch,
  getDocs,
  getDoc
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, SurauInfo } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const databaseId = (firebaseConfig as any).firestoreDatabaseId;
export const db = (databaseId && databaseId !== '(default)')
  ? getFirestore(app, databaseId)
  : getFirestore(app);

// Helper to strip undefined values so Firestore setDoc does not throw errors
function cleanForFirestore<T extends Record<string, any>>(obj: T): Record<string, any> {
  const result: Record<string, any> = {};
  Object.keys(obj).forEach((key) => {
    const val = obj[key];
    if (val !== undefined) {
      result[key] = val;
    }
  });
  return result;
}

// Subscribe to Transactions real-time
export function subscribeToTransactions(
  onData: (data: Transaction[]) => void,
  onError?: (err: Error) => void
) {
  const transactionsCol = collection(db, 'transactions');
  return onSnapshot(
    transactionsCol,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data() as Transaction;
        items.push({
          ...data,
          id: docSnap.id || data.id,
        });
      });
      // Sort by date descending
      items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      onData(items);
    },
    (err) => {
      console.error('Firestore transactions error:', err);
      if (onError) onError(err);
    }
  );
}

// Subscribe to Surau Info real-time
export function subscribeToSurauInfo(
  onData: (data: SurauInfo | null) => void,
  onError?: (err: Error) => void
) {
  const infoDocRef = doc(db, 'surau_settings', 'info');
  return onSnapshot(
    infoDocRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onData(docSnap.data() as SurauInfo);
      } else {
        onData(null);
      }
    },
    (err) => {
      console.error('Firestore surauInfo error:', err);
      if (onError) onError(err);
    }
  );
}

// Save or Update Single Transaction
export async function saveTransactionToCloud(transaction: Transaction): Promise<void> {
  try {
    const docRef = doc(db, 'transactions', transaction.id);
    const cleaned = cleanForFirestore(transaction);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    console.error('Error saving transaction to cloud:', err);
    throw err;
  }
}

// Delete Single Transaction
export async function deleteTransactionFromCloud(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'transactions', id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error('Error deleting transaction from cloud:', err);
    throw err;
  }
}

// Save or Update Surau Info
export async function saveSurauInfoToCloud(surauInfo: SurauInfo): Promise<void> {
  try {
    const infoDocRef = doc(db, 'surau_settings', 'info');
    const cleaned = cleanForFirestore(surauInfo);
    await setDoc(infoDocRef, cleaned, { merge: true });
  } catch (err) {
    console.error('Error saving surau info to cloud:', err);
    throw err;
  }
}

// Seed or Sync initial local data to Cloud if cloud is empty
export async function seedInitialCloudData(
  localInfo: SurauInfo,
  localTransactions: Transaction[]
): Promise<void> {
  try {
    // Check info
    const infoDocRef = doc(db, 'surau_settings', 'info');
    const infoSnap = await getDoc(infoDocRef);
    if (!infoSnap.exists() && localInfo) {
      await setDoc(infoDocRef, cleanForFirestore(localInfo));
    }

    // Check transactions
    if (localTransactions && localTransactions.length > 0) {
      const txCol = collection(db, 'transactions');
      const txSnap = await getDocs(txCol);
      if (txSnap.empty) {
        const batch = writeBatch(db);
        localTransactions.forEach((t) => {
          const ref = doc(db, 'transactions', t.id);
          batch.set(ref, cleanForFirestore(t));
        });
        await batch.commit();
      }
    }
  } catch (err) {
    console.error('Error seeding initial data to cloud:', err);
  }
}

// Batch Sync / Import All Transactions
export async function importAllToCloud(
  surauInfo: SurauInfo,
  transactions: Transaction[]
): Promise<void> {
  try {
    await saveSurauInfoToCloud(surauInfo);
    if (transactions && transactions.length > 0) {
      const batch = writeBatch(db);
      transactions.forEach((t) => {
        const ref = doc(db, 'transactions', t.id);
        batch.set(ref, cleanForFirestore(t));
      });
      await batch.commit();
    }
  } catch (err) {
    console.error('Error importing all to cloud:', err);
    throw err;
  }
}
