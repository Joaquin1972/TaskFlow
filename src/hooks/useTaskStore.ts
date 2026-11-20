import { useCallback, useEffect, useState } from 'react';
import {
  createInitialProjects,
  createInitialReflection,
  createInitialTasks,
  DEFAULT_PREFERENCES,
} from '../data/initialData';
import {
  Priority,
  Project,
  ProjectAccent,
  ReflectionEntry,
  Subtask,
  Task,
  TaskStatus,
  UserPreferences,
} from '../types/taskflow';
import { getWeekKey } from '../utils/dates';

const STORAGE_KEYS = {
  tasks: 'taskflow_narrative_tasks_v1',
  projects: 'taskflow_narrative_projects_v1',
  prefs: 'taskflow_narrative_prefs_v1',
  reflection: 'taskflow_narrative_reflection_v1',
};

function loadFromStorage<T>(key: string, fallback: () => T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback();
    return JSON.parse(raw) as T;
  } catch {
    return fallback();
  }
}

export function useTaskStore() {
  const [tasks, setTasks] = useState<Task[]>(() =>
    loadFromStorage(STORAGE_KEYS.tasks, createInitialTasks)
  );
  const [projects, setProjects] = useState<Project[]>(() =>
    loadFromStorage(STORAGE_KEYS.projects, createInitialProjects)
  );
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    loadFromStorage(STORAGE_KEYS.prefs, () => DEFAULT_PREFERENCES)
  );
  const [reflection, setReflection] = useState<ReflectionEntry>(() =>
    loadFromStorage(STORAGE_KEYS.reflection, createInitialReflection)
  );

  const [lastDeletedTask, setLastDeletedTask] = useState<Task | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.tasks, JSON.stringify(tasks));
    } catch {
      // Ignore storage quota errors
    }
  }, [tasks]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.projects, JSON.stringify(projects));
    } catch {
      // Ignore storage quota errors
    }
  }, [projects]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.prefs, JSON.stringify(preferences));
    } catch {
      // Ignore storage quota errors
    }
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.reflection, JSON.stringify(reflection));
    } catch {
      // Ignore storage quota errors
    }
  }, [reflection]);

  const addTask = useCallback(
    (input: {
      title: string;
      notes?: string;
      priority?: Priority;
      dueDate?: string | null;
      projectId?: string | null;
      estimateMinutes?: number | null;
      status?: TaskStatus;
    }): Task => {
      const now = new Date().toISOString();
      const newTask: Task = {
        id: `task-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: input.title.trim(),
        notes: input.notes ?? '',
        completed: input.status === 'done',
        status: input.status ?? 'todo',
        priority: input.priority ?? 'normal',
        dueDate: input.dueDate ?? null,
        projectId: input.projectId ?? null,
        estimateMinutes: input.estimateMinutes ?? null,
        subtasks: [],
        createdAt: now,
        completedAt: input.status === 'done' ? now : null,
        order: Date.now(),
      };
      setTasks((prev) => [newTask, ...prev]);
      return newTask;
    },
    []
  );

  const toggleTask = useCallback((taskId: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const nextCompleted = !t.completed;
        return {
          ...t,
          completed: nextCompleted,
          status: nextCompleted ? 'done' : 'todo',
          completedAt: nextCompleted ? new Date().toISOString() : null,
        };
      })
    );
  }, []);

  const updateTask = useCallback((taskId: string, patch: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id !== taskId) return t;
        const merged = { ...t, ...patch };
        if (patch.status !== undefined && patch.completed === undefined) {
          merged.completed = patch.status === 'done';
          merged.completedAt = merged.completed ? t.completedAt ?? new Date().toISOString() : null;
        } else if (patch.completed !== undefined && patch.status === undefined) {
          merged.status = patch.completed ? 'done' : 'todo';
          merged.completedAt = patch.completed ? t.completedAt ?? new Date().toISOString() : null;
        }
        return merged;
      })
    );
  }, []);

  const deleteTask = useCallback((taskId: string) => {
    setTasks((prev) => {
      const target = prev.find((t) => t.id === taskId) || null;
      if (target) setLastDeletedTask(target);
      return prev.filter((t) => t.id !== taskId);
    });
  }, []);

  const undoDeleteTask = useCallback(() => {
    if (!lastDeletedTask) return;
    setTasks((prev) => [lastDeletedTask, ...prev]);
    setLastDeletedTask(null);
  }, [lastDeletedTask]);

  const dismissDeletedToast = useCallback(() => {
    setLastDeletedTask(null);
  }, []);

  const addSubtask = useCallback((taskId: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    const sub: Subtask = {
      id: `st-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      title: trimmed,
      completed: false,
    };
    setTasks((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, subtasks: [...t.subtasks, sub] } : t))
    );
  }, []);

  const toggleSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              subtasks: t.subtasks.map((s) =>
                s.id === subtaskId ? { ...s, completed: !s.completed } : s
              ),
            }
          : t
      )
    );
  }, []);

  const deleteSubtask = useCallback((taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((t) =>
        t.id === taskId
          ? { ...t, subtasks: t.subtasks.filter((s) => s.id !== subtaskId) }
          : t
      )
    );
  }, []);

  const addProject = useCallback(
    (input: { name: string; description: string; accent: ProjectAccent }): Project => {
      const proj: Project = {
        id: `proj-${Date.now()}`,
        name: input.name.trim(),
        description: input.description.trim(),
        accent: input.accent,
        createdAt: new Date().toISOString(),
      };
      setProjects((prev) => [...prev, proj]);
      return proj;
    },
    []
  );

  const updateProject = useCallback((projectId: string, patch: Partial<Project>) => {
    setProjects((prev) => prev.map((p) => (p.id === projectId ? { ...p, ...patch } : p)));
  }, []);

  const deleteProject = useCallback((projectId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
    setTasks((prev) =>
      prev.map((t) => (t.projectId === projectId ? { ...t, projectId: null } : t))
    );
  }, []);

  const updatePreferences = useCallback((patch: Partial<UserPreferences>) => {
    setPreferences((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateReflection = useCallback((patch: Partial<ReflectionEntry>) => {
    setReflection((prev) => ({
      ...prev,
      ...patch,
      weekKey: getWeekKey(),
      updatedAt: new Date().toISOString(),
    }));
  }, []);

  const resetWorkspace = useCallback(() => {
    const freshTasks = createInitialTasks();
    const freshProjects = createInitialProjects();
    const freshReflection = createInitialReflection();
    setTasks(freshTasks);
    setProjects(freshProjects);
    setPreferences(DEFAULT_PREFERENCES);
    setReflection(freshReflection);
    setLastDeletedTask(null);
  }, []);

  return {
    tasks,
    projects,
    preferences,
    reflection,
    lastDeletedTask,
    addTask,
    toggleTask,
    updateTask,
    deleteTask,
    undoDeleteTask,
    dismissDeletedToast,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    addProject,
    updateProject,
    deleteProject,
    updatePreferences,
    updateReflection,
    resetWorkspace,
  };
}
