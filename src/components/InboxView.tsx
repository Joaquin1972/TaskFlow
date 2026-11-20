import React, { useMemo } from 'react';
import { Calendar, FolderInput } from 'lucide-react';
import { Priority, Project, Task } from '../types/taskflow';
import { toLocalDateKey } from '../utils/dates';
import { EmptyState } from './EmptyState';
import { QuickAddBar } from './QuickAddBar';
import { TaskRow } from './TaskRow';

interface InboxViewProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  selectedTaskId: string | null;
  compact: boolean;
  quickAddRef: React.RefObject<HTMLInputElement | null>;
  onAddTask: (input: {
    title: string;
    priority: Priority;
    dueDate: string | null;
    projectId: string | null;
  }) => void;
  onToggleTask: (taskId: string) => void;
  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (taskId: string, patch: Partial<Task>) => void;
}

export const InboxView: React.FC<InboxViewProps> = ({
  tasks,
  projects,
  searchQuery,
  selectedTaskId,
  compact,
  quickAddRef,
  onAddTask,
  onToggleTask,
  onSelectTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const todayKey = toLocalDateKey();

  const inboxTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks
      .filter((t) => t.projectId === null && !t.completed)
      .filter((t) => {
        if (!q) return true;
        return t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
      })
      .sort((a, b) => a.order - b.order);
  }, [tasks, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2563EB]">
            Captura rápida
          </p>
          <h1 className="mt-1 text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] font-bold tracking-tight text-[#0F172A]">
            Bandeja de entrada
          </h1>
        </div>
        <p className="text-[13px] text-[#64748B] tabular-nums">
          {inboxTasks.length} {inboxTasks.length === 1 ? 'elemento pendiente de clasificar' : 'elementos pendientes de clasificar'}
        </p>
      </div>

      <QuickAddBar
        projects={projects}
        defaultProjectId={null}
        inputRef={quickAddRef}
        placeholder="Captura una idea o tarea sin clasificar..."
        onAddTask={onAddTask}
      />

      {inboxTasks.length === 0 ? (
        <EmptyState
          title="Bandeja de entrada al día"
          description="Todas las tareas capturadas han sido programadas o asignadas a un proyecto."
          actionLabel="Capturar nuevo elemento"
          onAction={() => quickAddRef.current?.focus()}
        />
      ) : (
        <div className="space-y-3">
          {inboxTasks.map((task) => (
            <div key={task.id} className="space-y-1.5">
              <TaskRow
                task={task}
                isSelected={selectedTaskId === task.id}
                compact={compact}
                onToggle={onToggleTask}
                onSelect={onSelectTask}
                onDelete={onDeleteTask}
                onChangePriority={(id, priority) => onUpdateTask(id, { priority })}
              />
              {/* Quiet inline triage bar */}
              <div className="flex items-center flex-wrap gap-2 pl-9 text-[12px]">
                <button
                  type="button"
                  onClick={() => onUpdateTask(task.id, { dueDate: todayKey })}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] font-medium transition-colors"
                >
                  <Calendar className="w-3 h-3" />
                  Programar para hoy
                </button>
                <div className="inline-flex items-center gap-1 text-[#475569]">
                  <FolderInput className="w-3.5 h-3.5 text-[#64748B]" />
                  <select
                    aria-label={`Asignar ${task.title} a proyecto`}
                    value=""
                    onChange={(e) => {
                      if (e.target.value) {
                        onUpdateTask(task.id, { projectId: e.target.value });
                      }
                    }}
                    className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-md px-2 py-1 text-[12px] text-[#334155] focus:outline-none focus:border-[#2563EB]"
                  >
                    <option value="">Mover a proyecto...</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
