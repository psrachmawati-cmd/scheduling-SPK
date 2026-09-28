import React from 'react';
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
  CheckCircle2,
  Layers3,
  ArrowUpRight,
  Briefcase,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatIDR } from '../utils/wbsLogic';

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
    setActiveTab,
    setBaseline,
    currentUser,
  } = useApp();

  const deviation = Number((project.currentProgressActual - project.targetProgressPlan).toFixed(2));
  const isDelayed = deviation < 0;

  // Status counts
  const completedCount = wbsNodes.filter((n) => n.status === 'COMPLETED').length;
  const inProgressCount = wbsNodes.filter((n) => n.status === 'ON_PROGRESS').length;
  const delayedCount = wbsNodes.filter((n) => n.status === 'DELAYED').length;
  const notStartedCount = wbsNodes.filter((n) => n.status === 'NOT_STARTED').length;

  // Milestones in this SPK
  const milestones = wbsNodes.filter((n) => n.isMilestone);
  const criticalTasks = wbsNodes.filter((n) => n.isCritical);

  return (
    <div className="space-y-6 pb-12">
      {/* 10 SPK Operational Context Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-400/30 uppercase tracking-wider">
              Monitoring Operasional Simultan
            </span>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              {projects.length} Paket SPK
            </span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1.5">
            Wilayah Kerja Pertamina EP Zona 4 (Prabumulih, Limau, Pendopo, Adera, Ramba)
          </h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Pekerjaan survey pemetaan terestris, drone LiDAR, fotogrametri, dan pelaporan berkala.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={() => setActiveTab('portfolio')}
            className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-xs transition flex items-center space-x-1.5"
          >
            <Briefcase className="w-4 h-4" />
            <span>Buka Monitoring SPK</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
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
                  project.healthStatus === 'ON_TRACK'
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

            {(currentUser.role === 'SUBCONTRACTOR' ||
              currentUser.role === 'SITE_SUPERVISOR' ||
              currentUser.role === 'PROJECT_MANAGER') && (
              <button
                onClick={() => setActiveTab('progress_input')}
                className="flex items-center space-x-2 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <PenTool className="w-4 h-4" />
                <span>Input Progres Aktual</span>
              </button>
            )}

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

      {/* Milestones Tracking M1 - M5 */}
      {milestones.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-2">
              <Diamond className="w-4 h-4 text-purple-600 fill-purple-200" />
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Monitoring Milestones Kontrak (M1 s.d. M5)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('wbs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>Detail WBS</span>
              <ChevronRight className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {milestones.map((m) => {
              const isDone = m.progressActual >= 100;
              return (
                <div
                  key={m.id}
                  className={`p-3 rounded-xl border transition ${
                    isDone
                      ? 'bg-emerald-50/60 border-emerald-200'
                      : m.status === 'DELAYED'
                      ? 'bg-rose-50/60 border-rose-200'
                      : 'bg-purple-50/40 border-purple-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-white text-purple-800 border border-purple-200">
                      {m.wbsCode}
                    </span>
                    {isDone ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    ) : (
                      <span className="text-[10px] font-mono font-bold text-purple-700">
                        {m.progressActual}%
                      </span>
                    )}
                  </div>
                  <h4 className="text-xs font-bold text-slate-900 mt-2 line-clamp-2 leading-tight">
                    {m.workName}
                  </h4>
                  <div className="text-[10px] text-slate-500 mt-1 font-mono">
                    Target: {m.finishPlan}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* S-CURVE (KURVA-S) MAIN SECTION */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Kurva-S Progres Proyek: {project.code}
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                Minggu ke-7
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

      {/* 2-Column: Subcontractor Performance & Recent Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Subcontractor Performance */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Monitoring Progres Sub-Kontraktor
              </h3>
              <p className="text-xs text-slate-500">
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
        </div>

        {/* Audit Log / Histori Progres Terbaru */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Histori Snapshot & Log Lapangan
              </h3>
              <p className="text-xs text-slate-500">
                Audit trail pembaruan realisasi (Spec 5.3 & 8)
              </p>
            </div>
            <button
              onClick={() => setActiveTab('wbs')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center"
            >
              <span>Lihat WBS</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>

          <div className="space-y-3">
            {progressLogs.slice(0, 4).map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-xl border border-slate-100 bg-white hover:bg-slate-50/70 transition space-y-1"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-900 flex items-center">
                    <span className="font-mono text-blue-600 mr-1.5">{log.wbsCode}</span>
                    <span className="truncate max-w-[200px]">{log.workName}</span>
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {log.snapshotDate}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-2">
                  "{log.notes}"
                </p>

                <div className="flex items-center justify-between pt-1 text-[11px] text-slate-500">
                  <span>
                    Oleh: <strong className="text-slate-700">{log.userName}</strong> ({log.userRole})
                  </span>
                  <span className="font-mono font-semibold text-emerald-600">
                    Progres: {log.progressActual}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
