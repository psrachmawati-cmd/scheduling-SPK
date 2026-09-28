import React, { useState } from 'react';
import {
  CheckSquare,
  Plus,
  Calendar,
  AlertCircle,
  Clock,
  CheckCircle2,
  Trash2,
  User,
  Filter,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DailyTask, DailyTaskStatus, TaskPriority } from '../types';

export const TaskListView: React.FC = () => {
  const {
    dailyTasks,
    wbsNodes,
    currentUser,
    users,
    addDailyTask,
    updateDailyTaskStatus,
    deleteDailyTask,
    project,
  } = useApp();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [deadline, setDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [priority, setPriority] = useState<TaskPriority>('HIGH');
  const [wbsId, setWbsId] = useState('');
  const [assigneeId, setAssigneeId] = useState(currentUser.id);

  const availableWbs = wbsNodes.filter((n) => !wbsNodes.some((o) => o.parentId === n.id));

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const assignedUser = users.find((u) => u.id === assigneeId);
    const linkedWbs = wbsNodes.find((n) => n.id === wbsId);

    addDailyTask({
      projectId: project.id,
      wbsId: linkedWbs ? linkedWbs.id : undefined,
      wbsCode: linkedWbs ? linkedWbs.wbsCode : undefined,
      wbsWorkName: linkedWbs ? linkedWbs.workName : undefined,
      assigneeId,
      assigneeName: assignedUser ? assignedUser.name : 'Staf Operasional',
      subcontractorId: assignedUser?.subcontractorId,
      title: title.trim(),
      description: desc.trim() || undefined,
      deadline,
      priority,
      status: 'TODO',
    });

    setTitle('');
    setDesc('');
    setIsAddOpen(false);
  };

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'URGENT':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'HIGH':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'MEDIUM':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'LOW':
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const filteredTasks = dailyTasks.filter((t) => {
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    return true;
  });

  const columns: { status: DailyTaskStatus; label: string; count: number; color: string }[] = [
    {
      status: 'TODO',
      label: 'To Do (Rencana Harian)',
      count: filteredTasks.filter((t) => t.status === 'TODO').length,
      color: 'border-slate-300 text-slate-700',
    },
    {
      status: 'IN_PROGRESS',
      label: 'Sedang Dikerjakan (In Progress)',
      count: filteredTasks.filter((t) => t.status === 'IN_PROGRESS').length,
      color: 'border-blue-300 text-blue-700',
    },
    {
      status: 'DONE',
      label: 'Selesai (Done)',
      count: filteredTasks.filter((t) => t.status === 'DONE').length,
      color: 'border-emerald-300 text-emerald-700',
    },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <CheckSquare className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Daftar Tugas Harian (Operational Kanban)
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              To-do operasional harian lapangan terintegrasi dengan struktur paket WBS (Spec 5.6)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="URGENT">Urgent (Kritis)</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <button
              onClick={() => setIsAddOpen(true)}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Tugas</span>
            </button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {columns.map((col) => {
          const colTasks = filteredTasks.filter((t) => t.status === col.status);

          return (
            <div
              key={col.status}
              className="bg-slate-50/70 rounded-2xl p-4 border border-slate-200/80 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-800">{col.label}</span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-white border border-slate-200 font-bold text-slate-700">
                    {colTasks.length}
                  </span>
                </div>
              </div>

              {/* Tasks List */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {colTasks.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs italic">
                    Belum ada tugas di kolom ini.
                  </div>
                ) : (
                  colTasks.map((task) => {
                    const today = new Date().toISOString().split('T')[0];
                    const isOverdue = task.status !== 'DONE' && task.deadline < today;
                    const isDueSoon = task.status !== 'DONE' && task.deadline === today;

                    return (
                      <div
                        key={task.id}
                        className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs hover:shadow-xs transition space-y-2.5 text-xs"
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getPriorityBadge(
                              task.priority
                            )}`}
                          >
                            {task.priority}
                          </span>

                          <button
                            onClick={() => deleteDailyTask(task.id)}
                            className="text-slate-300 hover:text-rose-600 transition"
                            title="Hapus tugas"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <h4 className="font-bold text-slate-900 leading-snug">
                          {task.title}
                        </h4>

                        {task.description && (
                          <p className="text-slate-500 text-[11px] line-clamp-2">
                            {task.description}
                          </p>
                        )}

                        {task.wbsCode && (
                          <div className="p-1.5 rounded bg-blue-50/60 border border-blue-100 text-[10px] text-blue-800 flex items-center space-x-1">
                            <span className="font-mono font-bold">[{task.wbsCode}]</span>
                            <span className="truncate">{task.wbsWorkName}</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                          <span className="text-slate-500 flex items-center">
                            <User className="w-3 h-3 mr-1 text-slate-400" />
                            {task.assigneeName.split(' ')[0]}
                          </span>

                          <span
                            className={`font-mono flex items-center ${
                              isOverdue
                                ? 'text-rose-600 font-bold'
                                : isDueSoon
                                ? 'text-amber-600 font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            <Clock className="w-3 h-3 mr-1" />
                            {task.deadline}
                          </span>
                        </div>

                        {/* Status Change Buttons */}
                        <div className="pt-2 flex items-center justify-between border-t border-slate-100 text-[10px]">
                          <span className="text-slate-400">Pindah status:</span>
                          <div className="flex items-center space-x-1">
                            {col.status !== 'TODO' && (
                              <button
                                onClick={() => updateDailyTaskStatus(task.id, 'TODO')}
                                className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 hover:bg-slate-200"
                              >
                                To Do
                              </button>
                            )}
                            {col.status !== 'IN_PROGRESS' && (
                              <button
                                onClick={() => updateDailyTaskStatus(task.id, 'IN_PROGRESS')}
                                className="px-2 py-0.5 rounded bg-blue-50 text-blue-600 hover:bg-blue-100 font-medium"
                              >
                                Sedang
                              </button>
                            )}
                            {col.status !== 'DONE' && (
                              <button
                                onClick={() => updateDailyTaskStatus(task.id, 'DONE')}
                                className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold"
                              >
                                Selesai
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Task Modal */}
      {isAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200 text-xs">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              Tambah Tugas Harian Baru
            </h3>
            <p className="text-slate-500 mb-4">
              Buat penugasan operasional spesifik untuk pekerja atau sub-kontraktor lapangan.
            </p>

            <form onSubmit={handleCreateTask} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Judul Tugas:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kalibrasi torque wrench sebelum erection balok"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Tautkan ke Item WBS (Opsional):
                </label>
                <select
                  value={wbsId}
                  onChange={(e) => setWbsId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="">-- Tugas Umum (Tanpa WBS Khusus) --</option>
                  {availableWbs.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.wbsCode} - {w.workName}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Petugas / Assignee:
                  </label>
                  <select
                    value={assigneeId}
                    onChange={(e) => setAssigneeId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.roleTitle})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Prioritas:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as TaskPriority)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="LOW">Low (Rendah)</option>
                    <option value="MEDIUM">Medium (Normal)</option>
                    <option value="HIGH">High (Tinggi)</option>
                    <option value="URGENT">Urgent (Kritis)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Target Deadline:
                </label>
                <input
                  type="date"
                  required
                  value={deadline}
                  onChange={(e) => setDeadline(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Keterangan Tambahan:
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail instruksi kerja, SOP, atau alat pelindung diri yang wajib..."
                  value={desc}
                  onChange={(e) => setDesc(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Simpan Tugas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
