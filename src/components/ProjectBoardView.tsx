import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Edit3,
  FolderPlus,
  LayoutGrid,
  List,
  Trash2,
} from 'lucide-react';
import { Priority, Project, ProjectAccent, Task, TaskStatus } from '../types/taskflow';
import { formatDueDateLabel, toLocalDateKey } from '../utils/dates';
import { ConfirmModal } from './ConfirmModal';
import { EmptyState } from './EmptyState';
import { QuickAddBar } from './QuickAddBar';
import { TaskRow } from './TaskRow';

interface ProjectBoardViewProps {
  projects: Project[];
  tasks: Task[];
  selectedProjectId: string | null;
  searchQuery: string;
  selectedTaskId: string | null;
  compact: boolean;
  showCompletedPref: boolean;
  quickAddRef: React.RefObject<HTMLInputElement | null>;
  onSelectProject: (projectId: string | null) => void;
  onOpenNewProject: () => void;
  onOpenEditProject: (project: Project) => void;
  onDeleteProject: (projectId: string) => void;
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

const ACCENT_BAR: Record<ProjectAccent, string> = {
  blue: 'bg-[#2563EB]',
  indigo: 'bg-[#4F46E5]',
  emerald: 'bg-[#10B981]',
  slate: 'bg-[#64748B]',
};

const COLUMNS: { id: TaskStatus; label: string }[] = [
  { id: 'todo', label: 'Por hacer' },
  { id: 'in_progress', label: 'En progreso' },
  { id: 'done', label: 'Completadas' },
];

export const ProjectBoardView: React.FC<ProjectBoardViewProps> = ({
  projects,
  tasks,
  selectedProjectId,
  searchQuery,
  selectedTaskId,
  compact,
  showCompletedPref,
  quickAddRef,
  onSelectProject,
  onOpenNewProject,
  onOpenEditProject,
  onDeleteProject,
  onAddTask,
  onToggleTask,
  onSelectTask,
  onDeleteTask,
  onUpdateTask,
}) => {
  const [layoutMode, setLayoutMode] = useState<'list' | 'board'>('list');
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [confirmDeleteProj, setConfirmDeleteProj] = useState(false);
  const todayKey = toLocalDateKey();

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId) ?? null,
    [projects, selectedProjectId]
  );

  // Directory view when no specific project is selected
  if (!selectedProject) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2563EB]">
              Portafolio
            </p>
            <h1 className="mt-1 text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] font-bold tracking-tight text-[#0F172A]">
              Proyectos
            </h1>
          </div>
          <button
            type="button"
            onClick={onOpenNewProject}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-[14px] font-semibold transition-all whitespace-nowrap shrink-0 tf-btn-primary"
          >
            <FolderPlus className="w-4 h-4" />
            Nuevo proyecto
          </button>
        </div>

        {projects.length === 0 ? (
          <EmptyState
            title="Aún no hay proyectos creados"
            description="Agrupa iniciativas relacionadas en proyectos dedicados con vista de lista y tablero Kanban."
            actionLabel="Crear primer proyecto"
            onAction={onOpenNewProject}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((proj) => {
              const projTasks = tasks.filter((t) => t.projectId === proj.id);
              const doneCount = projTasks.filter((t) => t.completed).length;
              const openCount = projTasks.length - doneCount;
              const pct = projTasks.length
                ? Math.round((doneCount / projTasks.length) * 100)
                : 0;

              return (
                <button
                  key={proj.id}
                  type="button"
                  onClick={() => onSelectProject(proj.id)}
                  className="tf-card tf-card-hover rounded-2xl p-5 text-left flex flex-col justify-between gap-4 tf-focus-ring"
                >
                  <div>
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className={`w-2.5 h-2.5 rounded-full shrink-0 ${ACCENT_BAR[proj.accent]}`}
                        />
                        <h2 className="text-[18px] font-semibold text-[#0F172A] truncate">
                          {proj.name}
                        </h2>
                      </div>
                      <span className="text-[12px] font-semibold text-[#2563EB] tabular-nums shrink-0">
                        {pct}%
                      </span>
                    </div>
                    <p className="mt-2 text-[14px] text-[#475569] line-clamp-2">
                      {proj.description || 'Sin descripción agregada aún.'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="h-1.5 w-full rounded-full bg-[#EFF4FF] overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[12px] text-[#64748B] tabular-nums">
                      <span>{openCount} pendientes</span>
                      <span>
                        {doneCount} / {projTasks.length} completadas
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Single Project Workspace
  const q = searchQuery.trim().toLowerCase();
  const projectTasks = tasks
    .filter((t) => t.projectId === selectedProject.id)
    .filter((t) => {
      if (!showCompletedPref && layoutMode === 'list' && t.completed) return false;
      if (q) {
        return t.title.toLowerCase().includes(q) || t.notes.toLowerCase().includes(q);
      }
      return true;
    })
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return a.order - b.order;
    });

  const totalCount = tasks.filter((t) => t.projectId === selectedProject.id).length;
  const completedCount = tasks.filter(
    (t) => t.projectId === selectedProject.id && t.completed
  ).length;
  const pct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Breadcrumb + Project Header */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => {
            setConfirmDeleteProj(false);
            onSelectProject(null);
          }}
          className="inline-flex items-center gap-1.5 text-[13px] font-medium text-[#64748B] hover:text-[#0F172A] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Todos los proyectos
        </button>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2.5">
              <span
                className={`w-3 h-3 rounded-full shrink-0 ${ACCENT_BAR[selectedProject.accent]}`}
              />
              <h1 className="text-[28px] sm:text-[34px] leading-[36px] sm:leading-[42px] font-bold tracking-tight text-[#0F172A] truncate">
                {selectedProject.name}
              </h1>
            </div>
            {selectedProject.description && (
              <p className="mt-1.5 text-[14px] text-[#475569] max-w-2xl">
                {selectedProject.description}
              </p>
            )}
          </div>

          <div className="flex items-center flex-wrap gap-2 shrink-0">
            {/* Segmented List / Board toggle */}
            <div className="flex items-center gap-1 p-1 bg-[#EFF4FF] border border-[#E2E8F0] rounded-lg">
              <button
                type="button"
                onClick={() => setLayoutMode('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${
                  layoutMode === 'list'
                    ? 'bg-[#FFFFFF] text-[#0F172A] shadow-sm'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <List className="w-3.5 h-3.5" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setLayoutMode('board')}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-semibold transition-colors ${
                  layoutMode === 'board'
                    ? 'bg-[#FFFFFF] text-[#0F172A] shadow-sm'
                    : 'text-[#475569] hover:text-[#0F172A]'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                Tablero
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenEditProject(selectedProject)}
              aria-label="Editar proyecto"
              title="Editar proyecto"
              className="p-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] hover:text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => setConfirmDeleteProj(true)}
              aria-label="Eliminar proyecto"
              title="Eliminar proyecto"
              className="p-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] hover:text-[#DC2626] hover:bg-[#FEE2E2]/40 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Project Progress Bar */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div
              className="h-full rounded-full bg-[#10B981] transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[12px] font-medium text-[#64748B] tabular-nums whitespace-nowrap">
            {completedCount} de {totalCount} completadas ({pct}%)
          </span>
        </div>
      </div>

      {/* Quick Add scoped to Project */}
      <QuickAddBar
        projects={projects}
        defaultProjectId={selectedProject.id}
        inputRef={quickAddRef}
        placeholder={`Añadir tarea a ${selectedProject.name}...`}
        onAddTask={onAddTask}
      />

      {/* List or Board View */}
      {layoutMode === 'list' ? (
        projectTasks.length === 0 ? (
          <EmptyState
            title="Aún no hay tareas en este proyecto"
            description="Añade el primer hito de trabajo arriba o cambia a la vista de tablero."
            actionLabel="Añadir tarea"
            onAction={() => quickAddRef.current?.focus()}
          />
        ) : (
          <div className="space-y-2.5">
            {projectTasks.map((task) => (
              <TaskRow
                key={task.id}
                task={task}
                project={selectedProject}
                isSelected={selectedTaskId === task.id}
                compact={compact}
                onToggle={onToggleTask}
                onSelect={onSelectTask}
                onDelete={onDeleteTask}
                onChangePriority={(id, priority) => onUpdateTask(id, { priority })}
              />
            ))}
          </div>
        )
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colTasks = projectTasks.filter((t) => t.status === col.id);
            return (
              <div
                key={col.id}
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => {
                  if (draggedTaskId) {
                    onUpdateTask(draggedTaskId, { status: col.id });
                    setDraggedTaskId(null);
                  }
                }}
                className="rounded-2xl bg-[#EFF4FF]/65 border border-[#E2E8F0] p-3.5 min-h-[320px] flex flex-col"
              >
                <div className="flex items-center justify-between px-1 pb-3">
                  <span className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#334155]">
                    {col.label}
                  </span>
                  <span className="text-[12px] font-semibold text-[#64748B] tabular-nums">
                    {colTasks.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {colTasks.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-[#CBD5E1] p-6 text-center text-[12px] text-[#64748B]">
                      Arrastra tareas aquí
                    </div>
                  ) : (
                    colTasks.map((task) => (
                      <div
                        key={task.id}
                        draggable
                        onDragStart={() => setDraggedTaskId(task.id)}
                        onDragEnd={() => setDraggedTaskId(null)}
                        onClick={() => onSelectTask(task.id)}
                        className={`cursor-pointer rounded-xl p-3.5 transition-all ${
                          selectedTaskId === task.id
                            ? 'tf-card-selected'
                            : 'tf-card tf-card-hover'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onToggleTask(task.id);
                            }}
                            aria-label={`Completar o desmarcar ${task.title}`}
                            className={`mt-0.5 w-4 h-4 rounded-[5px] shrink-0 flex items-center justify-center ${
                              task.completed
                                ? 'bg-[#10B981] border border-[#10B981] text-white'
                                : 'bg-white border border-[#CBD5E1] hover:border-[#2563EB]'
                            }`}
                          >
                            {task.completed && <Check className="w-3 h-3" strokeWidth={3} />}
                          </button>
                          <p
                            className={`text-[14px] font-medium leading-snug ${
                              task.completed ? 'line-through text-[#64748B]' : 'text-[#0F172A]'
                            }`}
                          >
                            {task.title}
                          </p>
                        </div>

                        <div className="mt-2.5 pl-6 flex items-center justify-between gap-2 text-[11px] text-[#64748B]">
                          <div className="flex items-center gap-2 tabular-nums">
                            {task.priority === 'high' && !task.completed && (
                              <span className="font-semibold text-[#B91C1C]">Alta</span>
                            )}
                            {task.dueDate && (
                              <span>{formatDueDateLabel(task.dueDate, todayKey)}</span>
                            )}
                          </div>

                          <select
                            aria-label="Mover a otra columna"
                            value={task.status}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => {
                              e.stopPropagation();
                              onUpdateTask(task.id, { status: e.target.value as TaskStatus });
                            }}
                            className="bg-[#F8FAFC] border border-[#E2E8F0] rounded px-1.5 py-0.5 text-[11px] text-[#334155] focus:outline-none"
                          >
                            <option value="todo">Por hacer</option>
                            <option value="in_progress">En progreso</option>
                            <option value="done">Completada</option>
                          </select>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirmation Modal for Project Deletion */}
      <ConfirmModal
        isOpen={confirmDeleteProj}
        title="Eliminar proyecto"
        message={`¿Estás seguro de que deseas eliminar el proyecto "${selectedProject.name}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar proyecto"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          onDeleteProject(selectedProject.id);
          onSelectProject(null);
          setConfirmDeleteProj(false);
        }}
        onClose={() => setConfirmDeleteProj(false)}
      />
    </div>
  );
};
