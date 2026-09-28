import React, { useState } from 'react';
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Calendar,
  UserCheck,
  Plus,
  Lock,
  Filter,
  CheckSquare,
  Square,
  Play,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { TimesheetEntry, TimesheetStatus } from '../types';
import { exportTimesheetCSV } from '../utils/exportUtils';

export const TimesheetView: React.FC = () => {
  const {
    timesheets,
    wbsNodes,
    currentUser,
    addTimesheet,
    approveTimesheet,
    rejectTimesheet,
    batchApproveTimesheets,
    startTimer,
    project,
  } = useApp();

  const [viewMode, setViewMode] = useState<'approval' | 'grid' | 'list'>('approval');
  const [selectedWbsId, setSelectedWbsId] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('08:00');
  const [endTime, setEndTime] = useState('17:00');
  const [workDesc, setWorkDesc] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [rejectionModalId, setRejectionModalId] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Leaf tasks only
  const availableTasks = wbsNodes.filter((n) => !wbsNodes.some((o) => o.parentId === n.id));

  // Compute hours from start and end time
  const computeDuration = (start: string, end: string): number => {
    const [h1, m1] = start.split(':').map(Number);
    const [h2, m2] = end.split(':').map(Number);
    let diffMinutes = h2 * 60 + m2 - (h1 * 60 + m1);
    if (diffMinutes < 0) diffMinutes += 24 * 60;
    return Number((diffMinutes / 60).toFixed(1));
  };

  const calculatedHours = computeDuration(startTime, endTime);
  const isOvertime = calculatedHours > 8;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWbsId) return;

    // Check collision / overlap for same user on same date
    const userTimesheetsOnDate = timesheets.filter(
      (t) => t.userId === currentUser.id && t.date === entryDate
    );

    const hasCollision = userTimesheetsOnDate.some((t) => {
      return (
        (startTime >= t.startTime && startTime < t.endTime) ||
        (endTime > t.startTime && endTime <= t.endTime) ||
        (startTime <= t.startTime && endTime >= t.endTime)
      );
    });

    if (hasCollision) {
      if (!confirm('Peringatan: Jadwal jam kerja bentrok (overlap) dengan entri lain di hari yang sama. Tetap ajukan?')) {
        return;
      }
    }

    addTimesheet({
      wbsId: selectedWbsId,
      date: entryDate,
      startTime,
      endTime,
      totalHours: calculatedHours,
      description: workDesc.trim() || 'Pelaksanaan pekerjaan operasional harian.',
    });

    setWorkDesc('');
  };

  const isManagerOrSupervisor =
    currentUser.role === 'PROJECT_MANAGER' ||
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.role === 'SITE_SUPERVISOR';

  const filteredTimesheets = timesheets.filter((t) => {
    if (filterStatus !== 'ALL' && t.status !== filterStatus) return false;
    // Row level security: staff and subkon only see their own / subcontractor entries in their primary log
    if (currentUser.role === 'STAFF') {
      return t.userId === currentUser.id;
    }
    if (currentUser.role === 'SUBCONTRACTOR' && currentUser.subcontractorId) {
      return t.subcontractorId === currentUser.subcontractorId;
    }
    return true;
  });

  const pendingList = timesheets.filter((t) => t.status === 'PENDING');

  const toggleSelectAllPending = () => {
    if (selectedIds.length === pendingList.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingList.map((p) => p.id));
    }
  };

  const toggleSelectId = (id: string) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleBatchApprove = () => {
    if (selectedIds.length === 0) return;
    batchApproveTimesheets(selectedIds);
    setSelectedIds([]);
  };

  const handleConfirmReject = () => {
    if (!rejectionModalId) return;
    rejectTimesheet(rejectionModalId, rejectionReason || 'Tidak memenuhi kuota output pekerjaan harian.');
    setRejectionModalId(null);
    setRejectionReason('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <Clock className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Timesheet & Presensi Tenaga Kerja
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Time tracking jam kerja per paket WBS, validasi jam lembur (&gt;8 jam), serta alur persetujuan PM/Supervisor
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* View Switcher */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100 p-0.5 text-xs font-medium text-slate-600">
              {isManagerOrSupervisor && (
                <button
                  onClick={() => setViewMode('approval')}
                  className={`px-3 py-1.5 rounded-md transition ${
                    viewMode === 'approval' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'
                  }`}
                >
                  Approval Queue ({pendingList.length})
                </button>
              )}
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md transition ${
                  viewMode === 'list' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Daftar Riwayat
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1.5 rounded-md transition ${
                  viewMode === 'grid' ? 'bg-white text-slate-900 font-semibold shadow-2xs' : 'hover:text-slate-900'
                }`}
              >
                Grid Mingguan
              </button>
            </div>

            <button
              onClick={() => exportTimesheetCSV(project, timesheets)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 shadow-2xs"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* Manual Entry Form */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center space-x-2">
          <Plus className="w-4 h-4 text-blue-600" />
          <span>Input Timesheet Mandiri</span>
        </h3>

        <form onSubmit={handleManualSubmit} className="space-y-3 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <div className="sm:col-span-5">
              <label className="block font-semibold text-slate-700 mb-1">
                Pilih Item WBS:
              </label>
              <select
                required
                value={selectedWbsId}
                onChange={(e) => setSelectedWbsId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">-- Pilih Pekerjaan WBS --</option>
                {availableTasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.wbsCode} - {t.workName}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-3">
              <label className="block font-semibold text-slate-700 mb-1">
                Tanggal:
              </label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Jam Mulai:
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Jam Selesai:
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
            <div className="sm:col-span-8">
              <input
                type="text"
                placeholder="Deskripsi aktivitas spesifik (cth: Pengelasan balok, pemasangan ducting AC)..."
                value={workDesc}
                onChange={(e) => setWorkDesc(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 text-center">
              <span className="font-mono font-bold text-slate-800 text-sm">
                {calculatedHours} Jam
              </span>
              {isOvertime && (
                <span className="block text-[10px] text-amber-600 font-semibold">
                  (Lembur &gt;8 Jam)
                </span>
              )}
            </div>

            <div className="sm:col-span-2">
              <button
                type="submit"
                disabled={!selectedWbsId}
                className="w-full py-2 px-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50"
              >
                Ajukan Log
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* VIEW: APPROVAL QUEUE (FOR PM & SUPERVISOR) */}
      {viewMode === 'approval' && isManagerOrSupervisor && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Antrean Persetujuan (Approval Dashboard)
              </h3>
              <p className="text-xs text-slate-500">
                Data yang disetujui otomatis terkunci dan diakumulasi ke jam kerja proyek
              </p>
            </div>

            {pendingList.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleSelectAllPending}
                  className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  {selectedIds.length === pendingList.length ? 'Batal Pilih Semua' : 'Pilih Semua'}
                </button>
                <button
                  onClick={handleBatchApprove}
                  disabled={selectedIds.length === 0}
                  className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition disabled:opacity-50"
                >
                  Setujui Massal ({selectedIds.length})
                </button>
              </div>
            )}
          </div>

          {pendingList.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2 opacity-80" />
              <p className="text-sm font-semibold text-slate-700">Tidak ada timesheet yang menunggu persetujuan.</p>
              <p className="text-xs text-slate-400">Semua pengajuan jam kerja telah diproses.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingList.map((ts) => {
                const isSelected = selectedIds.includes(ts.id);
                return (
                  <div
                    key={ts.id}
                    className={`p-4 rounded-xl border transition flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 ${
                      isSelected ? 'border-blue-500 bg-blue-50/40 ring-1 ring-blue-400' : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <button
                        onClick={() => toggleSelectId(ts.id)}
                        className="mt-0.5 text-slate-400 hover:text-blue-600"
                      >
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5 text-blue-600" />
                        ) : (
                          <Square className="w-5 h-5" />
                        )}
                      </button>

                      <div className="text-xs space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-slate-900 text-sm">{ts.userName}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md font-semibold bg-slate-100 text-slate-700">
                            {ts.userRole}
                          </span>
                          {ts.subcontractorName && (
                            <span className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              {ts.subcontractorName}
                            </span>
                          )}
                          {ts.isOvertime && (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                              Lembur
                            </span>
                          )}
                        </div>

                        <div className="text-slate-600">
                          <strong className="font-mono text-blue-600">[{ts.wbsCode}]</strong> {ts.wbsWorkName}
                        </div>

                        <p className="text-slate-500 italic">"{ts.workDescription}"</p>

                        <div className="text-[11px] text-slate-400 font-mono">
                          {ts.date} • {ts.startTime} - {ts.endTime} ({ts.totalHours} jam kerja)
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 self-end sm:self-center">
                      <button
                        onClick={() => setRejectionModalId(ts.id)}
                        className="px-3 py-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-semibold transition"
                      >
                        Tolak
                      </button>
                      <button
                        onClick={() => approveTimesheet(ts.id)}
                        className="px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition"
                      >
                        Setujui
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW: WEEKLY GRID (HARVEST / TOGGL STYLE) */}
      {viewMode === 'grid' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Grid Jam Kerja Mingguan (Toggl/Harvest View)
              </h3>
              <p className="text-xs text-slate-500">
                Matriks alokasi jam kerja per item WBS dari Senin sampai Minggu
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-blue-600">
              Minggu Ini: 14 Sep - 20 Sep 2026
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-200 text-slate-700 font-semibold">
                  <th className="p-3 min-w-[200px]">Item Pekerjaan WBS</th>
                  <th className="p-3 text-center">Sen (14)</th>
                  <th className="p-3 text-center">Sel (15)</th>
                  <th className="p-3 text-center">Rab (16)</th>
                  <th className="p-3 text-center">Kam (17)</th>
                  <th className="p-3 text-center">Jum (18)</th>
                  <th className="p-3 text-center">Sab (19)</th>
                  <th className="p-3 text-center font-bold text-blue-700">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {availableTasks.slice(0, 6).map((task) => {
                  return (
                    <tr key={task.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <div className="font-semibold text-slate-800">
                          {task.wbsCode} - {task.workName}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {task.subcontractorName || 'Internal'}
                        </div>
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">8.0h</td>
                      <td className="p-3 text-center font-mono text-slate-600">8.0h</td>
                      <td className="p-3 text-center font-mono text-slate-600">8.0h</td>
                      <td className="p-3 text-center font-mono font-bold text-amber-600 bg-amber-50/50">
                        10.5h
                      </td>
                      <td className="p-3 text-center font-mono text-slate-600">8.0h</td>
                      <td className="p-3 text-center font-mono text-slate-400">0.0h</td>
                      <td className="p-3 text-center font-mono font-bold text-blue-700 bg-blue-50/40">
                        42.5h
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW: REGULAR LIST */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              Riwayat Lengkap Timesheet ({filteredTimesheets.length})
            </h3>

            <div className="flex items-center space-x-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 bg-slate-50"
              >
                <option value="ALL">Semua Status</option>
                <option value="PENDING">Menunggu Review</option>
                <option value="APPROVED">Disetujui (Locked)</option>
                <option value="REJECTED">Ditolak</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {filteredTimesheets.map((ts) => (
              <div key={ts.id} className="py-3 flex items-center justify-between text-xs gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-slate-900">{ts.userName}</span>
                    <span className="font-mono text-blue-600 font-semibold">[{ts.wbsCode}]</span>
                    <span className="text-slate-700 truncate max-w-xs">{ts.wbsWorkName}</span>
                    {ts.isOvertime && (
                      <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        Lembur
                      </span>
                    )}
                  </div>
                  <p className="text-slate-500 italic">"{ts.workDescription}"</p>
                  <p className="text-[11px] text-slate-400">
                    Tanggal: {ts.date} • {ts.startTime} - {ts.endTime}
                  </p>
                </div>

                <div className="text-right shrink-0 space-y-1">
                  <div className="font-mono font-bold text-sm text-slate-900">
                    {ts.totalHours} Jam
                  </div>
                  {ts.status === 'APPROVED' ? (
                    <span className="inline-flex items-center text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <Lock className="w-2.5 h-2.5 mr-1" /> Approved
                    </span>
                  ) : ts.status === 'REJECTED' ? (
                    <span className="inline-flex items-center text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                      <XCircle className="w-2.5 h-2.5 mr-1" /> Ditolak
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      Pending Review
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Catatan Penolakan Timesheet
            </h3>
            <p className="text-slate-500 mb-3">
              Berikan alasan revisi agar tenaga kerja atau sub-kontraktor dapat mengajukan ulang data yang benar.
            </p>

            <textarea
              rows={3}
              placeholder="Contoh: Jam lembur belum disetujui pengawas lapangan, output volume tidak sesuai."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500 mb-4"
            />

            <div className="flex items-center justify-end space-x-2">
              <button
                type="button"
                onClick={() => setRejectionModalId(null)}
                className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmReject}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold"
              >
                Tolak Pengajuan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
