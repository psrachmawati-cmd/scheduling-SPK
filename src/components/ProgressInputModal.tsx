import React, { useState, useMemo } from 'react';
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
  Users,
  Compass,
  MapPin,
  CheckCircle2,
  Calendar,
  Gauge,
  Activity,
  Layers3,
  Sliders,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Briefcase,
  ChevronRight,
  Check,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { WbsNode } from '../types';

export const ProgressInputModal: React.FC = () => {
  const {
    projects,
    activeProjectId,
    switchProject,
    project,
    allWbsNodes,
    wbsNodes,
    currentUser,
    submitProgress,
    progressLogs,
    terrestrialProductivityLogs,
    addTerrestrialProductivity,
    setActiveTab,
  } = useApp();

  // Filter tasks based on row-level security for Subcontractor
  const eligibleProjects = useApp().accessibleProjects;

  const currentProjectWbs = useApp().allWbsNodes.filter((n) => n.projectId === activeProjectId);

  // Filter leaf tasks
  const eligibleTasks = currentProjectWbs.filter((node) => {
    const isLeaf = !currentProjectWbs.some((other) => other.parentId === node.id);
    if (!isLeaf) return false;

    if (currentUser.subcontractorId) {
      return node.subcontractorId === currentUser.subcontractorId;
    }
    return true;
  });

  const [selectedWbsId, setSelectedWbsId] = useState<string>(() => {
    const terr = eligibleTasks.find(
      (t) =>
        t.wbsCode === '2.4' ||
        t.workName.toLowerCase().includes('terestris') ||
        t.workName.toLowerCase().includes('detail situasi')
    );
    if (terr) return terr.id;
    return eligibleTasks.length > 0 ? eligibleTasks[0].id : '';
  });

  const selectedNode = currentProjectWbs.find((n) => n.id === selectedWbsId);

  // Detect whether selected task is Pengukuran Detil / Survei Terestris (WBS 2.4)
  const isTerrestrialTask = useMemo(() => {
    if (!selectedNode) return false;
    const name = selectedNode.workName.toLowerCase();
    const code = selectedNode.wbsCode;
    return (
      code === '2.4' ||
      name.includes('terestris') ||
      name.includes('detail situasi') ||
      name.includes('survei terestris') ||
      name.includes('pengukuran detail') ||
      name.includes('detail topografi')
    );
  }, [selectedNode]);

  // General Progress Percentage State (for non-terrestrial stages)
  const [progressPercent, setProgressPercent] = useState<number>(() => selectedNode?.progressActual || 50);

  // Daily Progress percentage delta
  const [dailyProgressInput, setDailyProgressInput] = useState<number>(0);

  // Specialized Terrestrial Survey Input States
  const [hectaresToday, setHectaresToday] = useState<number>(1.25);
  const [teamCount, setTeamCount] = useState<number>(2);
  const [teamDescription, setTeamDescription] = useState<string>(
    'Tim 1 (Ian & Rahmat - TS Leica), Tim 2 (Dedi & Agus - GPS RTK)'
  );
  const [totalTargetHa, setTotalTargetHa] = useState<number>(4.5);
  const [prevHectares, setPrevHectares] = useState<number>(2.25);

  // Simple Notes (replaced Catatan Narasi Progres & Opname Lapangan)
  const [notes, setNotes] = useState<string>('');
  const [photoFileName, setPhotoFileName] = useState<string>('');

  // Productivity calculation for Terrestrial Survey: ha / tim / hari
  const productivityHaPerTeam = useMemo(() => {
    if (!teamCount || teamCount <= 0 || !hectaresToday) return 0;
    return Number((hectaresToday / teamCount).toFixed(2));
  }, [hectaresToday, teamCount]);

  // Cumulative hectare and derived percentage
  const cumHectares = Number((prevHectares + (hectaresToday || 0)).toFixed(2));
  const derivedTerrestrialPercent = useMemo(() => {
    if (!totalTargetHa || totalTargetHa <= 0) return 100;
    return Math.min(100, Number(((cumHectares / totalTargetHa) * 100).toFixed(1)));
  }, [cumHectares, totalTargetHa]);

  // Active progress value depending on task type
  const effectiveProgressActual = isTerrestrialTask ? derivedTerrestrialPercent : progressPercent;
  const currentPlan = selectedNode?.progressPlan || 100;
  const calculatedDeviation = Number((effectiveProgressActual - currentPlan).toFixed(2));

  // Sync when task changes
  const handleSelectTask = (id: string) => {
    setSelectedWbsId(id);
    const node = currentProjectWbs.find((n) => n.id === id);
    if (node) {
      setProgressPercent(node.progressActual);
      const isTerr =
        node.wbsCode === '2.4' ||
        node.workName.toLowerCase().includes('terestris') ||
        node.workName.toLowerCase().includes('detail situasi');
      if (isTerr) {
        const estTotalHa = node.volumePlan || 4.5;
        setTotalTargetHa(estTotalHa);
        const prev = Number(((node.progressActual / 100) * estTotalHa).toFixed(2));
        setPrevHectares(prev);
        setHectaresToday(Number(Math.max(0.2, (estTotalHa - prev) * 0.4).toFixed(2)));
      }
    }
  };

  const handleSelectProject = (projId: string) => {
    switchProject(projId);
    const pNodes = allWbsNodes.filter((n) => n.projectId === projId);
    const leaves = pNodes.filter((n) => !pNodes.some((o) => o.parentId === n.id));
    const firstTask =
      leaves.find(
        (t) =>
          t.workName.toLowerCase().includes('terestris') ||
          t.workName.toLowerCase().includes('detail')
      ) || leaves[0];
    if (firstTask) {
      handleSelectTask(firstTask.id);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNode) return;

    if (isTerrestrialTask) {
      // Terrestrial Survey Submission
      submitProgress({
        wbsId: selectedNode.id,
        progressActual: derivedTerrestrialPercent,
        volumeSubmitted: cumHectares,
        isTerrestrialSurvey: true,
        hectaresMeasuredToday: hectaresToday,
        teamCount,
        teamDescription,
        productivityHaPerTeam,
        totalAreaHaTarget: totalTargetHa,
        cumHectaresMeasured: cumHectares,
        stageName: 'Survey terestris',
        notes:
          notes.trim() ||
          `Pengukuran detil / survei terestris: ${hectaresToday} Ha terukur hari ini (${teamCount} tim, Produktivitas: ${productivityHaPerTeam} Ha/tim/hari). Kumulatif: ${cumHectares} Ha dari ${totalTargetHa} Ha (${derivedTerrestrialPercent}%).`,
      });
    } else {
      // Non-terrestrial stage: Direct percentage progress submission
      submitProgress({
        wbsId: selectedNode.id,
        progressActual: Number(progressPercent),
        notes:
          notes.trim() ||
          `Realisasi progres ${selectedNode.workName} dimutakhirkan menjadi ${progressPercent}%.`,
        stageName: selectedNode.workName,
      });
    }

    setNotes('');
    setPhotoFileName('');
  };

  // Productivity evaluation badge helper
  const getProductivityBadge = (rate: number) => {
    if (rate >= 0.75) {
      return {
        label: 'Produktivitas Tinggi (Melampaui Target)',
        color: 'bg-emerald-50 text-emerald-800 border-emerald-300',
        dot: 'bg-emerald-500',
      };
    }
    if (rate >= 0.45) {
      return {
        label: 'Produktivitas Standar / Optimal',
        color: 'bg-blue-50 text-blue-800 border-blue-300',
        dot: 'bg-blue-500',
      };
    }
    return {
      label: 'Di Bawah Standar (Terkendala Lapangan)',
      color: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
    };
  };

  const prodBadge = getProductivityBadge(productivityHaPerTeam);

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                <PenTool className="w-5 h-5" />
              </div>
              <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                Input Progres Lapangan & Monitoring Produktivitas
              </h1>
            </div>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Sistem input realisasi progres pekerjaan: Tahapan <strong>Survei Terestris / Pengukuran Detil</strong> dilengkapi input luas hektar per hari & jumlah tim (monitoring produktivitas ha/tim/hari), sedangkan tahapan lain disajikan dalam bentuk <strong>persentase realisasi progres (%)</strong>.
            </p>
          </div>

          <div className="flex items-center space-x-3 flex-wrap">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 flex items-center">
              <Calendar className="w-3.5 h-3.5 mr-1.5 text-slate-500" />
              Status: 10 September 2026
            </span>
            {currentUser.subcontractorName && (
              <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                {currentUser.subcontractorName}
              </span>
            )}
          </div>
        </div>

        {/* Project Selector Strip */}
        <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-slate-700 flex items-center shrink-0">
              <Layers3 className="w-4 h-4 mr-1.5 text-blue-600" />
              Pilih Lokasi Bor / SPK:
            </span>
            <select
              value={activeProjectId}
              onChange={(e) => handleSelectProject(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 bg-slate-50 font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              {eligibleProjects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code} — {p.name} ({p.currentProgressActual}%)
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3 font-medium text-slate-600">
            <span>
              Target Plan: <strong className="font-mono text-indigo-700">{project.targetProgressPlan}%</strong>
            </span>
            <span>•</span>
            <span>
              Realisasi Saat Ini:{' '}
              <strong className="font-mono text-emerald-700">{project.currentProgressActual}%</strong>
            </span>
            <span>•</span>
            <span>
              Deviasi:{' '}
              <strong
                className={`font-mono ${
                  project.currentProgressActual - project.targetProgressPlan >= 0
                    ? 'text-emerald-700'
                    : 'text-rose-600'
                }`}
              >
                {(project.currentProgressActual - project.targetProgressPlan).toFixed(2)}%
              </strong>
            </span>
          </div>
        </div>
      </div>

      {/* Main Input Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              {/* WBS Task Selector */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-slate-800 flex items-center">
                    <Compass className="w-4 h-4 mr-1.5 text-blue-600" />
                    Pilih Tahapan / Item Pekerjaan WBS:
                  </label>
                  {isTerrestrialTask ? (
                    <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold text-[10px] uppercase tracking-wider flex items-center">
                      <Activity className="w-3 h-3 mr-1 text-amber-600" />
                      Mode Pengukuran Detil (Ha / Tim)
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-800 border border-blue-200 font-semibold text-[10px]">
                      Mode Persentase Realisasi (%)
                    </span>
                  )}
                </div>
                <select
                  value={selectedWbsId}
                  onChange={(e) => handleSelectTask(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
                >
                  {eligibleTasks.map((t) => (
                    <option key={t.id} value={t.id}>
                      [{t.wbsCode}] {t.workName} (Aktual: {t.progressActual}%)
                    </option>
                  ))}
                </select>
              </div>

              {/* REPORT PROGRESS METRIC CARDS (Persentase Progress Laporan) */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-700 flex items-center text-xs">
                    <FileText className="w-3.5 h-3.5 mr-1.5 text-blue-600" />
                    Persentase Progress Pekerjaan:
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    {selectedNode?.workName || project.name}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center font-mono">
                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Cum. Plan</span>
                    <span className="text-base font-extrabold text-indigo-700 mt-0.5 block">
                      {currentPlan.toFixed(2)}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Daily Progress</span>
                    <span className="text-base font-extrabold text-blue-700 mt-0.5 block">
                      {isTerrestrialTask
                        ? `${(hectaresToday && totalTargetHa ? ((hectaresToday / totalTargetHa) * 100).toFixed(1) : 0)}%`
                        : `${dailyProgressInput}%`}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Cum. Progress</span>
                    <span className="text-base font-extrabold text-emerald-700 mt-0.5 block">
                      {effectiveProgressActual}%
                    </span>
                  </div>

                  <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-2xs">
                    <span className="text-[10px] font-bold text-slate-500 block uppercase">Deviasi</span>
                    <span
                      className={`text-base font-extrabold mt-0.5 block ${
                        calculatedDeviation >= 0 ? 'text-emerald-700' : 'text-rose-600'
                      }`}
                    >
                      {calculatedDeviation > 0 ? `+${calculatedDeviation}` : calculatedDeviation}%
                    </span>
                  </div>
                </div>
              </div>

              {/* CASE A: PENGUKURAN DETIL / SURVEI TERESTRIS (Input Ha/Hari, Jumlah Tim & Produktivitas) */}
              {isTerrestrialTask ? (
                <div className="space-y-4 p-5 rounded-2xl bg-amber-50/40 border-2 border-amber-300/80">
                  <div className="flex items-center justify-between pb-3 border-b border-amber-200/80">
                    <div className="flex items-center space-x-2">
                      <Gauge className="w-4 h-4 text-amber-700" />
                      <h3 className="font-bold text-sm text-slate-900">
                        Input Pengukuran Detil / Survei Terestris
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded">
                      SOW Terestris (Grid 5x5m & Poligon)
                    </span>
                  </div>

                  {/* Primary Terrestrial Inputs: Hectare & Team Count */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Total Hectare Measured Today */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Total Hectare Terukur Per Hari:
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          max="50"
                          step="0.05"
                          value={hectaresToday}
                          onChange={(e) => setHectaresToday(Math.max(0, Number(e.target.value)))}
                          className="w-full pl-3 pr-16 py-2 rounded-xl border border-slate-300 bg-white font-mono font-extrabold text-base text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
                          placeholder="Contoh: 1.25"
                        />
                        <span className="absolute right-3 top-2.5 font-bold text-slate-500 text-xs">
                          Ha/hari
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Total luasan tapak bor / rute yang berhasil diukur hari ini
                      </span>
                    </div>

                    {/* Number of Teams */}
                    <div>
                      <label className="block font-bold text-slate-800 mb-1">
                        Jumlah Tim dalam Report:
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          min="1"
                          max="10"
                          step="1"
                          value={teamCount}
                          onChange={(e) => setTeamCount(Math.max(1, Number(e.target.value)))}
                          className="w-full pl-3 pr-12 py-2 rounded-xl border border-slate-300 bg-white font-mono font-extrabold text-base text-slate-900 focus:ring-2 focus:ring-amber-500 focus:outline-none shadow-2xs"
                          placeholder="Contoh: 2"
                        />
                        <span className="absolute right-3 top-2.5 font-bold text-slate-500 text-xs">
                          Tim
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Keterangan berapa tim surveyor yang beroperasi
                      </span>
                    </div>
                  </div>

                  {/* Team Description / Personnel Roster */}
                  <div>
                    <label className="block font-bold text-slate-800 mb-1">
                      Keterangan Tim & Personil dalam Report:
                    </label>
                    <input
                      type="text"
                      value={teamDescription}
                      onChange={(e) => setTeamDescription(e.target.value)}
                      placeholder="Contoh: Tim 1: Ian & Rahmat (TS Leica), Tim 2: Dedi & Agus (GPS RTK)"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white font-medium text-slate-800 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    />
                  </div>

                  {/* Scope target & Cumulative hectare */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Total Luas Rencana SPK (Ha):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.5"
                          value={totalTargetHa}
                          onChange={(e) => setTotalTargetHa(Math.max(0.5, Number(e.target.value)))}
                          className="w-full pl-3 pr-10 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-xs"
                        />
                        <span className="absolute right-3 top-2 text-slate-400 font-bold">Ha</span>
                      </div>
                    </div>

                    <div>
                      <label className="block font-semibold text-slate-700 mb-1">
                        Luas Kumulatif Sebelumnya (Ha):
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.05"
                          min="0"
                          value={prevHectares}
                          onChange={(e) => setPrevHectares(Math.max(0, Number(e.target.value)))}
                          className="w-full pl-3 pr-10 py-1.5 rounded-lg border border-slate-300 bg-white font-mono font-bold text-xs"
                        />
                        <span className="absolute right-3 top-2 text-slate-400 font-bold">Ha</span>
                      </div>
                    </div>
                  </div>

                  {/* LIVE MONITORING PRODUKTIVITAS CARD */}
                  <div className="p-4 rounded-xl bg-white border border-amber-200 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center">
                        <Activity className="w-4 h-4 mr-1 text-emerald-600" />
                        Monitoring Produktivitas Harian
                      </span>
                      <span
                        className={`text-[11px] font-bold px-2 py-0.5 rounded-full border flex items-center ${prodBadge.color}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${prodBadge.dot}`}></span>
                        {prodBadge.label}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                      <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider">
                          Produktivitas Tim
                        </span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-2xl font-black font-mono text-emerald-700">
                            {productivityHaPerTeam}
                          </span>
                          <span className="text-[11px] font-bold text-emerald-900">Ha / Tim / Hari</span>
                        </div>
                        <span className="text-[10px] text-emerald-700">
                          ({hectaresToday} Ha ÷ {teamCount} Tim)
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-blue-50/70 border border-blue-100">
                        <span className="text-[10px] font-bold text-blue-800 uppercase tracking-wider">
                          Akumulasi Terukur
                        </span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-2xl font-black font-mono text-blue-700">
                            {cumHectares}
                          </span>
                          <span className="text-[11px] font-bold text-blue-900">/ {totalTargetHa} Ha</span>
                        </div>
                        <span className="text-[10px] text-blue-700">
                          Sisa: {Math.max(0, Number((totalTargetHa - cumHectares).toFixed(2)))} Ha
                        </span>
                      </div>

                      <div className="p-3 rounded-lg bg-purple-50/70 border border-purple-100">
                        <span className="text-[10px] font-bold text-purple-800 uppercase tracking-wider">
                          Realisasi Fisik WBS
                        </span>
                        <div className="flex items-baseline space-x-1 mt-1">
                          <span className="text-2xl font-black font-mono text-purple-700">
                            {derivedTerrestrialPercent}%
                          </span>
                          <span className="text-[10px] font-bold text-purple-900">Roll-up</span>
                        </div>
                        <span className="text-[10px] text-purple-700">
                          Otomatis tersimpan ke bobot WBS
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* CASE B: TAHAPAN LAIN (Persentase Realisasi Progres 0 - 100%) */
                <div className="space-y-4 p-5 rounded-2xl bg-blue-50/40 border border-blue-200">
                  <div className="flex items-center justify-between pb-2 border-b border-blue-200">
                    <div className="flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-blue-600" />
                      <h3 className="font-bold text-sm text-slate-900">
                        Persentase Realisasi Progress Tahapan
                      </h3>
                    </div>
                    <span className="text-[11px] font-medium text-blue-700">
                      Sesuai Standar Laporan Kemajuan Proyek
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="font-bold text-slate-800 text-xs">
                        Realisasi Progres Pekerjaan:
                      </label>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-2xl font-black font-mono text-blue-600">
                          {progressPercent}%
                        </span>
                        <span className="text-[11px] text-slate-500">
                          (Baseline Plan: {selectedNode?.progressPlan}%)
                        </span>
                      </div>
                    </div>

                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="1"
                      value={progressPercent}
                      onChange={(e) => setProgressPercent(Number(e.target.value))}
                      className="w-full accent-blue-600 cursor-pointer h-2.5 bg-slate-200 rounded-lg"
                    />

                    <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                      <span>0%</span>
                      <span>25%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>

                    {/* Quick percentage selector chips */}
                    <div className="flex items-center space-x-2 pt-1 flex-wrap gap-y-1.5">
                      <span className="text-[11px] font-semibold text-slate-500 mr-1">Preset:</span>
                      {[0, 10, 25, 50, 60, 75, 85, 90, 100].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setProgressPercent(val)}
                          className={`px-2 py-1 rounded-lg border text-[11px] font-mono font-bold transition ${
                            progressPercent === val
                              ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {val}%
                        </button>
                      ))}
                    </div>

                    <div className="pt-2 flex items-center space-x-3">
                      <label className="font-semibold text-slate-700 text-xs shrink-0">
                        Input Nilai Manual (%):
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.5"
                        value={progressPercent}
                        onChange={(e) => setProgressPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                        className="w-24 px-3 py-1 rounded-lg border border-slate-300 font-mono font-bold text-center"
                      />
                      <span className="text-xs text-slate-500 font-medium">
                        Daily Progress:
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        step="0.1"
                        value={dailyProgressInput}
                        onChange={(e) => setDailyProgressInput(Math.max(0, Number(e.target.value)))}
                        className="w-20 px-2 py-1 rounded-lg border border-slate-300 font-mono font-bold text-center"
                        placeholder="0%"
                      />
                      <span className="text-xs text-slate-400">%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Field Notes (User instruction: ganti "Catatan Narasi Progres & Opname Lapangan:" dengan "Catatan") */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Catatan:
                </label>
                <textarea
                  rows={2}
                  placeholder="Tuliskan catatan teknis progres pekerjaan atau catatan opname lapangan..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:outline-none text-xs"
                />
              </div>

              {/* Photo / Document Upload */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Lampiran Bukti Opname Fisik / Foto / Berkas:
                </label>
                <div className="border border-dashed border-slate-300 rounded-xl p-3 text-center hover:bg-slate-50 transition cursor-pointer">
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
                      {photoFileName ? `File terpilih: ${photoFileName}` : 'Klik untuk upload bukti opname lapangan'}
                    </span>
                    <span className="text-[10px] text-slate-400">JPG, PNG, PDF (Maks. 10MB)</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="submit"
                  className="flex items-center space-x-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition"
                >
                  <TrendingUp className="w-4 h-4" />
                  <span>Simpan Snapshot & Hitung Roll-Up WBS</span>
                </button>
              </div>
            </form>
          </div>

          {/* DAFTAR PROGRESS PEKERJAAN SPK AKTIF (Report Progress Versi Sebelumnya) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Layers className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Daftar Progres Pekerjaan: {project.code}
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">
                {currentProjectWbs.length} Item WBS
              </span>
            </div>

            <div className="overflow-x-auto max-h-[320px] overflow-y-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 sticky top-0 z-10 text-[11px]">
                    <th className="py-2 px-2">WBS</th>
                    <th className="py-2 px-3">Uraian Pekerjaan</th>
                    <th className="py-2 px-2 text-center">Bobot</th>
                    <th className="py-2 px-2 text-center">Rencana</th>
                    <th className="py-2 px-2 text-center">Realisasi</th>
                    <th className="py-2 px-2 text-center">Status</th>
                    <th className="py-2 px-2 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {currentProjectWbs.map((node) => {
                    const isSelected = node.id === selectedWbsId;
                    const isLeaf = !currentProjectWbs.some((other) => other.parentId === node.id);
                    return (
                      <tr
                        key={node.id}
                        className={`transition ${
                          isSelected ? 'bg-blue-50/70 font-semibold' : 'hover:bg-slate-50/60'
                        }`}
                      >
                        <td className="py-2 px-2 font-mono text-[11px] text-slate-500">
                          {node.wbsCode}
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`${
                              node.parentId ? 'pl-2 text-slate-800' : 'font-bold text-slate-900'
                            }`}
                          >
                            {node.workName}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600">
                          {node.weight}%
                        </td>
                        <td className="py-2 px-2 text-center font-mono text-slate-600">
                          {node.progressPlan}%
                        </td>
                        <td className="py-2 px-2 text-center font-mono font-bold">
                          <span
                            className={
                              node.progressActual >= 100
                                ? 'text-emerald-700'
                                : node.progressActual > 0
                                ? 'text-blue-700'
                                : 'text-slate-400'
                            }
                          >
                            {node.progressActual}%
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${
                              node.progressActual >= 100
                                ? 'bg-emerald-100 text-emerald-800'
                                : node.progressActual > 0
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {node.progressActual >= 100 ? 'Selesai' : node.progressActual > 0 ? 'Berjalan' : 'Belum'}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-center">
                          {isLeaf && (
                            <button
                              type="button"
                              onClick={() => handleSelectTask(node.id)}
                              className={`px-2 py-0.5 rounded text-[10px] font-bold transition ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700'
                              }`}
                            >
                              {isSelected ? 'Dipilih' : 'Pilih'}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Column: Live Productivity Monitoring & Audit Trail */}
        <div className="lg:col-span-5 space-y-5">
          {/* PRODUCTIVITY MONITORING PANEL (Ha/Tim/Hari) */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-emerald-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Monitoring Produktivitas Survei Terestris
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                ha/tim/hari
              </span>
            </div>

            {/* KPI Summary Strip */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Rata-rata Produktivitas
                </span>
                <div className="text-xl font-black font-mono text-emerald-600 mt-0.5">
                  {(
                    terrestrialProductivityLogs.reduce((sum, r) => sum + r.productivityHaPerTeam, 0) /
                    Math.max(1, terrestrialProductivityLogs.length)
                  ).toFixed(2)}{' '}
                  <span className="text-xs font-bold text-slate-500">Ha/Tim/Hari</span>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  Standar Target Migas
                </span>
                <div className="text-xl font-black font-mono text-blue-600 mt-0.5">
                  0.60{' '}
                  <span className="text-xs font-bold text-slate-500">Ha/Tim/Hari</span>
                </div>
              </div>
            </div>

            {/* Recent Terrestrial Survey Logs */}
            <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
              {terrestrialProductivityLogs.map((log) => (
                <div
                  key={log.id}
                  className="p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-extrabold text-slate-900">
                      {log.wellName} — {log.fieldArea}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">{log.date}</span>
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-0.5">
                    <span className="text-slate-600">
                      Luas: <strong className="font-mono text-slate-800">{log.hectaresToday} Ha</strong> ({log.teamsCount} Tim)
                    </span>
                    <span className="font-mono font-extrabold px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800">
                      {log.productivityHaPerTeam} Ha/Tim/Hari
                    </span>
                  </div>

                  {log.teamMembers && (
                    <div className="text-[10px] text-slate-500 truncate">
                      Personil: {log.teamMembers}
                    </div>
                  )}

                  {log.notes && (
                    <p className="text-[11px] text-slate-600 italic line-clamp-2">
                      "{log.notes}"
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* General Progress Log & Audit Trail */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <div className="flex items-center space-x-2">
                <History className="w-4 h-4 text-slate-600" />
                <h3 className="text-sm font-bold text-slate-900">
                  Log Histori Snapshot ({progressLogs.length})
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">Tersimpan per Snapshot</span>
            </div>

            <div className="space-y-2.5 max-h-[320px] overflow-y-auto pr-1">
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
                    <div className="flex items-center space-x-2">
                      {log.isTerrestrialSurvey && log.productivityHaPerTeam && (
                        <span className="font-mono text-[10px] font-bold text-amber-800 bg-amber-100 px-1.5 py-0.5 rounded">
                          {log.productivityHaPerTeam} Ha/Tim
                        </span>
                      )}
                      <span className="font-mono font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                        Aktual: {log.progressActual}%
                      </span>
                    </div>
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
