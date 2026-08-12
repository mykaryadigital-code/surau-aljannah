import React, { useState, useEffect, useMemo } from 'react';
import { Transaction, SurauInfo } from './types';
import { defaultSurauInfo, initialTransactions } from './data/initialData';
import { calculateFinancialSummary } from './utils/formatters';
import { 
  subscribeToTransactions, 
  subscribeToSurauInfo, 
  saveTransactionToCloud, 
  deleteTransactionFromCloud, 
  saveSurauInfoToCloud, 
  seedInitialCloudData, 
  importAllToCloud 
} from './lib/firebaseService';

import { Header } from './components/Header';
import { FinancialSummaryCards } from './components/FinancialSummaryCards';
import { TransactionTable } from './components/TransactionTable';
import { FinancialCharts } from './components/FinancialCharts';
import { TransactionFormModal } from './components/TransactionFormModal';
import { AuditModule } from './components/AuditModule';
import { MonthlyReportView } from './components/MonthlyReportView';
import { ReceiptPrintModal } from './components/ReceiptPrintModal';
import { AttachmentModal } from './components/AttachmentModal';
import { SettingsModal } from './components/SettingsModal';
import { AdminLoginModal } from './components/AdminLoginModal';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';

const SURAU_INFO_KEY = 'surau_pulasan3_info_v5';
const TRANSACTIONS_KEY = 'surau_pulasan3_transactions_v3';

