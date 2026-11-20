import React from 'react';
import { Calendar, Check, Clock, Flag, ListChecks, SlidersHorizontal, Trash2 } from 'lucide-react';
import { Priority, Project, Task } from '../types/taskflow';
import { formatDueDateLabel, isOverdue, toLocalDateKey } from '../utils/dates';

interface TaskRowProps {
  task: Task;
  project?: Project;
  isSelected: boolean;
  compact?: boolean;
  onToggle: (taskId: string) => void;
  onSelect: (taskId: string) => void;
  onDelete: (taskId: string) => void;
  onChangePriority?: (taskId: string, priority: Priority) => void;
}

export const TaskRow: React.FC<TaskRowProps> = ({
  task,
  project,
  isSelected,
  compact = false,
  onToggle,
  onSelect,
  onDelete,
  onChangePriority,
}) => {
  const todayKey = toLocalDateKey();
  const overdue = isOverdue(task.dueDate, task.completed, todayKey);
  const completedSubtasks = task.subtasks.filter((s) => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  const nextPriority = (): Priority => {
    if (task.priority === 'normal') return 'high';
    if (task.priority === 'high') return 'low';
    return 'normal';
  };

  const priorityLabel = (p: Priority): string => {
    if (p === 'high') return 'Alta';
    if (p === 'low') return 'Baja';
    return 'Normal';
  };

  return (
    <div
      className={`group rounded-xl transition-all duration-150 ${
        isSelected ? 'tf-card-selected' : 'tf-card tf-card-hover'
      } ${compact ? 'px-3.5 py-2.5' : 'px-4 py-3.5'}`}
    >
      <div className="flex items-start gap-3">
        {/* Custom 20x20 animated completion checkbox */}
        <button
          type="button"
          role="checkbox"
          aria-checked={task.completed}
          aria-label={task.completed ? `Marcar "${task.title}" como pendiente` : `Completar "${task.title}"`}
          onClick={(e) => {
            e.stopPropagation();
            onToggle(task.id);
          }}
          className={`mt-0.5 w-5 h-5 rounded-[6px] shrink-0 flex items-center justify-center transition-all duration-150 tf-focus-ring ${
            task.completed
              ? 'bg-[#10B981] border-[1.5px] border-[#10B981] text-white'
              : 'bg-white border-[1.5px] border-[#CBD5E1] hover:border-[#2563EB] text-transparent'
          }`}
        >
          <Check
            className={`w-3.5 h-3.5 transition-transform duration-150 ${
              task.completed ? 'scale-100' : 'scale-0'
            }`}
            strokeWidth={3}
          />
        </button>

        {/* Main Content Click Area */}
        <div
          role="button"
          tabIndex={0}
          onClick={() => onSelect(task.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(task.id);
            }
          }}
          className="flex-1 min-w-0 cursor-pointer focus:outline-none"
        >
          <div className="flex items-start justify-between gap-2">
            <p
              className={`text-[15px] leading-[22px] font-medium transition-colors duration-150 ${
                task.completed ? 'line-through text-[#64748B]' : 'text-[#0F172A]'
              }`}
            >
              {task.title}
            </p>
          </div>

          {/* Clean unboxed metadata line */}
          <div className="mt-1.5 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[12px] text-[#64748B]">
            {task.status === 'in_progress' && !task.completed && (
              <>
                <span className="font-semibold text-[#1D4ED8]">En progreso</span>
                <span aria-hidden="true" className="text-[#CBD5E1]">
                  ·
                </span>
              </>
            )}

            {task.priority === 'high' && !task.completed && (
              <>
                <span className="inline-flex items-center gap-1 font-semibold text-[#B91C1C]">
                  <Flag className="w-3 h-3" />
                  Prioridad alta
                </span>
                <span aria-hidden="true" className="text-[#CBD5E1]">
                  ·
                </span>
              </>
            )}

            {task.dueDate && (
              <span
                className={`inline-flex items-center gap-1 tabular-nums ${
                  overdue
                    ? 'text-[#DC2626] font-semibold'
                    : task.dueDate === todayKey && !task.completed
                    ? 'text-[#2563EB] font-medium'
                    : 'text-[#64748B]'
                }`}
              >
                <Calendar className="w-3 h-3" />
                {overdue ? `Vencida (${formatDueDateLabel(task.dueDate, todayKey)})` : formatDueDateLabel(task.dueDate, todayKey)}
              </span>
            )}

            {project && (
              <>
                {task.dueDate && (
                  <span aria-hidden="true" className="text-[#CBD5E1]">
                    ·
                  </span>
                )}
                <span className="text-[#475569] font-medium">{project.name}</span>
              </>
            )}

            {totalSubtasks > 0 && (
              <>
                {(task.dueDate || project) && (
                  <span aria-hidden="true" className="text-[#CBD5E1]">
                    ·
                  </span>
                )}
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <ListChecks className="w-3.5 h-3.5 text-[#64748B]" />
                  {completedSubtasks}/{totalSubtasks} subtareas
                </span>
              </>
            )}

            {task.estimateMinutes && (
              <>
                {(task.dueDate || project || totalSubtasks > 0) && (
                  <span aria-hidden="true" className="text-[#CBD5E1]">
                    ·
                  </span>
                )}
                <span className="inline-flex items-center gap-1 tabular-nums">
                  <Clock className="w-3 h-3 text-[#64748B]" />
                  {task.estimateMinutes}m
                </span>
              </>
            )}
          </div>
        </div>

        {/* Hover Secondary Utilities */}
        <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100 transition-opacity shrink-0">
          {onChangePriority && !task.completed && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChangePriority(task.id, nextPriority());
              }}
              title={`Prioridad: ${priorityLabel(task.priority)} (clic para cambiar)`}
              aria-label={`Cambiar prioridad de ${task.title}`}
              className={`p-1.5 rounded-lg transition-colors tf-focus-ring ${
                task.priority === 'high'
                  ? 'text-[#B91C1C] bg-[#FEE2E2]/60 hover:bg-[#FEE2E2]'
                  : 'text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9]'
              }`}
            >
              <Flag className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onSelect(task.id);
            }}
            title="Ver detalles de la tarea"
            aria-label={`Inspeccionar ${task.title}`}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors tf-focus-ring"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            title="Eliminar tarea"
            aria-label={`Eliminar ${task.title}`}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]/60 transition-colors tf-focus-ring"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
