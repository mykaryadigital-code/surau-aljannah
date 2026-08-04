export type TransactionType = 'IN' | 'OUT'; // IN = Duit Masuk, OUT = Duit Keluar

export type MainCategoryIn = 
  | 'Tabung Surau'
  | 'Derma Jumaat'
  | 'Infaq Am / Sedekah'
  | 'Wakaf'
  | 'Sumbangan YB / Korporat'
  | 'Sewa Dewan / Peralatan'
  | 'Kutipan Program Khas'
  | 'Lain-lain Masuk';

export type MainCategoryOut = 
  | 'Utiliti Bil (SESB/Jabatan Air/WiFi)'
  | 'Penyelenggaraan & Pembaikan'
  | 'Elaun Imam / Bilal / Siak'
  | 'Elaun Penceramah / Guru Takmir'
  | 'Aktiviti & Program Kariah'
  | 'Kebajikan & Bantuan'
  | 'Pentadbiran & Alat Tulis'
  | 'Lain-lain Keluar';

export type CategoryType = MainCategoryIn | MainCategoryOut;

export type FundCategory = 
  | 'Tabung Am / Pengurusan'
  | 'Tabung Wakaf'
  | 'Tabung Kebajikan & Bantuan'
  | 'Tabung Pembangunan & Pembaikan'
  | 'Tabung Imarah & Aktiviti';

export type PaymentMethod = 'Tunai' | 'Pindahan Bank' | 'QR DuitNow' | 'Cek';

export type AuditStatus = 'DISAHKAN' | 'SEMAKAN_DIPERLUKAN' | 'TUNGGU_AUDIT';

export interface Transaction {
  id: string;
  type: TransactionType;
  date: string; // ISO format YYYY-MM-DD
  receiptNo: string; // Auto for IN (e.g. SAJ-202608-001) or manual invoice ref for OUT
  category: CategoryType;
  fundCategory: FundCategory;
  amount: number;
  payerPayee: string; // Nama Pembayar / Penerima
  paymentMethod: PaymentMethod;
  description: string;
  attachmentUrl?: string; // Data URL or Image string for audit receipt/bill
  attachmentName?: string;
  auditStatus: AuditStatus;
  auditorNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SurauInfo {
  name: string;
  locationName?: string;
  address: string;
  registrationNo: string;
  bankName: string;
  accountNo: string;
  pengerusiName: string;
  bendahariName: string;
  setiausahaName: string;
  phone: string;
  email: string;
  bakiTerdahulu: number; // Opening balance before records
}

export interface FinancialSummary {
  bakiTerdahulu: number;
  totalIncome: number;
  totalExpense: number;
  currentBalance: number;
  netSurplus: number;
  healthStatus: 'SIHAT' | 'SEDERHANA' | 'DEFISIT';
  incomeCount: number;
  expenseCount: number;
}
