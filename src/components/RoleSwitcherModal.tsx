import React from 'react';
import { X, Shield, CheckCircle, ArrowRight, Lock, Eye, Briefcase, HardHat, FileCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

interface RoleSwitcherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RoleSwitcherModal: React.FC<RoleSwitcherModalProps> = ({ isOpen, onClose }) => {
  const { users, currentUser, switchUser } = useApp();

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
      mainAccess: ['Full Access sistem', 'Multi-project management', 'Konfigurasi WBS global', 'Manajemen hak akses pengguna'],
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
      title: 'Site Supervisor / Field Engineer',
      description: 'Mengawasi pelaksanaan lapangan, update progress aktual, verifikasi awal timesheet',
      mainAccess: ['Update progress aktual lapangan', 'Verifikasi timesheet pekerja', 'Input log kendala teknis', 'Monitoring harian subkon'],
      color: 'border-amber-200 bg-amber-50/50 text-amber-900',
      icon: HardHat,
    },
    {
      role: 'SUBCONTRACTOR',
      title: 'Sub-Kontraktor / Vendor',
      description: 'Pelaksana pekerjaan paket spesifik (Row-level security: hanya lihat task sendiri)',
      mainAccess: ['Input progress pekerjaan sendiri (% atau volume m³/ton)', 'Input timesheet mandiri', 'Message board koordinasi task', 'Upload bukti fisik/foto'],
      color: 'border-emerald-200 bg-emerald-50/50 text-emerald-900',
      icon: FileCheck,
    },
    {
      role: 'STAFF',
      title: 'Staff / Tenaga Kerja Lapangan',
      description: 'Tenaga kerja operasional lapangan',
      mainAccess: ['Input jam kerja (Timesheet) manual / live timer', 'Lihat daftar tugas harian (To Do)', 'Cek status approval lembur'],
      color: 'border-teal-200 bg-teal-50/50 text-teal-900',
      icon: HardHat,
    },
    {
      role: 'VIEWER',
      title: 'Viewer / Klien (Owner)',
      description: 'Pemangku kepentingan eksternal, dewan direksi, investor',
      mainAccess: ['Read-only dashboard proyek', 'Pantau grafik Kurva-S & keterlambatan', 'Download laporan PDF/Excel', 'Diskusi koordinasi umum'],
      color: 'border-slate-200 bg-slate-50/70 text-slate-900',
      icon: Eye,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto no-print">
      <div className="bg-white rounded-2xl shadow-2xl max-w-3xl w-full p-6 border border-slate-200 my-8">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Struktur Peran (Role Hierarchy) & Hak Akses
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Sesuai Bab 2 Spesifikasi Teknis: Platform Monitoring Proyek & Scheduling Berbasis WBS
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Roles grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 my-5 max-h-[60vh] overflow-y-auto pr-1">
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
                      <span className="text-xs font-medium text-slate-800">
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

        <div className="pt-3 border-t border-slate-200 flex justify-end">
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
