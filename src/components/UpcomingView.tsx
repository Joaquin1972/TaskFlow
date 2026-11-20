import React, { useMemo, useState } from 'react';
import { CalendarDays } from 'lucide-react';
import { Priority, Project, Task } from '../types/taskflow';
import {
  addDays,
  formatDueDateLabel,
  getShortDayLabel,
  isOverdue,
  toLocalDateKey,
} from '../utils/dates';
import { EmptyState } from './EmptyState';
import { QuickAddBar } from './QuickAddBar';
import { TaskRow } from './TaskRow';

interface UpcomingViewProps {
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

export const UpcomingView: React.FC<UpcomingViewProps> = ({
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
  const [selectedDayKey, setSelectedDayKey] = useState<string | null>(null);

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  // Next 7 days strip
  const weekDays = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const key = addDays(todayKey, i);
      const { weekday, dayNum } = getShortDayLabel(key);
      const count = tasks.filter((t) => !t.completed && t.dueDate === key).length;
      return { key, weekday, dayNum, count, isToday: i === 0 };
    });
  }, [todayKey, tasks]);

  const upcomingTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return tasks
      .filter((t) => {
        if (t.completed) return false;
        if (selectedDayKey && t.dueDate !== selectedDayKey) return false;
        if (q) {
          const projName = t.projectId ? projectMap.get(t.projectId)?.name ?? '' : '';
          return (
            t.title.toLowerCase().includes(q) ||
            t.notes.toLowerCase().includes(q) ||
            projName.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        if (!a.dueDate && !b.dueDate) return a.order - b.order;
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        if (a.dueDate !== b.dueDate) return a.dueDate.localeCompare(b.dueDate);
        const pRank: Record<Priority, number> = { high: 0, normal: 1, low: 2 };
        return pRank[a.priority] - pRank[b.priority];
      });
  }, [tasks, selectedDayKey, searchQuery, projectMap]);

  // Group chronologically
  const groups = useMemo(() => {
    const overdue = upcomingTasks.filter((t) => isOverdue(t.dueDate, t.completed, todayKey));
    const byDate = new Map<string, Task[]>();
    const unscheduled: Task[] = [];

    upcomingTasks.forEach((t) => {
      if (isOverdue(t.dueDate, t.completed, todayKey)) return;
      if (!t.dueDate) {
        unscheduled.push(t);
        return;
      }
      const existing = byDate.get(t.dueDate) ?? [];
      existing.push(t);
      byDate.set(t.dueDate, existing);
    });

    const dateEntries = Array.from(byDate.entries()).sort(([a], [b]) => a.localeCompare(b));
    return { overdue, dateEntries, unscheduled };
  }, [upcomingTasks, todayKey]);

  const hasAny =
    groups.overdue.length > 0 ||
    groups.dateEntries.length > 0 ||
    groups.unscheduled.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2563EB]">
            Planificador cronológico
          </p>
          <h1 className="mt-1 text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] font-bold tracking-tight text-[#0F172A]">
            Próximas tareas
          </h1>
        </div>
        {selectedDayKey && (
          <button
            type="button"
            onClick={() => setSelectedDayKey(null)}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-[12px] font-semibold transition-colors"
          >
            Mostrar todos los días
          </button>
        )}
      </div>

      {/* 7-Day Interactive Load Strip */}
      <div className="grid grid-cols-7 gap-2">
        {weekDays.map((day) => {
          const isSelected = selectedDayKey === day.key;
          return (
            <button
              key={day.key}
              type="button"
              onClick={() => setSelectedDayKey(isSelected ? null : day.key)}
              className={`rounded-xl px-2 py-3 text-center border transition-all tf-focus-ring ${
                isSelected
                  ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-sm'
                  : day.isToday
                  ? 'bg-[#EFF6FF] border-[#DBEAFE] text-[#1D4ED8] hover:border-[#2563EB]'
                  : 'bg-[#FFFFFF] border-[#E2E8F0] text-[#334155] hover:border-[#CBD5E1]'
              }`}
            >
              <div
                className={`text-[11px] font-semibold uppercase tracking-[0.04em] ${
                  isSelected ? 'text-white/80' : 'text-[#64748B]'
                }`}
              >
                {day.weekday}
              </div>
              <div className="mt-0.5 text-[18px] font-bold tabular-nums">{day.dayNum}</div>
              <div
                className={`mt-1 text-[11px] font-medium tabular-nums ${
                  isSelected
                    ? 'text-white/90'
                    : day.count > 0
                    ? 'text-[#2563EB]'
                    : 'text-[#94A3B8]'
                }`}
              >
                {day.count} {day.count === 1 ? 'tarea' : 'tareas'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Quick Add */}
      <QuickAddBar
        projects={projects}
        defaultDueDate={selectedDayKey ?? addDays(todayKey, 1)}
        inputRef={quickAddRef}
        placeholder={
          selectedDayKey
            ? `Programar tarea para ${formatDueDateLabel(selectedDayKey, todayKey)}...`
            : 'Programar una próxima tarea...'
        }
        onAddTask={onAddTask}
      />

      {!hasAny ? (
        <EmptyState
          title={selectedDayKey ? 'No hay tareas programadas para este día' : 'No hay próximas tareas'}
          description="Utiliza la barra de captura rápida para planificar con antelación y equilibrar tu semana."
          actionLabel="Programar tarea"
          onAction={() => quickAddRef.current?.focus()}
        />
      ) : (
        <div className="space-y-7">
          {groups.overdue.length > 0 && (
            <section>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#DC2626] mb-3">
                Vencidas ({groups.overdue.length})
              </h2>
              <div className="space-y-2.5">
                {groups.overdue.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    project={task.projectId ? projectMap.get(task.projectId) : undefined}
                    isSelected={selectedTaskId === task.id}
                    compact={compact}
                    onToggle={onToggleTask}
                    onSelect={onSelectTask}
                    onDelete={onDeleteTask}
                    onChangePriority={(id, priority) => onUpdateTask(id, { priority })}
                  />
                ))}
              </div>
            </section>
          )}

          {groups.dateEntries.map(([dateKey, items]) => (
            <section key={dateKey}>
              <div className="flex items-center gap-2 mb-3">
                <CalendarDays className="w-4 h-4 text-[#2563EB]" />
                <h2 className="text-[13px] font-semibold text-[#0F172A]">
                  {formatDueDateLabel(dateKey, todayKey)}
                </h2>
                <span className="text-[12px] text-[#64748B] tabular-nums">· {items.length}</span>
              </div>
              <div className="space-y-2.5">
                {items.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    project={task.projectId ? projectMap.get(task.projectId) : undefined}
                    isSelected={selectedTaskId === task.id}
                    compact={compact}
                    onToggle={onToggleTask}
                    onSelect={onSelectTask}
                    onDelete={onDeleteTask}
                    onChangePriority={(id, priority) => onUpdateTask(id, { priority })}
                  />
                ))}
              </div>
            </section>
          ))}

          {groups.unscheduled.length > 0 && (
            <section>
              <h2 className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-3">
                Pendientes sin fecha ({groups.unscheduled.length})
              </h2>
              <div className="space-y-2.5">
                {groups.unscheduled.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    project={task.projectId ? projectMap.get(task.projectId) : undefined}
                    isSelected={selectedTaskId === task.id}
                    compact={compact}
                    onToggle={onToggleTask}
                    onSelect={onSelectTask}
                    onDelete={onDeleteTask}
                    onChangePriority={(id, priority) => onUpdateTask(id, { priority })}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
};
