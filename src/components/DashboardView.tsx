import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Area,
  ComposedChart,
} from 'recharts';
import {
  TrendingUp,
  TrendingDown,
  Clock,
  FileSpreadsheet,
  PenTool,
  BookmarkCheck,
  ChevronRight,
  MapPin,
  Diamond,
  Flame,
  AlertTriangle,
  AlertOctagon,
  CheckCircle2,
  Layers3,
  ArrowUpRight,
  Briefcase,
  Activity,
  Gauge,
  Search,
  Filter,
  Users,
  Compass,
  FileCheck,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIDR } from '../utils/wbsLogic';
import { TopographyDailyReportItem } from '../types';

export const DashboardView: React.FC = () => {
  const {
    project,
    projects,
    activeProjectId,
    switchProject,
    wbsNodes,
    scurveData,
    subcontractors,
    progressLogs,
    topographyDailyReports,
    terrestrialProductivityLogs,
    setActiveTab,
    setBaseline,
    currentUser,
  } = useApp();

  const deviation = Number((project.currentProgressActual - project.targetProgressPlan).toFixed(2));
  const isDelayed = deviation < 0;

  // Status counts for active project
  const completedCount = wbsNodes.filter((n) => n.status === 'COMPLETED').length;
  const inProgressCount = wbsNodes.filter((n) => n.status === 'ON_PROGRESS').length;
  const delayedCount = wbsNodes.filter((n) => n.status === 'DELAYED').length;
  const notStartedCount = wbsNodes.filter((n) => n.status === 'NOT_STARTED').length;

  // Milestones in this SPK
  const milestones = wbsNodes.filter((n) => n.isMilestone);

  // Search & Filter for 10 September Topography Report Grid
  const [reportSearch, setReportSearch] = useState('');
  const [reportFilter, setReportFilter] = useState<'ALL' | 'DONE' | 'ON_PROGRESS' | 'DELAYED'>('ALL');

  const filteredReports = useMemo(() => {
    return topographyDailyReports.filter((r) => {
      if (
        reportSearch &&
        !r.title.toLowerCase().includes(reportSearch.toLowerCase()) &&
        !r.wellName.toLowerCase().includes(reportSearch.toLowerCase()) &&
        !r.plannedActivityToday.toLowerCase().includes(reportSearch.toLowerCase())
      ) {
        return false;
      }
      if (reportFilter === 'DONE') {
        return r.cumProgress >= 100;
      }
      if (reportFilter === 'ON_PROGRESS') {
        return r.cumProgress < 100;
      }
      if (reportFilter === 'DELAYED') {
        return r.deviation < 0;
      }
      return true;
    });
  }, [topographyDailyReports, reportSearch, reportFilter]);

  // Overall Statistics from 10 September Report
  const totalReportsCount = topographyDailyReports.length;
  const doneReportsCount = topographyDailyReports.filter((r) => r.cumProgress >= 100).length;
  const onProgressCount = topographyDailyReports.filter((r) => r.cumProgress < 100).length;
  const delayedReportsCount = topographyDailyReports.filter((r) => r.deviation < 0).length;

  // Terrestrial Productivity Summary
  const avgProductivity = useMemo(() => {
    if (!terrestrialProductivityLogs || terrestrialProductivityLogs.length === 0) return 0.65;
    const sum = terrestrialProductivityLogs.reduce((acc, cur) => acc + cur.productivityHaPerTeam, 0);
    return Number((sum / terrestrialProductivityLogs.length).toFixed(2));
  }, [terrestrialProductivityLogs]);

  const totalHectaresToday = useMemo(() => {
    return terrestrialProductivityLogs
      .filter((l) => l.date === '2026-09-10')
      .reduce((acc, cur) => acc + cur.hectaresToday, 0);
  }, [terrestrialProductivityLogs]);

  const totalActiveTeams = useMemo(() => {
    return terrestrialProductivityLogs
      .filter((l) => l.date === '2026-09-10')
      .reduce((acc, cur) => acc + cur.teamsCount, 0);
  }, [terrestrialProductivityLogs]);

  const handleSelectReportLocation = (wellName: string) => {
    const matched = projects.find(
      (p) =>
        p.wellName?.toLowerCase().includes(wellName.toLowerCase()) ||
        p.name.toLowerCase().includes(wellName.toLowerCase())
    );
    if (matched) {
      switchProject(matched.id);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* 10 SPK Operational Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-blue-950 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
              Monitoring Operasional Simultan
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              Status Resmi: 10 September 2026
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1.5">
            Wilayah Kerja Pertamina EP Zona 4 (Prabumulih, Limau, Pendopo, Adera, Ramba)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Pekerjaan survey pemetaan terestris, pembuatan BM, drone LiDAR, fotogrametri, dan desain siteplan.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setActiveTab('progress_input')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
          >
            <PenTool className="w-4 h-4" />
            <span>Input Progres Lapangan</span>
          </button>

          <button
            onClick={() => setActiveTab('portfolio')}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center space-x-1.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>Daftar SPK</span>
          </button>
        </div>
      </div>

      {/* Project Banner & Quick Info */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-2">
            {/* SPK Selector */}
            <div className="flex items-center space-x-2 flex-wrap gap-y-2">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center">
                <Layers3 className="w-4 h-4 mr-1 text-blue-600" />
                SPK Terpilih:
              </span>
              <select
                value={activeProjectId}
                onChange={(e) => switchProject(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-300 bg-slate-50 font-bold text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code} • {p.name.slice(0, 48)}...
                  </option>
                ))}
              </select>

              <span
                className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold flex items-center ${
                  project.healthStatus === 'ON_TRACK' || project.healthStatus === 'COMPLETED'
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : project.healthStatus === 'CRITICAL'
                    ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                    : 'bg-amber-50 text-amber-700 border-amber-200'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5"></span>
                {project.healthStatus || 'ON_TRACK'}
              </span>

              <span className="text-xs text-slate-500 flex items-center">
                <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
                {project.location}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {project.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600">
              No. SPK: <span className="font-mono font-bold text-slate-800">{project.spkNumber}</span> • Nilai Kontrak:{' '}
              <span className="font-semibold text-slate-800">{formatIDR(project.contractValue)}</span> • Pelaksana:{' '}
              <span className="font-semibold text-slate-800">{project.subcontractor || 'KJSB'} (PIC: {project.picName})</span>
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-2.5 flex-wrap gap-y-2">
            {(currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'SUPER_ADMIN') && (
              <button
                onClick={setBaseline}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
                title="Kunci Snapshot Baseline Schedule"
              >
                <BookmarkCheck className="w-4 h-4 text-blue-600" />
                <span>Set Baseline</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('progress_input')}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <PenTool className="w-4 h-4" />
              <span>Input Progres Aktual</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Export Laporan</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards (Plan vs Actual, Deviation, Task Status) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Actual Progress */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Realisasi Aktual
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {project.currentProgressActual}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Roll-up WBS</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, project.currentProgressActual)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Planned Baseline */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Target Rencana (Plan)
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight font-mono">
                {project.targetProgressPlan}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Baseline v1.0</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-3 overflow-hidden">
              <div
                className="bg-indigo-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, project.targetProgressPlan)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Deviation (Deviasi Jadwal) */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Deviasi Jadwal
            </span>
            <div
              className={`p-2 rounded-xl ${
                isDelayed ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
              }`}
            >
              {isDelayed ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline space-x-2">
              <span
                className={`text-3xl font-extrabold tracking-tight font-mono ${
                  isDelayed ? 'text-rose-600' : 'text-emerald-600'
                }`}
              >
                {deviation > 0 ? `+${deviation}` : deviation}%
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 flex items-center">
              {isDelayed ? (
                <span className="text-rose-600 font-semibold flex items-center">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1" />
                  Keterlambatan SPK
                </span>
              ) : (
                <span className="text-emerald-600 font-semibold flex items-center">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                  Sesuai / Melampaui Jadwal
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Task Breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Pekerjaan WBS
            </span>
            <span className="text-xs font-bold text-slate-700">{wbsNodes.length} Item</span>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-emerald-50/70 border border-emerald-100">
              <span className="text-emerald-800 font-medium">Selesai</span>
              <span className="font-bold text-emerald-700 font-mono">{completedCount}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-blue-50/70 border border-blue-100">
              <span className="text-blue-800 font-medium">Berjalan</span>
              <span className="font-bold text-blue-700 font-mono">{inProgressCount}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-rose-50/70 border border-rose-100">
              <span className="text-rose-800 font-medium">Delayed</span>
              <span className="font-bold text-rose-700 font-mono">{delayedCount}</span>
            </div>
            <div className="flex items-center justify-between p-1.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-slate-600 font-medium">Belum</span>
              <span className="font-bold text-slate-700 font-mono">{notStartedCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PAPAN MONITORING PROGRES PEKERJAAN TOPOGRAFI LOKASI BOR */}
      {/* STATUS RESMI 10 SEPTEMBER 2026 (REKAPITULASI LAPORAN HARIAN) */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
                <FileCheck className="w-5 h-5" />
              </div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight">
                Progress Pekerjaan Topografi Lokasi Bor (Status Per 10 September 2026)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Rekapitulasi kemajuan pekerjaan survey topografi lokasi bor di Wilayah Kerja PT Pertamina EP Zona 4
            </p>
          </div>

          {/* Quick Filter Badges */}
          <div className="flex items-center space-x-2 text-xs flex-wrap gap-y-1">
            <button
              onClick={() => setReportFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                reportFilter === 'ALL'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Semua Lokasi ({totalReportsCount})
            </button>
            <button
              onClick={() => setReportFilter('DONE')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                reportFilter === 'DONE'
                  ? 'bg-emerald-600 text-white'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
              }`}
            >
              Selesai 100% ({doneReportsCount})
            </button>
            <button
              onClick={() => setReportFilter('ON_PROGRESS')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                reportFilter === 'ON_PROGRESS'
                  ? 'bg-blue-600 text-white'
                  : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
              }`}
            >
              Berjalan ({onProgressCount})
            </button>
            <button
              onClick={() => setReportFilter('DELAYED')}
              className={`px-3 py-1.5 rounded-xl font-bold transition ${
                reportFilter === 'DELAYED'
                  ? 'bg-rose-600 text-white'
                  : 'bg-rose-50 text-rose-800 border border-rose-200 hover:bg-rose-100'
              }`}
            >
              Deviasi Negatif ({delayedReportsCount})
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Cari lokasi bor (BKB-AR13, ABB-A7, GNK, BNG...)"
              value={reportSearch}
              onChange={(e) => setReportSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div className="text-[11px] text-slate-500 font-medium">
            Menampilkan <strong className="text-slate-800 font-mono">{filteredReports.length}</strong> dari{' '}
            <strong className="text-slate-800 font-mono">{totalReportsCount}</strong> lokasi pemboran
          </div>
        </div>

        {/* Table of Topography Locations Progress */}
        <div className="overflow-x-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold text-[11px]">
                <th className="py-2.5 px-3">No & Lokasi Bor</th>
                <th className="py-2.5 px-2">TMT / Periode</th>
                <th className="py-2.5 px-2 text-center">Hari / Mg</th>
                <th className="py-2.5 px-2 text-center">Cum. Plan</th>
                <th className="py-2.5 px-2 text-center">Daily</th>
                <th className="py-2.5 px-2 text-center">Cum. Realisasi</th>
                <th className="py-2.5 px-2 text-center">Deviasi</th>
                <th className="py-2.5 px-2 text-center">Status</th>
                <th className="py-2.5 px-3">Aktivitas Hari Ini & Kendala</th>
                <th className="py-2.5 px-2 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-normal">
              {filteredReports.map((item) => {
                const isItemDelayed = item.deviation < 0;
                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition group">
                    {/* Location Name & Well */}
                    <td className="py-2.5 px-3 font-semibold text-slate-900">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-mono text-slate-400">#{item.orderNumber}</span>
                        <strong className="text-slate-900 group-hover:text-blue-600 transition truncate max-w-[200px] sm:max-w-xs md:max-w-sm">
                          {item.wellName}
                        </strong>
                      </div>
                      <span className="text-[10px] text-slate-500 line-clamp-1">{item.title}</span>
                    </td>

                    {/* TMT Period */}
                    <td className="py-2.5 px-2 text-[11px] text-slate-600 whitespace-nowrap">
                      {item.tmtPeriod}
                    </td>

                    {/* Day / Week */}
                    <td className="py-2.5 px-2 text-center font-mono text-[11px] whitespace-nowrap">
                      H-{item.dayNumber} (W-{item.weekNumber})
                    </td>

                    {/* Cum Plan */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold text-slate-700">
                      {item.cumPlan.toFixed(1)}%
                    </td>

                    {/* Daily Progress */}
                    <td className="py-2.5 px-2 text-center font-mono font-medium text-blue-700">
                      {item.dailyProgress > 0 ? `+${item.dailyProgress}%` : '0%'}
                    </td>

                    {/* Cum Actual Progress */}
                    <td className="py-2.5 px-2 text-center font-mono font-black text-slate-900">
                      <span
                        className={`px-1.5 py-0.5 rounded ${
                          item.cumProgress >= 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.cumProgress >= 80
                            ? 'bg-blue-50 text-blue-800'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {item.cumProgress}%
                      </span>
                    </td>

                    {/* Deviation */}
                    <td className="py-2.5 px-2 text-center font-mono font-bold whitespace-nowrap">
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] ${
                          item.deviation === 0
                            ? 'bg-slate-100 text-slate-700'
                            : isItemDelayed
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {item.deviation > 0 ? `+${item.deviation}` : item.deviation}%
                      </span>
                    </td>

                    {/* Status Progress */}
                    <td className="py-2.5 px-2 text-center whitespace-nowrap">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          item.cumProgress >= 100
                            ? 'bg-emerald-100 text-emerald-800'
                            : isItemDelayed
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-blue-100 text-blue-800'
                        }`}
                      >
                        {item.cumProgress >= 100 ? 'Selesai 100%' : isItemDelayed ? 'Terlambat' : 'On Track'}
                      </span>
                    </td>

                    {/* Planned Activity Today & Constraints */}
                    <td className="py-2.5 px-3 max-w-[260px] md:max-w-md lg:max-w-lg xl:max-w-xl">
                      <div className="text-slate-800 font-medium truncate" title={item.plannedActivityToday}>
                        {item.plannedActivityToday}
                      </div>
                      {item.constraints && item.constraints !== '-' && (
                        <div className="text-[10px] text-rose-600 truncate flex items-center mt-0.5" title={item.constraints}>
                          <AlertTriangle className="w-3 h-3 mr-1 shrink-0" />
                          {item.constraints}
                        </div>
                      )}
                    </td>

                    {/* Action: Switch & Monitor */}
                    <td className="py-2.5 px-2 text-center">
                      <button
                        onClick={() => handleSelectReportLocation(item.wellName)}
                        className="px-2 py-1 rounded-lg bg-blue-50 hover:bg-blue-600 hover:text-white text-blue-700 font-semibold text-[10px] transition"
                        title="Buka SPK & Monitoring WBS"
                      >
                        Buka
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* S-CURVE (KURVA-S) MAIN SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Kurva-S Progres Proyek: {project.code}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Minggu ke-14
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Grafik kumulatif perbandingan rencana (baseline) dengan realisasi aktual hasil roll-up WBS
            </p>
          </div>

          <div className="flex items-center space-x-4 text-xs">
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-xs bg-indigo-500"></div>
              <span className="font-medium text-slate-700">Rencana (Plan Baseline)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <div className="w-3 h-3 rounded-xs bg-emerald-500"></div>
              <span className="font-medium text-slate-700">Realisasi (Actual)</span>
            </div>
          </div>
        </div>

        {/* Chart */}
        <div className="h-80 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={scurveData} margin={{ top: 10, right: 20, bottom: 10, left: -10 }}>
              <defs>
                <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="planGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
              <YAxis
                domain={[0, 100]}
                unit="%"
                tick={{ fontSize: 11, fill: '#64748b' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs space-y-1 border border-slate-700">
                        <p className="font-bold text-slate-200">
                          {data.weekLabel} ({label})
                        </p>
                        <p className="text-indigo-300">
                          Rencana (Plan): <span className="font-mono font-semibold">{data.progressPlanCumulative}%</span>
                        </p>
                        {data.progressActualCumulative !== null ? (
                          <>
                            <p className="text-emerald-400">
                              Realisasi (Actual):{' '}
                              <span className="font-mono font-semibold">{data.progressActualCumulative}%</span>
                            </p>
                            <p
                              className={
                                data.deviation >= 0 ? 'text-emerald-300 font-semibold' : 'text-rose-400 font-semibold'
                              }
                            >
                              Deviasi:{' '}
                              <span className="font-mono">
                                {data.deviation >= 0 ? `+${data.deviation}` : data.deviation}%
                              </span>
                            </p>
                          </>
                        ) : (
                          <p className="text-slate-400 italic">Belum ada data aktual</p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="progressPlanCumulative"
                stroke="#6366f1"
                strokeWidth={2}
                strokeDasharray="4 4"
                fillOpacity={1}
                fill="url(#planGradient)"
                name="Rencana (Plan)"
              />
              <Area
                type="monotone"
                dataKey="progressActualCumulative"
                stroke="#10b981"
                strokeWidth={3}
                fillOpacity={1}
                fill="url(#actualGradient)"
                name="Realisasi (Actual)"
                connectNulls={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2-Column: Terrestrial Productivity Monitoring & Subcontractor Performance */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* MONITORING PRODUKTIVITAS SURVEI TERESTRIS (HA/TIM/HARI) */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center space-x-2">
                <Gauge className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Monitoring Produktivitas Survei Terestris
                </h3>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Pencapaian output fisik per tim lapangan (Standar KPI: 0.60 Ha/Tim/Hari)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('progress_input')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>+ Input Baru</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-100">
              <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                Rata-rata Produktivitas
              </span>
              <div className="text-xl font-black font-mono text-emerald-700 mt-1">
                {avgProductivity}{' '}
                <span className="text-[10px] font-bold text-emerald-900">Ha/Tim/Hari</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-blue-50/70 border border-blue-100">
              <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                Output Hari Ini
              </span>
              <div className="text-xl font-black font-mono text-blue-700 mt-1">
                {totalHectaresToday.toFixed(1)}{' '}
                <span className="text-[10px] font-bold text-blue-900">Hectare</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
              <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Tim Bertugas
              </span>
              <div className="text-xl font-black font-mono text-slate-800 mt-1">
                {totalActiveTeams}{' '}
                <span className="text-[10px] font-bold text-slate-600">Tim Aktif</span>
              </div>
            </div>
          </div>

          {/* Productivity Records List */}
          <div className="space-y-2.5 max-h-[340px] overflow-y-auto pr-1">
            {terrestrialProductivityLogs.slice(0, 5).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-extrabold text-slate-900">{log.wellName}</span>
                    <span className="text-[10px] text-slate-500">({log.fieldArea})</span>
                  </div>
                  <span className="font-mono text-[10px] text-slate-400">{log.date}</span>
                </div>

                <div className="flex items-center justify-between text-[11px] pt-0.5">
                  <span className="text-slate-600">
                    Luas: <strong className="font-mono text-slate-800">{log.hectaresToday} Ha</strong> ({log.teamsCount} Tim)
                  </span>
                  <span
                    className={`font-mono font-extrabold px-2 py-0.5 rounded text-[11px] ${
                      log.productivityHaPerTeam >= 0.75
                        ? 'bg-emerald-100 text-emerald-800'
                        : log.productivityHaPerTeam >= 0.45
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {log.productivityHaPerTeam} Ha/Tim/Hari
                  </span>
                </div>

                {log.teamMembers && (
                  <div className="text-[10px] text-slate-500 truncate">
                    Personil: {log.teamMembers}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Subcontractor Performance & Audit Logs */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monitoring Progres Sub-Kontraktor
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Tingkat pencapaian vendor terhadap paket WBS SPK aktif
              </p>
            </div>
            <button
              onClick={() => setActiveTab('subcontractors')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>Semua Subkon</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3.5">
            {subcontractors.map((sub) => {
              const subTasks = wbsNodes.filter((n) => n.subcontractorId === sub.id);
              const totalSubWeight = subTasks.reduce((sum, n) => sum + (n.weight || 0), 0) || 1;
              const actualProgress =
                subTasks.length > 0
                  ? Number(
                      (
                        subTasks.reduce((sum, n) => sum + n.progressActual * (n.weight || 1), 0) /
                        totalSubWeight
                      ).toFixed(1)
                    )
                  : sub.averageProgress;

              return (
                <div
                  key={sub.id}
                  className="p-3.5 rounded-xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 transition"
                >
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 pr-2">
                      <h4 className="text-xs font-bold text-slate-900 truncate">
                        {sub.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 truncate">
                        {sub.specialty}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-slate-800 shrink-0">
                      {actualProgress}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-200 rounded-full h-2 mt-2.5 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-300 ${
                        actualProgress >= 80
                          ? 'bg-emerald-500'
                          : actualProgress >= 40
                          ? 'bg-blue-600'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${Math.min(100, actualProgress)}%` }}
                    />
                  </div>

                  <div className="flex items-center justify-between mt-2 text-[11px] text-slate-500">
                    <span>PIC: {sub.contactPerson.split(' ')[0]}</span>
                    <span>{subTasks.length} Paket WBS Terkait</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Audit trail preview */}
          <div className="pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-700">Histori Snapshot Lapangan Terbaru:</span>
              <button
                onClick={() => setActiveTab('progress_input')}
                className="text-[11px] text-blue-600 hover:underline font-semibold"
              >
                Lihat Semua
              </button>
            </div>
            <div className="space-y-2">
              {progressLogs.slice(0, 2).map((log) => (
                <div key={log.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex items-center justify-between font-semibold">
                    <span className="text-slate-800">
                      [{log.wbsCode}] {log.workName}
                    </span>
                    <span className="font-mono text-emerald-600 font-bold">{log.progressActual}%</span>
                  </div>
                  <p className="text-slate-500 text-[11px] italic truncate mt-0.5">"{log.notes}"</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
