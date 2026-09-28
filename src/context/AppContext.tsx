import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  Project,
  WbsNode,
  ProgressLog,
  TimesheetEntry,
  DailyTask,
  MessageComment,
  Subcontractor,
  SCurveDataPoint,
  DailyTaskStatus,
} from '../types';
import {
  INITIAL_PROJECTS,
  INITIAL_PROJECT,
  INITIAL_USERS,
  INITIAL_SUBCONTRACTORS,
  INITIAL_WBS_NODES,
  INITIAL_PROGRESS_LOGS,
  INITIAL_TIMESHEETS,
  INITIAL_DAILY_TASKS,
  INITIAL_MESSAGES,
} from '../data/mockInitialData';
import {
  calculateRollup,
  reindexWbsCodes,
  generateSCurveData,
} from '../utils/wbsLogic';
import { generateStandardWbsForProject } from '../data/standardWbsTemplate';

export interface TimerState {
  isRunning: boolean;
  isPaused: boolean;
  seconds: number;
  wbsId: string;
  wbsWorkName: string;
  description: string;
}

interface AppContextType {
  currentUser: User;
  users: User[];
  projects: Project[];
  activeProjectId: string;
  project: Project;
  switchProject: (projectId: string) => void;
  // SPK Project Management
  addProject: (projectData: {
    code: string;
    spkNumber: string;
    name: string;
    fieldArea: string;
    location: string;
    contractValue: number;
    startDate: string;
    finishDate: string;
    subcontractor?: string;
    picName?: string;
    scopeType?: 'TERESTRIS' | 'DRONE_LIDAR' | 'FOTOGRAMETRI' | 'MULTI_DISIPLIN';
    autoGenerateWbs?: boolean;
  }) => string;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  resetProjectToStandardWbs: (projectId: string) => void;
  wbsNodes: WbsNode[];
  allWbsNodes: WbsNode[];
  progressLogs: ProgressLog[];
  timesheets: TimesheetEntry[];
  dailyTasks: DailyTask[];
  messages: MessageComment[];
  subcontractors: Subcontractor[];
  scurveData: SCurveDataPoint[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  // Role & User Switching
  switchUser: (userId: string) => void;
  loginWithCredentials: (username: string, password: string) => { success: boolean; message?: string };
  // WBS Actions
  addWbsNode: (nodeData: {
    parentId: string | null;
    workName: string;
    weight: number;
    startPlan: string;
    finishPlan: string;
    subcontractorId?: string;
    volumePlan?: number;
    volumeUnit?: string;
  }) => void;
  updateWbsNode: (id: string, updates: Partial<WbsNode>) => void;
  batchUpdateWbsDates: (
    targetProjectId: string,
    updates: Array<{ id: string; startPlan: string; finishPlan: string }>
  ) => void;
  deleteWbsNode: (id: string) => void;
  setBaseline: () => void;
  // Progress Input & Roll-up
  submitProgress: (params: {
    wbsId: string;
    progressActual: number;
    volumeSubmitted?: number;
    notes: string;
  }) => void;
  // Timesheet
  addTimesheet: (params: {
    wbsId: string;
    date: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    description: string;
  }) => void;
  approveTimesheet: (id: string) => void;
  rejectTimesheet: (id: string, reason: string) => void;
  batchApproveTimesheets: (ids: string[]) => void;
  // Daily Tasks
  addDailyTask: (task: Omit<DailyTask, 'id' | 'createdAt'>) => void;
  updateDailyTaskStatus: (id: string, status: DailyTaskStatus) => void;
  deleteDailyTask: (id: string) => void;
  // Message Board
  postMessage: (content: string, wbsId?: string | null, attachmentName?: string) => void;
  // Timer Widget
  timerState: TimerState;
  startTimer: (wbsId: string, wbsWorkName: string, description?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  stopTimerAndSave: () => void;
  discardTimer: () => void;
  // Notification Toast
  toastMessage: string | null;
  setToast: (msg: string | null) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_VERSION = 'v6_26_spk_kjsb_subkhi_syahrial_database';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check version and clear old stale building data if needed
  const isUpToDate = typeof window !== 'undefined' && localStorage.getItem('optiwbs_version') === STORAGE_VERSION;
  if (typeof window !== 'undefined' && !isUpToDate) {
    try {
      localStorage.removeItem('optiwbs_project');
      localStorage.removeItem('optiwbs_projects');
      localStorage.removeItem('optiwbs_wbs');
      localStorage.removeItem('optiwbs_logs');
      localStorage.removeItem('optiwbs_timesheets');
      localStorage.removeItem('optiwbs_tasks');
      localStorage.removeItem('optiwbs_messages');
      localStorage.removeItem('optiwbs_user');
      localStorage.setItem('optiwbs_version', STORAGE_VERSION);
    } catch {
      // ignore
    }
  }

  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem('optiwbs_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        const matched = INITIAL_USERS.find(
          (u) => u.id === parsed.id || u.username === parsed.username
        );
        if (matched) return matched;
      } catch {
        return INITIAL_USERS[0]; // Super Admin
      }
    }
    return INITIAL_USERS[0]; // Super Admin default
  });

  const [users] = useState<User[]>(INITIAL_USERS);
  const [subcontractors] = useState<Subcontractor[]>(INITIAL_SUBCONTRACTORS);

  // 10 Concurrent SPKs
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = localStorage.getItem('optiwbs_projects');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length >= 10) return parsed;
      } catch {
        return INITIAL_PROJECTS;
      }
    }
    return INITIAL_PROJECTS;
  });

  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    const saved = localStorage.getItem('optiwbs_active_project_id');
    if (saved && INITIAL_PROJECTS.some((p) => p.id === saved)) {
      return saved;
    }
    return 'spk-001';
  });

  const project: Project = projects.find((p) => p.id === activeProjectId) || projects[0] || INITIAL_PROJECT;

  // Master WBS nodes for all projects
  const [allWbsNodes, setAllWbsNodes] = useState<WbsNode[]>(() => {
    const saved = localStorage.getItem('optiwbs_wbs');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        return calculateRollup(parsed);
      } catch {
        return calculateRollup(INITIAL_WBS_NODES);
      }
    }
    return calculateRollup(INITIAL_WBS_NODES);
  });

  // Current active project WBS
  const wbsNodes = allWbsNodes.filter((n) => n.projectId === activeProjectId);

  const [progressLogs, setProgressLogs] = useState<ProgressLog[]>(() => {
    const saved = localStorage.getItem('optiwbs_logs');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_PROGRESS_LOGS; }
    }
    return INITIAL_PROGRESS_LOGS;
  });

  const [timesheets, setTimesheets] = useState<TimesheetEntry[]>(() => {
    const saved = localStorage.getItem('optiwbs_timesheets');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_TIMESHEETS; }
    }
    return INITIAL_TIMESHEETS;
  });

  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>(() => {
    const saved = localStorage.getItem('optiwbs_tasks');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_DAILY_TASKS; }
    }
    return INITIAL_DAILY_TASKS;
  });

  const [messages, setMessages] = useState<MessageComment[]>(() => {
    const saved = localStorage.getItem('optiwbs_messages');
    if (saved) {
      try { return JSON.parse(saved); } catch { return INITIAL_MESSAGES; }
    }
    return INITIAL_MESSAGES;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Floating Timer state
  const [timerState, setTimerState] = useState<TimerState>({
    isRunning: false,
    isPaused: false,
    seconds: 0,
    wbsId: '',
    wbsWorkName: '',
    description: '',
  });

  // Timer interval
  useEffect(() => {
    let interval: any = null;
    if (timerState.isRunning && !timerState.isPaused) {
      interval = setInterval(() => {
        setTimerState((prev) => ({ ...prev, seconds: prev.seconds + 1 }));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerState.isRunning, timerState.isPaused]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('optiwbs_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('optiwbs_projects', JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem('optiwbs_active_project_id', activeProjectId);
  }, [activeProjectId]);

  useEffect(() => {
    localStorage.setItem('optiwbs_wbs', JSON.stringify(allWbsNodes));
  }, [allWbsNodes]);

  useEffect(() => {
    localStorage.setItem('optiwbs_logs', JSON.stringify(progressLogs));
  }, [progressLogs]);

  useEffect(() => {
    localStorage.setItem('optiwbs_timesheets', JSON.stringify(timesheets));
  }, [timesheets]);

  useEffect(() => {
    localStorage.setItem('optiwbs_tasks', JSON.stringify(dailyTasks));
  }, [dailyTasks]);

  useEffect(() => {
    localStorage.setItem('optiwbs_messages', JSON.stringify(messages));
  }, [messages]);

  // Helper toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Switch User / Role
  const switchUser = (userId: string) => {
    const found = users.find((u) => u.id === userId);
    if (found) {
      setCurrentUser(found);
      try {
        localStorage.setItem('optiwbs_user', JSON.stringify(found));
      } catch {
        // ignore
      }
      showToast(`Beralih ke akun: ${found.actorLabel || found.name} (${found.roleTitle})`);
      if (found.actorType === 'SURVEYOR' || found.actorType === 'DRAFTER') {
        setActiveTab('timesheet');
      } else if (found.actorType === 'KOORDINATOR_SUBKONTRAKTOR') {
        setActiveTab('progress_input');
      } else if (found.actorType === 'KOORDINATOR_SURVEY') {
        setActiveTab('wbs');
      } else if (found.actorType === 'KOORDINATOR_ADMINISTRASI') {
        setActiveTab('reports');
      } else if (found.actorType === 'KOORDINATOR_DRAFTER') {
        setActiveTab('tasks');
      } else if (found.actorType === 'SUPER_ADMIN') {
        setActiveTab('portfolio');
      } else if (found.role === 'SUBCONTRACTOR') {
        setActiveTab('progress_input');
      } else if (found.role === 'STAFF') {
        setActiveTab('timesheet');
      }
    }
  };

  // Login with Username & Password credentials
  const loginWithCredentials = (
    username: string,
    password: string
  ): { success: boolean; message?: string } => {
    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanUsername) {
      return { success: false, message: 'Silakan masukkan username atau email.' };
    }
    if (!cleanPassword) {
      return { success: false, message: 'Silakan masukkan password akun.' };
    }

    const userAliasMap: Record<string, string> = {
      admin: 'usr-admin',
      superadmin: 'usr-admin',
      'super admin': 'usr-admin',
      yogi: 'usr-koord-survey',
      'yogi armansyah': 'usr-koord-survey',
      'koordinator.survey': 'usr-koord-survey',
      'koordinator survey': 'usr-koord-survey',
      ivan: 'usr-koord-subkon',
      'koordinator.subkon': 'usr-koord-subkon',
      'koordinator subkontraktor': 'usr-koord-subkon',
      ian: 'usr-surveyor',
      surveyor: 'usr-surveyor',
      yuswa: 'usr-koord-admin',
      'yuswa affandi': 'usr-koord-admin',
      'koordinator.admin': 'usr-koord-admin',
      'koordinator administrasi': 'usr-koord-admin',
      hari: 'usr-koord-drafter',
      'hari susmoyo': 'usr-koord-drafter',
      'koordinator.drafter': 'usr-koord-drafter',
      'koordinator drafter': 'usr-koord-drafter',
      annisa: 'usr-drafter-1',
      'drafter.annisa': 'usr-drafter-1',
      bayu: 'usr-drafter-2',
      'drafter.bayu': 'usr-drafter-2',
      drafter: 'usr-drafter-1',
      subkhi: 'usr-koord-subkon',
      'kjsb subkhi': 'usr-koord-subkon',
      syahrial: 'usr-koord-drafter',
      'kjsb syahrial': 'usr-koord-drafter',
    };

    const targetUserId = userAliasMap[cleanUsername];

    const found = users.find(
      (u) =>
        (targetUserId && u.id === targetUserId) ||
        u.username.toLowerCase() === cleanUsername ||
        u.name.toLowerCase() === cleanUsername ||
        u.email.toLowerCase() === cleanUsername
    );

    if (!found) {
      return {
        success: false,
        message: `Username atau email "${username}" tidak terdaftar dalam sistem.`,
      };
    }

    if (found.password && found.password !== cleanPassword) {
      return {
        success: false,
        message: 'Password yang Anda masukkan salah. Silakan coba lagi.',
      };
    }

    setCurrentUser(found);
    try {
      localStorage.setItem('optiwbs_user', JSON.stringify(found));
    } catch {
      // ignore
    }

    showToast(`Login berhasil! Selamat datang, ${found.name} (${found.actorLabel || found.roleTitle})`);

    // Direct to corresponding functional module
    if (found.actorType === 'SURVEYOR' || found.actorType === 'DRAFTER') {
      setActiveTab('timesheet');
    } else if (found.actorType === 'KOORDINATOR_SUBKONTRAKTOR') {
      setActiveTab('progress_input');
    } else if (found.actorType === 'KOORDINATOR_SURVEY') {
      setActiveTab('wbs');
    } else if (found.actorType === 'KOORDINATOR_ADMINISTRASI') {
      setActiveTab('reports');
    } else if (found.actorType === 'KOORDINATOR_DRAFTER') {
      setActiveTab('tasks');
    } else if (found.actorType === 'SUPER_ADMIN') {
      setActiveTab('portfolio');
    }

    return { success: true };
  };

  // Switch SPK Project
  const switchProject = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (target) {
      setActiveProjectId(projectId);
      showToast(`Beralih ke ${target.code} — ${target.name}`);
    }
  };

  // Add new SPK
  const addProject = (projectData: {
    code: string;
    spkNumber: string;
    name: string;
    fieldArea: string;
    location: string;
    contractValue: number;
    startDate: string;
    finishDate: string;
    subcontractor?: string;
    picName?: string;
    scopeType?: 'TERESTRIS' | 'DRONE_LIDAR' | 'FOTOGRAMETRI' | 'MULTI_DISIPLIN';
    autoGenerateWbs?: boolean;
  }): string => {
    const newId = `spk-${Date.now()}`;
    const autoGen = projectData.autoGenerateWbs !== false;

    // Generate Standard WBS Nodes if requested (standard SOW scope)
    let newProjectWbs: WbsNode[] = [];
    if (autoGen) {
      newProjectWbs = generateStandardWbsForProject(
        newId,
        projectData.startDate,
        projectData.finishDate,
        {
          subcontractorName: projectData.subcontractor,
          defaultPic: projectData.picName,
        }
      );
    }

    const newProject: Project = {
      id: newId,
      code: projectData.code,
      spkNumber: projectData.spkNumber || projectData.code,
      name: projectData.name,
      client: 'PT Pertamina EP Zona 4',
      contractType: 'Call of Order (COO)',
      subcontractor: projectData.subcontractor || 'KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN',
      fieldArea: projectData.fieldArea,
      location: projectData.location,
      contractValue: Number(projectData.contractValue) || 0,
      startDate: projectData.startDate,
      finishDate: projectData.finishDate,
      status: 'ACTIVE',
      targetProgressPlan: 0,
      currentProgressActual: 0,
      totalTasks: newProjectWbs.length,
      baselineLocked: false,
      healthStatus: 'ON_TRACK',
      picName: projectData.picName || 'Ian (Surveyor)',
      scopeType: projectData.scopeType || 'TERESTRIS',
    };

    setProjects((prev) => [newProject, ...prev]);

    if (newProjectWbs.length > 0) {
      const rolledUp = calculateRollup(newProjectWbs);
      setAllWbsNodes((prev) => [...prev, ...rolledUp]);
    }

    setActiveProjectId(newId);
    showToast(`SPK Baru "${newProject.code}" berhasil ditambahkan dengan ${newProjectWbs.length} item WBS standar.`);
    return newId;
  };

  // Update existing SPK details (range waktu, nilai SPK, lokasi, nama, dll)
  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
    showToast(`Informasi SPK berhasil diperbarui.`);
  };

  // Delete SPK
  const deleteProject = (id: string) => {
    if (projects.length <= 1) {
      showToast('Tidak dapat menghapus SPK terakhir.');
      return;
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
    setAllWbsNodes((prev) => prev.filter((n) => n.projectId !== id));
    setProgressLogs((prev) => prev.filter((l) => l.projectId !== id));
    setTimesheets((prev) => prev.filter((t) => t.projectId !== id));
    setDailyTasks((prev) => prev.filter((t) => t.projectId !== id));
    setMessages((prev) => prev.filter((m) => m.projectId !== id));

    const remaining = projects.filter((p) => p.id !== id);
    if (activeProjectId === id && remaining.length > 0) {
      setActiveProjectId(remaining[0].id);
    }
    showToast(`SPK telah dihapus.`);
  };

  // Reset or apply standard WBS to an SPK
  const resetProjectToStandardWbs = (projectId: string) => {
    const target = projects.find((p) => p.id === projectId);
    if (!target) return;

    const stdNodes = generateStandardWbsForProject(
      projectId,
      target.startDate,
      target.finishDate,
      {
        subcontractorName: target.subcontractor,
        defaultPic: target.picName,
      }
    );

    const rolledUp = calculateRollup(stdNodes);
    const otherNodes = allWbsNodes.filter((n) => n.projectId !== projectId);
    const newAll = [...otherNodes, ...rolledUp];
    setAllWbsNodes(newAll);
    recalculateProjectOverall(projectId, newAll);
    showToast(`Struktur WBS standar Pertamina EP (53 item) berhasil diterapkan pada ${target.code}.`);
  };

  // Update Project stats whenever WBS rolls up
  const recalculateProjectOverall = (targetProjectId: string, updatedAllWbs: WbsNode[]) => {
    const projectWbs = updatedAllWbs.filter((n) => n.projectId === targetProjectId);
    const rootNodes = projectWbs.filter((n) => !n.parentId);
    const totalRootWeight = rootNodes.reduce((sum, n) => sum + (n.weight || 0), 0) || 1;
    const overallActual = rootNodes.reduce((sum, n) => sum + n.progressActual * n.weight, 0) / totalRootWeight;
    const overallPlan = rootNodes.reduce((sum, n) => sum + n.progressPlan * n.weight, 0) / totalRootWeight;

    setProjects((prev) =>
      prev.map((p) =>
        p.id === targetProjectId
          ? {
              ...p,
              currentProgressActual: Number(overallActual.toFixed(1)),
              targetProgressPlan: Number(overallPlan.toFixed(1)),
              totalTasks: projectWbs.length,
              healthStatus:
                overallActual >= 100
                  ? 'COMPLETED'
                  : overallPlan - overallActual > 15
                  ? 'CRITICAL'
                  : overallPlan - overallActual > 5
                  ? 'DELAYED'
                  : 'ON_TRACK',
            }
          : p
      )
    );
  };

  // Add WBS Node
  const addWbsNode = (nodeData: {
    parentId: string | null;
    workName: string;
    weight: number;
    startPlan: string;
    finishPlan: string;
    subcontractorId?: string;
    volumePlan?: number;
    volumeUnit?: string;
  }) => {
    const start = new Date(nodeData.startPlan);
    const finish = new Date(nodeData.finishPlan);
    const diffDays = Math.max(1, Math.round((finish.getTime() - start.getTime()) / (1000 * 3600 * 24)));

    const sub = subcontractors.find((s) => s.id === nodeData.subcontractorId);

    const newNode: WbsNode = {
      id: `wbs-${Date.now()}`,
      projectId: activeProjectId,
      parentId: nodeData.parentId,
      wbsCode: '',
      workName: nodeData.workName,
      level: nodeData.parentId ? 1 : 0,
      order: 99,
      weight: Number(nodeData.weight) || 10,
      startPlan: nodeData.startPlan,
      finishPlan: nodeData.finishPlan,
      durationDays: diffDays,
      progressPlan: 0,
      progressActual: 0,
      status: 'NOT_STARTED',
      subcontractorId: nodeData.subcontractorId,
      subcontractorName: sub ? sub.name : undefined,
      picName: sub ? sub.contactPerson : undefined,
      volumePlan: nodeData.volumePlan,
      volumeUnit: nodeData.volumeUnit,
      volumeActual: 0,
      baselineLocked: false,
    };

    const currentProjectNodes = allWbsNodes.filter((n) => n.projectId === activeProjectId);
    const otherProjectNodes = allWbsNodes.filter((n) => n.projectId !== activeProjectId);

    const combined = [...currentProjectNodes, newNode];
    const indexed = reindexWbsCodes(combined);
    const rolledUp = calculateRollup(indexed);

    const newAllWbs = [...otherProjectNodes, ...rolledUp];
    setAllWbsNodes(newAllWbs);
    recalculateProjectOverall(activeProjectId, newAllWbs);
    showToast(`Pekerjaan WBS "${nodeData.workName}" berhasil ditambahkan ke ${project.code}.`);
  };

  // Update WBS Node
  const updateWbsNode = (id: string, updates: Partial<WbsNode>) => {
    const target = allWbsNodes.find((n) => n.id === id);
    const targetProjId = target ? target.projectId : activeProjectId;

    const currentProjectNodes = allWbsNodes.filter((n) => n.projectId === targetProjId);
    const otherProjectNodes = allWbsNodes.filter((n) => n.projectId !== targetProjId);

    const updated = currentProjectNodes.map((node) => {
      if (node.id === id) {
        const merged = { ...node, ...updates };
        if (updates.startPlan || updates.finishPlan) {
          const s = new Date(merged.startPlan).getTime();
          const f = new Date(merged.finishPlan).getTime();
          if (!isNaN(s) && !isNaN(f)) {
            merged.durationDays = Math.max(1, Math.round((f - s) / (1000 * 60 * 60 * 24)));
          }
        }
        return merged;
      }
      return node;
    });

    const indexed = reindexWbsCodes(updated);
    const rolledUp = calculateRollup(indexed);

    const newAllWbs = [...otherProjectNodes, ...rolledUp];
    setAllWbsNodes(newAllWbs);
    recalculateProjectOverall(targetProjId, newAllWbs);
    showToast('Rencana WBS berhasil diperbarui.');
  };

  // Batch update WBS dates
  const batchUpdateWbsDates = (
    targetProjectId: string,
    updates: Array<{ id: string; startPlan: string; finishPlan: string }>
  ) => {
    const updateMap = new Map<string, { startPlan: string; finishPlan: string }>();
    updates.forEach((u) => updateMap.set(u.id, u));

    const currentProjectNodes = allWbsNodes.filter((n) => n.projectId === targetProjectId);
    const otherProjectNodes = allWbsNodes.filter((n) => n.projectId !== targetProjectId);

    const updated = currentProjectNodes.map((node) => {
      const up = updateMap.get(node.id);
      if (up) {
        const s = new Date(up.startPlan).getTime();
        const f = new Date(up.finishPlan).getTime();
        const durationDays =
          !isNaN(s) && !isNaN(f)
            ? Math.max(1, Math.round((f - s) / (1000 * 60 * 60 * 24)))
            : node.durationDays;
        return {
          ...node,
          startPlan: up.startPlan,
          finishPlan: up.finishPlan,
          durationDays,
        };
      }
      return node;
    });

    const indexed = reindexWbsCodes(updated);
    const rolledUp = calculateRollup(indexed);
    const newAllWbs = [...otherProjectNodes, ...rolledUp];
    setAllWbsNodes(newAllWbs);
    recalculateProjectOverall(targetProjectId, newAllWbs);
    showToast(`${updates.length} jadwal rencana WBS berhasil diperbarui.`);
  };

  // Delete WBS Node
  const deleteWbsNode = (id: string) => {
    const target = allWbsNodes.find((n) => n.id === id);
    const targetProjId = target ? target.projectId : activeProjectId;

    const toDeleteIds = new Set<string>([id]);
    let added = true;
    while (added) {
      added = false;
      allWbsNodes.forEach((n) => {
        if (n.parentId && toDeleteIds.has(n.parentId) && !toDeleteIds.has(n.id)) {
          toDeleteIds.add(n.id);
          added = true;
        }
      });
    }

    const currentProjectNodes = allWbsNodes.filter((n) => n.projectId === targetProjId && !toDeleteIds.has(n.id));
    const otherProjectNodes = allWbsNodes.filter((n) => n.projectId !== targetProjId);

    const indexed = reindexWbsCodes(currentProjectNodes);
    const rolledUp = calculateRollup(indexed);

    const newAllWbs = [...otherProjectNodes, ...rolledUp];
    setAllWbsNodes(newAllWbs);
    recalculateProjectOverall(targetProjId, newAllWbs);
    showToast('Pekerjaan WBS telah dihapus.');
  };

  // Set Baseline
  const setBaseline = () => {
    const now = new Date().toISOString().split('T')[0];
    const newAllWbs = allWbsNodes.map((n) => {
      if (n.projectId === activeProjectId) {
        return {
          ...n,
          baselineLocked: true,
          baselineStart: n.startPlan,
          baselineFinish: n.finishPlan,
          baselineProgressPlan: n.progressPlan,
        };
      }
      return n;
    });

    setAllWbsNodes(newAllWbs);
    setProjects((prev) =>
      prev.map((p) =>
        p.id === activeProjectId
          ? {
              ...p,
              baselineLocked: true,
              baselineDate: now,
            }
          : p
      )
    );
    showToast(`Baseline jadwal ${project.code} telah dikunci (Set Baseline Sukses).`);
  };

  // Submit Progress & Trigger Roll-up
  const submitProgress = ({
    wbsId,
    progressActual,
    volumeSubmitted,
    notes,
  }: {
    wbsId: string;
    progressActual: number;
    volumeSubmitted?: number;
    notes: string;
  }) => {
    const targetNode = allWbsNodes.find((n) => n.id === wbsId);
    if (!targetNode) return;
    const targetProjId = targetNode.projectId;

    // 1. Create snapshot log
    const newLog: ProgressLog = {
      id: `log-${Date.now()}`,
      wbsId,
      wbsCode: targetNode.wbsCode,
      workName: targetNode.workName,
      projectId: targetProjId,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      snapshotDate: new Date().toISOString().split('T')[0],
      progressPlan: targetNode.progressPlan,
      progressActual,
      volumeSubmitted,
      notes,
      createdAt: new Date().toISOString(),
    };
    setProgressLogs((prev) => [newLog, ...prev]);

    // 2. Update node actual progress & volume
    const currentProjectNodes = allWbsNodes.filter((n) => n.projectId === targetProjId);
    const otherProjectNodes = allWbsNodes.filter((n) => n.projectId !== targetProjId);

    const updated = currentProjectNodes.map((n) => {
      if (n.id === wbsId) {
        const newVolume = volumeSubmitted !== undefined ? volumeSubmitted : n.volumeActual;
        return {
          ...n,
          progressActual: Math.min(100, Math.max(0, Number(progressActual))),
          volumeActual: newVolume,
        };
      }
      return n;
    });

    const rolledUp = calculateRollup(updated);
    const newAllWbs = [...otherProjectNodes, ...rolledUp];
    setAllWbsNodes(newAllWbs);
    recalculateProjectOverall(targetProjId, newAllWbs);

    showToast(`Progress WBS ${targetNode.wbsCode} diperbarui ke ${progressActual}%. Roll-up berhasil dihitung.`);
  };

  // Add Timesheet Entry
  const addTimesheet = (params: {
    wbsId: string;
    date: string;
    startTime: string;
    endTime: string;
    totalHours: number;
    description: string;
  }) => {
    const targetWbs = allWbsNodes.find((n) => n.id === params.wbsId);
    const isOvertime = params.totalHours > 8;

    const newEntry: TimesheetEntry = {
      id: `ts-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      subcontractorId: currentUser.subcontractorId,
      subcontractorName: currentUser.subcontractorName,
      wbsId: params.wbsId,
      wbsCode: targetWbs ? targetWbs.wbsCode : '-',
      wbsWorkName: targetWbs ? targetWbs.workName : 'Pekerjaan Umum',
      projectId: activeProjectId,
      date: params.date,
      startTime: params.startTime,
      endTime: params.endTime,
      totalHours: params.totalHours,
      isOvertime,
      workDescription: params.description,
      status: 'PENDING',
    };

    setTimesheets((prev) => [newEntry, ...prev]);
    showToast('Timesheet berhasil dicatat dan menunggu approval.');
  };

  const approveTimesheet = (id: string) => {
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'APPROVED',
              approvedById: currentUser.id,
              approvedByName: currentUser.name,
              approvalDate: new Date().toISOString(),
            }
          : t
      )
    );
    showToast('Timesheet telah disetujui (Approved).');
  };

  const rejectTimesheet = (id: string, reason: string) => {
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === id
          ? {
              ...t,
              status: 'REJECTED',
              rejectionReason: reason,
              approvedById: currentUser.id,
              approvedByName: currentUser.name,
              approvalDate: new Date().toISOString(),
            }
          : t
      )
    );
    showToast('Timesheet ditolak dengan catatan evaluasi.');
  };

  const batchApproveTimesheets = (ids: string[]) => {
    const idSet = new Set(ids);
    setTimesheets((prev) =>
      prev.map((t) =>
        idSet.has(t.id)
          ? {
              ...t,
              status: 'APPROVED',
              approvedById: currentUser.id,
              approvedByName: currentUser.name,
              approvalDate: new Date().toISOString(),
            }
          : t
      )
    );
    showToast(`${ids.length} timesheet berhasil di-approve sekaligus.`);
  };

  // Daily Tasks
  const addDailyTask = (taskData: Omit<DailyTask, 'id' | 'createdAt'>) => {
    const newTask: DailyTask = {
      ...taskData,
      id: `tsk-${Date.now()}`,
      projectId: activeProjectId,
      createdAt: new Date().toISOString().split('T')[0],
    };
    setDailyTasks((prev) => [newTask, ...prev]);
    showToast('Tugas operasional baru ditambahkan ke Kanban.');
  };

  const updateDailyTaskStatus = (id: string, status: DailyTaskStatus) => {
    setDailyTasks((prev) => prev.map((t) => (t.id === id ? { ...t, status } : t)));
  };

  const deleteDailyTask = (id: string) => {
    setDailyTasks((prev) => prev.filter((t) => t.id !== id));
    showToast('Tugas harian telah dihapus.');
  };

  // Message Board
  const postMessage = (content: string, wbsId: string | null = null, attachmentName?: string) => {
    const targetWbs = wbsId ? allWbsNodes.find((n) => n.id === wbsId) : null;

    const newMsg: MessageComment = {
      id: `msg-${Date.now()}`,
      projectId: activeProjectId,
      wbsId,
      wbsCode: targetWbs ? targetWbs.wbsCode : undefined,
      wbsWorkName: targetWbs ? targetWbs.workName : undefined,
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      userAvatar: currentUser.avatar,
      content,
      attachments: attachmentName
        ? [{ name: attachmentName, url: '#', size: '1.8 MB' }]
        : undefined,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, newMsg]);
    showToast('Pesan berhasil dikirim.');
  };

  // Timer Controls
  const startTimer = (wbsId: string, wbsWorkName: string, description: string = '') => {
    setTimerState({
      isRunning: true,
      isPaused: false,
      seconds: 0,
      wbsId,
      wbsWorkName,
      description,
    });
    showToast(`Timer dimulai untuk: ${wbsWorkName}`);
  };

  const pauseTimer = () => {
    setTimerState((prev) => ({ ...prev, isPaused: true }));
  };

  const resumeTimer = () => {
    setTimerState((prev) => ({ ...prev, isPaused: false }));
  };

  const stopTimerAndSave = () => {
    if (timerState.seconds < 60) {
      showToast('Durasi kurang dari 1 menit tidak dapat disimpan.');
      setTimerState({
        isRunning: false,
        isPaused: false,
        seconds: 0,
        wbsId: '',
        wbsWorkName: '',
        description: '',
      });
      return;
    }

    const hours = Number((timerState.seconds / 3600).toFixed(2));
    const now = new Date();
    const startTime = new Date(now.getTime() - timerState.seconds * 1000);
    const startStr = startTime.toTimeString().slice(0, 5);
    const endStr = now.toTimeString().slice(0, 5);

    addTimesheet({
      wbsId: timerState.wbsId,
      date: now.toISOString().split('T')[0],
      startTime: startStr,
      endTime: endStr,
      totalHours: hours,
      description: timerState.description || `Pencatatan waktu live via timer: ${timerState.wbsWorkName}`,
    });

    setTimerState({
      isRunning: false,
      isPaused: false,
      seconds: 0,
      wbsId: '',
      wbsWorkName: '',
      description: '',
    });
  };

  const discardTimer = () => {
    setTimerState({
      isRunning: false,
      isPaused: false,
      seconds: 0,
      wbsId: '',
      wbsWorkName: '',
      description: '',
    });
    showToast('Pencatatan timer dibatalkan.');
  };

  // Dynamic S-Curve based on current active project progress
  const scurveData = generateSCurveData(
    project.startDate,
    project.finishDate,
    project.currentProgressActual,
    project.targetProgressPlan
  );

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        projects,
        activeProjectId,
        project,
        switchProject,
        addProject,
        updateProject,
        deleteProject,
        resetProjectToStandardWbs,
        wbsNodes,
        allWbsNodes,
        progressLogs,
        timesheets,
        dailyTasks,
        messages,
        subcontractors,
        scurveData,
        activeTab,
        setActiveTab,
        switchUser,
        loginWithCredentials,
        addWbsNode,
        updateWbsNode,
        batchUpdateWbsDates,
        deleteWbsNode,
        setBaseline,
        submitProgress,
        addTimesheet,
        approveTimesheet,
        rejectTimesheet,
        batchApproveTimesheets,
        addDailyTask,
        updateDailyTaskStatus,
        deleteDailyTask,
        postMessage,
        timerState,
        startTimer,
        pauseTimer,
        resumeTimer,
        stopTimerAndSave,
        discardTimer,
        toastMessage,
        setToast: setToastMessage,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const useAppContext = useApp;
