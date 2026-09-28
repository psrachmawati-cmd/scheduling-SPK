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
    activeProjectId,
    switchProject,
    switchUser,
    timerState,
    stopTimerAndSave,
    setActiveTab,
  } = useApp();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [spkDropdownOpen, setSpkDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <p className="text-[11px] text-slate-600 font-medium truncate max-w-[140px] sm:max-w-xs md:max-w-md">
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
                      <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                        {projects.length} SPK Berjalan Simultan (Zona 4)
                      </p>
                      <p className="text-xs text-slate-600">
                        Klik untuk beralih WBS & timeline SPK:
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setSpkDropdownOpen(false);
                        setActiveTab('portfolio');
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:underline flex items-center"
                    >
                      <span>Semua SPK</span>
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-50">
                    {projects.map((p) => {
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

            {/* Quick Access to 7 Dummy Accounts Modal */}
            <button
              onClick={onOpenCredentialModal}
              className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 transition text-xs font-semibold shadow-2xs"
              title="Lihat daftar & kredensial 7 akun dummy (username & password)"
            >
              <KeyRound className="w-3.5 h-3.5 text-amber-700 shrink-0" />
              <span className="hidden sm:inline">7 Akun Dummy</span>
            </button>

            {/* Role Switcher Button & Dropdown */}
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

              {/* Role Dropdown Menu */}
              {dropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                        Akses Akun (7 Aktor Proyek)
                      </p>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Klik untuk langsung beralih peran:
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenCredentialModal();
                      }}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200"
                    >
                      Kredensial
                    </button>
                  </div>

                  <div className="max-h-80 overflow-y-auto py-1 divide-y divide-slate-50">
                    {users.map((u) => {
                      const isActive = u.id === currentUser.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => {
                            switchUser(u.id);
                            setDropdownOpen(false);
                          }}
                          className={`w-full flex items-center px-3 py-2.5 text-left transition hover:bg-slate-50 ${
                            isActive ? 'bg-blue-50/70' : ''
                          }`}
                        >
                          <img
                            src={u.avatar}
                            alt={u.name}
                            className="w-8 h-8 rounded-full object-cover mr-3 shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span
                                className={`text-xs font-semibold truncate ${
                                  isActive ? 'text-blue-700' : 'text-slate-800'
                                }`}
                              >
                                {u.name}
                              </span>
                              {isActive && (
                                <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0"></span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 mt-0.5 flex-wrap gap-y-0.5">
                              <span
                                className={`text-[10px] font-semibold px-1.5 py-0.2 rounded border ${getRoleBadgeColor(
                                  u.role
                                )}`}
                              >
                                {u.actorLabel || u.role}
                              </span>
                              <code className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1.5 py-0.2 rounded">
                                @{u.username}
                              </code>
                            </div>
                            <p className="text-[10px] text-slate-400 truncate mt-0.5">
                              {u.roleTitle}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs">
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenCredentialModal();
                      }}
                      className="text-amber-700 hover:text-amber-800 font-semibold flex items-center space-x-1 py-1"
                    >
                      <KeyRound className="w-3.5 h-3.5" />
                      <span>Lihat Semua Username & PW</span>
                    </button>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        onOpenRoleModal();
                      }}
                      className="text-slate-500 hover:text-slate-700 font-medium py-1"
                    >
                      Bagan Hierarki
                    </button>
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
