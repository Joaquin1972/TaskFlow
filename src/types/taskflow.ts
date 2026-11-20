export type Priority = 'high' | 'normal' | 'low';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type NavView = 'today' | 'upcoming' | 'inbox' | 'projects' | 'review';

export type StatusFilter = 'all' | 'active' | 'completed';

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  notes: string;
  completed: boolean;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null; // YYYY-MM-DD local date
  projectId: string | null; // null => Inbox
  estimateMinutes: number | null;
  subtasks: Subtask[];
  createdAt: string; // ISO string
  completedAt: string | null; // ISO string
  order: number;
}

export type ProjectAccent = 'blue' | 'indigo' | 'emerald' | 'slate';

export interface Project {
  id: string;
  name: string;
  description: string;
  accent: ProjectAccent;
  createdAt: string;
}

export interface UserPreferences {
  userName: string;
  userRole: string;
  density: 'comfortable' | 'compact';
  showCompleted: boolean;
  sidebarCollapsed: boolean;
}

export interface ReflectionEntry {
  weekKey: string;
  wins: string;
  focusNextWeek: string;
  updatedAt: string;
}
