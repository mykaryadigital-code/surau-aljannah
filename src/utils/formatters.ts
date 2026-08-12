import { Transaction, FinancialSummary } from '../types';

export function formatRM(amount: number): string {
  return new Intl.NumberFormat('ms-MY', {
    style: 'currency',
    currency: 'MYR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount).replace('MYR', 'RM');
}

export function formatDateMalay(dateString: string): string {
  if (!dateString) return '-';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return dateString;

  const monthNamesMalay = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];

  const day = date.getDate();
  const month = monthNamesMalay[date.getMonth()];
  const year = date.getFullYear();

  return `${day} ${month} ${year}`;
}

export function formatMonthYearMalay(yearMonth: string): string {
  // expects 'YYYY-MM'
  if (!yearMonth) return '';
  const [year, month] = yearMonth.split('-');
  const monthIndex = parseInt(month, 10) - 1;
  const monthNamesMalay = [
    'Januari', 'Februari', 'Mac', 'April', 'Mei', 'Jun',
    'Julai', 'Ogos', 'September', 'Oktober', 'November', 'Disember'
  ];
  return `${monthNamesMalay[monthIndex] || month} ${year}`;
}

export function numberToMalayWords(amount: number): string {
  if (amount === 0) return 'Kosong Ringgit Sahaja';

  const sa = ['', 'Satu', 'Dua', 'Tiga', 'Empat', 'Lima', 'Enam', 'Tujuh', 'Lapan', 'Sembilan'];
  const belas = ['Sepuluh', 'Sebelas', 'Dua Belas', 'Tiga Belas', 'Empat Belas', 'Lima Belas', 'Enam Belas', 'Tujuh Belas', 'Lapan Belas', 'Sembilan Belas'];
  const puluh = ['', '', 'Dua Puluh', 'Tiga Puluh', 'Empat Puluh', 'Lima Puluh', 'Enam Puluh', 'Tujuh Puluh', 'Lapan Puluh', 'Sembilan Puluh'];

  function convertGroup(num: number): string {
    let result = '';
    const ratus = Math.floor(num / 100);
    const bakiRatus = num % 100;

    if (ratus > 0) {
      if (ratus === 1) {
        result += 'Seratus ';
      } else {
        result += sa[ratus] + ' Ratus ';
      }
    }

    if (bakiRatus >= 10 && bakiRatus < 20) {
      result += belas[bakiRatus - 10] + ' ';
    } else if (bakiRatus >= 20 || bakiRatus < 10) {
      const p = Math.floor(bakiRatus / 10);
      const s = bakiRatus % 10;
      if (p > 0) result += puluh[p] + ' ';
      if (s > 0) result += sa[s] + ' ';
    }

    return result.trim();
  }

  const ringgit = Math.floor(amount);
  const sen = Math.round((amount - ringgit) * 100);

  let ringgitText = '';

  if (ringgit === 0) {
    ringgitText = 'Kosong';
  } else if (ringgit >= 1000000) {
    const juta = Math.floor(ringgit / 1000000);
    const bakiJuta = ringgit % 1000000;
    const ribu = Math.floor(bakiJuta / 1000);
    const bakiRibu = bakiJuta % 1000;

    ringgitText += convertGroup(juta) + ' Juta ';
    if (ribu > 0) ringgitText += convertGroup(ribu) + ' Ribu ';
    if (bakiRibu > 0) ringgitText += convertGroup(bakiRibu);
  } else if (ringgit >= 1000) {
    const ribu = Math.floor(ringgit / 1000);
    const bakiRibu = ringgit % 1000;

    if (ribu === 1) {
      ringgitText += 'Seribu ';
    } else {
      ringgitText += convertGroup(ribu) + ' Ribu ';
    }
    if (bakiRibu > 0) ringgitText += convertGroup(bakiRibu);
  } else {
    ringgitText = convertGroup(ringgit);
  }

  ringgitText = ringgitText.trim() + ' Ringgit';

  if (sen > 0) {
    const senText = convertGroup(sen) + ' Sen';
    return `${ringgitText} Dan ${senText} Sahaja`;
  }

  return `${ringgitText} Sahaja`;
}

export function generateNextRefNo(
  transactions: Transaction[],
  type: 'IN' | 'OUT' = 'IN',
  targetDate?: string
): string {
  const dateObj = targetDate ? new Date(targetDate) : new Date();
  const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj;
  const yearMonth = validDate.toISOString().slice(0, 7).replace('-', '');

  const prefix = type === 'IN' ? 'SAJ' : 'INV';

  // Find transactions matching prefix and yearMonth
  const sequences = transactions
    .filter((t) => {
      if (!t.receiptNo) return false;
      const startPattern = `${prefix}-${yearMonth}`;
      return t.receiptNo.startsWith(startPattern);
    })
    .map((t) => {
      const parts = t.receiptNo.split('-');
      const lastPart = parts[parts.length - 1];
      const seq = parseInt(lastPart, 10);
      return isNaN(seq) ? 0 : seq;
    });

  let nextSeq = 1;
  if (sequences.length > 0) {
    nextSeq = Math.max(...sequences) + 1;
  } else {
    // Fallback: check count of transactions of same type in that yearMonth
    const sameMonthCount = transactions.filter((t) => {
      const tType = t.type || 'IN';
      if (tType !== type) return false;
      const tYM = t.date ? t.date.slice(0, 7).replace('-', '') : '';
      return tYM === yearMonth;
    }).length;
    nextSeq = sameMonthCount + 1;
  }

  const seqPadded = String(nextSeq).padStart(4, '0');
  return `${prefix}-${yearMonth}-${seqPadded}`;
}

export function generateNextReceiptNo(transactions: Transaction[]): string {
  return generateNextRefNo(transactions, 'IN');
}

export function calculateFinancialSummary(
  transactions: Transaction[],
  bakiTerdahuluTotal: number,
  bakiBankTerdahuluOpt?: number,
  bakiTunaiTerdahuluOpt?: number
): FinancialSummary {
  const bakiBankTerdahulu = bakiBankTerdahuluOpt !== undefined ? bakiBankTerdahuluOpt : (bakiTerdahuluTotal || 0);
  const bakiTunaiTerdahulu = bakiTunaiTerdahuluOpt !== undefined ? bakiTunaiTerdahuluOpt : 0;
  const bakiTerdahulu = bakiBankTerdahulu + bakiTunaiTerdahulu;

  let totalIncome = 0;
  let totalExpense = 0;
  let incomeCount = 0;
  let expenseCount = 0;

  let bankIncome = 0;
  let bankExpense = 0;
  let cashIncome = 0;
  let cashExpense = 0;

  transactions.forEach((t) => {
    const isCash = t.paymentMethod === 'Tunai';
    if (t.type === 'IN') {
      totalIncome += t.amount;
      incomeCount++;
      if (isCash) {
        cashIncome += t.amount;
      } else {
        bankIncome += t.amount;
      }
    } else {
      totalExpense += t.amount;
      expenseCount++;
      if (isCash) {
        cashExpense += t.amount;
      } else {
        bankExpense += t.amount;
      }
    }
  });

  const bankBalance = bakiBankTerdahulu + bankIncome - bankExpense;
  const cashBalance = bakiTunaiTerdahulu + cashIncome - cashExpense;
  const currentBalance = bankBalance + cashBalance;
  const netSurplus = totalIncome - totalExpense;

  let healthStatus: 'SIHAT' | 'SEDERHANA' | 'DEFISIT' = 'SIHAT';
  if (currentBalance < 0 || netSurplus < -1000) {
    healthStatus = 'DEFISIT';
  } else if (totalExpense > totalIncome && currentBalance < 5000) {
    healthStatus = 'SEDERHANA';
  }

  return {
    bakiTerdahulu,
    bakiBankTerdahulu,
    bakiTunaiTerdahulu,
    totalIncome,
    totalExpense,
    currentBalance,
    netSurplus,
    healthStatus,
    incomeCount,
    expenseCount,
    bankIncome,
    bankExpense,
    bankBalance,
    cashIncome,
    cashExpense,
    cashBalance,
  };
}
