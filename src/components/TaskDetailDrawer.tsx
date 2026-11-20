import React, { useState } from 'react';
import { Calendar, Check, Clock, Flag, Folder, Plus, Trash2, X } from 'lucide-react';
import { Priority, Project, Task, TaskStatus } from '../types/taskflow';
import { addDays, toLocalDateKey } from '../utils/dates';

interface TaskDetailDrawerProps {
  task: Task | null;
  projects: Project[];
  onClose: () => void;
  onUpdate: (taskId: string, patch: Partial<Task>) => void;
  onToggle: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onAddSubtask: (taskId: string, title: string) => void;
  onToggleSubtask: (taskId: string, subtaskId: string) => void;
  onDeleteSubtask: (taskId: string, subtaskId: string) => void;
}

export const TaskDetailDrawer: React.FC<TaskDetailDrawerProps> = ({
  task,
  projects,
  onClose,
  onUpdate,
  onToggle,
  onDelete,
  onAddSubtask,
  onToggleSubtask,
  onDeleteSubtask,
}) => {
  const [newSubtask, setNewSubtask] = useState('');
  const todayKey = toLocalDateKey();

  if (!task) return null;

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    onAddSubtask(task.id, newSubtask);
    setNewSubtask('');
  };

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-[#0F172A]/25 backdrop-blur-[4px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Detalles de la tarea"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[460px] h-full bg-[#FFFFFF] border-l border-[#E2E8F0] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)] flex flex-col"
      >
        {/* Top Drawer Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <button
            type="button"
            onClick={() => onToggle(task.id)}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px] font-semibold transition-colors tf-focus-ring ${
              task.completed
                ? 'bg-[#ECFDF5] text-[#059669] hover:bg-[#D1FAE5]'
                : 'bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]'
            }`}
          >
            <Check className="w-4 h-4" strokeWidth={2.5} />
            <span>{task.completed ? 'Completada' : 'Marcar completada'}</span>
          </button>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                onDelete(task.id);
              }}
              aria-label="Eliminar tarea"
              className="p-2 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]/70 transition-colors tf-focus-ring"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar panel"
              className="p-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors tf-focus-ring"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Editable Title */}
          <div>
            <label
              htmlFor="drawer-task-title"
              className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5"
            >
              Título de la tarea
            </label>
            <textarea
              id="drawer-task-title"
              rows={2}
              value={task.title}
              onChange={(e) => onUpdate(task.id, { title: e.target.value })}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[16px] font-semibold text-[#0F172A] leading-snug resize-none tf-input"
            />
          </div>

          {/* Workflow Properties Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="drawer-status"
                className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5"
              >
                Estado
              </label>
              <select
                id="drawer-status"
                value={task.status}
                onChange={(e) => onUpdate(task.id, { status: e.target.value as TaskStatus })}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[13px] font-medium text-[#334155] tf-input"
              >
                <option value="todo">Por hacer</option>
                <option value="in_progress">En progreso</option>
                <option value="done">Completada</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="drawer-priority"
                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5"
              >
                <Flag className="w-3 h-3" />
                Prioridad
              </label>
              <select
                id="drawer-priority"
                value={task.priority}
                onChange={(e) => onUpdate(task.id, { priority: e.target.value as Priority })}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[13px] font-medium text-[#334155] tf-input"
              >
                <option value="high">Prioridad alta</option>
                <option value="normal">Normal</option>
                <option value="low">Prioridad baja</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="drawer-project"
                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5"
              >
                <Folder className="w-3 h-3" />
                Proyecto
              </label>
              <select
                id="drawer-project"
                value={task.projectId ?? ''}
                onChange={(e) => onUpdate(task.id, { projectId: e.target.value || null })}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[13px] font-medium text-[#334155] tf-input"
              >
                <option value="">Bandeja de entrada (Sin proyecto)</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="drawer-estimate"
                className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5"
              >
                <Clock className="w-3 h-3" />
                Estimación (min)
              </label>
              <input
                id="drawer-estimate"
                type="number"
                min={5}
                max={480}
                step={5}
                value={task.estimateMinutes ?? ''}
                placeholder="ej. 30"
                onChange={(e) =>
                  onUpdate(task.id, {
                    estimateMinutes: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[13px] font-medium text-[#334155] tabular-nums tf-input"
              />
            </div>
          </div>

          {/* Due Date + Quick Shortcuts */}
          <div>
            <label
              htmlFor="drawer-due-date"
              className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5"
            >
              <Calendar className="w-3 h-3" />
              Fecha programada
            </label>
            <div className="flex items-center gap-2">
              <input
                id="drawer-due-date"
                type="date"
                value={task.dueDate ?? ''}
                onChange={(e) => onUpdate(task.id, { dueDate: e.target.value || null })}
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[13px] font-medium text-[#334155] tabular-nums tf-input"
              />
              <button
                type="button"
                onClick={() => onUpdate(task.id, { dueDate: todayKey })}
                className="px-2.5 py-2 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-[12px] font-semibold transition-colors whitespace-nowrap"
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => onUpdate(task.id, { dueDate: addDays(todayKey, 1) })}
                className="px-2.5 py-2 rounded-lg bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#475569] text-[12px] font-medium transition-colors whitespace-nowrap"
              >
                Mañana
              </button>
              {task.dueDate && (
                <button
                  type="button"
                  onClick={() => onUpdate(task.id, { dueDate: null })}
                  className="px-2 py-2 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] text-[12px]"
                >
                  Quitar
                </button>
              )}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              htmlFor="drawer-notes"
              className="block text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B] mb-1.5"
            >
              Contexto y notas
            </label>
            <textarea
              id="drawer-notes"
              rows={4}
              value={task.notes}
              placeholder="Añade notas de contexto, enlaces o criterios de decisión..."
              onChange={(e) => onUpdate(task.id, { notes: e.target.value })}
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2.5 text-[14px] text-[#334155] leading-relaxed tf-input"
            />
          </div>

          {/* Subtasks Checklist */}
          <div className="pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Subtareas
              </span>
              {task.subtasks.length > 0 && (
                <span className="text-[12px] text-[#64748B] tabular-nums">
                  {task.subtasks.filter((s) => s.completed).length} de {task.subtasks.length} completadas
                </span>
              )}
            </div>

            <div className="space-y-2 mb-3">
              {task.subtasks.map((sub) => (
                <div
                  key={sub.id}
                  className="group flex items-center justify-between gap-2.5 px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#E2E8F0]"
                >
                  <button
                    type="button"
                    onClick={() => onToggleSubtask(task.id, sub.id)}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left"
                  >
                    <span
                      className={`w-4 h-4 rounded-[4px] shrink-0 flex items-center justify-center transition-colors ${
                        sub.completed
                          ? 'bg-[#10B981] border border-[#10B981] text-white'
                          : 'bg-white border border-[#CBD5E1]'
                      }`}
                    >
                      {sub.completed && <Check className="w-3 h-3" strokeWidth={3} />}
                    </span>
                    <span
                      className={`text-[13px] truncate ${
                        sub.completed ? 'line-through text-[#64748B]' : 'text-[#0F172A]'
                      }`}
                    >
                      {sub.title}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => onDeleteSubtask(task.id, sub.id)}
                    aria-label={`Eliminar subtarea ${sub.title}`}
                    className="p-1 text-[#94A3B8] hover:text-[#DC2626] opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <form onSubmit={handleAddSubtask} className="flex items-center gap-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Añadir un paso o subtarea..."
                className="flex-1 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] tf-input"
              />
              <button
                type="submit"
                disabled={!newSubtask.trim()}
                className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-[13px] font-semibold disabled:opacity-40 transition-colors shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Añadir
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
