import React, { useMemo } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { Project, ReflectionEntry, Task } from '../types/taskflow';
import { addDays, getShortDayLabel, toLocalDateKey } from '../utils/dates';

interface WeeklyReviewViewProps {
  tasks: Task[];
  projects: Project[];
  reflection: ReflectionEntry;
  onUpdateReflection: (patch: Partial<ReflectionEntry>) => void;
  onSelectProject: (projectId: string) => void;
}

export const WeeklyReviewView: React.FC<WeeklyReviewViewProps> = ({
  tasks,
  projects,
  reflection,
  onUpdateReflection,
  onSelectProject,
}) => {
  const todayKey = toLocalDateKey();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.completed).length;
    const active = total - completed;
    const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
    const completedMinutes = tasks
      .filter((t) => t.completed)
      .reduce((sum, t) => sum + (t.estimateMinutes ?? 20), 0);
    const highOpen = tasks.filter((t) => !t.completed && t.priority === 'high').length;

    return {
      total,
      completed,
      active,
      rate,
      completedHours: (completedMinutes / 60).toFixed(1),
      highOpen,
    };
  }, [tasks]);

  // Last 7 days completion activity derived from real task completedAt timestamps
  const dailyActivity = useMemo(() => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const dateKey = addDays(todayKey, i - 6);
      const { weekday, dayNum } = getShortDayLabel(dateKey);
      const count = tasks.filter(
        (t) => t.completed && t.completedAt && t.completedAt.slice(0, 10) === dateKey
      ).length;
      return { dateKey, weekday, dayNum, count, isToday: i === 6 };
    });
    const maxCount = Math.max(1, ...days.map((d) => d.count));
    return { days, maxCount };
  }, [tasks, todayKey]);

  const projectBreakdown = useMemo(() => {
    return projects.map((p) => {
      const pTasks = tasks.filter((t) => t.projectId === p.id);
      const done = pTasks.filter((t) => t.completed).length;
      const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0;
      return { project: p, total: pTasks.length, done, pct };
    });
  }, [projects, tasks]);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-semibold uppercase tracking-[0.04em] text-[#2563EB]">
          Cadencia ejecutiva
        </p>
        <h1 className="mt-1 text-[28px] sm:text-[36px] leading-[36px] sm:leading-[44px] font-bold tracking-tight text-[#0F172A]">
          Revisión semanal
        </h1>
      </div>

      {/* Real Computed KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="tf-card rounded-xl px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Tasa de finalización
          </div>
          <div className="mt-1 text-[26px] font-bold text-[#0F172A] tabular-nums">
            {stats.rate}%
          </div>
          <div className="mt-0.5 text-[12px] text-[#64748B] tabular-nums">
            {stats.completed} de {stats.total} tareas
          </div>
        </div>

        <div className="tf-card rounded-xl px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Cola activa
          </div>
          <div className="mt-1 text-[26px] font-bold text-[#2563EB] tabular-nums">
            {stats.active}
          </div>
          <div className="mt-0.5 text-[12px] text-[#64748B] tabular-nums">
            {stats.highOpen} de alta prioridad
          </div>
        </div>

        <div className="tf-card rounded-xl px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Tiempo completado
          </div>
          <div className="mt-1 text-[26px] font-bold text-[#10B981] tabular-nums">
            {stats.completedHours}h
          </div>
          <div className="mt-0.5 text-[12px] text-[#64748B]">Horas estimadas registradas</div>
        </div>

        <div className="tf-card rounded-xl px-4 py-4">
          <div className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
            Proyectos activos
          </div>
          <div className="mt-1 text-[26px] font-bold text-[#0F172A] tabular-nums">
            {projects.length}
          </div>
          <div className="mt-0.5 text-[12px] text-[#64748B]">Iniciativas en seguimiento</div>
        </div>
      </div>

      {/* 2-Column Activity & Project Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
        {/* 7-Day Completion Momentum */}
        <div className="lg:col-span-6 tf-card rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h2 className="text-[16px] font-semibold text-[#0F172A]">
              Cadencia de los últimos 7 días
            </h2>
            <p className="mt-0.5 text-[13px] text-[#64748B]">
              Tareas completadas por día durante la semana
            </p>
          </div>

          <div className="mt-6 grid grid-cols-7 gap-2 items-end h-[160px] pt-4">
            {dailyActivity.days.map((d) => {
              const heightPct = d.count === 0 ? 6 : Math.max(18, Math.round((d.count / dailyActivity.maxCount) * 100));
              return (
                <div key={d.dateKey} className="flex flex-col items-center h-full justify-end gap-2">
                  <span className="text-[11px] font-semibold text-[#475569] tabular-nums">
                    {d.count}
                  </span>
                  <div className="w-full max-w-[36px] flex-1 flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        d.count === 0
                          ? 'bg-[#E2E8F0]'
                          : d.isToday
                          ? 'bg-[#2563EB]'
                          : 'bg-[#93C5FD]'
                      }`}
                      style={{ height: `${heightPct}%` }}
                    />
                  </div>
                  <div className="text-center">
                    <div
                      className={`text-[11px] font-medium ${
                        d.isToday ? 'text-[#2563EB] font-semibold' : 'text-[#64748B]'
                      }`}
                    >
                      {d.weekday}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Progress Table */}
        <div className="lg:col-span-6 tf-card rounded-2xl p-5">
          <h2 className="text-[16px] font-semibold text-[#0F172A]">Ejecución de proyectos</h2>
          <p className="mt-0.5 text-[13px] text-[#64748B]">
            Porcentaje de finalización en iniciativas activas
          </p>

          <div className="mt-4 divide-y divide-[#E2E8F0]">
            {projectBreakdown.map(({ project, total, done, pct }) => (
              <button
                key={project.id}
                type="button"
                onClick={() => onSelectProject(project.id)}
                className="w-full py-3 flex items-center justify-between gap-4 text-left hover:bg-[#F8FAFC] -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <span className="text-[14px] font-semibold text-[#0F172A] truncate">
                      {project.name}
                    </span>
                    <span className="text-[12px] text-[#64748B] tabular-nums shrink-0">
                      {done}/{total} · {pct}%
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#EFF4FF] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-[#2563EB] transition-all duration-300"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Narrative Reflection Journal */}
      <div className="tf-card rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-[18px] font-semibold text-[#0F172A]">Notas de reflexión semanal</h2>
            <p className="text-[13px] text-[#64748B]">
              Registra los logros clave y calibra las principales prioridades de la próxima semana
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-[#10B981]">
            <CheckCircle2 className="w-4 h-4" />
            Guardado automáticamente
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div>
            <label
              htmlFor="reflection-wins"
              className="block text-[12px] font-semibold uppercase tracking-[0.04em] text-[#334155] mb-2"
            >
              Logros clave y resultados completados
            </label>
            <textarea
              id="reflection-wins"
              rows={4}
              value={reflection.wins}
              onChange={(e) => onUpdateReflection({ wins: e.target.value })}
              placeholder="¿Qué avances marcaron la diferencia esta semana?"
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-3.5 py-2.5 text-[14px] text-[#334155] leading-relaxed tf-input"
            />
          </div>

          <div>
            <label
              htmlFor="reflection-focus"
              className="block text-[12px] font-semibold uppercase tracking-[0.04em] text-[#334155] mb-2"
            >
              Foco principal para la próxima semana
            </label>
            <textarea
              id="reflection-focus"
              rows={4}
              value={reflection.focusNextWeek}
              onChange={(e) => onUpdateReflection({ focusNextWeek: e.target.value })}
              placeholder="Define de 1 a 3 entregables clave para el lunes..."
              className="w-full rounded-xl border border-[#E2E8F0] bg-[#FFFFFF] px-3.5 py-2.5 text-[14px] text-[#334155] leading-relaxed tf-input"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