export default function App() {
  // Admin Auth State
  const [isAdmin, setIsAdmin] = useState<boolean>(() => {
    return sessionStorage.getItem('surau_admin_auth') === 'true';
  });
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [adminLoginReason, setAdminLoginReason] = useState('');

  // Surau Info State
  const [surauInfo, setSurauInfo] = useState<SurauInfo>(() => {
    const saved = localStorage.getItem(SURAU_INFO_KEY) || localStorage.getItem('surau_pulasan3_info_v4') || localStorage.getItem('surau_pulasan3_info_v3');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const pengerusi = (!parsed.pengerusiName || parsed.pengerusiName === 'Haji Ahmad bin Mohd') 
          ? defaultSurauInfo.pengerusiName 
          : parsed.pengerusiName;
        const bendahari = (!parsed.bendahariName || parsed.bendahariName === 'Encik Razali bin Harun') 
          ? defaultSurauInfo.bendahariName 
          : parsed.bendahariName;
        const setiausaha = (!parsed.setiausahaName || parsed.setiausahaName === 'Encik Azman bin Kassim') 
          ? defaultSurauInfo.setiausahaName 
          : parsed.setiausahaName;

        const bakiBank = (parsed.bakiBankTerdahulu !== undefined && parsed.bakiBankTerdahulu !== 0) 
          ? parsed.bakiBankTerdahulu 
          : defaultSurauInfo.bakiBankTerdahulu;
        const bakiTunai = (parsed.bakiTunaiTerdahulu !== undefined && parsed.bakiTunaiTerdahulu !== 0) 
          ? parsed.bakiTunaiTerdahulu 
          : defaultSurauInfo.bakiTunaiTerdahulu;

        return {
          ...defaultSurauInfo,
          ...parsed,
          pengerusiName: pengerusi,
          bendahariName: bendahari,
          setiausahaName: setiausaha,
          bakiBankTerdahulu: bakiBank,
          bakiTunaiTerdahulu: bakiTunai,
          bakiTerdahulu: bakiBank + bakiTunai,
        };
      } catch (e) {
        console.error('Failed to parse saved surau info:', e);
      }
    }
    return defaultSurauInfo;
  });

  // Transactions State
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(TRANSACTIONS_KEY);
    if (saved) {
      try {
        const parsed: Transaction[] = JSON.parse(saved);
        return parsed.map((t) => {
          if ((t.category as string) === 'Utiliti Bil (TNB/Syabas/WiFi)') {
            return { ...t, category: 'Utiliti Bil (SESB/Jabatan Air/WiFi)' };
          }
          return t;
        });
      } catch (e) {
        console.error('Failed to parse saved transactions:', e);
      }
    }
    return initialTransactions;
  });

  // Active Tab: 'dashboard' | 'transactions' | 'reports' | 'audit'
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'reports' | 'audit'>('dashboard');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalInitialType, setAddModalInitialType] = useState<'IN' | 'OUT'>('IN');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [receiptToPrint, setReceiptToPrint] = useState<Transaction | null>(null);
  const [attachmentToView, setAttachmentToView] = useState<Transaction | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isGoogleSheetsOpen, setIsGoogleSheetsOpen] = useState(false);

  // Admin Handlers
  const handleOpenAdminLogin = (reason?: string) => {
    setAdminLoginReason(reason || '');
    setIsAdminLoginOpen(true);
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    sessionStorage.setItem('surau_admin_auth', 'true');
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    sessionStorage.removeItem('surau_admin_auth');
  };

  const handleOpenAddModal = (type: 'IN' | 'OUT' = 'IN') => {
    if (!isAdmin) {
      handleOpenAdminLogin('Log masuk Pentadbir (Admin) diperlukan untuk menambah transaksi baharu.');
      return;
    }
    setEditingTransaction(null);
    setAddModalInitialType(type);
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (t: Transaction) => {
    if (!isAdmin) {
      handleOpenAdminLogin('Log masuk Pentadbir (Admin) diperlukan untuk mengedit transaksi.');
      return;
    }
    setEditingTransaction(t);
    setIsAddModalOpen(true);
  };

  const handleOpenSettings = () => {
    if (!isAdmin) {
      handleOpenAdminLogin('Log masuk Pentadbir (Admin) diperlukan untuk mengubah Tetapan Surau.');
      return;
    }
    setIsSettingsOpen(true);
  };

  // Sync state to localStorage cache
  useEffect(() => {
    localStorage.setItem(SURAU_INFO_KEY, JSON.stringify(surauInfo));
  }, [surauInfo]);

  useEffect(() => {
    localStorage.setItem(TRANSACTIONS_KEY, JSON.stringify(transactions));
  }, [transactions]);

  // Real-time Cloud Firestore Subscriptions (Phone <-> PC Sync)
  useEffect(() => {
    // Seed initial local data to cloud if cloud database is empty
    seedInitialCloudData(surauInfo, transactions);

    // Real-time listener for Transactions
    const unsubTx = subscribeToTransactions((cloudTxs) => {
      if (cloudTxs && cloudTxs.length > 0) {
        setTransactions(cloudTxs);
      } else if (cloudTxs && cloudTxs.length === 0) {
        setTransactions((prevLocal) => {
          if (prevLocal && prevLocal.length > 0) {
            // Push local transactions up to Cloud if Cloud is empty
            importAllToCloud(surauInfo, prevLocal).catch((err) =>
              console.error('Failed to sync local data to cloud:', err)
            );
            return prevLocal;
          }
          return [];
        });
      }
    });

    // Real-time listener for Surau Info
    const unsubInfo = subscribeToSurauInfo((cloudInfo) => {
      if (cloudInfo && cloudInfo.name) {
        setSurauInfo(cloudInfo);
      }
    });

    return () => {
      unsubTx();
      unsubInfo();
    };
  }, []);

  // Financial Summary
  const summary = useMemo(() => {
    return calculateFinancialSummary(
      transactions, 
      surauInfo.bakiTerdahulu, 
      surauInfo.bakiBankTerdahulu, 
      surauInfo.bakiTunaiTerdahulu
    );
  }, [transactions, surauInfo.bakiTerdahulu, surauInfo.bakiBankTerdahulu, surauInfo.bakiTunaiTerdahulu]);

  // Handlers
  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
  ) => {
    const now = new Date().toISOString();
    let txToSave: Transaction;

    if (editingTransaction) {
      txToSave = { ...editingTransaction, ...data, updatedAt: now };
    } else {
      txToSave = {
        ...data,
        id: `tx-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        createdAt: now,
        updatedAt: now,
      };
      if (data.type === 'IN') {
        setReceiptToPrint(txToSave);
      }
    }

    // Optimistic local update
    setTransactions((prev) =>
      editingTransaction
        ? prev.map((t) => (t.id === txToSave.id ? txToSave : t))
        : [txToSave, ...prev]
    );
    setEditingTransaction(null);

    // Save to Cloud Firestore
    try {
      await saveTransactionToCloud(txToSave);
    } catch (err) {
      console.error('Failed to sync transaction to Cloud:', err);
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
    try {
      await deleteTransactionFromCloud(id);
    } catch (err) {
      console.error('Failed to delete transaction from Cloud:', err);
    }
  };

  const handleVerifyAudit = async (id: string, notes?: string) => {
    const updatedNow = new Date().toISOString();
    const target = transactions.find((t) => t.id === id);
    if (!target) return;

    const updatedTx: Transaction = {
      ...target,
      auditStatus: 'DISAHKAN',
      auditorNotes: notes || 'Disahkan oleh Pemeriksa Kira-kira Surau Al Jannah',
      updatedAt: updatedNow,
    };

    setTransactions((prev) => prev.map((t) => (t.id === id ? updatedTx : t)));

    try {
      await saveTransactionToCloud(updatedTx);
    } catch (err) {
      console.error('Failed to sync audit to Cloud:', err);
    }
  };

  const handleSaveSurauInfo = async (newInfo: SurauInfo) => {
    setSurauInfo(newInfo);
    try {
      await saveSurauInfoToCloud(newInfo);
    } catch (err) {
      console.error('Failed to sync surauInfo to Cloud:', err);
    }
  };

  const handleExportData = () => {
    const data = {
      surauInfo,
      transactions,
      exportedAt: new Date().toISOString(),
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `Backup_Kewangan_${surauInfo.name.replace(/\s+/g, '_')}_${new Date()
        .toISOString()
        .slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (e.target.files && e.target.files[0]) {
      fileReader.readAsText(e.target.files[0], 'UTF-8');
      fileReader.onload = async (event) => {
        try {
          const parsed = JSON.parse(event.target?.result as string);
          if (parsed.transactions && Array.isArray(parsed.transactions)) {
            setTransactions(parsed.transactions);
            const importedInfo = parsed.surauInfo || surauInfo;
            if (parsed.surauInfo) setSurauInfo(parsed.surauInfo);
            await importAllToCloud(importedInfo, parsed.transactions);
            alert('Data kewangan berjaya diimport dan disegerakkan ke Awan!');
          } else {
            alert('Format fail JSON tidak sah.');
          }
        } catch (err) {
          alert('Gagal membaca fail JSON. Sila pastikan fail sah.');
        }
      };
    }
  };

  const handleResetData = () => {
    setSurauInfo(defaultSurauInfo);
    setTransactions(initialTransactions);
  };

  return (
    <div className="min-h-screen bg-slate-100 font-sans text-slate-800 flex flex-col antialiased selection:bg-emerald-200">
      {/* App Header */}
      <Header
        surauInfo={surauInfo}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAddModal={(type) => handleOpenAddModal(type || 'IN')}
        onOpenSettings={handleOpenSettings}
        onOpenGoogleSheets={() => setIsGoogleSheetsOpen(true)}
        isAdmin={isAdmin}
        onLogoutAdmin={handleAdminLogout}
        onOpenAdminLogin={handleOpenAdminLogin}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Tab 1: DASHBOARD UTAMA */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            {/* Top Financial Cards */}
            <FinancialSummaryCards
              summary={summary}
              transactions={transactions}
              onOpenAddModal={() => handleOpenAddModal('IN')}
            />

            {/* Visual Charts */}
            <FinancialCharts transactions={transactions} />

            {/* Recent Transactions Preview */}
            <TransactionTable
              transactions={transactions}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTransaction}
              onPrintReceipt={(t) => setReceiptToPrint(t)}
              onViewAttachment={(t) => setAttachmentToView(t)}
              isAdmin={isAdmin}
              onRequireAdminLogin={handleOpenAdminLogin}
            />
          </div>
        )}

        {/* Tab 2: REKOD & TRANSAKSI */}
        {activeTab === 'transactions' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <TransactionTable
              transactions={transactions}
              onEdit={handleOpenEditModal}
              onDelete={handleDeleteTransaction}
              onPrintReceipt={(t) => setReceiptToPrint(t)}
              onViewAttachment={(t) => setAttachmentToView(t)}
              isAdmin={isAdmin}
              onRequireAdminLogin={handleOpenAdminLogin}
            />
          </div>
        )}

        {/* Tab 3: PENYATA AJK BULANAN */}
        {activeTab === 'reports' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <MonthlyReportView
              transactions={transactions}
              surauInfo={surauInfo}
            />
          </div>
        )}

        {/* Tab 4: DOKUMEN & AUDIT */}
        {activeTab === 'audit' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <AuditModule
              transactions={transactions}
              onVerifyAudit={handleVerifyAudit}
              onViewAttachment={(t) => setAttachmentToView(t)}
              onOpenAddModal={() => handleOpenAddModal('OUT')}
              isAdmin={isAdmin}
              onRequireAdminLogin={handleOpenAdminLogin}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-emerald-950 text-emerald-300/80 text-xs border-t border-emerald-900 py-6 px-4 mt-12 print:hidden">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-white font-serif">{surauInfo.name}</p>
            <p className="text-[11px] text-emerald-400/80">{surauInfo.address}</p>
          </div>
          <div className="text-[11px]">
            Sistem Pengurusan Kewangan Digital © {new Date().getFullYear()} • Akaun & Audit Surau
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => setIsAdminLoginOpen(false)}
        onSuccess={handleAdminLoginSuccess}
        actionReason={adminLoginReason}
      />

      <TransactionFormModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        existingTransactions={transactions}
        initialData={editingTransaction}
        initialType={addModalInitialType}
      />

      <ReceiptPrintModal
        transaction={receiptToPrint}
        surauInfo={surauInfo}
        onClose={() => setReceiptToPrint(null)}
      />

      <AttachmentModal
        transaction={attachmentToView}
        onClose={() => setAttachmentToView(null)}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        surauInfo={surauInfo}
        onSaveSurauInfo={handleSaveSurauInfo}
      />

      <GoogleSheetsModal
        isOpen={isGoogleSheetsOpen}
        onClose={() => setIsGoogleSheetsOpen(false)}
        transactions={transactions}
        surauInfo={surauInfo}
      />
    </div>
  );
}
