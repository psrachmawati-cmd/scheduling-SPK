import React, { useState, useEffect } from 'react';
import {
  CalendarRange,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  X,
  Search,
  ArrowRight,
  MoveRight,
  RotateCcw,
  Sparkles,
  Layers,
  Filter,
} from 'lucide-react';
import { WbsNode, Project } from '../types';
import { useAppContext } from '../context/AppContext';

interface BatchWbsScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project;
  nodes: WbsNode[];
}

interface DateDraft {
  id: string;
  wbsCode: string;
  workName: string;
  level: number;
  parentId: string | null;
  startPlan: string;
  finishPlan: string;
  durationDays: number;
  sowReference?: string;
  isCritical?: boolean;
}

export const BatchWbsScheduleModal: React.FC<BatchWbsScheduleModalProps> = ({
  isOpen,
  onClose,
  project,
  nodes,
}) => {
  const { batchUpdateWbsDates, setToast } = useAppContext();

  const [drafts, setDrafts] = useState<DateDraft[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDivision, setSelectedDivision] = useState<string>('all');
  const [shiftDays, setShiftDays] = useState<number>(3);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (nodes && nodes.length > 0) {
      const initialDrafts = nodes.map((n) => ({
        id: n.id,
        wbsCode: n.wbsCode,
        workName: n.workName,
        level: n.level,
        parentId: n.parentId,
        startPlan: n.startPlan || project.startDate,
        finishPlan: n.finishPlan || project.finishDate,
        durationDays: n.durationDays || 1,
        sowReference: n.sowReference,
        isCritical: n.isCritical,
      }));
      setDrafts(initialDrafts);
      setHasChanges(false);
    }
  }, [nodes, project, isOpen]);

  if (!isOpen) return null;

  const handleDateChange = (id: string, field: 'startPlan' | 'finishPlan', value: string) => {
    setDrafts((prev) =>
      prev.map((d) => {
        if (d.id === id) {
          const updated = { ...d, [field]: value };
          const s = new Date(field === 'startPlan' ? value : d.startPlan).getTime();
          const f = new Date(field === 'finishPlan' ? value : d.finishPlan).getTime();
          if (!isNaN(s) && !isNaN(f)) {
            updated.durationDays = Math.max(1, Math.round((f - s) / (1000 * 60 * 60 * 24)));
          }
          return updated;
        }
        return d;
      })
    );
    setHasChanges(true);
  };

  // Shift all tasks by X days
  const handleShiftAll = (direction: 'forward' | 'backward') => {
    const days = direction === 'forward' ? shiftDays : -shiftDays;
    const shiftMs = days * 24 * 60 * 60 * 1000;

    const toYmd = (dateStr: string) => {
      const orig = new Date(dateStr).getTime();
      if (isNaN(orig)) return dateStr;
      const shifted = new Date(orig + shiftMs);
      const y = shifted.getFullYear();
      const m = String(shifted.getMonth() + 1).padStart(2, '0');
      const d = String(shifted.getDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    };

    setDrafts((prev) =>
      prev.map((d) => {
        const newStart = toYmd(d.startPlan);
        const newFinish = toYmd(d.finishPlan);
        return {
          ...d,
          startPlan: newStart,
          finishPlan: newFinish,
        };
      })
    );
    setHasChanges(true);
    setToast(`Seluruh jadwal WBS berhasil digeser ${days > 0 ? `+${days}` : days} hari.`);
  };

  // Reset all dates to project boundary
  const handleResetToSpkDates = () => {
    if (confirm(`Reset tanggal mulai & selesai semua WBS ke rentang awal SPK (${project.startDate} s/d ${project.finishDate})?`)) {
      const initialDrafts = nodes.map((n) => ({
        id: n.id,
        wbsCode: n.wbsCode,
        workName: n.workName,
        level: n.level,
        parentId: n.parentId,
        startPlan: n.startPlan || project.startDate,
        finishPlan: n.finishPlan || project.finishDate,
        durationDays: n.durationDays || 1,
        sowReference: n.sowReference,
        isCritical: n.isCritical,
      }));
      setDrafts(initialDrafts);
      setHasChanges(false);
      setToast('Jadwal WBS dikembalikan ke kondisi awal.');
    }
  };

  // Save batch changes
  const handleSaveAll = () => {
    const updates = drafts.map((d) => ({
      id: d.id,
      startPlan: d.startPlan,
      finishPlan: d.finishPlan,
    }));

    batchUpdateWbsDates(project.id, updates);
    setHasChanges(false);
    onClose();
  };

  // Filtering
  const filteredDrafts = drafts.filter((d) => {
    // Search query
    const matchSearch =
      d.workName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.wbsCode.includes(searchTerm) ||
      (d.sowReference && d.sowReference.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchSearch) return false;

    // Division filter
    if (selectedDivision === 'div1') return d.wbsCode.startsWith('1');
    if (selectedDivision === 'div2') return d.wbsCode.startsWith('2');
    if (selectedDivision === 'div3') return d.wbsCode.startsWith('3');
    if (selectedDivision === 'div4') return d.wbsCode.startsWith('4');

    return true;
  });

  // Calculate SPK boundary
  const spkFinishTime = new Date(project.finishDate).getTime();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-lg bg-indigo-100 text-indigo-700">
                <CalendarRange className="w-5 h-5" />
              </span>
              <h3 className="text-base font-bold text-slate-900">
                Tools Atur Rencana Tanggal Mulai & Selesai WBS
              </h3>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 font-semibold text-indigo-700 border border-indigo-200">
                {drafts.length} Item Breakdown
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              SPK: <span className="font-semibold text-slate-800">{project.spkNumber || project.code}</span> • Rentang Kontrak: <span className="font-mono font-semibold text-blue-700">{project.startDate}</span> s/d <span className="font-mono font-semibold text-blue-700">{project.finishDate}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Batch Tools Toolbar */}
        <div className="px-6 py-3 bg-indigo-50/40 border-b border-indigo-100 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex items-center space-x-2 flex-wrap gap-y-1">
            <span className="font-semibold text-slate-700 flex items-center space-x-1">
              <MoveRight className="w-3.5 h-3.5 text-indigo-600" />
              <span>Geser Jadwal Seluruh Task:</span>
            </span>
            <div className="flex items-center space-x-1">
              <input
                type="number"
                min="1"
                max="90"
                value={shiftDays}
                onChange={(e) => setShiftDays(Math.max(1, Number(e.target.value)))}
                className="w-14 px-2 py-1 rounded border border-slate-300 bg-white font-mono text-xs focus:ring-1 focus:ring-indigo-500 text-center"
              />
              <span className="text-slate-500">hari</span>
            </div>
            <button
              type="button"
              onClick={() => handleShiftAll('forward')}
              className="px-2.5 py-1 rounded bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-2xs transition"
              title="Mundurkan tanggal semua task (+hari)"
            >
              + Majukan Jadwal
            </button>
            <button
              type="button"
              onClick={() => handleShiftAll('backward')}
              className="px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-medium transition"
              title="Majukan tanggal semua task (-hari)"
            >
              - Mundurkan Jadwal
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleResetToSpkDates}
              className="flex items-center space-x-1 px-2.5 py-1 rounded bg-white hover:bg-slate-100 text-slate-600 border border-slate-300 font-medium transition"
              title="Reset ke tanggal awal"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Awal</span>
            </button>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="px-6 py-2.5 bg-white border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          {/* Division Tabs */}
          <div className="flex items-center space-x-1 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedDivision('all')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                selectedDivision === 'all'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Semua Divisi
            </button>
            <button
              onClick={() => setSelectedDivision('div1')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                selectedDivision === 'div1'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              1. Persiapan
            </button>
            <button
              onClick={() => setSelectedDivision('div2')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                selectedDivision === 'div2'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              2. Terestris
            </button>
            <button
              onClick={() => setSelectedDivision('div3')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                selectedDivision === 'div3'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              3. Drone LiDAR
            </button>
            <button
              onClick={() => setSelectedDivision('div4')}
              className={`px-2.5 py-1 rounded-lg transition font-medium ${
                selectedDivision === 'div4'
                  ? 'bg-blue-600 text-white shadow-2xs font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              4. Administrasi & Laporan
            </button>
          </div>

          {/* Search box */}
          <div className="relative w-64">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Filter nama pekerjaan atau kode..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1 rounded-lg border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50 focus:bg-white"
            />
          </div>
        </div>

        {/* Interactive Breakdown Dates Table */}
        <div className="flex-1 overflow-y-auto px-6 py-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-semibold sticky top-0 bg-white z-10">
                <th className="py-2.5 px-2 w-20">Kode WBS</th>
                <th className="py-2.5 px-3 min-w-[260px]">Nama Breakdown Pekerjaan</th>
                <th className="py-2.5 px-2 w-36 text-center">Rencana Tgl Mulai</th>
                <th className="py-2.5 px-2 w-36 text-center">Rencana Tgl Selesai</th>
                <th className="py-2.5 px-2 w-24 text-center">Durasi</th>
                <th className="py-2.5 px-2 w-28 text-center">Validasi SPK</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDrafts.map((item) => {
                const finishMs = new Date(item.finishPlan).getTime();
                const startMs = new Date(item.startPlan).getTime();
                const isOverSpk = !isNaN(finishMs) && finishMs > spkFinishTime;
                const isInvalid = !isNaN(finishMs) && !isNaN(startMs) && finishMs < startMs;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-blue-50/50 transition-colors ${
                      item.level === 0
                        ? 'bg-slate-50/80 font-semibold text-slate-900'
                        : 'text-slate-700'
                    }`}
                  >
                    {/* WBS Code */}
                    <td className="py-2 px-2 font-mono font-bold text-blue-700">
                      {item.wbsCode}
                    </td>

                    {/* Work Name */}
                    <td className="py-2 px-3">
                      <div
                        className="flex items-center space-x-1.5"
                        style={{ paddingLeft: `${item.level * 14}px` }}
                      >
                        <span className="truncate max-w-sm" title={item.workName}>
                          {item.workName}
                        </span>
                        {item.sowReference && (
                          <span className="text-[9px] font-mono px-1 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0">
                            {item.sowReference}
                          </span>
                        )}
                        {item.isCritical && (
                          <span className="text-[9px] font-bold px-1 rounded bg-rose-100 text-rose-700 shrink-0">
                            CPM
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Start Plan Input */}
                    <td className="py-1.5 px-2 text-center">
                      <input
                        type="date"
                        value={item.startPlan}
                        onChange={(e) => handleDateChange(item.id, 'startPlan', e.target.value)}
                        className="w-32 px-2 py-1 rounded border border-slate-300 font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
                      />
                    </td>

                    {/* Finish Plan Input */}
                    <td className="py-1.5 px-2 text-center">
                      <input
                        type="date"
                        value={item.finishPlan}
                        onChange={(e) => handleDateChange(item.id, 'finishPlan', e.target.value)}
                        className={`w-32 px-2 py-1 rounded border font-mono text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white ${
                          isOverSpk
                            ? 'border-amber-400 bg-amber-50 text-amber-900'
                            : isInvalid
                            ? 'border-rose-400 bg-rose-50 text-rose-900'
                            : 'border-slate-300'
                        }`}
                      />
                    </td>

                    {/* Duration Display */}
                    <td className="py-2 px-2 text-center font-mono font-medium text-slate-800">
                      {item.durationDays} hari
                    </td>

                    {/* Validation */}
                    <td className="py-2 px-2 text-center">
                      {isInvalid ? (
                        <span className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                          Tgl Terbalik
                        </span>
                      ) : isOverSpk ? (
                        <span
                          className="inline-flex items-center text-[10px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200"
                          title={`Melebihi batas SPK (${project.finishDate})`}
                        >
                          &gt; Batas SPK
                        </span>
                      ) : (
                        <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                          Sesuai
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            {hasChanges ? (
              <span className="text-amber-700 font-semibold flex items-center space-x-1">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Ada perubahan jadwal yang belum disimpan.</span>
              </span>
            ) : (
              <span>Seluruh jadwal tersinkronisasi dengan portofolio WBS.</span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 font-medium text-xs transition"
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-xs transition flex items-center space-x-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Simpan Seluruh Rencana Jadwal</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
