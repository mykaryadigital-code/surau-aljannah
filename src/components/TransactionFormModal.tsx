import React, { useState, useEffect } from 'react';
import { 
  Transaction, 
  TransactionType, 
  MainCategoryIn, 
  MainCategoryOut, 
  FundCategory, 
  PaymentMethod 
} from '../types';
import { generateNextReceiptNo } from '../utils/formatters';
import { 
  X, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Calendar, 
  Hash, 
  Tag, 
  DollarSign, 
  User, 
  CreditCard, 
  FileText, 
  Upload, 
  Paperclip, 
  Check, 
  AlertCircle
} from 'lucide-react';

interface TransactionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  existingTransactions: Transaction[];
  initialData?: Transaction | null;
  initialType?: TransactionType;
}

const CATEGORIES_IN: MainCategoryIn[] = [
  'Tabung Surau',
  'Derma Jumaat',
  'Infaq Am / Sedekah',
  'Wakaf',
  'Sumbangan YB / Korporat',
  'Sewa Dewan / Peralatan',
  'Kutipan Program Khas',
  'Lain-lain Masuk',
];

const CATEGORIES_OUT: MainCategoryOut[] = [
  'Utiliti Bil (SESB/Jabatan Air/WiFi)',
  'Penyelenggaraan & Pembaikan',
  'Elaun Imam / Bilal / Siak',
  'Elaun Penceramah / Guru Takmir',
  'Aktiviti & Program Kariah',
  'Kebajikan & Bantuan',
  'Pentadbiran & Alat Tulis',
  'Lain-lain Keluar',
];

const FUND_CATEGORIES: FundCategory[] = [
  'Tabung Am / Pengurusan',
  'Tabung Wakaf',
  'Tabung Kebajikan & Bantuan',
  'Tabung Pembangunan & Pembaikan',
  'Tabung Imarah & Aktiviti',
];

const PAYMENT_METHODS: PaymentMethod[] = [
  'Tunai',
  'Pindahan Bank',
  'QR DuitNow',
  'Cek',
];

