import React from 'react';
import {
  LayoutDashboard,
  GitGraph,
  PenTool,
  Clock,
  CheckSquare,
  MessageSquare,
  FileSpreadsheet,
  Users2,
  TrendingUp,
  ShieldAlert,
  AlertCircle,
  Briefcase,
  Layers3,
  LogOut,
  UserCheck,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, currentUser, timesheets, dailyTasks, wbsNodes, projects, logout } = useApp();

  // Pending timesheets count for PM / Supervisor approval
  const pendingTimesheetsCount = timesheets.filter((t) => t.status === 'PENDING').length;

  // Delayed tasks count
  const delayedTasksCount = wbsNodes.filter((n) => n.status === 'DELAYED').length;

  // Daily todo count for current assignee
  const myTasksCount = dailyTasks.filter((t) => t.status !== 'DONE').length;

  const menuItems = [
    {
      id: 'portfolio',
      label: 'Monitoring SPK',
      icon: Briefcase,
      description: 'Monitoring SPK berjalan simultan',
      badge: `${projects.length} SPK`,
      badgeColor: 'bg-blue-100 text-blue-800',
    },
    {
      id: 'wbs',
      label: 'WBS & Gantt Chart',
      icon: GitGraph,
      description: 'Struktur breakdown & timeline',
    },
    {
      id: 'dashboard',
      label: 'Dashboard & Kurva-S',
      icon: LayoutDashboard,
      description: 'Overview progres, Kurva-S & deviasi',
      badge: delayedTasksCount > 0 ? `${delayedTasksCount} delay` : undefined,
      badgeColor: 'bg-rose-100 text-rose-700',
    },
    {
      id: 'progress_input',
      label: 'Input Progres Lapangan',
      icon: PenTool,
      description: 'Input ha/tim terestris & progres %',
      badge: 'Produktivitas',
      badgeColor: 'bg-emerald-100 text-emerald-800',
      highlight: true,
    },
    {
      id: 'timesheet',
      label: 'Timesheet & Presensi',
      icon: Clock,
      description: 'Time tracking & persetujuan',
      badge:
        currentUser.role === 'PROJECT_MANAGER' || currentUser.role === 'SITE_SUPERVISOR'
          ? pendingTimesheetsCount > 0
            ? `${pendingTimesheetsCount} review`
            : undefined
          : undefined,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'tasks',
      label: 'Daftar Tugas Harian',
      icon: CheckSquare,
      description: 'Kanban board operasional',
      badge: myTasksCount > 0 ? `${myTasksCount}` : undefined,
      badgeColor: 'bg-slate-100 text-slate-700',
    },
    {
      id: 'messages',
      label: 'Message Board',
      icon: MessageSquare,
      description: 'Diskusi proyek & per-task',
    },
    {
      id: 'reports',
      label: 'Laporan & Export',
      icon: FileSpreadsheet,
      description: 'PDF, Excel & analisa deviasi',
    },
    {
      id: 'subcontractors',
      label: 'Sub-Kontraktor',
      icon: Users2,
      description: 'Kinerja vendor & pembobotan',
    },
  ];

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-slate-200 flex flex-col h-[calc(100vh-4rem)] sticky top-16 select-none">
      {/* Navigation list */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2">
          <p className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase">
            Menu Operasional
          </p>
        </div>

        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left font-medium transition-all group ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/20'
                  : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <Icon
                  className={`w-4 h-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-500 group-hover:text-blue-600'
                  }`}
                />
                <span className="text-sm truncate">{item.label}</span>
              </div>

              {item.badge && (
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? 'bg-white/20 text-white' : item.badgeColor || 'bg-slate-100 text-slate-700'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Role Notice Card at Bottom */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70">
        <div className="p-2.5 rounded-xl bg-white border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Hak Akses Aktif
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-medium bg-blue-50 text-blue-700">
              @{currentUser.username}
            </span>
          </div>
          <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
            {currentUser.name}
          </p>
          <p className="text-[11px] text-slate-500 line-clamp-1">
            {currentUser.actorLabel || currentUser.roleTitle}
          </p>
          {currentUser.subcontractorName && (
            <p className="text-[10px] font-medium text-emerald-700 mt-1 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200 truncate">
              {currentUser.subcontractorName}
            </p>
          )}

          <button
            onClick={logout}
            className="w-full mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-center space-x-1.5 text-slate-500 hover:text-rose-600 text-xs font-semibold py-1 rounded-lg hover:bg-rose-50 transition"
            title="Keluar dari sesi akun dan buka halaman login"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Keluar (Logout)</span>
          </button>
        </div>

        <div className="mt-2 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            Copyright © PT Sucofindo Cabang Palembang
          </p>
        </div>
      </div>
    </aside>
  );
};
