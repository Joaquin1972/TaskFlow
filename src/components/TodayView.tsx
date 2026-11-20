import React, { useMemo, useState } from 'react';
import { Priority, Project, StatusFilter, Task } from '../types/taskflow';
import { formatFullDateHeader, isOverdue, toLocalDateKey } from '../utils/dates';
import { EmptyState } from './EmptyState';
import { QuickAddBar } from './QuickAddBar';
import { TaskRow } from './TaskRow';

interface TodayViewProps {
  tasks: Task[];
  projects: Project[];
  searchQuery: string;
  selectedTaskId: string | null;
  compact: boolean;
  showCompletedPref: boolean;
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

export const TodayView: React.FC<TodayViewProps> = ({
  tasks,
  projects,
  searchQuery,
  selectedTaskId,
  compact,
  showCompletedPref,
  quickAddRef,
  onAddTask,
  onToggleTask,
  onSelectTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const todayKey = toLocalDateKey();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | Priority>('all');

  const projectMap = useMemo(
    () => new Map(projects.map((p) => [p.id, p])),
    [projects]
  );

  // Tasks relevant to Today: due today, overdue incomplete, or completed today
  const todayScopedTasks = useMemo(() => {
    return tasks.filter((t) => {
      const dueToday = t.dueDate === todayKey;
      const overdue = isOverdue(t.dueDate, t.completed, todayKey);
      const completedToday = t.completed && t.completedAt?.slice(0, 10) === todayKey;
      return dueToday || overdue || completedToday;
    });
  }, [tasks, todayKey]);

  const metrics = useMemo(() => {
    const activeToday = todayScopedTasks.filter((t) => !t.completed);
    const completedToday = todayScopedTasks.filter((t) => t.completed);
    const highPriority = activeToday.filter((t) => t.priority === 'high');
    const focusMinutes = activeToday.reduce((sum, t) => sum + (t.estimateMinutes ?? 0), 0);
    return {
      remaining: activeToday.length,
      completed: completedToday.length,
      highPriority: highPriority.length,
      focusMinutes,
    };
  }, [todayScopedTasks]);

  const filteredTasks = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return todayScopedTasks
      .filter((t) => {
        if (!showCompletedPref && t.completed && statusFilter !== 'completed') return false;
        if (statusFilter === 'active' && t.completed) return false;
        if (statusFilter === 'completed' && !t.completed) return false;
        if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
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
        if (a.completed !== b.completed) return a.completed ? 1 : -1;
        const pRank: Record<Priority, number> = { high: 0, normal: 1, low: 2 };
        if (pRank[a.priority] !== pRank[b.priority]) {
          return pRank[a.priority] - pRank[b.priority];
        }
        return a.order - b.order;
      });
  }, [todayScopedTasks, showCompletedPref, statusFilter, priorityFilter, searchQuery, projectMap]);

  const overdueTasks = filteredTasks.filter((t) => isOverdue(t.dueDate, t.completed, todayKey));
  const scheduledTodayTasks = filteredTasks.filter(
    (t) => !t.completed && !isOverdue(t.dueDate, t.completed, todayKey)
  );
  const completedTasks = filteredTasks.filter((t) => t.completed);

  const focusHoursLabel =
    metrics.focusMinutes >= 60
      ? `${Math.floor(metrics.focusMinutes / 60)}h ${metrics.focusMinutes % 60}m`
      : `${metrics.focusMinutes}m`;

  const statusLabel = (f: StatusFilter): string => {
    if (f === 'all') return 'Todas';
    if (f === 'active') return 'Pendientes';
    return 'Completadas';
  };