export const TransactionFormModal: React.FC<TransactionFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  existingTransactions,
  initialData,
  initialType = 'IN',
}) => {
  const [type, setType] = useState<TransactionType>('IN');
  const [date, setDate] = useState<string>(new Date().toISOString().slice(0, 10));
  const [receiptNo, setReceiptNo] = useState<string>('');
  const [category, setCategory] = useState<string>(CATEGORIES_IN[0]);
  const [fundCategory, setFundCategory] = useState<FundCategory>('Tabung Am / Pengurusan');
  const [amount, setAmount] = useState<string>('');
  const [payerPayee, setPayerPayee] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Tunai');
  const [description, setDescription] = useState<string>('');
  const [attachmentUrl, setAttachmentUrl] = useState<string>('');
  const [attachmentName, setAttachmentName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string>('');

  // Auto generate or update fields
  useEffect(() => {
    if (initialData) {
      setType(initialData.type);
      setDate(initialData.date);
      setReceiptNo(initialData.receiptNo);
      setCategory(initialData.category);
      setFundCategory(initialData.fundCategory);
      setAmount(String(initialData.amount));
      setPayerPayee(initialData.payerPayee);
      setPaymentMethod(initialData.paymentMethod);
      setDescription(initialData.description);
      setAttachmentUrl(initialData.attachmentUrl || '');
      setAttachmentName(initialData.attachmentName || '');
    } else {
      // Default reset
      const startType = initialType || 'IN';
      const newDate = new Date().toISOString().slice(0, 10);
      setDate(newDate);
      setType(startType);
      setCategory(startType === 'IN' ? CATEGORIES_IN[0] : CATEGORIES_OUT[0]);
      setFundCategory('Tabung Am / Pengurusan');
      setAmount('');
      setPayerPayee('');
      setPaymentMethod('Tunai');
      setDescription('');
      setAttachmentUrl('');
      setAttachmentName('');
      if (startType === 'IN') {
        setReceiptNo(generateNextReceiptNo(existingTransactions));
      } else {
        setReceiptNo(`INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-001`);
      }
    }
    setErrorMsg('');
  }, [isOpen, initialData, initialType, existingTransactions]);

  // When type changes (IN vs OUT)
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'IN') {
      setCategory(CATEGORIES_IN[0]);
      if (!initialData) {
        setReceiptNo(generateNextReceiptNo(existingTransactions));
      }
    } else {
      setCategory(CATEGORIES_OUT[0]);
      if (!initialData) {
        setReceiptNo(`INV-${new Date().toISOString().slice(0, 7).replace('-', '')}-001`);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAttachmentName(file.name);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachmentUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('Sila masukkan amaun (RM) yang sah dan melebihi 0.');
      return;
    }

    if (!payerPayee.trim()) {
      setErrorMsg(
        type === 'IN' 
          ? 'Sila masukkan nama pembayar/penderma (e.g. Hamba Allah / Jemaah Jumaat).' 
          : 'Sila masukkan nama penerima/syarikat (e.g. SESB / Jabatan Air / WiFi / Pembekal).'
      );
      return;
    }

    if (!description.trim()) {
      setErrorMsg('Sila masukkan catatan/keterangan ringkas transaksi.');
      return;
    }

    onSave({
      type,
      date,
      receiptNo: receiptNo.trim() || generateNextReceiptNo(existingTransactions),
      category: category as any,
      fundCategory,
      amount: numAmount,
      payerPayee: payerPayee.trim(),
      paymentMethod,
      description: description.trim(),
      attachmentUrl: attachmentUrl || undefined,
      attachmentName: attachmentName || undefined,
      auditStatus: attachmentUrl ? 'DISAHKAN' : (type === 'OUT' ? 'SEMAKAN_DIPERLUKAN' : 'DISAHKAN'),
    });

    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${type === 'IN' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'}`}>
              {type === 'IN' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold font-serif">
                {initialData ? 'Kemaskini Transaksi' : 'Borang Tambah Transaksi Terperinci'}
              </h2>
              <p className="text-xs text-emerald-200/80">Akaun Kewangan Surau Al Jannah</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-900/80 hover:bg-emerald-800 text-emerald-200 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Type Selector Cards */}
          <div>
            <label className="block text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-2.5 flex items-center justify-between">
              <span>Pilih Jenis Transaksi Kewangan *</span>
              <span className="text-slate-400 font-normal normal-case text-[11px]">(Klik untuk pilih Duit Masuk atau Keluar)</span>
            </label>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: DUIT MASUK */}
              <button
                type="button"
                onClick={() => handleTypeChange('IN')}
                className={`p-4 rounded-2xl text-left border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                  type === 'IN'
                    ? 'bg-emerald-50/90 border-emerald-600 ring-2 ring-emerald-500/20 text-emerald-950 shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  type === 'IN' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                }`}>
                  <ArrowDownLeft className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-black text-base tracking-tight text-emerald-900">
                      DUIT MASUK
                    </span>
                    {type === 'IN' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-emerald-600 text-white shadow-sm">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-600">
                    Sumbangan, Infaq, Derma Jumaat, Wakaf, Sewa
                  </p>
                </div>
              </button>

              {/* Option 2: DUIT KELUAR */}
              <button
                type="button"
                onClick={() => handleTypeChange('OUT')}
                className={`p-4 rounded-2xl text-left border-2 transition-all flex items-start gap-3.5 cursor-pointer ${
                  type === 'OUT'
                    ? 'bg-rose-50/90 border-rose-600 ring-2 ring-rose-500/20 text-rose-950 shadow-md'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600 hover:bg-slate-100/80'
                }`}
              >
                <div className={`p-2.5 rounded-xl shrink-0 ${
                  type === 'OUT' ? 'bg-rose-600 text-white shadow-sm' : 'bg-slate-200 text-slate-600'
                }`}>
                  <ArrowUpRight className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-black text-base tracking-tight text-rose-900">
                      DUIT KELUAR
                    </span>
                    {type === 'OUT' && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-rose-600 text-white shadow-sm">
                        Dipilih
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-medium text-slate-600">
                    Perbelanjaan Bil, Elaun Imam, Penyelenggaraan
                  </p>
                </div>
              </button>
            </div>

            {/* Active Status Indicator */}
            <div className={`mt-3 p-3 rounded-xl border flex items-center justify-between gap-2.5 text-xs font-bold ${
              type === 'IN'
                ? 'bg-emerald-100/90 border-emerald-300 text-emerald-950'
                : 'bg-rose-100/90 border-rose-300 text-rose-950'
            }`}>
              <div className="flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0" />
                <span>
                  Borang Aktif: <span className="underline uppercase">{type === 'IN' ? 'Penerimaan Kewangan (Duit Masuk)' : 'Perbelanjaan Kewangan (Duit Keluar)'}</span>
                </span>
              </div>
            </div>
          </div>

          {/* Row 1: Date & Receipt No */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                Tarikh Transaksi *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5 text-emerald-600" />
                No. Rujukan Resit / Invois *
              </label>
              <input
                type="text"
                required
                value={receiptNo}
                onChange={(e) => setReceiptNo(e.target.value)}
                placeholder={type === 'IN' ? 'SAJ-202608-0001' : 'INV-SESB-98124'}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-mono font-medium"
              />
              <span className="text-[11px] text-slate-400 mt-0.5 block">
                {type === 'IN' ? 'Nombor siri resit rasmi auto-jana' : 'Nombor rujukan bil/invois pembekal'}
              </span>
            </div>
          </div>

          {/* Row 2: Category & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-emerald-600" />
                Kategori Utama *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
              >
                {type === 'IN'
                  ? CATEGORIES_IN.map((cat) => <option key={cat} value={cat}>{cat}</option>)
                  : CATEGORIES_OUT.map((cat) => <option key={cat} value={cat}>{cat}</option>)
                }
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                Kaedah Pembayaran *
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
              >
                {PAYMENT_METHODS.map((method) => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 3: Amount */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
              Amaun Transaksi (RM) *
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 font-bold text-slate-400 text-sm">RM</span>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full pl-11 pr-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-base font-bold font-mono text-slate-900"
              />
            </div>
          </div>

          {/* Row 4: Payer/Payee Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-600" />
              {type === 'IN' ? 'Nama Pembayar / Penderma / Syarikat *' : 'Nama Penerima / Syarikat / Penceramah *'}
            </label>
            <input
              type="text"
              required
              value={payerPayee}
              onChange={(e) => setPayerPayee(e.target.value)}
              placeholder={type === 'IN' ? 'Contoh: Jemaah Solat Jumaat / Hamba Allah / YB Azman' : 'Contoh: SESB / Jabatan Air / TM WiFi / Ustaz Ahmad'}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm font-medium"
            />
          </div>

          {/* Row 5: Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-emerald-600" />
              Catatan / Keterangan Transaksi *
            </label>
            <textarea
              rows={2}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Contoh: Kutipan Tabung Jumaat Minggu 1 Ogos 2026 atau Bayaran bil elektrik aircond..."
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm"
            />
          </div>

          {/* Row 6: Upload Attachment / Proof for Audit */}
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-bold text-slate-800 mb-1 flex items-center gap-1.5">
              <Paperclip className="w-3.5 h-3.5 text-emerald-600" />
              Muat Naik Dokumen Sokongan / Bukti Bil / Resit (Audit)
            </label>
            <p className="text-[11px] text-slate-500 mb-3">
              Imej atau fail bil asal sebagai bukti audit (digalakkan untuk semua perbelanjaan).
            </p>

            {attachmentUrl ? (
              <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-emerald-200 text-xs">
                <div className="flex items-center gap-2.5 overflow-hidden">
                  <div className="w-10 h-10 rounded bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border">
                    <img src={attachmentUrl} alt="Bukti" className="w-full h-full object-cover" />
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-800 truncate">{attachmentName || 'Dokumen_Bukti.jpg'}</p>
                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-3 h-3" /> Bukti Dimuat Naik
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setAttachmentUrl('');
                    setAttachmentName('');
                  }}
                  className="text-rose-600 font-bold hover:underline ml-2"
                >
                  Padam Fail
                </button>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-white transition">
                <Upload className="w-6 h-6 text-slate-400 mb-1" />
                <span className="text-xs font-semibold text-slate-700">Klik untuk muat naik gambar bil / resit</span>
                <span className="text-[10px] text-slate-400">JPG, PNG atau PDF (Max 5MB)</span>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            )}
          </div>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 font-semibold text-sm hover:bg-slate-100 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-sm shadow-md transition flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              <span>Simpan Transaksi</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
