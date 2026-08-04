import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User, signOut } from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Transaction, SurauInfo } from '../types';
import { formatDateMalay, formatRM } from '../utils/formatters';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/spreadsheets');
provider.addScope('https://www.googleapis.com/auth/drive.file');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else if (!isSigningIn) {
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      if (onAuthFailure) onAuthFailure();
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses daripada Google Auth.');
    }
    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getCurrentAccessToken = (): string | null => {
  return cachedAccessToken;
};

export const googleSignOut = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};

// Helper: Export transactions to a new Google Sheet
export const exportToNewGoogleSheet = async (
  transactions: Transaction[],
  surauInfo: SurauInfo,
  sheetTitleCustom?: string
): Promise<{ spreadsheetId: string; spreadsheetUrl: string }> => {
  if (!cachedAccessToken) {
    throw new Error('Sila log masuk dengan akaun Google terlebih dahulu.');
  }

  const title = sheetTitleCustom || `Kewangan ${surauInfo.name} - ${new Date().toLocaleDateString('ms-MY')}`;

  // 1. Create a new Spreadsheet
  const createRes = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${cachedAccessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      properties: {
        title,
      },
      sheets: [
        {
          properties: {
            title: 'Rekod Kewangan',
            gridProperties: {
              frozenRowCount: 6,
            },
          },
        },
      ],
    }),
  });

  if (!createRes.ok) {
    const errData = await createRes.json();
    throw new Error(errData?.error?.message || 'Gagal mencipta Google Sheet baru.');
  }

  const createData = await createRes.json();
  const spreadsheetId = createData.spreadsheetId;
  const spreadsheetUrl = createData.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`;

  // 2. Prepare header rows and data rows
  const openingBalance = surauInfo.bakiTerdahulu || 0;
  const totalIn = transactions.filter(t => t.type === 'IN').reduce((sum, t) => sum + t.amount, 0);
  const totalOut = transactions.filter(t => t.type === 'OUT').reduce((sum, t) => sum + t.amount, 0);
  const balance = openingBalance + totalIn - totalOut;

  const values: (string | number)[][] = [
    [`PENYATA KEWANGAN - ${surauInfo.name.toUpperCase()}`],
    [`Lokasi: ${surauInfo.locationName || 'Surau Al Jannah'} | Tarikh Jana: ${new Date().toLocaleDateString('ms-MY')}`],
    [`Baki Awal: RM ${openingBalance.toFixed(2)} | Total Masuk: RM ${totalIn.toFixed(2)} | Total Keluar: RM ${totalOut.toFixed(2)} | Baki Semasa: RM ${balance.toFixed(2)}`],
    [''],
    [
      'Bil',
      'Tarikh',
      'No. Resit / Baucer',
      'Jenis (IN/OUT)',
      'Kategori Utama',
      'Perihal / Tujuan',
      'Pembayar / Penerima',
      'Kaedah Pembayaran',
      'Jumlah (RM)',
      'Status Audit'
    ],
  ];

  transactions.forEach((t, idx) => {
    values.push([
      idx + 1,
      t.date,
      t.receiptNo,
      t.type === 'IN' ? 'PENERIMAAN (IN)' : 'PERBELANJAAN (OUT)',
      t.category,
      t.description || '-',
      t.payerPayee || '-',
      t.paymentMethod || 'TUNAI',
      t.type === 'IN' ? t.amount : -t.amount,
      t.auditStatus || 'BELUM DISAHKAN',
    ]);
  });

  // Summary footer
  values.push(['']);
  values.push(['JUMLAH KESELURUHAN PENERIMAAN (RM):', totalIn]);
  values.push(['JUMLAH KESELURUHAN PERBELANJAAN (RM):', totalOut]);
  values.push(['BAKI BERSIH SEMASA (RM):', balance]);

  // 3. Write values to the sheet
  const updateRes = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekod%20Kewangan!A1?valueInputOption=USER_ENTERED`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Rekod Kewangan!A1',
        majorDimension: 'ROWS',
        values,
      }),
    }
  );

  if (!updateRes.ok) {
    const errData = await updateRes.json();
    throw new Error(errData?.error?.message || 'Gagal memasukkan data ke Google Sheet.');
  }

  return { spreadsheetId, spreadsheetUrl };
};

// Helper: Sync / append single transaction to an existing sheet
export const appendTransactionToSheet = async (
  spreadsheetId: string,
  t: Transaction
): Promise<void> => {
  if (!cachedAccessToken) {
    throw new Error('Sila log masuk dengan akaun Google.');
  }

  const row = [
    t.date,
    t.receiptNo,
    t.type === 'IN' ? 'PENERIMAAN (IN)' : 'PERBELANJAAN (OUT)',
    t.category,
    t.description || '-',
    t.payerPayee || '-',
    t.paymentMethod || 'TUNAI',
    t.type === 'IN' ? t.amount : -t.amount,
    t.auditStatus || 'BELUM DISAHKAN',
  ];

  const res = await fetch(
    `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/Rekod%20Kewangan!A6:append?valueInputOption=USER_ENTERED`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cachedAccessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        range: 'Rekod Kewangan!A6',
        majorDimension: 'ROWS',
        values: [row],
      }),
    }
  );

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err?.error?.message || 'Gagal mengemaskini Google Sheet.');
  }
};
