import React, { useState } from 'react';
import {
  Layers,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  Calendar,
  FileText,
  UserCheck,
  TrendingUp,
  TrendingDown,
  GitGraph,
  ShieldCheck,
  Eye,
  Plus,
  Edit3,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { Project } from '../types';
import { formatIDR } from '../utils/wbsLogic';
import { AddSpkModal } from './AddSpkModal';
import { EditSpkModal } from './EditSpkModal';

export const SpkPortfolioView: React.FC = () => {
  const {
    projects,
    accessibleProjects,
    isUserAllowedProject,
    currentUser,
    activeProjectId,
    switchProject,
    setActiveTab,
  } = useApp();

  const isSubcontractorActor = !!currentUser.subcontractorId;
  const canManageMasterSpk =
    currentUser.role === 'SUPER_ADMIN' ||
    currentUser.actorType === 'SUPER_ADMIN' ||
    currentUser.actorType === 'KOORDINATOR_ADMINISTRASI' ||
    currentUser.role === 'PROJECT_MANAGER';

  const [searchTerm, setSearchTerm] = useState('');
  const [fieldFilter, setFieldFilter] = useState('');
  const [subFilter, setSubFilter] = useState(() => {
    if (currentUser.subcontractorId === 'sub-01') return 'SUBKHI';
    if (currentUser.subcontractorId === 'sub-02') return 'SYAHRIAL';
    return '';
  });
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editTargetProject, setEditTargetProject] = useState<Project | null>(null);
  const [showManualGuide, setShowManualGuide] = useState(false);

  // Statistics across all SPKs or filtered for actor
  const statsBaseProjects = isSubcontractorActor ? accessibleProjects : projects;
  const totalSPKs = statsBaseProjects.length;
  const activeSPKs = statsBaseProjects.filter((p) => p.status === 'ACTIVE').length;
  const totalContractValue = statsBaseProjects.reduce((sum, p) => sum + (p.contractValue || 0), 0);

  const avgPlan = Number(
    (statsBaseProjects.reduce((sum, p) => sum + p.targetProgressPlan, 0) / (totalSPKs || 1)).toFixed(1)
  );
  const avgActual = Number(
    (statsBaseProjects.reduce((sum, p) => sum + p.currentProgressActual, 0) / (totalSPKs || 1)).toFixed(1)
  );
  const avgDeviation = Number((avgActual - avgPlan).toFixed(1));

  const delayedCount = statsBaseProjects.filter(
    (p) => p.healthStatus === 'DELAYED' || p.healthStatus === 'CRITICAL'
  ).length;
  const onTrackCount = statsBaseProjects.filter((p) => p.healthStatus === 'ON_TRACK').length;
  const completedCount = statsBaseProjects.filter((p) => p.status === 'COMPLETED' || p.healthStatus === 'COMPLETED').length;

  const baseProjectsList = isSubcontractorActor ? accessibleProjects : projects;
  const filteredProjects = baseProjectsList.filter((p) => {
    if (
      searchTerm &&
      !p.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.code.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.spkNumber.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !p.location.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    if (fieldFilter && p.fieldArea !== fieldFilter) return false;
    if (subFilter && !p.subcontractor?.toLowerCase().includes(subFilter.toLowerCase())) return false;
    if (statusFilter && p.healthStatus !== statusFilter) return false;
    return true;
  });

  const getHealthBadge = (health?: string) => {
    switch (health) {
      case 'ON_TRACK':
        return (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
            On Track
          </span>
        );
      case 'DELAYED':
        return (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <AlertTriangle className="w-3 h-3 mr-1 text-amber-500" />
            Terlambat
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertOctagon className="w-3 h-3 mr-1 text-rose-600 animate-pulse" />
            Kritis
          </span>
        );
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center text-[11px] font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
            <CheckCircle2 className="w-3 h-3 mr-1 text-blue-600" />
            Selesai
          </span>
        );
      default:
        return (
          <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
            Aktif
          </span>
        );
    }
  };

  const getScopeBadge = (scope?: string) => {
    switch (scope) {
      case 'MULTI_DISIPLIN':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'DRONE_LIDAR':
        return 'bg-cyan-50 text-cyan-700 border-cyan-200';
      case 'FOTOGRAMETRI':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  const handleSelectSPK = (spkId: string) => {
    switchProject(spkId);
    setActiveTab('wbs');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-200">
                PT Pertamina EP Zona 4
              </span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Call of Order (COO)
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-2 tracking-tight">
              Monitoring SPK berjalan
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              Pengawasan operasional simultan seluruh Surat Perintah Kerja (SPK) survey topografi, pemetaan terestris, dan drone LiDAR di Wilayah Kerja Zona 4.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 self-start lg:self-center">
            <button
              onClick={() => setShowManualGuide(!showManualGuide)}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold shadow-2xs transition"
            >
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Panduan Manual SPK & WBS</span>
              {showManualGuide ? (
                <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {canManageMasterSpk && (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm shadow-emerald-600/20 transition"
              >
                <Plus className="w-4 h-4" />
                <span>+ Tambah SPK Baru</span>
              </button>
            )}

            <button
              onClick={() => handleSelectSPK(activeProjectId)}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition"
            >
              <GitGraph className="w-4 h-4" />
              <span>Buka WBS ({projects.find((p) => p.id === activeProjectId)?.code})</span>
            </button>
          </div>
        </div>

        {/* Expandable Manual Guide Banner */}
        {showManualGuide && (
          <div className="mt-5 p-5 bg-gradient-to-br from-blue-50/90 via-slate-50 to-indigo-50/70 border border-blue-200/80 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="flex items-start justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold shadow-xs">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Panduan Menambah & Merevisi SPK Berjalan (SOW Pertamina EP Zona 4)
                  </h3>
                  <p className="text-xs text-slate-600">
                    Keseragaman WBS 4 Divisi, 19 paket pekerjaan Orde 2 (1.1 s/d 4.4), dan 5 milestone operasional.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowManualGuide(false)}
                className="text-slate-400 hover:text-slate-600 text-xs px-2 py-1 rounded"
              >
                Tutup
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-xs">
              <div className="p-3.5 bg-white/90 rounded-xl border border-blue-100 shadow-2xs">
                <span className="font-bold text-blue-900 flex items-center mb-1.5">
                  <Plus className="w-3.5 h-3.5 mr-1 text-blue-600" />
                  1. Tambah SPK Baru (Melalui UI)
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Klik tombol <strong className="text-emerald-700">+ Tambah SPK Baru</strong> di atas. Masukkan Nomor SPK, rentang tanggal mulai & selesai, dan nilai kontrak. Opsi <em>"Generate otomatis 53 item WBS standar"</em> akan menyusun pohon WBS lengkap yang disesuaikan secara proporsional dengan durasi proyek.
                </p>
              </div>

              <div className="p-3.5 bg-white/90 rounded-xl border border-blue-100 shadow-2xs">
                <span className="font-bold text-blue-900 flex items-center mb-1.5">
                  <Edit3 className="w-3.5 h-3.5 mr-1 text-amber-600" />
                  2. Revisi SPK yang Ada (Rentang Waktu & Nilai)
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Pada setiap kartu atau baris SPK, klik tombol <strong>Edit</strong> (ikon pensil ✏️). Anda dapat menggeser rentang tanggal, memperbarui nilai kontrak rupiah, mengganti PIC/Subkontraktor, atau menekan <em>"Reset WBS Standar"</em> untuk menata ulang paket pekerjaan.
                </p>
              </div>

              <div className="p-3.5 bg-white/90 rounded-xl border border-blue-100 shadow-2xs">
                <span className="font-bold text-blue-900 flex items-center mb-1.5">
                  <FileText className="w-3.5 h-3.5 mr-1 text-purple-600" />
                  3. Pengisian Manual Berkas Data
                </span>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Untuk mendaftarkan SPK secara kode baku, buka berkas <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">src/data/mockInitialData.ts</code> pada array <code className="bg-slate-100 px-1 py-0.5 rounded font-mono text-[10px]">INITIAL_PROJECTS</code>. Sistem otomatis menerapkan template 53 item WBS standar ke setiap SPK yang terdaftar!
                </p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-blue-200/50 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
              <span>
                <strong>Struktur WBS Baku:</strong> 1. Persiapan Pekerjaan (19%) • 2. Survey Terestris (48%) • 3. Drone LiDAR & Foto (20%) • 4. Administrasi (13%)
              </span>
              <span className="font-semibold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full">
                Lampiran A.1 COO PT Pertamina EP Zona 4
              </span>
            </div>
          </div>
        )}

        {/* Portfolio KPI Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-slate-100">
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total SPK Berjalan
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1">
              {totalSPKs} <span className="text-xs font-normal text-slate-500">SPK Kontrak</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {activeSPKs} Aktif • {completedCount} Serah Terima
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Rata-rata Progres
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline space-x-1.5">
              <span>{avgActual}%</span>
              <span className="text-xs font-medium text-slate-400">/ {avgPlan}%</span>
            </div>
            <div
              className={`text-[11px] font-semibold mt-1 flex items-center ${
                avgDeviation < 0 ? 'text-rose-600' : 'text-emerald-600'
              }`}
            >
              {avgDeviation < 0 ? (
                <TrendingDown className="w-3 h-3 mr-1" />
              ) : (
                <TrendingUp className="w-3 h-3 mr-1" />
              )}
              Deviasi: {avgDeviation > 0 ? `+${avgDeviation}` : avgDeviation}%
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Kesehatan Jadwal
            </div>
            <div className="text-2xl font-black text-slate-900 mt-1 flex items-center space-x-2">
              <span className="text-emerald-600 font-bold">{onTrackCount}</span>
              <span className="text-xs text-slate-400">On Track</span>
              <span className="text-rose-600 font-bold">/ {delayedCount}</span>
              <span className="text-xs text-slate-400">Delay</span>
            </div>
            <div className="text-[11px] text-slate-500 mt-1">
              {delayedCount > 0 ? 'Perlu tindakan mitigasi jalur kritis' : 'Seluruh jadwal aman'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Total Nilai Kontrak
            </div>
            <div className="text-lg sm:text-xl font-black text-slate-900 mt-1 truncate" title={formatIDR(totalContractValue)}>
              {formatIDR(totalContractValue)}
            </div>
            <div className="text-[11px] text-slate-500 mt-1 truncate">
              PT Pertamina EP Zona 4
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari nomor SPK, judul pekerjaan, lokasi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            />
          </div>

          <div>
            <select
              value={fieldFilter}
              onChange={(e) => setFieldFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="">Semua Wilayah Kerja / Field</option>
              <option value="Prabumulih Field">Prabumulih Field</option>
              <option value="Limau Field">Limau Field</option>
              <option value="Pendopo Field">Pendopo Field</option>
              <option value="Adera Field">Adera Field</option>
              <option value="Ramba Field">Ramba Field</option>
            </select>
          </div>

          <div>
            <select
              value={subFilter}
              onChange={(e) => setSubFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs font-medium"
            >
              <option value="">Semua Subkontraktor (2 KJSB)</option>
              <option value="SUBKHI">KJSB SUBKHI ABDUL HAKIM</option>
              <option value="SYAHRIAL">KJSB SYAHRIAL & REKAN</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
            >
              <option value="">Semua Status Progres</option>
              <option value="ON_TRACK">On Track</option>
              <option value="DELAYED">Terlambat (Delayed)</option>
              <option value="CRITICAL">Kritis (Critical)</option>
              <option value="COMPLETED">Selesai (Completed)</option>
            </select>
          </div>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-1 p-1 bg-slate-100 rounded-lg text-xs self-end md:self-auto">
          <button
            onClick={() => setViewMode('cards')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              viewMode === 'cards' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Grid Kartu
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`px-3 py-1 rounded-md transition font-medium ${
              viewMode === 'table' ? 'bg-white text-slate-900 shadow-2xs font-semibold' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Tabel Komparasi
          </button>
        </div>
      </div>

      {/* Cards View */}
      {viewMode === 'cards' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProjects.map((spk) => {
            const isCurrentActive = spk.id === activeProjectId;
            const dev = Number((spk.currentProgressActual - spk.targetProgressPlan).toFixed(1));

            return (
              <div
                key={spk.id}
                className={`bg-white rounded-2xl border transition-all p-5 flex flex-col justify-between ${
                  isCurrentActive
                    ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                    : 'border-slate-200 hover:border-slate-300 shadow-xs'
                }`}
              >
                <div>
                  {/* Top tags */}
                  <div className="flex items-center justify-between gap-2 flex-wrap">
                    <div className="flex items-center space-x-1.5">
                      <span className="font-mono text-[11px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        {spk.code}
                      </span>
                      {spk.wellName && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                          {spk.wellName}
                        </span>
                      )}
                      {spk.scopeType && (
                        <span
                          className={`text-[10px] font-semibold px-1.5 py-0.5 rounded border uppercase tracking-wider ${getScopeBadge(
                            spk.scopeType
                          )}`}
                        >
                          {spk.scopeType.replace('_', ' ')}
                        </span>
                      )}
                      {isSubcontractorActor && (
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            isUserAllowedProject(spk.id)
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {isUserAllowedProject(spk.id) ? 'Paket Anda' : 'Paket Rekanan'}
                        </span>
                      )}
                    </div>
                    {getHealthBadge(spk.healthStatus)}
                  </div>

                  {/* SPK Title */}
                  <h3 className="font-bold text-slate-900 text-sm mt-3 line-clamp-2 leading-snug">
                    {spk.name}
                  </h3>

                  {/* Meta details */}
                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                    <div className="flex items-center text-[11px]">
                      <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                      <span className="truncate">{spk.location}</span>
                    </div>
                    <div className="flex items-center text-[11px]">
                      <Building className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                      <span className="truncate">{spk.subcontractor || 'KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN'} • PIC: {spk.picName || '-'}</span>
                    </div>
                    <div className="flex items-center text-[11px]">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 shrink-0" />
                      <span>
                        {spk.startDate.slice(5)} s/d {spk.finishDate.slice(5)} • Nilai:{' '}
                        <strong className="text-slate-800 font-semibold">{formatIDR(spk.contractValue)}</strong>
                      </span>
                    </div>
                    {spk.contractNumber && (
                      <div className="flex items-center text-[10px] text-slate-400 font-mono">
                        <span>Kontrak Induk: #{spk.contractNumber}</span>
                      </div>
                    )}
                  </div>

                  {/* Progress Bar & Deviation */}
                  <div className="mt-4 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-slate-600 font-medium">Realisasi Lapangan</span>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {spk.currentProgressActual}%
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          (Rencana {spk.targetProgressPlan}%)
                        </span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden relative">
                      {/* Plan marker */}
                      <div
                        className="absolute top-0 bottom-0 bg-slate-300 w-1 z-10"
                        style={{ left: `${Math.min(100, spk.targetProgressPlan)}%` }}
                        title={`Target Plan: ${spk.targetProgressPlan}%`}
                      />
                      {/* Actual Fill */}
                      <div
                        className={`h-2 rounded-full transition-all ${
                          spk.currentProgressActual >= 100
                            ? 'bg-emerald-500'
                            : dev < -5
                            ? 'bg-rose-500'
                            : dev < 0
                            ? 'bg-amber-500'
                            : 'bg-blue-600'
                        }`}
                        style={{ width: `${Math.min(100, spk.currentProgressActual)}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between text-[11px] mt-1.5">
                      <span
                        className={`font-semibold ${
                          dev < 0 ? 'text-rose-600' : dev > 0 ? 'text-emerald-600' : 'text-slate-500'
                        }`}
                      >
                        Deviasi: {dev > 0 ? `+${dev}` : dev}%
                      </span>
                      <span className="text-slate-400 font-mono text-[10px]">
                        {spk.totalTasks} WBS items
                      </span>
                    </div>
                  </div>
                </div>

                {/* Bottom Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {isCurrentActive ? (
                      <span className="text-[11px] font-bold text-blue-600 flex items-center">
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-blue-600" />
                        Aktif
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">
                        Pilih SPK
                      </span>
                    )}

                    {canManageMasterSpk && (
                      <button
                        onClick={() => setEditTargetProject(spk)}
                        className="px-2 py-1 rounded-md text-[11px] font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center space-x-1 transition"
                        title="Edit Range Waktu, Nilai Kontrak, PIC, dll"
                      >
                        <Edit3 className="w-3 h-3 text-slate-500" />
                        <span>Edit</span>
                      </button>
                    )}
                  </div>

                  <button
                    onClick={() => handleSelectSPK(spk.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1 transition ${
                      isCurrentActive
                        ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-700'
                    }`}
                  >
                    <span>Buka WBS & Gantt</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-600 font-semibold select-none">
                  <th className="py-3 px-3">Kode / No. SPK</th>
                  <th className="py-3 px-3 min-w-[220px]">Nama Pekerjaan & Lokasi</th>
                  <th className="py-3 px-2">Wilayah Kerja</th>
                  <th className="py-3 px-2">Subkontraktor / PIC</th>
                  <th className="py-3 px-2 text-right">Nilai Kontrak</th>
                  <th className="py-3 px-2 text-center">Jadwal Selesai</th>
                  <th className="py-3 px-2 text-center w-24">Rencana</th>
                  <th className="py-3 px-2 text-center w-28">Realisasi</th>
                  <th className="py-3 px-2 text-center">Deviasi</th>
                  <th className="py-3 px-2">Status</th>
                  <th className="py-3 px-3 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProjects.map((spk) => {
                  const isCurrentActive = spk.id === activeProjectId;
                  const dev = Number((spk.currentProgressActual - spk.targetProgressPlan).toFixed(1));

                  return (
                    <tr
                      key={spk.id}
                      className={`hover:bg-blue-50/50 transition-colors ${
                        isCurrentActive ? 'bg-blue-50/40 font-medium' : ''
                      }`}
                    >
                      <td className="py-3 px-3">
                        <div className="flex items-center space-x-1.5">
                          <span className="font-mono font-bold text-blue-700">{spk.code}</span>
                          {spk.wellName && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-50 text-amber-800 border border-amber-200">
                              {spk.wellName}
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {spk.spkNumber} {spk.contractNumber ? `• Perjanjian: #${spk.contractNumber}` : ''}
                        </div>
                      </td>

                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-900 leading-snug">{spk.name}</div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs">{spk.location}</div>
                      </td>

                      <td className="py-3 px-2">
                        <span className="text-[11px] font-medium text-slate-700">{spk.fieldArea || '-'}</span>
                      </td>

                      <td className="py-3 px-2">
                        <div className="font-medium text-slate-800">{spk.subcontractor || 'KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN'}</div>
                        <div className="text-[10px] text-slate-400">PIC: {spk.picName || '-'}</div>
                      </td>

                      <td className="py-3 px-2 text-right font-mono font-medium text-slate-800">
                        {formatIDR(spk.contractValue)}
                      </td>

                      <td className="py-3 px-2 text-center text-slate-600 font-mono">
                        {spk.finishDate}
                      </td>

                      <td className="py-3 px-2 text-center font-mono font-semibold text-indigo-700">
                        {spk.targetProgressPlan}%
                      </td>

                      <td className="py-3 px-2 text-center">
                        <div className="flex flex-col items-center">
                          <span className="font-mono font-bold text-slate-900">
                            {spk.currentProgressActual}%
                          </span>
                          <div className="w-16 bg-slate-200 rounded-full h-1 mt-1 overflow-hidden">
                            <div
                              className={`h-1 rounded-full ${
                                spk.currentProgressActual >= 100
                                  ? 'bg-emerald-500'
                                  : dev < 0
                                  ? 'bg-rose-500'
                                  : 'bg-blue-600'
                              }`}
                              style={{ width: `${Math.min(100, spk.currentProgressActual)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-2 text-center font-mono text-xs">
                        <span
                          className={`font-semibold ${
                            dev < 0 ? 'text-rose-600' : dev > 0 ? 'text-emerald-600' : 'text-slate-500'
                          }`}
                        >
                          {dev > 0 ? `+${dev}` : dev}%
                        </span>
                      </td>

                      <td className="py-3 px-2">{getHealthBadge(spk.healthStatus)}</td>

                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          {canManageMasterSpk && (
                            <button
                              onClick={() => setEditTargetProject(spk)}
                              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-600 transition"
                              title="Edit SPK"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <button
                            onClick={() => handleSelectSPK(spk.id)}
                            className="px-2.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition inline-flex items-center space-x-1"
                          >
                            <span>Buka WBS</span>
                            <ArrowUpRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add SPK Modal */}
      <AddSpkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Edit SPK Modal */}
      {editTargetProject && (
        <EditSpkModal
          isOpen={!!editTargetProject}
          targetProject={editTargetProject}
          onClose={() => setEditTargetProject(null)}
        />
      )}
    </div>
  );
};
