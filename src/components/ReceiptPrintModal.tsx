import React from 'react';
import { Transaction, SurauInfo } from '../types';
import { formatDateMalay, formatRM, numberToMalayWords } from '../utils/formatters';
import { X, Printer, CheckCircle2, Landmark, Building2 } from 'lucide-react';

interface ReceiptPrintModalProps {
  transaction: Transaction | null;
  surauInfo: SurauInfo;
  onClose: () => void;
}

export const ReceiptPrintModal: React.FC<ReceiptPrintModalProps> = ({
  transaction,
  surauInfo,
  onClose,
}) => {
  if (!transaction) return null;

  const handlePrint = () => {
    window.print();
  };

  const wordsAmount = numberToMalayWords(transaction.amount);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Top Bar (Hidden on print) */}
        <div className="bg-emerald-950 text-white p-4 flex items-center justify-between border-b border-emerald-800 print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-400" />
            <span className="font-bold font-serif text-sm">Resit Rasmi Penerimaan - Surau Al Jannah</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg shadow flex items-center gap-1.5 transition"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak / Simpan PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div id="printable-receipt" className="p-8 bg-white text-slate-900 border-8 border-emerald-900/10 m-2 rounded-xl">
          {/* Islamic Bismillah Header */}
          <div className="text-center space-y-1 mb-4">
            <p className="font-serif text-lg text-emerald-900 font-bold tracking-widest">
              بِسْمِ ٱللَّٰهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ
            </p>
            <p className="text-[11px] text-slate-500 italic">"Dengan Nama Allah Yang Maha Pengasih Lagi Maha Penyayang"</p>
          </div>

          {/* Surau Header */}
          <div className="flex items-center justify-between border-b-2 border-emerald-900/80 pb-4 mb-5">
            <div>
              <h1 className="text-2xl font-black text-emerald-950 tracking-tight uppercase">
                {surauInfo.name}
              </h1>
              <p className="text-xs font-bold text-slate-800">{surauInfo.locationName || 'Kg.Padang Pulasan, Papar'}</p>
              <p className="text-xs font-medium text-slate-700">{surauInfo.address}</p>
              <p className="text-[11px] text-slate-500">
                No. Pendaftaran: <span className="font-bold">{surauInfo.registrationNo}</span> | Tel: {surauInfo.phone}
              </p>
            </div>

            <div className="text-right border-l pl-4 border-slate-200">
              <div className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                RESIT RASMI DERMA / INFAQ
              </div>
              <div className="text-sm font-extrabold font-mono text-emerald-900 mt-0.5">
                NO: {transaction.receiptNo}
              </div>
              <div className="text-xs text-slate-600 mt-1">
                Tarikh: <span className="font-bold">{formatDateMalay(transaction.date)}</span>
              </div>
            </div>
          </div>

          {/* Receipt Body Table */}
          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-12 border-b border-slate-200 pb-2">
              <div className="col-span-4 font-bold text-slate-600 uppercase">Diterima Daripada:</div>
              <div className="col-span-8 font-bold text-sm text-slate-900 uppercase font-serif">
                {transaction.payerPayee}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-slate-200 pb-2">
              <div className="col-span-4 font-bold text-slate-600 uppercase">Ringgit Dalam Perkataan:</div>
              <div className="col-span-8 font-semibold italic text-slate-800 bg-amber-50/50 p-2 rounded border border-amber-200/60">
                {wordsAmount}
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-slate-200 pb-2">
              <div className="col-span-4 font-bold text-slate-600 uppercase">Untuk Bayaran / Tujuan:</div>
              <div className="col-span-8 font-medium text-slate-800">
                <span className="font-bold text-emerald-800">{transaction.category}</span> - {transaction.description}
                <br />
                <span className="text-[11px] text-slate-500">Peruntukan: {transaction.fundCategory}</span>
              </div>
            </div>

            <div className="grid grid-cols-12 border-b border-slate-200 pb-2">
              <div className="col-span-4 font-bold text-slate-600 uppercase">Kaedah Pembayaran:</div>
              <div className="col-span-8 font-semibold text-slate-800">
                {transaction.paymentMethod}
              </div>
            </div>

            {/* Total Amount Box */}
            <div className="mt-6 flex items-center justify-between p-4 bg-emerald-50 rounded-2xl border-2 border-emerald-600/30">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  JUMLAH DITERIMA (RM)
                </span>
                <p className="text-[10px] text-emerald-700">Semua sumbangan layak mendapat keberkatan inshaAllah</p>
              </div>
              <div className="text-3xl font-extrabold font-mono text-emerald-950">
                {formatRM(transaction.amount)}
              </div>
            </div>

            {/* Official Stamp & Signatures */}
            <div className="mt-8 pt-6 grid grid-cols-2 gap-8 items-end border-t border-dashed border-slate-300">
              {/* Official Stamp Badge */}
              <div className="flex items-center gap-3">
                <div className="w-16 h-16 rounded-full border-4 border-double border-emerald-800 flex flex-col items-center justify-center p-1 text-center bg-emerald-50/50 transform -rotate-6">
                  <CheckCircle2 className="w-5 h-5 text-emerald-800 mb-0.5" />
                  <span className="text-[8px] font-extrabold uppercase text-emerald-900 leading-tight">
                    DISAHKAN & DITERIMA
                  </span>
                </div>
                <div className="text-[10px] text-slate-500">
                  <p className="font-bold text-slate-700">Resit ini digana secara digital oleh:</p>
                  <p>{surauInfo.name}</p>
                  <p>Bank: {surauInfo.bankName}</p>
                </div>
              </div>

              {/* Signature Block */}
              <div className="flex flex-col items-center text-center">
                <div className="h-10 w-44" />
                <div className="border-b border-slate-800 w-44 mb-1.5" />
                <p className="font-bold text-xs text-slate-900">{surauInfo.bendahariName}</p>
                <p className="text-[10px] text-slate-500 font-medium">Bendahari, {surauInfo.name}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
