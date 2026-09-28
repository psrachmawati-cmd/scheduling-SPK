import React, { useState, useEffect } from 'react';
import {
  X,
  Edit3,
  Calendar,
  DollarSign,
  MapPin,
  Building,
  CheckCircle2,
  Trash2,
  RefreshCw,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { formatIDR } from '../utils/wbsLogic';

interface EditSpkModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetProject: Project;
}

const FIELD_OPTIONS = [
  'Field Prabumulih',
  'Field Limau',
  'Field Pendopo',
  'Field Adera',
  'Field Ramba',
];

export const EditSpkModal: React.FC<EditSpkModalProps> = ({
  isOpen,
  onClose,
  targetProject,
}) => {
  const { updateProject, deleteProject, resetProjectToStandardWbs } = useApp();

  const [code, setCode] = useState(targetProject.code);
  const [spkNumber, setSpkNumber] = useState(targetProject.spkNumber);
  const [name, setName] = useState(targetProject.name);
  const [fieldArea, setFieldArea] = useState(targetProject.fieldArea || FIELD_OPTIONS[0]);
  const [location, setLocation] = useState(targetProject.location);
  const [startDate, setStartDate] = useState(targetProject.startDate);
  const [finishDate, setFinishDate] = useState(targetProject.finishDate);
  const [contractValue, setContractValue] = useState<number>(targetProject.contractValue || 0);
  const [status, setStatus] = useState<Project['status']>(targetProject.status);
  const [subcontractor, setSubcontractor] = useState(targetProject.subcontractor || '');
  const [picName, setPicName] = useState(targetProject.picName || '');
  const [scopeType, setScopeType] = useState(targetProject.scopeType || 'TERESTRIS');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  useEffect(() => {
    if (targetProject) {
      setCode(targetProject.code);
      setSpkNumber(targetProject.spkNumber);
      setName(targetProject.name);
      setFieldArea(targetProject.fieldArea || FIELD_OPTIONS[0]);
      setLocation(targetProject.location);
      setStartDate(targetProject.startDate);
      setFinishDate(targetProject.finishDate);
      setContractValue(targetProject.contractValue || 0);
      setStatus(targetProject.status);
      setSubcontractor(targetProject.subcontractor || '');
      setPicName(targetProject.picName || '');
      setScopeType(targetProject.scopeType || 'TERESTRIS');
      setShowDeleteConfirm(false);
      setShowResetConfirm(false);
    }
  }, [targetProject, isOpen]);

  if (!isOpen) return null;

  const s = new Date(startDate);
  const f = new Date(finishDate);
  const durationDays = Math.max(1, Math.round((f.getTime() - s.getTime()) / (1000 * 3600 * 24)));

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateProject(targetProject.id, {
      code,
      spkNumber,
      name,
      fieldArea,
      location,
      startDate,
      finishDate,
      contractValue: Number(contractValue) || 0,
      status,
      subcontractor,
      picName,
      scopeType: scopeType as any,
    });
    onClose();
  };

  const handleDelete = () => {
    deleteProject(targetProject.id);
    onClose();
  };

  const handleResetWbs = () => {
    resetProjectToStandardWbs(targetProject.id);
    setShowResetConfirm(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20">
              <Edit3 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">Edit Informasi SPK</h3>
              <p className="text-xs text-slate-500 font-mono">
                {targetProject.code} — {targetProject.spkNumber}
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
        <form onSubmit={handleSave} className="overflow-y-auto px-6 py-5 space-y-4 flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Kode SPK
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nomor Surat Perintah Kerja
              </label>
              <input
                type="text"
                value={spkNumber}
                onChange={(e) => setSpkNumber(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nama Pekerjaan Survey
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Wilayah Kerja / Field
              </label>
              <select
                value={fieldArea}
                onChange={(e) => setFieldArea(e.target.value)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                {FIELD_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status SPK
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="ACTIVE">ACTIVE (Sedang Berjalan)</option>
                <option value="PLANNING">PLANNING (Persiapan)</option>
                <option value="COMPLETED">COMPLETED (Selesai/Closing)</option>
                <option value="ON_HOLD">ON_HOLD (Ditunda)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Disiplin Survey
              </label>
              <select
                value={scopeType}
                onChange={(e) => setScopeType(e.target.value as any)}
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
              >
                <option value="MULTI_DISIPLIN">Multi Disiplin</option>
                <option value="TERESTRIS">Terestris</option>
                <option value="DRONE_LIDAR">Drone LiDAR</option>
                <option value="FOTOGRAMETRI">Fotogrametri</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Lokasi / Fasilitas / Wellpad
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
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
                  Tanggal Mulai (Start)
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">
                  Tanggal Selesai (Finish)
                </label>
                <input
                  type="date"
                  value={finishDate}
                  onChange={(e) => setFinishDate(e.target.value)}
                  className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white"
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
                step="5000000"
                className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg font-semibold text-slate-800"
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
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500"
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
                className="w-full text-xs px-3 py-2 border border-slate-300 rounded-lg"
              />
            </div>
          </div>

          {/* Advanced Actions Section */}
          <div className="pt-3 border-t border-slate-200 space-y-3">
            <h4 className="text-xs font-bold text-slate-700">Tindakan Khusus & Penyelarasan WBS</h4>

            {/* Reset WBS Button */}
            <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-amber-900 block">
                  Terapkan Ulang WBS Standar SOW (53 Item)
                </span>
                <span className="text-[11px] text-amber-700 block">
                  Regenerasi paket pekerjaan sesuai lingkup resmi lampiran Pertamina EP Zona 4 berdasarkan tanggal SPK ini.
                </span>
              </div>
              {showResetConfirm ? (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleResetWbs}
                    className="px-3 py-1.5 text-xs font-bold bg-amber-600 text-white rounded-lg hover:bg-amber-700"
                  >
                    Ya, Reset
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-amber-300 text-amber-800 rounded-lg hover:bg-amber-100/50 flex items-center space-x-1.5 shrink-0"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Reset WBS</span>
                </button>
              )}
            </div>

            {/* Delete SPK Button */}
            <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-rose-900 block">Hapus SPK Ini</span>
                <span className="text-[11px] text-rose-700 block">
                  Hapus SPK dan seluruh rekaman WBS, timesheet, serta log kemajuan terkait.
                </span>
              </div>
              {showDeleteConfirm ? (
                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    type="button"
                    onClick={handleDelete}
                    className="px-3 py-1.5 text-xs font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                  >
                    Ya, Hapus
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowDeleteConfirm(false)}
                    className="px-2.5 py-1.5 text-xs text-slate-600 hover:bg-slate-200/60 rounded-lg"
                  >
                    Batal
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  className="px-3 py-1.5 text-xs font-semibold bg-white border border-rose-300 text-rose-800 rounded-lg hover:bg-rose-100/50 flex items-center space-x-1.5 shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Hapus SPK</span>
                </button>
              )}
            </div>
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
            onClick={handleSave}
            className="px-5 py-2.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md shadow-blue-500/20 transition-all flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Simpan Perubahan SPK</span>
          </button>
        </div>
      </div>
    </div>
  );
};
