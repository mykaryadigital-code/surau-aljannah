import React from 'react';
import { Transaction } from '../types';
import { formatDateMalay, formatRM } from '../utils/formatters';
import { X, Paperclip, Download, CheckCircle, ExternalLink } from 'lucide-react';

interface AttachmentModalProps {
  transaction: Transaction | null;
  onClose: () => void;
}

export const AttachmentModal: React.FC<AttachmentModalProps> = ({
  transaction,
  onClose,
}) => {
  if (!transaction || !transaction.attachmentUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-6">
        {/* Modal Header */}
        <div className="bg-emerald-950 text-white p-4 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2">
            <Paperclip className="w-5 h-5 text-amber-400" />
            <div>
              <h3 className="font-bold font-serif text-sm">Pratonton Dokumen / Bil Asal Audit</h3>
              <p className="text-[11px] text-emerald-200/80">No: {transaction.receiptNo}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded bg-emerald-900 hover:bg-emerald-800 text-emerald-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between font-bold text-slate-800">
              <span>{transaction.payerPayee}</span>
              <span className="font-mono text-rose-600">-{formatRM(transaction.amount)}</span>
            </div>
            <p className="text-slate-600">{transaction.description}</p>
            <p className="text-[11px] text-slate-400">Tarikh: {formatDateMalay(transaction.date)} | Kategori: {transaction.category}</p>
          </div>

          {/* Image Display */}
          <div className="max-h-96 overflow-auto rounded-xl border border-slate-300 bg-slate-900 flex items-center justify-center p-2">
            <img
              src={transaction.attachmentUrl}
              alt="Pratonton Dokumen"
              className="max-h-80 w-auto object-contain rounded shadow-lg"
            />
          </div>

          <div className="flex items-center justify-between text-xs pt-2">
            <span className="text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle className="w-4 h-4" /> Proof Attachment Verified
            </span>

            <a
              href={transaction.attachmentUrl}
              download={transaction.attachmentName || 'Bukti_Resit.jpg'}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl font-bold flex items-center gap-1.5 shadow transition"
            >
              <Download className="w-4 h-4" />
              <span>Muat Turun Fail</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
