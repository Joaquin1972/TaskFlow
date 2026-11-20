import { useEffect, useMemo, useRef, useState } from 'react';
import { Plus, Search, Settings, X } from 'lucide-react';
import { ConfirmModal } from './components/ConfirmModal';
import { InboxView } from './components/InboxView';
import { ProjectBoardView } from './components/ProjectBoardView';
import { ProjectModal } from './components/ProjectModal';
import { SettingsModal } from './components/SettingsModal';
import { Sidebar } from './components/Sidebar';
import { TaskDetailDrawer } from './components/TaskDetailDrawer';
import { TodayView } from './components/TodayView';
import { UpcomingView } from './components/UpcomingView';
import { WeeklyReviewView } from './components/WeeklyReviewView';
import { useTaskStore } from './hooks/useTaskStore';
import { NavView, Project, Task } from './types/taskflow';
import { isOverdue, toLocalDateKey } from './utils/dates';

export default function App() {
  const store = useTaskStore();
  const [activeView, setActiveView] = useState<NavView>('today');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [taskPendingDelete, setTaskPendingDelete] = useState<Task | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const quickAddRef = useRef<HTMLInputElement>(null);
  const todayKey = toLocalDateKey();

  const selectedTask = useMemo(
    () => store.tasks.find((t) => t.id === selectedTaskId) ?? null,
    [store.tasks, selectedTaskId]
  );

  // Sidebar live counts
  const counts = useMemo(() => {
    const today = store.tasks.filter(
      (t) =>
        !t.completed &&
        (t.dueDate === todayKey || isOverdue(t.dueDate, t.completed, todayKey))
    ).length;
    const upcoming = store.tasks.filter((t) => !t.completed).length;
    const inbox = store.tasks.filter((t) => !t.completed && t.projectId === null).length;
    const projects: Record<string, number> = {};
    store.projects.forEach((p) => {
      projects[p.id] = store.tasks.filter((t) => !t.completed && t.projectId === p.id).length;
    });
    return { today, upcoming, inbox, projects };
  }, [store.tasks, store.projects, todayKey]);

  // Global keyboard shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if (e.key === 'Escape') {
        if (taskPendingDelete) {
          setTaskPendingDelete(null);
          return;
        }
        if (selectedTaskId) setSelectedTaskId(null);
        if (projectModalOpen) setProjectModalOpen(false);
        if (settingsOpen) setSettingsOpen(false);
        return;
      }

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
        return;
      }

      if (!isTyping && e.key === '/') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedTaskId, projectModalOpen, settingsOpen, taskPendingDelete]);

  // Auto-dismiss undo delete toast after 6s
  useEffect(() => {
    if (!store.lastDeletedTask) return;
    const timer = setTimeout(() => {
      store.dismissDeletedToast();
    }, 6000);
    return () => clearTimeout(timer);
  }, [store.lastDeletedTask, store]);

  const handleSelectView = (view: NavView, projectId: string | null = null) => {
    setActiveView(view);
    setSelectedProjectId(projectId);
    setSelectedTaskId(null);
  };

  const handlePrimaryNewTask = () => {
    if (activeView === 'review') {
      setActiveView('today');
      setSelectedProjectId(null);
      setTimeout(() => quickAddRef.current?.focus(), 60);
    } else {
      quickAddRef.current?.focus();
    }
  };

  const handleRequestDeleteTask = (taskId: string) => {
    const target = store.tasks.find((t) => t.id === taskId);
    if (target) {
      setTaskPendingDelete(target);
    }
  };

  const activeBreadcrumb = useMemo(() => {
    if (activeView === 'today') return 'Hoy';
    if (activeView === 'upcoming') return 'Próximas';
    if (activeView === 'inbox') return 'Bandeja de entrada';
    if (activeView === 'review') return 'Revisión semanal';
    if (activeView === 'projects') {
      if (selectedProjectId) {
        const proj = store.projects.find((p) => p.id === selectedProjectId);
        return proj ? `Proyectos / ${proj.name}` : 'Proyectos';
      }
      return 'Proyectos';
    }
    return 'Hoy';
  }, [activeView, selectedProjectId, store.projects]);

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-[#0F172A]">
      <Sidebar
        activeView={activeView}
        selectedProjectId={selectedProjectId}
        onSelectView={handleSelectView}
        projects={store.projects}
        counts={counts}
        preferences={store.preferences}
        onToggleCollapse={() =>
          store.updatePreferences({ sidebarCollapsed: !store.preferences.sidebarCollapsed })
        }
        onOpenNewProject={() => {
          setEditingProject(null);
          setProjectModalOpen(true);
        }}
        onOpenSettings={() => setSettingsOpen(true)}
      />

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col pb-20 md:pb-0">
        {/* Clean Single-Row Top Bar */}
        <header className="sticky top-0 z-20 h-16 bg-[#F8FAFC]/90 backdrop-blur-md border-b border-[#E2E8F0] px-4 sm:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[13px] font-medium text-[#64748B] whitespace-nowrap hidden sm:inline">
              TaskFlow
            </span>
            <span className="text-[#CBD5E1] hidden sm:inline">/</span>
            <span className="text-[14px] font-semibold text-[#0F172A] truncate">
              {activeBreadcrumb}
            </span>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {/* Search Box */}
            <div className="relative flex items-center">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar tareas..."
                aria-label="Buscar tareas"
                className="w-[150px] sm:w-[220px] md:w-[260px] pl-9 pr-8 py-1.5 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] tf-input"
              />
              {searchQuery ? (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  aria-label="Limpiar búsqueda"
                  className="absolute right-2.5 text-[#64748B] hover:text-[#0F172A]"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden sm:inline-block absolute right-2.5 text-[11px] font-mono text-[#94A3B8] pointer-events-none">
                  /
                </kbd>
              )}
            </div>

            {/* Mobile Settings Button */}
            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              aria-label="Preferencias del espacio de trabajo"
              className="md:hidden p-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] text-[#475569] hover:text-[#0F172A]"
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Primary CTA */}
            <button
              type="button"
              onClick={handlePrimaryNewTask}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-[13px] font-semibold transition-all whitespace-nowrap shrink-0 tf-btn-primary"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Nueva tarea</span>
              <span className="sm:hidden">Nueva</span>
            </button>
          </div>
        </header>

        {/* Centered 1200px Fluid Main Content Container */}
        <main className="flex-1 w-full max-w-[1200px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
          {activeView === 'today' && (
            <TodayView
              tasks={store.tasks}
              projects={store.projects}
              searchQuery={searchQuery}
              selectedTaskId={selectedTaskId}
              compact={store.preferences.density === 'compact'}
              showCompletedPref={store.preferences.showCompleted}
              quickAddRef={quickAddRef}
              onAddTask={store.addTask}
              onToggleTask={store.toggleTask}
              onSelectTask={setSelectedTaskId}
              onDeleteTask={handleRequestDeleteTask}
              onUpdateTask={store.updateTask}
            />
          )}

          {activeView === 'upcoming' && (
            <UpcomingView
              tasks={store.tasks}
              projects={store.projects}
              searchQuery={searchQuery}
              selectedTaskId={selectedTaskId}
              compact={store.preferences.density === 'compact'}
              quickAddRef={quickAddRef}
              onAddTask={store.addTask}
              onToggleTask={store.toggleTask}
              onSelectTask={setSelectedTaskId}
              onDeleteTask={handleRequestDeleteTask}
              onUpdateTask={store.updateTask}
            />
          )}

          {activeView === 'inbox' && (
            <InboxView
              tasks={store.tasks}
              projects={store.projects}
              searchQuery={searchQuery}
              selectedTaskId={selectedTaskId}
              compact={store.preferences.density === 'compact'}
              quickAddRef={quickAddRef}
              onAddTask={store.addTask}
              onToggleTask={store.toggleTask}
              onSelectTask={setSelectedTaskId}
              onDeleteTask={handleRequestDeleteTask}
              onUpdateTask={store.updateTask}
            />
          )}

          {activeView === 'projects' && (
            <ProjectBoardView
              projects={store.projects}
              tasks={store.tasks}
              selectedProjectId={selectedProjectId}
              searchQuery={searchQuery}
              selectedTaskId={selectedTaskId}
              compact={store.preferences.density === 'compact'}
              showCompletedPref={store.preferences.showCompleted}
              quickAddRef={quickAddRef}
              onSelectProject={(id) => setSelectedProjectId(id)}
              onOpenNewProject={() => {
                setEditingProject(null);
                setProjectModalOpen(true);
              }}
              onOpenEditProject={(proj) => {
                setEditingProject(proj);
                setProjectModalOpen(true);
              }}
              onDeleteProject={store.deleteProject}
              onAddTask={store.addTask}
              onToggleTask={store.toggleTask}
              onSelectTask={setSelectedTaskId}
              onDeleteTask={handleRequestDeleteTask}
              onUpdateTask={store.updateTask}
            />
          )}

          {activeView === 'review' && (
            <WeeklyReviewView
              tasks={store.tasks}
              projects={store.projects}
              reflection={store.reflection}
              onUpdateReflection={store.updateReflection}
              onSelectProject={(id) => handleSelectView('projects', id)}
            />
          )}
        </main>
      </div>

      {/* Task Detail Inspector Drawer */}
      <TaskDetailDrawer
        task={selectedTask}
        projects={store.projects}
        onClose={() => setSelectedTaskId(null)}
        onUpdate={store.updateTask}
        onToggle={store.toggleTask}
        onDelete={handleRequestDeleteTask}
        onAddSubtask={store.addSubtask}
        onToggleSubtask={store.toggleSubtask}
        onDeleteSubtask={store.deleteSubtask}
      />

      {/* Project Create / Edit Modal */}
      <ProjectModal
        isOpen={projectModalOpen}
        editingProject={editingProject}
        onClose={() => setProjectModalOpen(false)}
        onSave={(input) => {
          if (editingProject) {
            store.updateProject(editingProject.id, input);
          } else {
            const created = store.addProject(input);
            handleSelectView('projects', created.id);
          }
        }}
      />

      {/* Workspace Preferences Modal */}
      <SettingsModal
        isOpen={settingsOpen}
        preferences={store.preferences}
        tasks={store.tasks}
        projects={store.projects}
        onClose={() => setSettingsOpen(false)}
        onUpdatePreferences={store.updatePreferences}
        onResetWorkspace={store.resetWorkspace}
      />

      {/* Elegant Task Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={taskPendingDelete !== null}
        title="Eliminar tarea"
        message={
          taskPendingDelete
            ? `¿Estás seguro de que deseas eliminar la tarea "${taskPendingDelete.title}"?`
            : ''
        }
        confirmLabel="Eliminar tarea"
        cancelLabel="Cancelar"
        isDestructive={true}
        onConfirm={() => {
          if (taskPendingDelete) {
            store.deleteTask(taskPendingDelete.id);
            if (selectedTaskId === taskPendingDelete.id) {
              setSelectedTaskId(null);
            }
            setTaskPendingDelete(null);
          }
        }}
        onClose={() => setTaskPendingDelete(null)}
      />

      {/* Undo Delete Toast */}
      {store.lastDeletedTask && (
        <div
          role="status"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-xl bg-[#0F172A] text-white text-[13px] shadow-lg"
        >
          <span className="max-w-[220px] truncate">
            Se ha eliminado &ldquo;{store.lastDeletedTask.title}&rdquo;
          </span>
          <button
            type="button"
            onClick={store.undoDeleteTask}
            className="font-semibold text-[#60A5FA] hover:text-[#93C5FD] transition-colors whitespace-nowrap"
          >
            Deshacer
          </button>
          <button
            type="button"
            onClick={store.dismissDeletedToast}
            aria-label="Cerrar notificación"
            className="text-[#94A3B8] hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
