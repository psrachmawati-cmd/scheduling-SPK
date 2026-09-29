import React, { useState } from 'react';
import {
  Building2,
  Clock,
  ChevronDown,
  CheckCircle2,
  Square,
  Briefcase,
  Layers3,
  ExternalLink,
  Plus,
  KeyRound,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { AddSpkModal } from './AddSpkModal';

interface NavbarProps {
  onOpenRoleModal: () => void;
  onOpenCredentialModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenRoleModal, onOpenCredentialModal }) => {
  const {
    currentUser,
    users,
    project,
    projects,
    accessibleProjects,
    activeProjectId,
    switchProject,
    switchUser,
    logout,
    timerState,
    stopTimerAndSave,
    setActiveTab,
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [spkDropdownOpen, setSpkDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const isSubcontractorActor = !!currentUser.subcontractorId;
  const canAddSpk = currentUser.role === 'SUPER_ADMIN' || currentUser.role === 'PROJECT_MANAGER' || !currentUser.subcontractorId;

  // Format timer seconds into HH:MM:SS
  const formatTimer = (totalSeconds: number) => {
    const hrs = Math.floor(totalSeconds / 3600);
    const mins = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoleBadgeColor = (role: UserRole) => {
    switch (role) {
      case 'SUPER_ADMIN':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'PROJECT_MANAGER':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'SITE_SUPERVISOR':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SUBCONTRACTOR':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'STAFF':
        return 'bg-teal-100 text-teal-800 border-teal-200';
      case 'VIEWER':
        return 'bg-slate-100 text-slate-700 border-slate-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-200 shadow-xs">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & SPK Selector */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setActiveTab('portfolio')}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-sm hover:opacity-90 transition shrink-0"
              title="Kembali ke Monitoring SPK"
            >
              <Building2 className="w-5 h-5" />
            </button>

            {/* Quick SPK Switcher in Navbar */}
            <div className="relative">
              <button
                onClick={() => setSpkDropdownOpen(!spkDropdownOpen)}
                className="flex items-center space-x-2 text-left p-1.5 sm:px-3 sm:py-1.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition bg-slate-50/70"
              >
                <div className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></div>
                <div className="min-w-0">
                  <div className="flex items-center space-x-1.5">
                    <span className="font-mono font-bold text-xs text-blue-700">
                      {project.code}
                    </span>
                    <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-slate-200 text-slate-700">
                      {project.currentProgressActual}%
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-medium truncate max-w-[140px] sm:max-w-xs md:max-w-md lg:max-w-lg xl:max-w-xl">
                    {project.name}
                  </p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
              </button>

              {/* SPK Dropdown Menu */}
              {spkDropdownOpen && (
                <div
                  className="absolute left-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setSpkDropdownOpen(false)}
                >
                  <div className="px-3.5 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                        {isSubcontractorActor
                          ? currentUser.subcontractorId === 'sub-01'
                            ? '15 SPK KJSB Subkhi (Ivan)'
                            : '11 SPK KJSB Syahrial (Juli)'
                          : `${projects.length} SPK Zona 4 (Global)`}
                      </p>
                      <p className="text-xs text-slate-600">
                        {isSubcontractorActor ? 'Paket resmi yang dapat Anda kelola:' : 'Klik untuk beralih WBS & timeline SPK:'}
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSpkDropdownOpen(false);
                        setActiveTab('portfolio');
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center"
                    >
                      <span>Lihat Portfolio</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-50">
                    {(isSubcontractorActor ? accessibleProjects : projects).map((p) => {
                      const isActive = p.id === activeProjectId;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            switchProject(p.id);
                            setSpkDropdownOpen(false);
                          }}
                          className={`w-full flex items-center justify-between px-3.5 py-2.5 text-left transition hover:bg-slate-50 ${
                            isActive ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          <div className="min-w-0 pr-3">
                            <div className="flex items-center space-x-1.5">
                              <span
                                className={`font-mono text-xs font-bold ${
                                  isActive ? 'text-blue-700' : 'text-slate-900'
                                }`}
                              >
                                {p.code}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                • {p.fieldArea || p.location}
                              </span>
                            </div>
                            <p className="text-xs text-slate-700 font-medium truncate mt-0.5">
                              {p.name}
                            </p>
                          </div>

                          <div className="text-right shrink-0">
                            <div className="font-mono text-xs font-bold text-slate-900">
                              {p.currentProgressActual}%
                            </div>
                            <div className="text-[10px] text-slate-400">
                              Plan: {p.targetProgressPlan}%
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="p-2 border-t border-slate-100 bg-slate-50/80 rounded-b-xl flex items-center justify-between">
                    {canAddSpk ? (
                      <button
                        onClick={() => {
                          setSpkDropdownOpen(false);
                          setIsAddModalOpen(true);
                        }}
                        className="w-full py-1.5 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1.5 transition shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>+ Tambah SPK Baru</span>
                      </button>
                    ) : (
                      <div className="w-full py-1.5 px-3 bg-slate-100 text-slate-600 rounded-lg text-[11px] font-medium text-center">
                        Hak akses rekanan: {currentUser.subcontractorName || 'Subkontraktor'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center / Right controls */}
          <div className="flex items-center space-x-3">
            {/* Active Live Timer Indicator */}
            {timerState.isRunning && (
              <div className="hidden sm:flex items-center bg-amber-50 border border-amber-300 rounded-lg px-3 py-1.5 shadow-xs animate-pulse">
                <Clock className="w-4 h-4 text-amber-600 mr-2 animate-spin" />
                <div className="text-left mr-3">
                  <div className="text-[11px] font-medium text-amber-800 leading-tight">
                    Timer: {formatTimer(timerState.seconds)}
                  </div>
                  <div className="text-[10px] text-amber-600 truncate max-w-[120px]">
                    {timerState.wbsWorkName}
                  </div>
                </div>
                <button
                  onClick={stopTimerAndSave}
                  title="Simpan ke Timesheet"
                  className="p-1 rounded bg-amber-600 text-white hover:bg-amber-700 transition"
                >
                  <Square className="w-3.5 h-3.5 fill-current" />
                </button>
              </div>
            )}

            {/* Baseline Status Badge */}
            <div className="hidden lg:flex items-center text-xs px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 mr-1.5" />
              <span>Baseline: {project.baselineLocked ? 'Terkunci (v1.0)' : 'Draft'}</span>
            </div>

            {/* User Profile Button & Dropdown */}
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 sm:px-3 sm:py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition bg-white shadow-xs"
                id="role-switcher-btn"
              >
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-8 h-8 rounded-full object-cover ring-2 ring-blue-500/20"
                />
                <div className="hidden md:block text-left">
                  <div className="text-xs font-semibold text-slate-800 leading-tight flex items-center gap-1.5">
                    {currentUser.name}
                  </div>
                  <div className="text-[10px] text-slate-500 font-medium">
                    {currentUser.actorLabel || currentUser.roleTitle}
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>

              {/* Individual User Profile Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  {/* Logged in User Profile Info */}
                  <div className="px-4 pb-3 border-b border-slate-100">
                    <div className="flex items-center space-x-3">
                      <img
                        src={currentUser.avatar}
                        alt={currentUser.name}
                        className="w-11 h-11 rounded-full object-cover ring-2 ring-blue-500/30 shrink-0"
                      />
                      <div className="min-w-0 flex-1">
                        <h4 className="text-sm font-bold text-slate-900 truncate">
                          {currentUser.name}
                        </h4>
                        <p className="text-xs text-slate-500 font-mono">
                          @{currentUser.username}
                        </p>
                        <div className="mt-1 flex items-center space-x-1.5">
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(
                              currentUser.role
                            )}`}
                          >
                            {currentUser.actorLabel || currentUser.role}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs space-y-1">
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                        {currentUser.roleTitle}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {currentUser.department}
                      </p>
                      {currentUser.subcontractorName && (
                        <p className="text-[10px] font-medium text-emerald-700 bg-emerald-50 px-2 py-1 rounded border border-emerald-200 mt-1">
                          Rekanan: {currentUser.subcontractorName}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Account Actions */}
                  <div className="px-3 pt-2 space-y-1">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenRoleModal();
                      }}
                      className="w-full text-left px-3 py-2 text-xs text-slate-700 hover:bg-slate-50 rounded-xl font-medium transition flex items-center justify-between"
                    >
                      <span>Bagan Hierarki & Organisasi</span>
                      <ChevronDown className="w-3.5 h-3.5 -rotate-90 text-slate-400" />
                    </button>

                    {/* Informasi Kredensial Akun Pengguna hanya dapat diakses saat login sebagai Super Admin */}
                    {currentUser.role === 'SUPER_ADMIN' && (
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenCredentialModal();
                        }}
                        className="w-full text-left px-3 py-2 text-xs text-blue-700 hover:bg-blue-50 rounded-xl font-semibold transition flex items-center justify-between"
                      >
                        <div className="flex items-center space-x-2">
                          <KeyRound className="w-3.5 h-3.5" />
                          <span>Informasi Kredensial Akun</span>
                        </div>
                      </button>
                    )}

                    <div className="pt-2 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setDropdownOpen(false);
                          logout();
                        }}
                        className="w-full py-2 px-3 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl text-xs font-bold flex items-center justify-center space-x-2 transition"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Keluar (Logout)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AddSpkModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </header>
  );
};
