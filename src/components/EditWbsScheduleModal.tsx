import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarDays,
  X,
  Layers,
  FileText,
  Building2,
  Percent,
} from 'lucide-react';
import { WbsNode, Project, Subcontractor } from '../types';
import { useAppContext } from '../context/AppContext';

interface EditWbsScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  node: WbsNode | null;
  project: Project;
  subcontractors: Subcontractor[];
}

export const EditWbsScheduleModal: React.FC<EditWbsScheduleModalProps> = ({
  isOpen,
  onClose,
  node,
  project,
  subcontractors,
}) => {
  const { updateWbsNode, allWbsNodes, setToast } = useAppContext();

  const [startPlan, setStartPlan] = useState('');
  const [finishPlan, setFinishPlan] = useState('');
  const [weight, setWeight] = useState<number>(0);
  const [subcontractorId, setSubcontractorId] = useState<string>('');
  const [volumePlan, setVolumePlan] = useState<number | undefined>(undefined);
  const [volumeUnit, setVolumeUnit] = useState<string>('');
  const [cascadeToChildren, setCascadeToChildren] = useState(true);

  useEffect(() => {
    if (node) {
      setStartPlan(node.startPlan || project.startDate);
      setFinishPlan(node.finishPlan || project.finishDate);
      setWeight(node.weight || 0);
      setSubcontractorId(node.subcontractorId || '');
      setVolumePlan(node.volumePlan);
      setVolumeUnit(node.volumeUnit || '');
      setCascadeToChildren(true);
    }
  }, [node, project]);

  if (!isOpen || !node) return null;

  // Calculate duration in calendar days
  const startDateObj = new Date(startPlan);
  const finishDateObj = new Date(finishPlan);
  const isValidDateRange =
    !isNaN(startDateObj.getTime()) &&
    !isNaN(finishDateObj.getTime()) &&
    finishDateObj.getTime() >= startDateObj.getTime();

  const calculatedDuration = isValidDateRange
    ? Math.max(1, Math.round((finishDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)))
    : 0;

  // SPK Boundary Checks
  const spkStartObj = new Date(project.startDate);
  const spkFinishObj = new Date(project.finishDate);

  const isBeforeSpkStart = !isNaN(startDateObj.getTime()) && startDateObj < spkStartObj;
  const isAfterSpkFinish = !isNaN(finishDateObj.getTime()) && finishDateObj > spkFinishObj;

  const spkDuration = Math.max(
    1,
    Math.round((spkFinishObj.getTime() - spkStartObj.getTime()) / (1000 * 60 * 60 * 24))
  );

  // Check if node has children
  const children = allWbsNodes.filter((n) => n.parentId === node.id);
  const hasChildren = children.length > 0;

  // Quick preset helper
  const setQuickDuration = (days: number) => {
    if (!startPlan) return;
    const s = new Date(startPlan);
    const newFinish = new Date(s.getTime() + days * 24 * 60 * 60 * 1000);
    const yyyy = newFinish.getFullYear();
    const mm = String(newFinish.getMonth() + 1).padStart(2, '0');
    const dd = String(newFinish.getDate()).padStart(2, '0');
    setFinishPlan(`${yyyy}-${mm}-${dd}`);
  };

  const handleApplySpkStart = () => {
    setStartPlan(project.startDate);
  };

  const handleApplySpkFinish = () => {
    setFinishPlan(project.finishDate);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValidDateRange) return;

    // Determine subcontractor name if selected
    const selectedSub = subcontractors.find((s) => s.id === subcontractorId);

    // If cascade is selected and has children, shift children proportionally
    if (hasChildren && cascadeToChildren && node.startPlan && node.finishPlan) {
      const oldStartMs = new Date(node.startPlan).getTime();
      const oldDurationMs = Math.max(
        1,
        new Date(node.finishPlan).getTime() - oldStartMs
      );
      const newStartMs = startDateObj.getTime();
      const newDurationMs = Math.max(1, finishDateObj.getTime() - newStartMs);

      // Shift direct child nodes
      children.forEach((child) => {
        if (child.startPlan && child.finishPlan) {
          const childStartMs = new Date(child.startPlan).getTime();
          const childFinishMs = new Date(child.finishPlan).getTime();

          const startRatio = Math.max(0, (childStartMs - oldStartMs) / oldDurationMs);
          const finishRatio = Math.min(1, (childFinishMs - oldStartMs) / oldDurationMs);

          const shiftedChildStart = new Date(newStartMs + startRatio * newDurationMs);
          const shiftedChildFinish = new Date(newStartMs + finishRatio * newDurationMs);

          const toYmd = (d: Date) => {
            const y = d.getFullYear();
            const m = String(d.getMonth() + 1).padStart(2, '0');
            const day = String(d.getDate()).padStart(2, '0');
            return `${y}-${m}-${day}`;
          };

          updateWbsNode(child.id, {
            startPlan: toYmd(shiftedChildStart),
            finishPlan: toYmd(shiftedChildFinish),
          });
        }
      });
    }

    // Update the targeted node
    updateWbsNode(node.id, {
      startPlan,
      finishPlan,
      durationDays: calculatedDuration,
      weight,
      subcontractorId: subcontractorId || undefined,
      subcontractorName: selectedSub ? selectedSub.name : node.subcontractorName,
      volumePlan: volumePlan !== undefined ? volumePlan : undefined,
      volumeUnit: volumeUnit || undefined,
    });

    setToast(`Rencana jadwal untuk "${node.workName}" berhasil diperbarui.`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-start justify-between">
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-100 text-blue-800 border border-blue-200">
                WBS {node.wbsCode}
              </span>
              {node.sowReference && (
                <span className="font-mono text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  {node.sowReference}
                </span>
              )}
              {node.isCritical && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-100 text-rose-700 border border-rose-200">
                  Jalur Kritis (CPM)
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 mt-1 leading-snug">
              {node.workName}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              SPK: <span className="font-semibold text-slate-700">{project.spkNumber || project.code}</span> • Lokasi: {project.location}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 space-y-4 text-xs">
          {/* SPK Timeline Reference Card */}
          <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-900 flex items-center justify-between">
            <div className="flex items-center space-x-2.5">
              <CalendarDays className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <div className="font-semibold text-xs">Masa Pelaksanaan Kontrak SPK:</div>
                <div className="text-[11px] font-mono text-blue-700">
                  {project.startDate} s/d {project.finishDate} ({spkDuration} Hari Kalender)
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                type="button"
                onClick={handleApplySpkStart}
                className="px-2 py-1 rounded bg-white text-[10px] font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 transition"
                title="Terapkan Tanggal Mulai SPK"
              >
                Mulai SPK
              </button>
              <button
                type="button"
                onClick={handleApplySpkFinish}
                className="px-2 py-1 rounded bg-white text-[10px] font-semibold text-blue-700 border border-blue-200 hover:bg-blue-50 transition"
                title="Terapkan Tanggal Selesai SPK"
              >
                Selesai SPK
              </button>
            </div>
          </div>

          {/* Primary Date Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Calendar className="w-3.5 h-3.5 text-blue-600" />
                <span>Rencana Tanggal Mulai:</span>
              </label>
              <input
                type="date"
                required
                value={startPlan}
                onChange={(e) => setStartPlan(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Tanggal kick-off / dimulainya pekerjaan
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
                <span>Rencana Tanggal Selesai:</span>
              </label>
              <input
                type="date"
                required
                value={finishPlan}
                onChange={(e) => setFinishPlan(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs bg-white"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Target penyelesaian / serah terima hasil
              </span>
            </div>
          </div>

          {/* Duration Summary & Quick Duration Adder */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-700">Dihitung Berdasarkan Kalender:</span>
              <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-slate-900">
                <span className="px-2 py-0.5 rounded-full bg-white border border-slate-300">
                  {calculatedDuration} Hari Kalender
                </span>
              </div>
            </div>

            {/* Quick preset duration buttons */}
            <div className="flex items-center space-x-2 pt-1">
              <span className="text-[11px] text-slate-500">Preset Durasi:</span>
              <div className="flex items-center space-x-1 flex-wrap gap-y-1">
                <button
                  type="button"
                  onClick={() => setQuickDuration(3)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-medium text-slate-700 transition"
                >
                  3 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(7)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-medium text-slate-700 transition"
                >
                  7 Hari (1 Mgg)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(14)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-medium text-slate-700 transition"
                >
                  14 Hari (2 Mgg)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDuration(21)}
                  className="px-2 py-0.5 rounded bg-white hover:bg-slate-100 border border-slate-300 text-[10px] font-medium text-slate-700 transition"
                >
                  21 Hari (3 Mgg)
                </button>
              </div>
            </div>

            {/* SPK Warning Indicator */}
            {isAfterSpkFinish && (
              <div className="flex items-start space-x-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> Tanggal selesai rencana ({finishPlan}) melampaui tanggal akhir kontrak SPK ({project.finishDate}). Pastikan telah ada kesepakatan adendum perpanjangan waktu.
                </span>
              </div>
            )}

            {isBeforeSpkStart && (
              <div className="flex items-start space-x-2 text-[11px] text-amber-800 bg-amber-50 p-2 rounded-lg border border-amber-200 mt-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Perhatian:</strong> Tanggal mulai rencana ({startPlan}) lebih awal dari tanggal penerbitan SPK ({project.startDate}).
                </span>
              </div>
            )}

            {!isValidDateRange && (
              <div className="flex items-start space-x-2 text-[11px] text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200 mt-2">
                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Kesalahan Tanggal:</strong> Tanggal selesai tidak boleh mendahului tanggal mulai rencana.
                </span>
              </div>
            )}
          </div>

          {/* Secondary Details: Bobot, Pelaksana & Volume */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Percent className="w-3.5 h-3.5 text-slate-500" />
                <span>Bobot (%) Pekerjaan:</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={weight}
                onChange={(e) => setWeight(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Kontribusi bobot terhadap sub-pekerjaan atau induk
              </span>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center space-x-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>Pelaksana / Subkontraktor:</span>
              </label>
              <select
                value={subcontractorId}
                onChange={(e) => setSubcontractorId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs bg-white"
              >
                <option value="">-- Tim Internal / Sesuai SPK --</option>
                {subcontractors.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.specialty})
                  </option>
                ))}
              </select>
              <span className="text-[10px] text-slate-400 mt-1 block">
                PIC operasional lapangan pelaksana
              </span>
            </div>
          </div>

          {/* Volume Target Input */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Volume Rencana (Opsional):
              </label>
              <input
                type="number"
                placeholder="Contoh: 15"
                value={volumePlan !== undefined ? volumePlan : ''}
                onChange={(e) =>
                  setVolumePlan(e.target.value ? Number(e.target.value) : undefined)
                }
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Satuan Volume:
              </label>
              <input
                type="text"
                placeholder="Titik / Ha / Km / Dokumen"
                value={volumeUnit}
                onChange={(e) => setVolumeUnit(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
              />
            </div>
          </div>

          {/* Cascade to children checkbox */}
          {hasChildren && (
            <div className="p-3 rounded-xl bg-purple-50/70 border border-purple-200">
              <label className="flex items-start space-x-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={cascadeToChildren}
                  onChange={(e) => setCascadeToChildren(e.target.checked)}
                  className="rounded border-slate-300 text-purple-600 focus:ring-purple-500 mt-0.5"
                />
                <div>
                  <span className="font-semibold text-purple-900 block">
                    Otomatis sesuaikan jadwal anak sub-task ({children.length} item)
                  </span>
                  <span className="text-[11px] text-purple-700 block mt-0.5">
                    Rentang tanggal semua sub-task di bawah item WBS ini akan digeser secara proporsional sesuai rentang tanggal baru.
                  </span>
                </div>
              </label>
            </div>
          )}

          {/* Footer Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium transition"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={!isValidDateRange}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs disabled:opacity-50 disabled:cursor-not-allowed transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Rencana Jadwal</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
