import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  ExternalLink, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  LogOut, 
  ShieldCheck, 
  CloudUpload,
  Sparkles,
  Link2
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  initAuth, 
  googleSignIn, 
  googleSignOut, 
  exportToNewGoogleSheet, 
  getCurrentAccessToken 
} from '../lib/googleSheetsService';
import { Transaction, SurauInfo } from '../types';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  surauInfo: SurauInfo;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  onClose,
  transactions,
  surauInfo,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [lastSheetUrl, setLastSheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('surau_last_google_sheet_url');
  });

  useEffect(() => {
    if (!isOpen) return;

    const unsubscribe = initAuth(
      (currentUser, accessToken) => {
        setUser(currentUser);
        setToken(accessToken);
      },
      () => {
        setUser(null);
        setToken(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await googleSignIn();
      if (res) {
        setUser(res.user);
        setToken(res.accessToken);
        setSuccessMsg(`Berjaya log masuk sebagai ${res.user.displayName || res.user.email}`);
      }
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      setError(err?.message || 'Gagal log masuk dengan akaun Google. Sila cuba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      await googleSignOut();
      setUser(null);
      setToken(null);
      setSuccessMsg('Log keluar Google berjaya.');
    } catch (err: any) {
      setError(err?.message || 'Gagal log keluar.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExportToSheets = async () => {
    const currentToken = token || getCurrentAccessToken();
    if (!currentToken) {
      setError('Sila log masuk dengan Google terlebih dahulu.');
      return;
    }

    setIsExporting(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const result = await exportToNewGoogleSheet(transactions, surauInfo);
      setLastSheetUrl(result.spreadsheetUrl);
      localStorage.setItem('surau_last_google_sheet_url', result.spreadsheetUrl);
      setSuccessMsg('Penyata kewangan berjaya dieksport ke Google Sheets!');
    } catch (err: any) {
      console.error('Export Error:', err);
      setError(err?.message || 'Gagal mengeksport data ke Google Sheets.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-emerald-200 hover:text-white p-1 rounded-lg hover:bg-emerald-800/50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-emerald-700/50 rounded-xl border border-emerald-500/30 text-emerald-300">
              <FileSpreadsheet className="w-7 h-7" />
            </div>
            <div>
              <h2 className="text-xl font-bold font-serif text-white">Integrasi Google Sheets</h2>
              <p className="text-xs text-emerald-200/90 mt-0.5">Eksport & Sambung Rekod Kewangan Surau</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Box */}
          {user ? (
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName || 'Google User'} className="w-10 h-10 rounded-full border border-emerald-300" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-sm">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-slate-900 text-xs">{user.displayName || 'Akaun Google'}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-200 text-emerald-800 text-[10px] font-extrabold">Terhubung</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-mono mt-0.5">{user.email}</p>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                disabled={isLoading}
                className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition border border-transparent hover:border-rose-200"
                title="Log Keluar Google"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="p-5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <p className="text-xs text-slate-600 font-medium leading-relaxed">
                Log masuk menggunakan akaun Google anda untuk membolehkan sistem terus mengeksport dan menyelaraskan rekod kewangan Surau Al Jannah ke Google Sheets secara rasmi.
              </p>

              {/* GSI Google Sign in Button */}
              <button
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                className="mx-auto w-full max-w-xs flex items-center justify-center gap-3 px-4 py-2.5 bg-white hover:bg-slate-50 border border-slate-300 rounded-xl shadow-sm text-slate-700 text-xs font-bold transition hover:shadow cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-700" />
                ) : (
                  <svg className="w-4 h-4" viewBox="0 0 48 48">
                    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"></path>
                    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"></path>
                    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"></path>
                    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"></path>
                  </svg>
                )}
                <span>Log Masuk dengan Google</span>
              </button>
            </div>
          )}

          {/* Feedback Messages */}
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Export Action Section */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <CloudUpload className="w-4 h-4 text-emerald-700" />
              <span>Eksport Rekod Kewangan ({transactions.length} Transaksi)</span>
            </h3>

            <p className="text-[11px] text-slate-500 leading-relaxed">
              Tindakan ini akan membuat satu Spreadsheet Google Sheets baru yang tersusun mengandungi ringkasan penerimaan, perbelanjaan, baki semasa, dan semua transaksi surau.
            </p>

            <button
              onClick={handleExportToSheets}
              disabled={!user || isExporting}
              className="w-full py-3 px-4 rounded-xl bg-emerald-800 hover:bg-emerald-900 disabled:bg-slate-300 text-white text-xs font-extrabold shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>Sedang Mengeksport ke Google Sheets...</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-4 h-4 text-amber-300" />
                  <span>Jana & Cipta Google Sheet Baru</span>
                </>
              )}
            </button>
          </div>

          {/* Last Export Link */}
          {lastSheetUrl && (
            <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 overflow-hidden">
                <Link2 className="w-4 h-4 text-amber-700 shrink-0" />
                <div className="truncate">
                  <p className="text-[11px] font-bold text-amber-900">Google Sheet Terakhir Dicipta</p>
                  <p className="text-[10px] text-amber-700 truncate">{lastSheetUrl}</p>
                </div>
              </div>

              <a
                href={lastSheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition shrink-0 flex items-center gap-1"
              >
                <span>Buka</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 text-xs font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
