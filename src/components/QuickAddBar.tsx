import React, { useEffect, useState } from 'react';
import { Calendar, Flag, Folder, Plus } from 'lucide-react';
import { Priority, Project } from '../types/taskflow';
import { addDays, formatDueDateLabel, toLocalDateKey } from '../utils/dates';

interface QuickAddBarProps {
  projects: Project[];
  defaultProjectId?: string | null;
  defaultDueDate?: string | null;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  placeholder?: string;
  onAddTask: (input: {
    title: string;
    priority: Priority;
    dueDate: string | null;
    projectId: string | null;
  }) => void;
}

export const QuickAddBar: React.FC<QuickAddBarProps> = ({
  projects,
  defaultProjectId = null,
  defaultDueDate = null,
  inputRef,
  placeholder = 'Añadir una tarea... (Pulsa Enter para guardar)',
  onAddTask,
}) => {
  const todayKey = toLocalDateKey();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<Priority>('normal');
  const [dueDate, setDueDate] = useState<string | null>(defaultDueDate);
  const [projectId, setProjectId] = useState<string | null>(defaultProjectId);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    setProjectId(defaultProjectId);
  }, [defaultProjectId]);

  useEffect(() => {
    setDueDate(defaultDueDate);
  }, [defaultDueDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = title.trim();
    if (!trimmed) return;
    onAddTask({
      title: trimmed,
      priority,
      dueDate,
      projectId,
    });
    setTitle('');
    setPriority('normal');
  };

  const cyclePriority = () => {
    setPriority((prev) => (prev === 'normal' ? 'high' : prev === 'high' ? 'low' : 'normal'));
  };

  const cycleQuickDate = () => {
    const tomorrowKey = addDays(todayKey, 1);
    const nextWeekKey = addDays(todayKey, 7);
    if (!dueDate) setDueDate(todayKey);
    else if (dueDate === todayKey) setDueDate(tomorrowKey);
    else if (dueDate === tomorrowKey) setDueDate(nextWeekKey);
    else setDueDate(null);
  };

  const priorityLabel = (p: Priority): string => {
    if (p === 'high') return 'Alta';
    if (p === 'low') return 'Baja';
    return 'Prioridad';
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`bg-[#FFFFFF] rounded-xl border transition-all duration-150 ${
        isFocused
          ? 'border-[#2563EB] shadow-[0_0_0_3px_rgba(37,99,235,0.12)]'
          : 'border-[#E2E8F0] shadow-[0_1px_3px_0_rgba(15,23,42,0.04)]'
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-2 sm:pl-3.5 sm:pr-2">
        <div className="flex items-center gap-2.5 flex-1 min-w-0">
          <Plus className="w-[18px] h-[18px] text-[#2563EB] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            aria-label="Añadir tarea rápida"
            className="w-full py-1.5 text-[15px] text-[#0F172A] placeholder:text-[#94A3B8] bg-transparent focus:outline-none"
          />
        </div>

        <div className="flex items-center flex-wrap sm:flex-nowrap gap-1.5 shrink-0 pl-7 sm:pl-0">
          {/* Quick Date Toggle */}
          <button
            type="button"
            onClick={cycleQuickDate}
            title="Cambiar fecha (Hoy / Mañana / Próxima semana / Sin fecha)"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 tf-focus-ring ${
              dueDate
                ? 'bg-[#EFF6FF] text-[#1D4ED8] hover:bg-[#DBEAFE]'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>{dueDate ? formatDueDateLabel(dueDate, todayKey) : 'Programar'}</span>
          </button>

          {/* Priority Cycle */}
          <button
            type="button"
            onClick={cyclePriority}
            title="Cambiar prioridad (Normal / Alta / Baja)"
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors whitespace-nowrap shrink-0 tf-focus-ring ${
              priority === 'high'
                ? 'bg-[#FEE2E2] text-[#B91C1C]'
                : priority === 'low'
                ? 'bg-[#F1F5F9] text-[#475569]'
                : 'bg-[#F8FAFC] text-[#475569] hover:bg-[#F1F5F9]'
            }`}
          >
            <Flag className="w-3.5 h-3.5" />
            <span>{priorityLabel(priority)}</span>
          </button>

          {/* Project Selector */}
          <div className="relative inline-flex items-center">
            <Folder className="w-3.5 h-3.5 text-[#64748B] absolute left-2.5 pointer-events-none" />
            <select
              aria-label="Asignar a proyecto"
              value={projectId ?? ''}
              onChange={(e) => setProjectId(e.target.value || null)}
              className="pl-7 pr-6 py-1.5 rounded-lg text-[12px] font-medium bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#334155] border-0 appearance-none cursor-pointer tf-focus-ring max-w-[140px] truncate"
            >
              <option value="">Bandeja de entrada</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            disabled={!title.trim()}
            className="px-3.5 py-1.5 rounded-lg text-[13px] font-semibold bg-[#2563EB] text-white hover:bg-[#1D4ED8] active:scale-[0.98] disabled:opacity-40 disabled:pointer-events-none transition-all whitespace-nowrap shrink-0 tf-btn-primary"
          >
            Añadir tarea
          </button>
        </div>
      </div>
    </form>
  );
};
