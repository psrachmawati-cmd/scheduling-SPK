import React, { useState } from 'react';
import {
  PenTool,
  CheckCircle,
  Clock,
  AlertTriangle,
  Upload,
  Camera,
  Layers,
  History,
  Info,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WbsNode } from '../types';

export const ProgressInputModal: React.FC = () => {
  const {
    wbsNodes,
    currentUser,
    submitProgress,
    progressLogs,
    setActiveTab,
  } = useApp();

  // Filter leaf tasks assigned to current user if subcontractor
  const eligibleTasks = wbsNodes.filter((node) => {
    const isLeaf = !wbsNodes.some((other) => other.parentId === node.id);
    if (!isLeaf) return false;

    // Row-level security for Sub-contractor (Spec 5.2.5 & 8)
    if (currentUser.role === 'SUBCONTRACTOR' && currentUser.subcontractorId) {
      return node.subcontractorId === currentUser.subcontractorId;
    }
    return true;
  });

  const [selectedWbsId, setSelectedWbsId] = useState<string>(
    eligibleTasks.length > 0 ? eligibleTasks[0].id : ''
  );
  const [inputMode, setInputMode] = useState<'percent' | 'volume'>('percent');
  const [progressPercent, setProgressPercent] = useState<number>(50);
  const [volumeDone, setVolumeDone] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');

  const selectedNode = wbsNodes.find((n) => n.id === selectedWbsId);

  // Sync default values when task changes
  const handleSelectTask = (id: string) => {
    setSelectedWbsId(id);
    const node = wbsNodes.find((n) => n.id === id);
    if (node) {
      setProgressPercent(node.progressActual);
      if (node.volumePlan) {
        setVolumeDone(node.volumeActual || 0);
        setInputMode('volume');
      } else {
        setInputMode('percent');
      }
    }
  };

  const calculatedPercent =
    inputMode === 'volume' && selectedNode?.volumePlan && selectedNode.volumePlan > 0
      ? Math.min(100, Number(((volumeDone / selectedNode.volumePlan) * 100).toFixed(1)))
      : progressPercent;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    submitProgress({
      wbsId: selectedNode.id,
      progressActual: calculatedPercent,
      volumeSubmitted: inputMode === 'volume' ? volumeDone : undefined,
      notes: notes.trim() || `Pembaruan realisasi progres aktual menjadi ${calculatedPercent}%.`,
    });

    setNotes('');
    setPhotoFileName('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <PenTool className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Input Progres Aktual Lapangan
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Pencatatan realisasi fisik bottom-up dengan pemicu otomatis roll-up kalkulasi ke parent & root project
            </p>
          </div>

          {currentUser.role === 'SUBCONTRACTOR' && (
            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-semibold text-emerald-800">
              Peran: Sub-Kontraktor ({currentUser.subcontractorName})
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Input Form */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-800 mb-1.5">
                Pilih Item Pekerjaan WBS:
              </label>
              <select
                value={selectedWbsId}
                onChange={(e) => handleSelectTask(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {eligibleTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    [{t.wbsCode}] {t.workName} (Saat ini: {t.progressActual}%)
                  </option>
                ))}
              </select>
            </div>

            {selectedNode && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Bobot Tugas:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedNode.weight}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Target Baseline Rencana:</span>
                  <span className="font-mono font-bold text-indigo-700">{selectedNode.progressPlan}%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Realisasi Saat Ini:</span>
                  <span className="font-mono font-bold text-emerald-700">{selectedNode.progressActual}%</span>
                </div>
                {selectedNode.subcontractorName && (
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Pelaksana:</span>
                    <span className="font-medium text-slate-800">{selectedNode.subcontractorName}</span>
                  </div>
                )}
              </div>
            )}

            {/* Input Mode Selector */}
            {selectedNode?.volumePlan ? (
              <div className="flex items-center space-x-3 pt-1">
                <span className="font-semibold text-slate-700">Metode Input:</span>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={inputMode === 'volume'}
                    onChange={() => setInputMode('volume')}
                    className="text-blue-600"
                  />
                  <span>Berbasis Volume Fisik ({selectedNode.volumeUnit})</span>
                </label>
                <label className="inline-flex items-center space-x-1.5 cursor-pointer">
                  <input
                    type="radio"
                    name="mode"
                    checked={inputMode === 'percent'}
                    onChange={() => setInputMode('percent')}
                    className="text-blue-600"
                  />
                  <span>Persentase Langsung (%)</span>
                </label>
              </div>
            ) : null}

            {/* Volume Input */}
            {inputMode === 'volume' && selectedNode?.volumePlan ? (
              <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Volume Fisik Selesai Kumulatif:
                  </label>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Total Rencana: {selectedNode.volumePlan} {selectedNode.volumeUnit}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    max={selectedNode.volumePlan * 1.5}
                    step="0.1"
                    value={volumeDone}
                    onChange={(e) => setVolumeDone(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white font-mono font-bold text-base focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <span className="font-bold text-slate-700">{selectedNode.volumeUnit}</span>
                </div>
                <div className="text-[11px] text-blue-700 font-medium">
                  Perhitungan: ({volumeDone} / {selectedNode.volumePlan}) × 100% ={' '}
                  <strong className="font-mono text-sm">{calculatedPercent}%</strong>
                </div>
              </div>
            ) : (
              /* Direct Percentage Slider & Input */
              <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-800">
                    Persentase Realisasi Progres (%):
                  </label>
                  <span className="text-base font-mono font-bold text-blue-600">
                    {progressPercent}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="1"
                  value={progressPercent}
                  onChange={(e) => setProgressPercent(Number(e.target.value))}
                  className="w-full accent-blue-600 cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>0%</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100%</span>
                </div>
              </div>
            )}

            {/* Field Notes & Reason */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Catatan Lapangan & Kendala Teknis:
              </label>
              <textarea
                rows={3}
                placeholder="Tuliskan laporan kondisi lapangan, kendala cuaca/material, atau tindakan korektif..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
              />
            </div>

            {/* Document / Photo Upload Simulator */}
            <div>
              <label className="block font-bold text-slate-800 mb-1">
                Dokumen Pendukung / Foto Lapangan (Spec 5.3.c):
              </label>
              <div className="border-2 border-dashed border-slate-200 rounded-xl p-3 text-center hover:bg-slate-50 transition cursor-pointer">
                <input
                  type="file"
                  id="photo-upload"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setPhotoFileName(e.target.files[0].name);
                    }
                  }}
                />
                <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center">
                  <Camera className="w-5 h-5 text-slate-400 mb-1" />
                  <span className="text-xs text-slate-600 font-medium">
                    {photoFileName ? `File terpilih: ${photoFileName}` : 'Klik atau drag foto opname fisik lapangan'}
                  </span>
                  <span className="text-[10px] text-slate-400">JPG, PNG, PDF (Maks. 10MB)</span>
                </label>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-2 flex items-center justify-end space-x-3">
              <button
                type="submit"
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
              >
                <TrendingUp className="w-4 h-4" />
                <span>Simpan Snapshot & Hitung Roll-Up</span>
              </button>
            </div>
          </form>
        </div>

        {/* Snapshot Logs & Audit Trail Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Log Histori Progress ({progressLogs.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Tersimpan per Snapshot</span>
            </div>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {progressLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between font-medium">
                    <span className="font-bold text-slate-900">
                      [{log.wbsCode}] {log.workName}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {log.snapshotDate}
                    </span>
                  </div>

                  <p className="text-slate-600 italic text-[11px]">
                    "{log.notes}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50">
                    <span className="text-slate-500">
                      Oleh: <strong className="text-slate-700">{log.userName}</strong>
                    </span>
                    <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                      Aktual: {log.progressActual}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
