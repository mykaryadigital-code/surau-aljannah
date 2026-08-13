import React, { useState, useEffect } from 'react';
import { SurauInfo } from '../types';
import { THEME_OPTIONS, ThemeColor } from '../utils/theme';
import { X, Building2, Save, RefreshCw, Landmark, Phone, Mail, User, Shield, Palette, Check } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  surauInfo: SurauInfo;
  onSaveSurauInfo: (info: SurauInfo) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  surauInfo,
  onSaveSurauInfo,
}) => {
  const [formData, setFormData] = useState<SurauInfo>(surauInfo);

  useEffect(() => {
    if (isOpen) {
      setFormData(surauInfo);
    }
  }, [surauInfo, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSurauInfo(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-emerald-950 text-white p-5 flex items-center justify-between border-b border-emerald-800">
          <div>
            <h2 className="text-lg font-bold">Tetapan Maklumat {formData.name || 'Surau'}</h2>
            <p className="text-xs text-emerald-200/80">Konfigurasi nama, alamat, bank & pegawaian</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg bg-emerald-900 hover:bg-emerald-800 text-emerald-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs text-slate-700">
          {/* Section 1: Basic Info */}
          <div className="space-y-3">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded">
              1. Maklumat Asas & Pendaftaran Surau
            </h3>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Masjid / Surau *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Kampung / Lokasi Surau *</label>
              <input
                type="text"
                required
                value={formData.locationName || ''}
                onChange={(e) => setFormData({ ...formData, locationName: e.target.value })}
                placeholder="Kg.Padang Pulasan, Papar"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 font-semibold text-slate-800"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Alamat Penuh *</label>
              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-xl border border-slate-300"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">No. Pendaftaran Jabatan Agama *</label>
                <input
                  type="text"
                  required
                  value={formData.registrationNo}
                  onChange={(e) => setFormData({ ...formData, registrationNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Baki Awal Akaun Terdahulu (RM) *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={formData.bakiTerdahulu}
                  onChange={(e) => setFormData({ ...formData, bakiTerdahulu: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold font-mono text-emerald-800"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Bank & Opening Balances */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded">
              2. Maklumat Akaun Bank & Baki Awal
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bank *</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nombor Akaun Bank *</label>
                <input
                  type="text"
                  required
                  value={formData.accountNo}
                  onChange={(e) => setFormData({ ...formData, accountNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Baki Awal Akaun Bank (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.bakiBankTerdahulu ?? formData.bakiTerdahulu ?? 0}
                  onChange={(e) => {
                    const bankVal = parseFloat(e.target.value) || 0;
                    const cashVal = formData.bakiTunaiTerdahulu || 0;
                    setFormData({
                      ...formData,
                      bakiBankTerdahulu: bankVal,
                      bakiTerdahulu: bankVal + cashVal,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-emerald-800 bg-emerald-50/50"
                  placeholder="0.00"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Jumlah duit baki awal dalam akaun bank surau.</p>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Baki Awal Peti Cash / Tunai (RM)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.bakiTunaiTerdahulu ?? 0}
                  onChange={(e) => {
                    const cashVal = parseFloat(e.target.value) || 0;
                    const bankVal = formData.bakiBankTerdahulu ?? formData.bakiTerdahulu ?? 0;
                    setFormData({
                      ...formData,
                      bakiTunaiTerdahulu: cashVal,
                      bakiTerdahulu: bankVal + cashVal,
                    });
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-mono font-bold text-amber-800 bg-amber-50/50"
                  placeholder="0.00"
                />
                <p className="text-[10px] text-slate-500 mt-0.5">Jumlah duit baki awal tunai dalam peti besi/cash box surau.</p>
              </div>
            </div>
          </div>

          {/* Section 3: AJK Leadership */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded">
              3. Ahli Jawatankuasa (AJK) Pengesah Laporan
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Pengerusi Surau *</label>
                <input
                  type="text"
                  required
                  value={formData.pengerusiName}
                  onChange={(e) => setFormData({ ...formData, pengerusiName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Nama Bendahari Surau *</label>
                <input
                  type="text"
                  required
                  value={formData.bendahariName}
                  onChange={(e) => setFormData({ ...formData, bendahariName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-bold text-slate-700 mb-1">Nama Setiausaha Surau *</label>
                <input
                  type="text"
                  required
                  value={formData.setiausahaName || ''}
                  onChange={(e) => setFormData({ ...formData, setiausahaName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Theme Selector */}
          <div className="space-y-3 pt-2">
            <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px] bg-slate-100 p-2 rounded flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-emerald-700" />
                4. Pilihan Skim Warna Utama (App Theme)
              </span>
              <span className="text-[10px] text-slate-500 font-normal normal-case">Pilih penampilan visual aplikasi</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_OPTIONS.map((opt) => {
                const isSelected = (formData.theme || 'emerald') === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, theme: opt.id })}
                    className={`p-3 rounded-xl border text-left transition relative flex items-center gap-3 cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/70 shadow-sm ring-2 ring-emerald-500/30'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${opt.previewBg} text-white font-bold text-base shadow-sm shrink-0`}>
                      <span>{opt.icon}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-slate-900 text-xs">{opt.name}</span>
                      </div>
                      <p className="text-[10px] text-slate-500 line-clamp-1">{opt.subtitle}</p>
                    </div>

                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-800 hover:bg-emerald-900 text-white font-bold flex items-center gap-1.5 shadow"
            >
              <Save className="w-4 h-4" />
              <span>Simpan Tetapan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