  return (
    <div className="space-y-6">
      {/* Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2563EB]">
            {formatFullDateHeader()}
          </p>
          <h1 className="mt-1 text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] font-bold tracking-tight text-[#0F172A] text-balance">
            Enfoque de hoy
          </h1>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center flex-wrap gap-2">
          <div className="flex items-center gap-1 p-1 bg-[#EFF4FF] border border-[#E2E8F0] rounded-lg">
            {(['all', 'active', 'completed'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setStatusFilter(f)}
                className={`px-3 py-1 rounded-md text-[12px] font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  statusFilter === f
                    ? 'bg-[#FFFFFF] text-[#0F172A] shadow-sm'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                {statusLabel(f)}
              </button>
            ))}
          </div>

          <select
            aria-label="Filtrar por prioridad"
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | Priority)}
            className="px-3 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[12px] font-semibold text-[#334155] tf-input"
          >
            <option value="all">Todas las prioridades</option>
            <option value="high">Prioridad alta</option>
            <option value="normal">Prioridad normal</option>
            <option value="low">Prioridad baja</option>
          </select>
        </div>
      </div>

      {/* 4-column Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="tf-card rounded-xl px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Pendientes hoy
          </div>
          <div className="mt-1 text-[24px] font-bold text-[#0F172A] tabular-nums">
            {metrics.remaining}
          </div>
        </div>
        <div className="tf-card rounded-xl px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Completadas
          </div>
          <div className="mt-1 text-[24px] font-bold text-[#10B981] tabular-nums">
            {metrics.completed}
          </div>
        </div>
        <div className="tf-card rounded-xl px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Prioridad alta
          </div>
          <div className="mt-1 text-[24px] font-bold text-[#0F172A] tabular-nums">
            {metrics.highPriority}
          </div>
        </div>
        <div className="tf-card rounded-xl px-4 py-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Tiempo planificado
          </div>
          <div className="mt-1 text-[24px] font-bold text-[#2563EB] tabular-nums">
            {focusHoursLabel}
          </div>
        </div>
      </div>

      {/* Quick-Add Bar */}
      <QuickAddBar
        projects={projects}
        defaultDueDate={todayKey}
        inputRef={quickAddRef}
        placeholder="Añadir una tarea para hoy..."
        onAddTask={onAddTask}
      />

      {/* Task Groups */}
      {filteredTasks.length === 0 ? (
        <EmptyState
          title={
            searchQuery
              ? 'No se encontraron tareas coincidentes'
              : statusFilter === 'completed'
              ? 'Aún no hay tareas completadas hoy'
              : 'Tu jornada está despejada'
          }
          description={
            searchQuery
              ? 'Prueba a cambiar el término de búsqueda o el filtro activo.'
              : 'Añade una tarea arriba para planificar y estructurar tu día.'
          }
          actionLabel={!searchQuery ? 'Añadir tarea rápida' : undefined}
          onAction={!searchQuery ? () => quickAddRef.current?.focus() : undefined}
        />
      ) : (
        <div className="space-y-7">
          {overdueTasks.length > 0 && (
            <section aria-labelledby="section-overdue">
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="section-overdue"
                  className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#DC2626]"
                >
                  Vencidas ({overdueTasks.length})
                </h2>
                <button
                  type="button"
                  onClick={() =>
                    overdueTasks.forEach((t) => onUpdateTask(t.id, { dueDate: todayKey }))
                  }
                  className="text-[12px] font-semibold text-[#2563EB] hover:text-[#1D4ED8] transition-colors"
                >
                  Reprogramar todas para hoy
                </button>
              </div>
              <div className="space-y-2.5">
                {overdueTasks.map((task) => (
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

          {scheduledTodayTasks.length > 0 && (
            <section aria-labelledby="section-scheduled">
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="section-scheduled"
                  className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#64748B]"
                >
                  Programadas para hoy ({scheduledTodayTasks.length})
                </h2>
              </div>
              <div className="space-y-2.5">
                {scheduledTodayTasks.map((task) => (
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

          {completedTasks.length > 0 && (
            <section aria-labelledby="section-completed">
              <div className="flex items-center justify-between mb-3">
                <h2
                  id="section-completed"
                  className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#64748B]"
                >
                  Completadas ({completedTasks.length})
                </h2>
              </div>
              <div className="space-y-2.5">
                {completedTasks.map((task) => (
                  <TaskRow
                    key={task.id}
                    task={task}
                    project={task.projectId ? projectMap.get(task.projectId) : undefined}
                    isSelected={selectedTaskId === task.id}
                    compact={compact}
                    onToggle={onToggleTask}
                    onSelect={onSelectTask}
                    onDelete={onDeleteTask}
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
