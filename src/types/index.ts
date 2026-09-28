export type UserRole =
  | 'SUPER_ADMIN'
  | 'PROJECT_MANAGER'
  | 'SITE_SUPERVISOR'
  | 'SUBCONTRACTOR'
  | 'STAFF'
  | 'VIEWER';

export type ActorType =
  | 'SUPER_ADMIN'
  | 'KOORDINATOR_SURVEY'
  | 'KOORDINATOR_SUBKONTRAKTOR'
  | 'SURVEYOR'
  | 'KOORDINATOR_ADMINISTRASI'
  | 'KOORDINATOR_DRAFTER'
  | 'DRAFTER'
  | 'PROJECT_MANAGER'
  | 'VIEWER';

export interface User {
  id: string;
  name: string;
  username: string;
  password?: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  actorType?: ActorType;
  actorLabel?: string;
  avatar: string;
  department?: string;
  phone?: string;
  subcontractorId?: string;
  subcontractorName?: string;
  projectAccess: string[];
}

export type TaskStatus =
  | 'NOT_STARTED'
  | 'ON_PROGRESS'
  | 'COMPLETED'
  | 'DELAYED'
  | 'ON_HOLD';

export interface WbsDependency {
  predecessorId: string;
  type: 'FS' | 'SS' | 'FF' | 'SF';
  lagDays: number;
}

export interface WbsNode {
  id: string;
  projectId: string;
  parentId: string | null;
  wbsCode: string; // e.g. "1", "1.1", "1.1.1", or "M1"
  workName: string;
  level: number; // 0 for Project/Phase, 1 for Sub-phase, 2 for Task, 3 for Subtask
  order: number;
  weight: number; // Bobot percentage %
  startPlan: string; // YYYY-MM-DD
  finishPlan: string; // YYYY-MM-DD
  durationDays: number;
  startActual?: string;
  finishActual?: string;
  progressPlan: number; // 0 - 100%
  progressActual: number; // 0 - 100%
  status: TaskStatus;
  subcontractorId?: string;
  subcontractorName?: string;
  picName?: string;
  volumePlan?: number;
  volumeUnit?: string;
  volumeActual?: number;
  dependencies?: WbsDependency[];
  baselineLocked: boolean;
  baselineStart?: string;
  baselineFinish?: string;
  baselineProgressPlan?: number;
  children?: WbsNode[];
  // Enhanced fields for SPK operational monitoring & Gantt
  isCritical?: boolean; // Jalur Kritis
  isMilestone?: boolean; // Milestone M1 - M5
  floatDays?: number; // Total float / slack days
  delayReason?: string; // Reason / root cause of delay
  delayImpactDays?: number;
  riskId?: string; // e.g. "R-014"
  manpower?: string; // e.g. "1 Geodetic Eng, 2 Surveyor, 4 Helper"
  equipment?: string; // e.g. "2 Unit GPS Geodetik RTK, 1 Total Station"
  notes?: string;
  sowReference?: string; // Ref SOW Lampiran A.1 (e.g. Ps. 2.1, 2.1.1.a, 2.2.4.3.3)
  category?: 'Persiapan' | 'Alat Ukur' | 'Drone' | 'Administrasi' | string;
  picPelaksana?: string; // Pelaksana operasional: KJSB, KJSB/PM, KJSB & PIHAK I
}

export interface ProgressLog {
  id: string;
  wbsId: string;
  wbsCode: string;
  workName: string;
  projectId: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  snapshotDate: string; // YYYY-MM-DD
  progressPlan: number;
  progressActual: number;
  volumeSubmitted?: number;
  notes: string;
  attachments?: string[];
  createdAt: string;
}

export type TimesheetStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface TimesheetEntry {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  subcontractorId?: string;
  subcontractorName?: string;
  wbsId: string;
  wbsCode: string;
  wbsWorkName: string;
  projectId: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  totalHours: number;
  isOvertime: boolean; // > 8 jam per hari
  workDescription: string;
  status: TimesheetStatus;
  approvedById?: string;
  approvedByName?: string;
  approvalDate?: string;
  rejectionReason?: string;
}

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type DailyTaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface DailyTask {
  id: string;
  projectId: string;
  wbsId?: string;
  wbsCode?: string;
  wbsWorkName?: string;
  assigneeId?: string;
  assigneeName: string;
  subcontractorId?: string;
  title: string;
  description?: string;
  deadline: string; // YYYY-MM-DD
  priority: TaskPriority;
  status: DailyTaskStatus;
  createdAt: string;
}

export interface MessageComment {
  id: string;
  projectId: string;
  wbsId?: string | null; // Polymorphic: null = General Project discussion, string = Specific WBS task
  wbsCode?: string;
  wbsWorkName?: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  userAvatar: string;
  content: string;
  attachments?: { name: string; url: string; size: string }[];
  mentions?: string[];
  createdAt: string;
}

export interface Project {
  id: string;
  code: string;
  spkNumber: string;
  contractNumber?: string; // No. Perjanjian e.g. "4710001475"
  name: string;
  client: string;
  contractType?: string; // e.g. "Call of Order (COO)"
  subcontractor?: string; // e.g. "KJSB SUBKHI ABDUL HAKIM AT-TIGHOLY & REKAN" / "KJSB SYAHRIAL & REKAN"
  fieldArea?: string; // e.g. "Prabumulih Field"
  wellName?: string; // e.g. "TLJ-A51"
  location: string;
  workScopeSummary?: string;
  contractValue: number; // in IDR
  startDate: string;
  finishDate: string;
  status: 'ACTIVE' | 'PLANNING' | 'COMPLETED' | 'ON_HOLD';
  targetProgressPlan: number;
  currentProgressActual: number;
  totalTasks: number;
  baselineLocked: boolean;
  baselineDate?: string;
  healthStatus?: 'ON_TRACK' | 'DELAYED' | 'CRITICAL' | 'COMPLETED';
  picName?: string;
  scopeType?: 'TERESTRIS' | 'DRONE_LIDAR' | 'FOTOGRAMETRI' | 'MULTI_DISIPLIN';
  coordinates?: { surfaceX?: number; surfaceY?: number; datum?: string };
}

export interface Subcontractor {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  specialty: string;
  activeTasksCount: number;
  completedTasksCount: number;
  averageProgress: number;
  status: 'ACTIVE' | 'INACTIVE';
}

export interface SCurveDataPoint {
  date: string;
  weekLabel: string;
  progressPlanCumulative: number;
  progressActualCumulative: number | null;
  deviation: number | null;
}
