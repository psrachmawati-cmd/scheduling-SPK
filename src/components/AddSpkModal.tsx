import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Calendar,
  DollarSign,
  MapPin,
  Building,
  UserCheck,
  CheckCircle2,
  Sparkles,
  Info,
  Compass,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIDR } from '../utils/wbsLogic';

interface AddSpkModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FIELD_OPTIONS = [
  'Field Prabumulih',
  'Field Limau',
  'Field Pendopo',
  'Field Adera',
  'Field Ramba',
];

export const AddSpkModal: React.FC<AddSpkModalProps> = ({ isOpen, onClose }) => {
  const { addProject, projects } = useApp();

  // Auto-suggest next SPK index
  const nextNum = projects.length + 1;
  const defaultCode = `SPK-${String(nextNum).padStart(3, '0')}/Z4-COO/2026`;
  const defaultSpkNum = `${String(nextNum).padStart(3, '0')}/SPK-COO/PEP-Z4/2026`;

  const [code, setCode] = useState(defaultCode);
  const [spkNumber, setSpkNumber] = useState(defaultSpkNum);
  const [name, setName] = useState('');
  const [fieldArea, setFieldArea] = useState(FIELD_OPTIONS[0]);
  const [location, setLocation] = useState('');
  const [startDate, setStartDate] = useState('2026-09-01');
  const [finishDate, setFinishDate] = useState('2026-10-15');
  const [contractValue, setContractValue] = useState<number>(450000000);
  const [subcontractor, setSubcontractor] = useState('KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN');
  const [picName, setPicName] = useState('Ivan (Koordinator Subkontraktor)');
  const [scopeType, setScopeType] = useState<'MULTI_DISIPLIN' | 'TERESTRIS' | 'DRONE_LIDAR' | 'FOTOGRAMETRI'>('MULTI_DISIPLIN');
  const [autoGenerateWbs, setAutoGenerateWbs] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  // Calculate day difference
  const s = new Date(startDate);
  const f = new Date(finishDate);
  const durationDays = Math.max(1, Math.round((f.getTime() - s.getTime()) / (1000 * 3600 * 24)));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !name.trim() || !location.trim()) {
      setErrorMsg('Harap lengkapi Kode SPK, Nama Pekerjaan, dan Lokasi.');
      return;
    }
    if (durationDays <= 0 || isNaN(durationDays)) {
      setErrorMsg('Tanggal Selesai harus setelah Tanggal Mulai.');
      return;
    }

    addProject({
      code: code.trim(),
      spkNumber: spkNumber.trim() || code.trim(),
      name: name.trim(),
      fieldArea,
      location: location.trim(),
      contractValue: Number(contractValue) || 0,
      startDate,
      finishDate,
      subcontractor,
      picName,
      scopeType,
      autoGenerateWbs,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-500/20">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Tambah SPK Baru</h3>
              <p className="text-xs text-slate-500">
                Registrasi Surat Perintah Kerja Survey Operasional Call of Order (COO)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center">
              <Info className="w-4 h-4 mr-2 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Info Banner */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-xl text-xs text-blue-900 flex items-start space-x-2.5">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-blue-800">Lingkup Pekerjaan WBS Standar Otomatis:</span>
              <p className="text-blue-700/90 mt-0.5 leading-relaxed">
                Setiap SPK baru akan langsung dilengkapi struktur resmi <strong>4 Kategori (53 sub-pekerjaan level 3)</strong> + <strong>5 Milestones</strong> sesuai Lampiran SOW Pertamina EP Zona 4 (Persiapan, Alat Ukur Terestris, Drone LiDAR/Foto, Administrasi).
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Kode SPK */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode Ringkas SPK <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. SPK-011/Z4-COO/2026"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
                required
              />
            </div>

            {/* Nomor SPK Resmi */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Surat Perintah Kerja (SPK)
              </label>
              <input
                type="text"
                value={spkNumber}
                onChange={(e) => setSpkNumber(e.target.value)}
                placeholder="011/SPK-COO/PEP-Z4/2026"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono"
              />
            </div>
          </div>

          {/* Nama Pekerjaan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama / Judul Pekerjaan Survey <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Survey Topografi Tapak Rig Pad & Rute Flowline Sumur BNG-72"
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Field Area */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wilayah Kerja / Field Operasi
              </label>
              <select
                value={fieldArea}
                onChange={(e) => setFieldArea(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                {FIELD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>

            {/* Scope Type */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disiplin Survey Utama
              </label>
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              >
                <option value="MULTI_DISIPLIN">Multi Disiplin (Terestris + Drone + Pembebasan Lahan)</option>
                <option value="TERESTRIS">Terestris (Total Station & GPS Geodetik)</option>
                <option value="DRONE_LIDAR">Drone LiDAR Scanning</option>
                <option value="FOTOGRAMETRI">UAV Fotogrametri & Ortofoto</option>
              </select>
            </div>
          </div>

          {/* Lokasi Fisik */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lokasi / Tapak / Fasilitas Spesifik <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Wellpad BNG-72 & Jalur Koridor Akses STA 0+000 - 3+200, Kab. Muara Enim"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
          </div>

          {/* Range Waktu */}
          <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center">
                <Calendar className="w-4 h-4 mr-1.5 text-blue-600" />
                Range Waktu Pelaksanaan SPK
              </span>
              <span className="text-[11px] font-semibold text-blue-700 bg-blue-100/80 px-2 py-0.5 rounded-full">
                Durasi: {durationDays} Hari Kalender
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tanggal Mulai (Start) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tanggal Selesai (Target Finish) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="date"
                  value={finishDate}
                  onChange={(e) => setFinishDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                  required
                />
              </div>
            </div>
          </div>

          {/* Nilai Kontrak */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nilai Kontrak SPK (IDR)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2 text-xs font-semibold text-slate-400">Rp</span>
              <input
                type="number"
                value={contractValue}
                onChange={(e) => setContractValue(Number(e.target.value))}
                placeholder="450000000"
                step="5000000"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-semibold text-slate-800"
              />
            </div>
            <p className="text-[11px] text-slate-500 mt-1">
              Terbaca: <span className="font-semibold text-slate-700">{formatIDR(contractValue)}</span>
            </p>
          </div>

          {/* Pelaksana & PIC */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Subkontraktor Pelaksana (2 KJSB Resmi)
              </label>
              <select
                value={subcontractor}
                onChange={(e) => setSubcontractor(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option value="KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN">
                  KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN
                </option>
                <option value="KJSB SYAHRIAL & REKAN">
                  KJSB SYAHRIAL & REKAN
                </option>
              </select>
              <p className="text-[10px] text-slate-500 mt-1">
                *Hanya 2 Subkontraktor Resmi (PT Sucofindo bukan kontraktor).
              </p>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead PIC / Site Manager
              </label>
              <input
                type="text"
                value={picName}
                onChange={(e) => setPicName(e.target.value)}
                placeholder="Ivan / Ian / Hari Susmoyo"
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Auto-generate WBS toggle */}
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
            <label className="flex items-start space-x-3 cursor-pointer">
              <input
                type="checkbox"
                checked={autoGenerateWbs}
                onChange={(e) => setAutoGenerateWbs(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
              />
              <div>
                <span className="text-xs font-bold text-slate-800">
                  Generate otomatis seluruh struktur WBS standar (53 item pekerjaan level 3 + 5 milestones)
                </span>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Timeline seluruh pekerjaan WBS akan otomatis dipetakan secara proporsional dari {startDate} hingga {finishDate}, lengkap dengan referensi SOW (Lampiran A.1) dan PIC operasional.
                </p>
              </div>
            </label>
          </div>
        </form>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50/80 rounded-b-2xl">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-200/60 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan & Buat SPK Baru</span>
          </button>
        </div>
      </div>
    </div>
  );
};
