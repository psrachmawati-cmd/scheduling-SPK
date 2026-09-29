import React, { useState } from 'react';
import {
  X,
  Shield,
  CheckCircle,
  ArrowRight,
  Eye,
  Briefcase,
  HardHat,
  FileCheck,
  Building2,
  Users2,
  Compass,
  Layers,
  FileSpreadsheet,
  PencilRuler,
  Info,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole, User } from '../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser } = useApp();
  const [activeTab, setActiveTab] = useState<'org' | 'roles'>('org');

  if (!isOpen) return null;

  const roleSpecs: {
    role: UserRole;
    title: string;
    description: string;
    mainAccess: string[];
    color: string;
    icon: any;
  }[] = [
    {
      role: 'SUPER_ADMIN',
      title: 'Super Admin',
      description: 'Mengelola seluruh sistem, multi-project, kelola user & role',
      mainAccess: ['Full Access sistem', 'Multi-project management (26 SPK)', 'Konfigurasi WBS global', 'Manajemen hak akses master'],
      color: 'border-purple-200 bg-purple-50/50 text-purple-900',
      icon: Shield,
    },
    {
      role: 'PROJECT_MANAGER',
      title: 'Project Manager (PM)',
      description: 'Pemilik proyek, membuat WBS, approve timesheet & progress, set baseline',
      mainAccess: ['CRUD Project & WBS Tree', 'Kunci Baseline Schedule', 'Persetujuan (Approval) Timesheet', 'Generate Laporan S-Curve & WBS'],
      color: 'border-blue-200 bg-blue-50/50 text-blue-900',
      icon: Briefcase,
    },
    {
      role: 'SITE_SUPERVISOR',
      title: 'Site Supervisor / Koordinator Survey & Drafter',
      description: 'Mengawasi pelaksanaan lapangan & drafting, update progress aktual, verifikasi awal timesheet',
      mainAccess: ['Supervisi teknis lapangan & studio', 'Verifikasi timesheet pekerja', 'Input log kendala teknis', 'Monitoring harian subkon'],
      color: 'border-amber-200 bg-amber-50/50 text-amber-900',
      icon: HardHat,
    },
    {
      role: 'SUBCONTRACTOR',
      title: 'Koordinator Sub-Kontraktor (KJSB)',
      description: 'Pelaksana pekerjaan paket spesifik (Akses terfilter: KJSB Subkhi 15 SPK / KJSB Syahrial 11 SPK)',
      mainAccess: ['Input progress pekerjaan paket rekanan', 'Review timesheet tim mandiri', 'Message board koordinasi task', 'Upload dokumen pendukung'],
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
      icon: FileCheck,
    },
    {
      role: 'STAFF',
      title: 'Staff Operasional Lapangan & Studio CAD',
      description: 'Surveyor lapangan dan drafter CAD/GIS',
      mainAccess: ['Input jam kerja (Timesheet) harian', 'Lihat daftar tugas harian (To Do)', 'Cek status verifikasi jam kerja'],
      color: 'border-teal-200 bg-teal-50/50 text-teal-900',
      icon: HardHat,
    },
    {
      role: 'VIEWER',
      title: 'Viewer / Pemangku Kepentingan',
      description: 'Pemangku kepentingan eksternal, manajemen',
      mainAccess: ['Read-only monitoring proyek', 'Pantau grafik Kurva-S & deviasi', 'Download laporan PDF/Excel', 'Diskusi koordinasi'],
      color: 'border-slate-200 bg-slate-50/70 text-slate-900',
      icon: Eye,
    },
  ];

  const pertaminaUsers = users.filter((u) => !u.subcontractorId);
  const subkhiUsers = users.filter((u) => u.subcontractorId === 'sub-01');
  const syahrialUsers = users.filter((u) => u.subcontractorId === 'sub-02');

  const renderActorItem = (u: User) => {
    const isCurrent = currentUser.id === u.id;
    return (
      <div
        key={u.id}
        className={`p-3 rounded-xl border transition-all flex items-center justify-between ${
          isCurrent
            ? 'bg-blue-50/60 border-blue-500 ring-2 ring-blue-500/20 shadow-2xs'
            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
        }`}
      >
        <div className="flex items-center space-x-3 min-w-0 pr-2">
          <img
            src={u.avatar}
            alt={u.name}
            className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
          />
          <div className="min-w-0">
            <div className="flex items-center space-x-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 truncate">{u.name}</span>
              {isCurrent && (
                <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-600 text-white">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-[11px] text-blue-700 font-medium truncate">{u.roleTitle}</p>
            <p className="text-[10px] text-slate-400 font-mono">@{u.username} • {u.projectAccess.length} Paket SPK</p>
          </div>
        </div>

        <button
          onClick={() => {
            switchUser(u.id);
            onClose();
          }}
          disabled={isCurrent}
          className={`shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1 ${
            isCurrent
              ? 'bg-slate-100 text-slate-400 cursor-default'
              : 'bg-blue-600 hover:bg-blue-700 text-white shadow-2xs'
          }`}
        >
          <span>{isCurrent ? 'Aktif' : 'Gunakan'}</span>
          {!isCurrent && <ArrowRight className="w-3 h-3" />}
        </button>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full p-5 sm:p-6 border border-slate-200 my-6 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 shrink-0">
          <div>
            <div className="flex items-center space-x-2">
              <div className="p-1.5 rounded-lg bg-blue-100 text-blue-700">
                <Users2 className="w-5 h-5" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Struktur Organisasi Proyek & Hak Akses Aktor
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Wilayah Kerja PT Pertamina Hulu Rokan Zona 4 • 2 Subkontraktor Resmi (KJSB Subkhi & KJSB Syahrial)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center space-x-2 border-b border-slate-200 pt-3 pb-2 shrink-0">
          <button
            onClick={() => setActiveTab('org')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'org'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Bagan Struktur Organisasi (9 Aktor)</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center space-x-1.5 ${
              activeTab === 'roles'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Spesifikasi Role Sistem</span>
          </button>
        </div>

        {/* Tab 1: Organization Hierarchy */}
        {activeTab === 'org' && (
          <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1">
            {/* Notice Info */}
            <div className="p-3 bg-blue-50/70 border border-blue-200 rounded-xl text-xs text-blue-900 flex items-start space-x-2.5">
              <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold text-blue-950">Hierarki Operasional Resmi: </strong>
                Sistem dikonfigurasi strictly untuk <strong>2 Subkontraktor Resmi</strong>:
                1. <strong>KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN</strong> (Koordinator: <strong>Ivan</strong>)
                2. <strong>KJSB SYAHRIAL & REKAN</strong> (Koordinator: <strong>Juli</strong>).
                <em> PT Sucofindo berkedudukan sebagai Pengelola Kontrak Utama (Bukan Kontraktor).</em>
              </div>
            </div>

            {/* Tree Section 1: Pihak I Pertamina Zona 4 */}
            <div className="rounded-xl border border-purple-200 bg-purple-50/30 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-purple-600"></span>
                  <h4 className="text-xs font-bold text-purple-950 uppercase tracking-wider">
                    Pihak I • PT Pertamina Hulu Rokan Zona 4 (Pemilik Kontrak & Pengawas)
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-800 border border-purple-200">
                  Akses Global: Seluruh 26 Paket SPK
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {pertaminaUsers.map(renderActorItem)}
              </div>
            </div>

            {/* Tree Section 2: Subkontraktor 1 - KJSB Subkhi */}
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/30 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-600"></span>
                  <h4 className="text-xs font-bold text-emerald-950 uppercase tracking-wider">
                    Subkontraktor 1 • KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN (Koordinator: Ivan)
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 border border-emerald-200 font-mono">
                  15 Paket SPK Resmi
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Spesialisasi: Survey Pemetaan Topografi Terestris, Pematokan Batas Tapak Bor, Pengamatan GPS Geodetik Jaring Orde-1/Orde-3, Inventaris Lahan Migas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {subkhiUsers.map(renderActorItem)}
              </div>
            </div>

            {/* Tree Section 3: Subkontraktor 2 - KJSB Syahrial */}
            <div className="rounded-xl border border-teal-200 bg-teal-50/30 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-teal-200 pb-2">
                <div className="flex items-center space-x-2">
                  <span className="w-3 h-3 rounded-full bg-teal-600"></span>
                  <h4 className="text-xs font-bold text-teal-950 uppercase tracking-wider">
                    Subkontraktor 2 • KJSB SYAHRIAL & REKAN (Koordinator: Juli)
                  </h4>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 text-teal-800 border border-teal-200 font-mono">
                  11 Paket SPK Resmi
                </span>
              </div>
              <p className="text-[11px] text-slate-600">
                Spesialisasi: Studio Penggambaran AutoCAD/Civil3D, Pemetaan Geospasial GIS, Akuisisi Drone LiDAR, Siteplan Tapak Bor & Koridor Flowline Migas.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {syahrialUsers.map(renderActorItem)}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: System Role Specs */}
        {activeTab === 'roles' && (
          <div className="flex-1 overflow-y-auto py-4 max-h-[60vh] pr-1">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {roleSpecs.map((spec) => {
                const Icon = spec.icon;
                const assignedUser = users.find((u) => u.role === spec.role);
                const isCurrent = currentUser.role === spec.role;

                return (
                  <div
                    key={spec.role}
                    className={`p-4 rounded-xl border transition-all ${
                      isCurrent
                        ? 'border-blue-500 ring-2 ring-blue-500/20 bg-blue-50/30'
                        : 'border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2.5">
                        <div className={`p-2 rounded-lg ${spec.color}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{spec.title}</h4>
                          <p className="text-[11px] text-slate-500">{spec.description}</p>
                        </div>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600 text-white">
                          Aktif
                        </span>
                      )}
                    </div>

                    <div className="mt-3 space-y-1">
                      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        Hak Akses Utama:
                      </p>
                      <ul className="text-xs text-slate-600 space-y-1">
                        {spec.mainAccess.map((acc, idx) => (
                          <li key={idx} className="flex items-center space-x-1.5">
                            <CheckCircle className="w-3 h-3 text-emerald-600 shrink-0" />
                            <span className="text-[11px]">{acc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {assignedUser && (
                      <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <img
                            src={assignedUser.avatar}
                            alt={assignedUser.name}
                            className="w-6 h-6 rounded-full object-cover"
                          />
                          <span className="text-xs font-medium text-slate-800 truncate max-w-[140px]">
                            {assignedUser.name}
                          </span>
                        </div>
                        <button
                          onClick={() => {
                            switchUser(assignedUser.id);
                            onClose();
                          }}
                          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                          <span>Gunakan Akun Ini</span>
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="pt-3 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-500">
            Aktor aktif: <strong className="text-slate-800">{currentUser.name}</strong> ({currentUser.actorLabel || currentUser.roleTitle})
          </div>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

