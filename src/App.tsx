/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { FloatingTimer } from './components/FloatingTimer';
import { RoleSwitcherModal } from './components/RoleSwitcherModal';
import { LoginCredentialModal } from './components/LoginCredentialModal';
import { LoginView } from './components/LoginView';
import { SpkPortfolioView } from './components/SpkPortfolioView';
import { DashboardView } from './components/DashboardView';
import { WbsGanttView } from './components/WbsGanttView';
import { ProgressInputModal } from './components/ProgressInputModal';
import { TimesheetView } from './components/TimesheetView';
import { TaskListView } from './components/TaskListView';
import { MessageBoardView } from './components/MessageBoardView';
import { ReportsView } from './components/ReportsView';
import { SubcontractorView } from './components/SubcontractorView';
import {
  LayoutDashboard,
  GitGraph,
  PenTool,
  Clock,
  CheckSquare,
  MessageSquare,
  FileSpreadsheet,
  Users2,
  CheckCircle2,
  Briefcase,
  LogIn,
} from 'lucide-react';

const MainLayout: React.FC = () => {
  const { activeTab, setActiveTab, toastMessage, currentUser } = useApp();
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isCredentialModalOpen, setIsCredentialModalOpen] = useState(false);

  const mobileTabs = [
    { id: 'portfolio', label: 'Monitoring SPK', icon: Briefcase },
    { id: 'wbs', label: 'WBS & Gantt', icon: GitGraph },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'progress_input', label: 'Input Progres', icon: PenTool },
    { id: 'timesheet', label: 'Timesheet', icon: Clock },
    { id: 'tasks', label: 'Tugas', icon: CheckSquare },
    { id: 'messages', label: 'Diskusi', icon: MessageSquare },
    { id: 'reports', label: 'Laporan', icon: FileSpreadsheet },
    { id: 'subcontractors', label: 'Subkon', icon: Users2 },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onOpenRoleModal={() => setIsRoleModalOpen(true)}
        onOpenCredentialModal={() => setIsCredentialModalOpen(true)}
      />

      {/* Mobile Horizontal Navigation Tabs (Visible only on md:hidden) */}
      <div className="md:hidden bg-white border-b border-slate-200 overflow-x-auto no-scrollbar px-3 py-2 flex items-center space-x-2 shrink-0 sticky top-16 z-20 shadow-2xs">
        {mobileTabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                isActive
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Body: Sidebar + Main Dynamic View (Full 16:9 Widescreen / Laptop Layout) */}
      <div className="flex-1 flex w-full">
        <div className="no-print hidden md:block">
          <Sidebar />
        </div>

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 w-full overflow-x-hidden">
          {activeTab === 'portfolio' && <SpkPortfolioView />}
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'wbs' && <WbsGanttView />}
          {activeTab === 'progress_input' && <ProgressInputModal />}
          {activeTab === 'timesheet' && <TimesheetView />}
          {activeTab === 'tasks' && <TaskListView />}
          {activeTab === 'messages' && <MessageBoardView />}
          {activeTab === 'reports' && <ReportsView />}
          {activeTab === 'subcontractors' && <SubcontractorView />}
          {activeTab === 'login' && <LoginView />}
        </main>
      </div>

      {/* Floating Timer Widget */}
      <FloatingTimer />

      {/* Role Switcher & Hierarchy Modal */}
      <RoleSwitcherModal
        isOpen={isRoleModalOpen}
        onClose={() => setIsRoleModalOpen(false)}
      />

      {/* 9 User Accounts Credential Modal - Hanya saat login di akun Super Admin */}
      {currentUser.role === 'SUPER_ADMIN' && (
        <LoginCredentialModal
          isOpen={isCredentialModalOpen}
          onClose={() => setIsCredentialModalOpen(false)}
        />
      )}

      {/* App Footer Credit */}
      <footer className="no-print mt-auto py-3 border-t border-slate-200/80 bg-white text-center text-xs text-slate-400">
        <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-1 text-[11px]">
          <span>Portal Pengawasan SPK & WBS Topografi</span>
          <span className="font-semibold text-slate-600">Copyright © PT Sucofindo Cabang Palembang</span>
        </div>
      </footer>

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-3 duration-200 no-print">
          <div className="flex items-center space-x-2.5 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 text-xs">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="font-medium">{toastMessage}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const AppContent: React.FC = () => {
  const { isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return <MainLayout />;
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
