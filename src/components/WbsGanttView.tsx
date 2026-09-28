import React, { useState } from 'react';
import {
  ChevronRight,
  ChevronDown,
  Plus,
  BookmarkCheck,
  Search,
  Filter,
  Trash2,
  Calendar,
  Layers,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Clock,
  PenTool,
  Diamond,
  Flame,
  Building,
  MapPin,
  FileText,
  UserCheck,
  Layers3,
  ExternalLink,
  Edit3,
  CalendarClock,
  CalendarRange,
  CalendarDays,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WbsNode, TaskStatus } from '../types';
import { formatIDR } from '../utils/wbsLogic';
import { EditSpkModal } from './EditSpkModal';
import { EditWbsScheduleModal } from './EditWbsScheduleModal';
import { BatchWbsScheduleModal } from './BatchWbsScheduleModal';

export const WbsGanttView: React.FC = () => {
  const {
    wbsNodes,
    project,
    projects,
    activeProjectId,
    switchProject,
    subcontractors,
    addWbsNode,
    deleteWbsNode,
    setBaseline,
    currentUser,
    setActiveTab,
  } = useApp();

  const [isEditSpkOpen, setIsEditSpkOpen] = useState(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSubcontractor, setFilterSubcontractor] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterCriticalOnly, setFilterCriticalOnly] = useState(false);
  const [filterMilestoneOnly, setFilterMilestoneOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'both' | 'table' | 'gantt'>('both');

  // Schedule Tools State
  const [editingScheduleNode, setEditingScheduleNode] = useState<WbsNode | null>(null);
  const [isEditScheduleOpen, setIsEditScheduleOpen] = useState(false);
  const [isBatchScheduleOpen, setIsBatchScheduleOpen] = useState(false);

  // Add Task Modal State
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newTaskParentId, setNewTaskParentId] = useState<string | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskWeight, setNewTaskWeight] = useState(20);
  const [newTaskStart, setNewTaskStart] = useState('2026-06-01');
  const [newTaskFinish, setNewTaskFinish] = useState('2026-07-15');
  const [newTaskSubId, setNewTaskSubId] = useState('');
  const [newTaskVolume, setNewTaskVolume] = useState<number | undefined>();
  const [newTaskUnit, setNewTaskUnit] = useState('');

  const toggleCollapse = (id: string) => {
    setCollapsedNodes((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Check if a node is visible based on parent collapse state
  const isNodeVisible = (node: WbsNode): boolean => {
    let curr = node;
    while (curr.parentId) {
      if (collapsedNodes.has(curr.parentId)) return false;
      const parent = wbsNodes.find((n) => n.id === curr.parentId);
      if (!parent) break;
      curr = parent;
    }
    return true;
  };

  const filteredNodes = wbsNodes.filter((node) => {
    if (!isNodeVisible(node)) return false;
    if (
      searchTerm &&
      !node.workName.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !node.wbsCode.includes(searchTerm)
    ) {
      return false;
    }
    if (filterSubcontractor && node.subcontractorId !== filterSubcontractor) {
      return false;
    }
    if (filterStatus && node.status !== filterStatus) {
      return false;
    }
    if (filterCriticalOnly && !node.isCritical) {
      return false;
    }
    if (filterMilestoneOnly && !node.isMilestone) {
      return false;
    }
    return true;
  });

  const handleOpenEditSchedule = (node: WbsNode) => {
    setEditingScheduleNode(node);
    setIsEditScheduleOpen(true);
  };

  const handleOpenAddModal = (parentId: string | null = null) => {
    setNewTaskParentId(parentId);
    setNewTaskName('');
    setNewTaskWeight(parentId ? 20 : 25);
    setNewTaskStart(project.startDate);
    setNewTaskFinish(project.finishDate);
    setNewTaskSubId('');
    setNewTaskVolume(undefined);
    setNewTaskUnit('');
    setIsAddModalOpen(true);
  };

  const handleSaveNewTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskName.trim()) return;

    addWbsNode({
      parentId: newTaskParentId,
      workName: newTaskName.trim(),
      weight: Number(newTaskWeight),
      startPlan: newTaskStart,
      finishPlan: newTaskFinish,
      subcontractorId: newTaskSubId || undefined,
      volumePlan: newTaskVolume,
      volumeUnit: newTaskUnit || undefined,
    });

    setIsAddModalOpen(false);
  };

  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 mr-1" /> Selesai
          </span>
        );
      case 'ON_PROGRESS':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3 h-3 mr-1" /> On Progress
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="w-3 h-3 mr-1" /> Delayed
          </span>
        );
      case 'ON_HOLD':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            On Hold
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
            Not Started
          </span>
        );
    }
  };

  // Timeline Gantt math based on active project's span
  const projectStart = new Date(project.startDate).getTime();
  const projectEnd = new Date(project.finishDate).getTime();
  const totalDuration = Math.max(1, projectEnd - projectStart);

  const getGanttPosition = (startStr: string, finishStr: string) => {
    const s = new Date(startStr).getTime();
    const f = new Date(finishStr).getTime();
    const leftPercent = Math.max(0, Math.min(100, ((s - projectStart) / totalDuration) * 100));
    const widthPercent = Math.max(2, Math.min(100 - leftPercent, ((f - s) / totalDuration) * 100));
    return { left: `${leftPercent}%`, width: `${widthPercent}%`, leftRaw: leftPercent };
  };

  // Today marker (Assume simulated date 2026-07-20 for demo timeline)
  const simulatedToday = new Date('2026-07-20').getTime();
  const todayPosition = Math.max(0, Math.min(100, ((simulatedToday - projectStart) / totalDuration) * 100));

  const criticalItemsCount = wbsNodes.filter((n) => n.isCritical).length;
  const milestoneItemsCount = wbsNodes.filter((n) => n.isMilestone).length;

  return (
    <div className="space-y-5 pb-12">
      {/* SPK Selector & Operational Context Header */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        {/* SPK Selector Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <label className="text-xs font-bold text-slate-700 flex items-center space-x-1.5 uppercase tracking-wider">
              <Layers3 className="w-4 h-4 text-blue-600" />
              <span>Pilih SPK:</span>
            </label>
            <div className="relative min-w-[280px] sm:min-w-[340px]">
              <select
                value={activeProjectId}
                onChange={(e) => switchProject(e.target.value)}
                className="w-full pl-3 pr-8 py-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-white focus:bg-white font-semibold text-slate-900 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} • {p.name.slice(0, 42)}... ({p.currentProgressActual}%)
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => setActiveTab('portfolio')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1 px-2.5 py-1.5 rounded-lg hover:bg-blue-50 transition"
            >
              <span>Lihat Monitoring SPK</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsEditSpkOpen(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
              title="Edit Range Waktu, Nilai Kontrak, atau Terapkan Ulang WBS Standar"
            >
              <Edit3 className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit SPK</span>
            </button>

            <span
              className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
                project.healthStatus === 'ON_TRACK'
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : project.healthStatus === 'CRITICAL'
                  ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                  : 'bg-amber-50 text-amber-700 border-amber-200'
              }`}
            >
              Kesehatan SPK: {project.healthStatus || 'ON_TRACK'}
            </span>
            <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              {project.currentProgressActual}% / Plan {project.targetProgressPlan}%
            </span>
          </div>
        </div>

        {/* Selected SPK Meta Details */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Nomor SPK Resmi:</span>
            <span className="font-mono font-bold text-slate-800">{project.spkNumber || project.code}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Lokasi & Wilayah Kerja:</span>
            <span className="font-semibold text-slate-800">{project.location}</span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Pelaksana & PIC:</span>
            <span className="font-semibold text-slate-800">
              {project.subcontractor || 'KJSB'} (PIC: {project.picName || 'Ir. Bambang S.'})
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">Durasi Kontrak & Nilai:</span>
            <span className="font-semibold text-slate-800">
              {project.startDate} s/d {project.finishDate} • {formatIDR(project.contractValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Header & Controls for WBS/Gantt */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 flex-wrap gap-y-1">
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                WBS & Gantt Timeline: {project.code}
              </h2>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 font-semibold text-slate-700 border border-slate-200">
                {wbsNodes.length} Item
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-rose-50 font-semibold text-rose-700 border border-rose-200 flex items-center space-x-1">
                <Flame className="w-3 h-3 text-rose-600" />
                <span>{criticalItemsCount} Jalur Kritis</span>
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-purple-50 font-semibold text-purple-700 border border-purple-200 flex items-center space-x-1">
                <Diamond className="w-3 h-3 text-purple-600 fill-purple-200" />
                <span>{milestoneItemsCount} Milestones</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Hierarki struktur pekerjaan survey pemetaan, visualisasi jadwal lintasan kritis (CPM), pelacakan milestone M1-M5, dan penyebab deviasi.
            </p>
          </div>

          <div className="flex items-center space-x-2 flex-wrap gap-y-2">
            {/* View Mode Toggle */}
            <div className="flex rounded-lg border border-slate-200 bg-slate-100/80 p-0.5 text-xs font-medium text-slate-600">
              <button
                onClick={() => setViewMode('both')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === 'both'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Split View
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === 'table'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Hanya WBS
              </button>
              <button
                onClick={() => setViewMode('gantt')}
                className={`px-2.5 py-1 rounded-md transition ${
                  viewMode === 'gantt'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'hover:text-slate-900'
                }`}
              >
                Hanya Gantt
              </button>
            </div>

            {/* Set Baseline Button */}
            {(currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'SUPER_ADMIN') && (
              <button
                onClick={setBaseline}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                title="Kunci baseline jadwal komparatif (Set Baseline)"
              >
                <BookmarkCheck className="w-3.5 h-3.5 text-blue-600" />
                <span>Set Baseline</span>
              </button>
            )}

            {/* Batch Schedule Tool Button */}
            {(currentUser.role === 'PROJECT_MANAGER' ||
              currentUser.role === 'SUPER_ADMIN' ||
              currentUser.role === 'SITE_SUPERVISOR') && (
              <button
                onClick={() => setIsBatchScheduleOpen(true)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-indigo-300 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold shadow-2xs transition"
                title="Atur rencana tanggal mulai & selesai untuk semua breakdown WBS (Batch Tools)"
              >
                <CalendarRange className="w-3.5 h-3.5 text-indigo-600" />
                <span>Atur Rencana Jadwal</span>
              </button>
            )}

            {/* Add Task Button */}
            {(currentUser.role === 'PROJECT_MANAGER' ||
              currentUser.role === 'SUPER_ADMIN' ||
              currentUser.role === 'SITE_SUPERVISOR') && (
              <button
                onClick={() => handleOpenAddModal(null)}
                className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Tambah Rencana</span>
              </button>
            )}
          </div>
        </div>

        {/* Filter bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mt-4 pt-3 border-t border-slate-100 text-xs">
          <div className="relative lg:col-span-2">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari kode WBS, nama pekerjaan, atau alat..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <select
              value={filterSubcontractor}
              onChange={(e) => setFilterSubcontractor(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Pelaksana/Subkon</option>
              {subcontractors.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Semua Status</option>
              <option value="NOT_STARTED">Not Started</option>
              <option value="ON_PROGRESS">On Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="DELAYED">Delayed</option>
              <option value="ON_HOLD">On Hold</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setFilterCriticalOnly(!filterCriticalOnly)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition ${
                filterCriticalOnly
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Flame className="w-3 h-3" />
              <span>Jalur Kritis</span>
            </button>
            <button
              onClick={() => setFilterMilestoneOnly(!filterMilestoneOnly)}
              className={`px-2.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center space-x-1 transition ${
                filterMilestoneOnly
                  ? 'bg-purple-600 text-white border-purple-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <Diamond className="w-3 h-3" />
              <span>Milestones</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Table + Gantt Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-100/90 border-b border-slate-200 text-slate-600 font-semibold select-none">
                <th className="py-3 px-3 w-16">WBS</th>
                <th className="py-3 px-3 min-w-[280px]">Nama Pekerjaan</th>
                <th className="py-3 px-2 text-center w-14">Bobot</th>
                <th className="py-3 px-2 w-24">Durasi / Jadwal</th>
                <th className="py-3 px-2 text-center w-16">Rencana</th>
                <th className="py-3 px-2 text-center w-20">Realisasi</th>
                <th className="py-3 px-2 text-center w-16">Deviasi</th>
                <th className="py-3 px-2 w-24">Status</th>
                <th className="py-3 px-2 min-w-[130px]">Pelaksana / PIC</th>
                {viewMode !== 'table' && (
                  <th className="py-3 px-3 min-w-[340px] bg-slate-50 border-l border-slate-200">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-500">
                      <span>{project.startDate.slice(5)}</span>
                      <span className="font-semibold text-blue-600 flex items-center space-x-1">
                        <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                        <span>Hari Ini (20 Jul)</span>
                      </span>
                      <span>{project.finishDate.slice(5)}</span>
                    </div>
                  </th>
                )}
                <th className="py-3 px-2 text-right w-20">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredNodes.map((node) => {
                const hasChildren = wbsNodes.some((n) => n.parentId === node.id);
                const isCollapsed = collapsedNodes.has(node.id);
                const isLeaf = !hasChildren;
                const deviation = Number((node.progressActual - node.progressPlan).toFixed(1));
                const ganttPos = getGanttPosition(node.startPlan, node.finishPlan);

                return (
                  <tr
                    key={node.id}
                    className={`hover:bg-blue-50/40 transition-colors ${
                      node.isMilestone
                        ? 'bg-purple-50/40 font-semibold'
                        : node.isCritical && deviation < 0
                        ? 'bg-rose-50/30'
                        : node.level === 0
                        ? 'bg-slate-50/70 font-semibold text-slate-900'
                        : 'text-slate-700'
                    }`}
                  >
                    {/* WBS Code */}
                    <td className="py-2.5 px-3 font-mono font-bold text-blue-700">
                      {node.wbsCode}
                    </td>

                    {/* Work Name with Tree Indentation */}
                    <td className="py-2.5 px-3">
                      <div
                        className="flex items-center space-x-1.5"
                        style={{ paddingLeft: `${node.level * 16}px` }}
                      >
                        {hasChildren ? (
                          <button
                            onClick={() => toggleCollapse(node.id)}
                            className="p-0.5 rounded text-slate-400 hover:text-slate-800 hover:bg-slate-200/60"
                          >
                            {isCollapsed ? (
                              <ChevronRight className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        ) : node.isMilestone ? (
                          <Diamond className="w-3.5 h-3.5 text-purple-600 fill-purple-400 shrink-0" />
                        ) : (
                          <span className="w-4 inline-block text-slate-300">•</span>
                        )}

                        <span className="truncate max-w-sm" title={node.workName}>
                          {node.workName}
                        </span>

                        {/* SOW Reference Badge */}
                        {node.sowReference && (
                          <span
                            className="inline-flex items-center text-[9px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200 shrink-0"
                            title={`Lingkup SOW Lampiran: ${node.sowReference}`}
                          >
                            {node.sowReference}
                          </span>
                        )}

                        {/* Critical Path Badge */}
                        {node.isCritical && (
                          <span
                            className="inline-flex items-center text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-rose-100 text-rose-700 border border-rose-200"
                            title={`Jalur Kritis (CPM): Float ${node.floatDays || 0} hari. Keterlambatan task ini menunda tanggal serah terima.`}
                          >
                            <Flame className="w-2.5 h-2.5 mr-0.5 text-rose-600" />
                            CPM
                          </span>
                        )}

                        {/* Volume target badge */}
                        {node.volumePlan && (
                          <span className="text-[10px] text-slate-400 font-mono shrink-0">
                            ({node.volumeActual || 0}/{node.volumePlan} {node.volumeUnit})
                          </span>
                        )}

                        {/* Delay reason indicator */}
                        {node.delayReason && (
                          <span
                            className="inline-flex items-center text-[10px] font-medium px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200 max-w-[160px] truncate"
                            title={`Penyebab Keterlambatan: ${node.delayReason} (+${node.delayImpactDays} hari)`}
                          >
                            <AlertTriangle className="w-2.5 h-2.5 mr-1 text-amber-600 shrink-0" />
                            {node.delayReason}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Weight % */}
                    <td className="py-2.5 px-2 text-center font-mono font-medium text-slate-600">
                      {node.weight}%
                    </td>

                    {/* Duration & Dates */}
                    <td className="py-2.5 px-2 text-[11px]">
                      {currentUser.role === 'PROJECT_MANAGER' ||
                      currentUser.role === 'SUPER_ADMIN' ||
                      currentUser.role === 'SITE_SUPERVISOR' ? (
                        <button
                          type="button"
                          onClick={() => handleOpenEditSchedule(node)}
                          className="group text-left p-1 -m-1 rounded-md hover:bg-indigo-50/80 transition border border-transparent hover:border-indigo-200 block w-full cursor-pointer"
                          title="Klik untuk atur rencana tanggal mulai & selesai pekerjaan ini"
                        >
                          <div className="font-medium text-slate-800 flex items-center space-x-1 group-hover:text-indigo-900">
                            <span>{node.durationDays} hari</span>
                            <Calendar className="w-3 h-3 text-slate-400 group-hover:text-indigo-600 transition" />
                          </div>
                          <div className="text-[10px] text-slate-400 font-mono group-hover:text-indigo-700">
                            {node.startPlan.slice(5)} s/d {node.finishPlan.slice(5)}
                          </div>
                        </button>
                      ) : (
                        <div>
                          <div className="font-medium text-slate-800">{node.durationDays} hari</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {node.startPlan.slice(5)} s/d {node.finishPlan.slice(5)}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Plan % */}
                    <td className="py-2.5 px-2 text-center font-mono text-indigo-700 font-semibold">
                      {node.progressPlan}%
                    </td>

                    {/* Actual % */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-900">
                      <div className="flex flex-col items-center">
                        <span>{node.progressActual}%</span>
                        <div className="w-12 bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                          <div
                            className={`h-1 rounded-full ${
                              node.progressActual >= 100
                                ? 'bg-emerald-500'
                                : deviation < 0
                                ? 'bg-rose-500'
                                : 'bg-blue-600'
                            }`}
                            style={{ width: `${Math.min(100, node.progressActual)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Deviation */}
                    <td className="py-2.5 px-2 text-center font-mono text-xs">
                      <span
                        className={`font-semibold ${
                          deviation < 0
                            ? 'text-rose-600'
                            : deviation > 0
                            ? 'text-emerald-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {deviation > 0 ? `+${deviation}` : deviation}%
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-2.5 px-2">{getStatusBadge(node.status)}</td>

                    {/* Subcontractor / PIC */}
                    <td className="py-2.5 px-2 text-slate-600">
                      {node.subcontractorName ? (
                        <div>
                          <div className="font-semibold text-slate-800 truncate max-w-[130px]">
                            {node.subcontractorName}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            PIC: {node.picName || '-'}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Tim Internal</span>
                      )}
                    </td>

                    {/* Gantt Bar Chart Cell */}
                    {viewMode !== 'table' && (
                      <td className="py-2.5 px-3 bg-slate-50/50 border-l border-slate-200 relative">
                        <div className="h-7 w-full relative bg-slate-100/70 rounded-md flex items-center overflow-hidden">
                          {/* Today line indicator */}
                          <div
                            className="absolute top-0 bottom-0 w-px bg-blue-500/80 z-20"
                            style={{ left: `${todayPosition}%` }}
                          />

                          {/* Milestone Diamond Rendering */}
                          {node.isMilestone ? (
                            <div
                              className="absolute z-10 flex items-center justify-center -translate-x-1/2"
                              style={{ left: ganttPos.left }}
                              title={`Milestone: ${node.workName} (${node.finishPlan})`}
                            >
                              <div
                                className={`w-3.5 h-3.5 rotate-45 border shadow-xs transition-transform hover:scale-125 ${
                                  node.progressActual >= 100
                                    ? 'bg-emerald-500 border-emerald-600'
                                    : 'bg-purple-600 border-purple-700'
                                }`}
                              />
                            </div>
                          ) : (
                            /* Standard Gantt Bar */
                            <>
                              {/* Plan Bar (Top bar) */}
                              <div
                                className={`absolute h-2 rounded-sm top-1 shadow-2xs ${
                                  node.isCritical
                                    ? 'bg-rose-400/90 border border-rose-500'
                                    : 'bg-blue-400/80'
                                }`}
                                style={{ left: ganttPos.left, width: ganttPos.width }}
                                title={`Rencana: ${node.startPlan} s/d ${node.finishPlan}`}
                              />

                              {/* Actual Progress Bar (Bottom bar) */}
                              <div
                                className={`absolute h-2 rounded-sm bottom-1 shadow-2xs ${
                                  node.progressActual >= 100
                                    ? 'bg-emerald-500'
                                    : deviation < 0
                                    ? 'bg-rose-500'
                                    : 'bg-blue-600'
                                }`}
                                style={{
                                  left: ganttPos.left,
                                  width: `${(parseFloat(ganttPos.width) * node.progressActual) / 100}%`,
                                }}
                                title={`Realisasi: ${node.progressActual}% (Deviasi: ${deviation}%)`}
                              />
                            </>
                          )}
                        </div>
                      </td>
                    )}

                    {/* Actions */}
                    <td className="py-2.5 px-2 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        {(currentUser.role === 'PROJECT_MANAGER' ||
                          currentUser.role === 'SUPER_ADMIN' ||
                          currentUser.role === 'SITE_SUPERVISOR') && (
                          <button
                            type="button"
                            onClick={() => handleOpenEditSchedule(node)}
                            className="p-1 rounded text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 transition"
                            title="Atur Rencana Tanggal Mulai & Selesai"
                          >
                            <CalendarClock className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {isLeaf &&
                          (currentUser.role === 'SUBCONTRACTOR' ||
                            currentUser.role === 'SITE_SUPERVISOR' ||
                            currentUser.role === 'PROJECT_MANAGER') && (
                            <button
                              onClick={() => setActiveTab('progress_input')}
                              className="p-1 rounded text-blue-600 hover:bg-blue-50"
                              title="Input Progres Aktual"
                            >
                              <PenTool className="w-3.5 h-3.5" />
                            </button>
                          )}

                        {(currentUser.role === 'PROJECT_MANAGER' ||
                          currentUser.role === 'SUPER_ADMIN') && (
                          <>
                            <button
                              onClick={() => handleOpenAddModal(node.id)}
                              className="p-1 rounded text-slate-400 hover:text-blue-600 hover:bg-slate-100"
                              title="Tambah Sub-Task"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (
                                  confirm(
                                    `Hapus item WBS "${node.workName}" beserta seluruh sub-pekerjaannya?`
                                  )
                                ) {
                                  deleteWbsNode(node.id);
                                }
                              }}
                              className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                              title="Hapus Task"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Task Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {newTaskParentId ? 'Tambah Rencana Sub-Task' : 'Tambah Rencana Pekerjaan / Phase'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {newTaskParentId
                ? 'Sub-task akan otomatis diindeks nomor WBS dan berkontribusi pada roll-up bobot induknya.'
                : 'Pekerjaan level utama yang akan menampung sub-phase atau task.'}
            </p>

            <form onSubmit={handleSaveNewTask} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pekerjaan:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Pengukuran Poligon Cabang Segmen C"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Bobot (%) terhadap Induk:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={newTaskWeight}
                    onChange={(e) => setNewTaskWeight(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Sub-Kontraktor / Pelaksana:
                  </label>
                  <select
                    value={newTaskSubId}
                    onChange={(e) => setNewTaskSubId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">-- Tanpa Vendor (Internal) --</option>
                    {subcontractors.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Tanggal Mulai Rencana:
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewTaskStart(project.startDate)}
                      className="text-[10px] text-blue-600 hover:underline font-medium"
                    >
                      Mulai SPK
                    </button>
                  </div>
                  <input
                    type="date"
                    required
                    value={newTaskStart}
                    onChange={(e) => setNewTaskStart(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">
                      Tanggal Selesai Rencana:
                    </label>
                    <button
                      type="button"
                      onClick={() => setNewTaskFinish(project.finishDate)}
                      className="text-[10px] text-blue-600 hover:underline font-medium"
                    >
                      Selesai SPK
                    </button>
                  </div>
                  <input
                    type="date"
                    required
                    value={newTaskFinish}
                    onChange={(e) => setNewTaskFinish(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Calculated duration display */}
              {newTaskStart && newTaskFinish && (
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
                  <span className="text-slate-600">Durasi Rencana Terhitung:</span>
                  <span className="font-mono font-bold text-blue-700">
                    {Math.max(
                      1,
                      Math.round(
                        (new Date(newTaskFinish).getTime() - new Date(newTaskStart).getTime()) /
                          (1000 * 60 * 60 * 24)
                      )
                    )}{' '}
                    Hari Kalender
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Volume Rencana (Opsional):
                  </label>
                  <input
                    type="number"
                    placeholder="Contoh: 15"
                    value={newTaskVolume || ''}
                    onChange={(e) =>
                      setNewTaskVolume(e.target.value ? Number(e.target.value) : undefined)
                    }
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Satuan Volume:
                  </label>
                  <input
                    type="text"
                    placeholder="km, Ha, titik, buku"
                    value={newTaskUnit}
                    onChange={(e) => setNewTaskUnit(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold"
                >
                  Simpan Rencana
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit SPK Modal */}
      {isEditSpkOpen && (
        <EditSpkModal
          isOpen={isEditSpkOpen}
          targetProject={project}
          onClose={() => setIsEditSpkOpen(false)}
        />
      )}

      {/* Edit Individual WBS Schedule Modal */}
      {isEditScheduleOpen && editingScheduleNode && (
        <EditWbsScheduleModal
          isOpen={isEditScheduleOpen}
          node={editingScheduleNode}
          project={project}
          subcontractors={subcontractors}
          onClose={() => {
            setIsEditScheduleOpen(false);
            setEditingScheduleNode(null);
          }}
        />
      )}

      {/* Batch WBS Schedule Modal */}
      {isBatchScheduleOpen && (
        <BatchWbsScheduleModal
          isOpen={isBatchScheduleOpen}
          project={project}
          nodes={wbsNodes}
          onClose={() => setIsBatchScheduleOpen(false)}
        />
      )}
    </div>
  );
};
