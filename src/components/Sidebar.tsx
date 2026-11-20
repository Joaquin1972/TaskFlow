import React from 'react';
import {
  BarChart3,
  CalendarDays,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  FolderKanban,
  Inbox,
  Plus,
  Settings,
  Sun,
} from 'lucide-react';
import { NavView, Project, ProjectAccent, UserPreferences } from '../types/taskflow';

interface SidebarProps {
  activeView: NavView;
  selectedProjectId: string | null;
  onSelectView: (view: NavView, projectId?: string | null) => void;
  projects: Project[];
  counts: {
    today: number;
    upcoming: number;
    inbox: number;
    projects: Record<string, number>;
  };
  preferences: UserPreferences;
  onToggleCollapse: () => void;
  onOpenNewProject: () => void;
  onOpenSettings: () => void;
}

const ACCENT_DOT: Record<ProjectAccent, string> = {
  blue: 'bg-[#2563EB]',
  indigo: 'bg-[#4F46E5]',
  emerald: 'bg-[#10B981]',
  slate: 'bg-[#64748B]',
};

export const Sidebar: React.FC<SidebarProps> = ({
  activeView,
  selectedProjectId,
  onSelectView,
  projects,
  counts,
  preferences,
  onToggleCollapse,
  onOpenNewProject,
  onOpenSettings,
}) => {
  const collapsed = preferences.sidebarCollapsed;
  const initials = preferences.userName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('') || 'TF';

  const navItems: {
    id: NavView;
    label: string;
    icon: React.ReactNode;
    count?: number;
  }[] = [
    { id: 'today', label: 'Hoy', icon: <Sun className="w-[18px] h-[18px]" />, count: counts.today },
    {
      id: 'upcoming',
      label: 'Próximas',
      icon: <CalendarDays className="w-[18px] h-[18px]" />,
      count: counts.upcoming,
    },
    { id: 'inbox', label: 'Bandeja de entrada', icon: <Inbox className="w-[18px] h-[18px]" />, count: counts.inbox },
    {
      id: 'projects',
      label: 'Proyectos',
      icon: <FolderKanban className="w-[18px] h-[18px]" />,
      count: projects.length,
    },
    {
      id: 'review',
      label: 'Revisión semanal',
      icon: <BarChart3 className="w-[18px] h-[18px]" />,
    },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside
        aria-label="Navegación del espacio de trabajo"
        className={`hidden md:flex flex-col shrink-0 bg-[#FFFFFF] border-r border-[#E2E8F0] transition-[width] duration-200 ease-out select-none ${
          collapsed ? 'w-[72px]' : 'w-[260px]'
        }`}
      >
        {/* Brand Row */}
        <div
          className={`flex items-center h-16 border-b border-[#E2E8F0] ${
            collapsed ? 'justify-center px-3' : 'justify-between px-5'
          }`}
        >
          <button
            type="button"
            onClick={() => onSelectView('today', null)}
            className="flex items-center gap-2.5 text-left focus-visible:outline-none tf-focus-ring rounded-lg p-1 -ml-1"
          >
            <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
              <CheckSquare className="w-[18px] h-[18px]" strokeWidth={2.25} />
            </div>
            {!collapsed && (
              <span className="text-[16px] font-bold tracking-tight text-[#0F172A] whitespace-nowrap">
                TaskFlow
              </span>
            )}
          </button>

          {!collapsed && (
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Colapsar barra lateral"
              aria-label="Colapsar barra lateral"
              className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors tf-focus-ring"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {collapsed && (
          <div className="flex justify-center pt-3">
            <button
              type="button"
              onClick={onToggleCollapse}
              title="Expandir barra lateral"
              aria-label="Expandir barra lateral"
              className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors tf-focus-ring"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Primary Views */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          <div className="space-y-1">
            {!collapsed && (
              <div className="px-2.5 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                Espacio de trabajo
              </div>
            )}

            {navItems.map((item) => {
              const isActive =
                activeView === item.id && (item.id !== 'projects' || selectedProjectId === null);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectView(item.id, null)}
                  title={collapsed ? item.label : undefined}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center px-2' : 'justify-between px-2.5'
                  } h-10 rounded-lg text-[14px] font-medium transition-colors tf-focus-ring ${
                    isActive
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold'
                      : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className={isActive ? 'text-[#2563EB]' : 'text-[#64748B]'}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate whitespace-nowrap">{item.label}</span>}
                  </span>
                  {!collapsed && item.count !== undefined && (
                    <span
                      className={`text-[12px] tabular-nums ml-2 ${
                        isActive ? 'text-[#1D4ED8] font-semibold' : 'text-[#64748B]'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Projects Section */}
          <div className="space-y-1">
            {!collapsed ? (
              <div className="flex items-center justify-between px-2.5 pb-1.5">
                <span className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[#64748B]">
                  Proyectos
                </span>
                <button
                  type="button"
                  onClick={onOpenNewProject}
                  aria-label="Crear nuevo proyecto"
                  title="Nuevo proyecto"
                  className="p-1 rounded text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors tf-focus-ring"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="border-t border-[#E2E8F0] pt-3 flex justify-center">
                <button
                  type="button"
                  onClick={onOpenNewProject}
                  aria-label="Crear nuevo proyecto"
                  title="Nuevo proyecto"
                  className="p-2 rounded-lg text-[#64748B] hover:text-[#2563EB] hover:bg-[#EFF6FF] transition-colors tf-focus-ring"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}

            {projects.map((project) => {
              const isSelected =
                activeView === 'projects' && selectedProjectId === project.id;
              const remaining = counts.projects[project.id] ?? 0;
              return (
                <button
                  key={project.id}
                  type="button"
                  onClick={() => onSelectView('projects', project.id)}
                  title={collapsed ? project.name : undefined}
                  className={`w-full flex items-center ${
                    collapsed ? 'justify-center px-2' : 'justify-between px-2.5'
                  } h-9 rounded-lg text-[14px] transition-colors tf-focus-ring ${
                    isSelected
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] font-semibold'
                      : 'text-[#334155] hover:bg-[#F1F5F9] hover:text-[#0F172A]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span
                      aria-hidden="true"
                      className={`w-2 h-2 rounded-full shrink-0 ${ACCENT_DOT[project.accent]}`}
                    />
                    {!collapsed && <span className="truncate">{project.name}</span>}
                  </span>
                  {!collapsed && (
                    <span
                      className={`text-[12px] tabular-nums ml-2 ${
                        isSelected ? 'text-[#1D4ED8] font-semibold' : 'text-[#64748B]'
                      }`}
                    >
                      {remaining}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Footer Profile / Settings */}
        <div className="p-3 border-t border-[#E2E8F0]">
          <button
            type="button"
            onClick={onOpenSettings}
            title={collapsed ? `${preferences.userName} — Preferencias` : 'Preferencias del espacio de trabajo'}
            className={`w-full flex items-center ${
              collapsed ? 'justify-center p-1.5' : 'justify-between px-2.5 py-2'
            } rounded-lg hover:bg-[#F1F5F9] transition-colors tf-focus-ring`}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-[#DBEAFE] text-[#1D4ED8] text-[12px] font-bold flex items-center justify-center shrink-0">
                {initials}
              </div>
              {!collapsed && (
                <div className="min-w-0 text-left">
                  <div className="text-[13px] font-semibold text-[#0F172A] truncate">
                    {preferences.userName}
                  </div>
                  <div className="text-[11px] text-[#64748B] truncate">{preferences.userRole}</div>
                </div>
              )}
            </div>
            {!collapsed && <Settings className="w-4 h-4 text-[#64748B] shrink-0" />}
          </button>
        </div>
      </aside>

      {/* Mobile Persistent Bottom Navigation Bar (compact <= 60px) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#FFFFFF]/95 backdrop-blur-md border-t border-[#E2E8F0] px-2 py-1.5 flex items-center justify-around"
      >
        {[
          { id: 'today' as NavView, label: 'Hoy', icon: <Sun className="w-[18px] h-[18px]" /> },
          {
            id: 'upcoming' as NavView,
            label: 'Próximas',
            icon: <CalendarDays className="w-[18px] h-[18px]" />,
          },
          { id: 'inbox' as NavView, label: 'Bandeja', icon: <Inbox className="w-[18px] h-[18px]" /> },
          {
            id: 'projects' as NavView,
            label: 'Proyectos',
            icon: <FolderKanban className="w-[18px] h-[18px]" />,
          },
          {
            id: 'review' as NavView,
            label: 'Revisión',
            icon: <BarChart3 className="w-[18px] h-[18px]" />,
          },
        ].map((item) => {
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectView(item.id, null)}
              className={`flex flex-col items-center justify-center min-w-[56px] min-h-[44px] rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                isActive ? 'text-[#2563EB] bg-[#EFF6FF]' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              {item.icon}
              <span className="mt-0.5 whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};
