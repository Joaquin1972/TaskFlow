import React, { useState } from 'react';
import { Download, RotateCcw, X } from 'lucide-react';
import { Project, Task, UserPreferences } from '../types/taskflow';

interface SettingsModalProps {
  isOpen: boolean;
  preferences: UserPreferences;
  tasks: Task[];
  projects: Project[];
  onClose: () => void;
  onUpdatePreferences: (patch: Partial<UserPreferences>) => void;
  onResetWorkspace: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  preferences,
  tasks,
  projects,
  onClose,
  onUpdatePreferences,
  onResetWorkspace,
}) => {
  const [confirmReset, setConfirmReset] = useState(false);

  if (!isOpen) return null;

  const handleExportJson = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      projects,
      tasks,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `taskflow-copia-seguridad-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/30 backdrop-blur-[4px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Preferencias del espacio de trabajo"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[480px] rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">Preferencias del espacio de trabajo</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar preferencias"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="pref-name"
                className="block text-[12px] font-semibold text-[#334155] mb-1.5"
              >
                Nombre visible
              </label>
              <input
                id="pref-name"
                type="text"
                value={preferences.userName}
                onChange={(e) => onUpdatePreferences({ userName: e.target.value })}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#0F172A] tf-input"
              />
            </div>

            <div>
              <label
                htmlFor="pref-role"
                className="block text-[12px] font-semibold text-[#334155] mb-1.5"
              >
                Rol profesional
              </label>
              <input
                id="pref-role"
                type="text"
                value={preferences.userRole}
                onChange={(e) => onUpdatePreferences({ userRole: e.target.value })}
                className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3 py-2 text-[14px] text-[#0F172A] tf-input"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2 border-t border-[#E2E8F0]">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[14px] font-semibold text-[#0F172A]">Densidad de la lista</div>
                <div className="text-[12px] text-[#64748B]">
                  Ajusta el espaciado vertical entre filas de tareas
                </div>
              </div>
              <div className="flex items-center gap-1 p-1 bg-[#F1F5F9] rounded-lg">
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ density: 'comfortable' })}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    preferences.density === 'comfortable'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Cómoda
                </button>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ density: 'compact' })}
                  className={`px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                    preferences.density === 'compact'
                      ? 'bg-white text-[#0F172A] shadow-sm'
                      : 'text-[#64748B] hover:text-[#0F172A]'
                  }`}
                >
                  Compacta
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <div>
                <div className="text-[14px] font-semibold text-[#0F172A]">
                  Mostrar tareas completadas
                </div>
                <div className="text-[12px] text-[#64748B]">
                  Mantener elementos completados visibles en las vistas de Hoy y Proyectos
                </div>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={preferences.showCompleted}
                aria-label="Alternar mostrar tareas completadas"
                onClick={() =>
                  onUpdatePreferences({ showCompleted: !preferences.showCompleted })
                }
                className={`w-11 h-6 rounded-full transition-colors p-0.5 ${
                  preferences.showCompleted ? 'bg-[#2563EB]' : 'bg-[#CBD5E1]'
                }`}
              >
                <span
                  className={`block w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${
                    preferences.showCompleted ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg bg-[#EFF6FF] hover:bg-[#DBEAFE] text-[#1D4ED8] text-[13px] font-semibold transition-colors"
            >
              <Download className="w-4 h-4" />
              Exportar JSON
            </button>

            {!confirmReset ? (
              <button
                type="button"
                onClick={() => setConfirmReset(true)}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-[#64748B] hover:text-[#DC2626] hover:bg-[#FEE2E2]/60 text-[13px] font-medium transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                Restablecer datos demo
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmReset(false)}
                  className="px-3 py-1.5 rounded-lg text-[12px] font-medium text-[#475569] hover:bg-[#F1F5F9]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onResetWorkspace();
                    setConfirmReset(false);
                    onClose();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-[#EF4444] hover:bg-[#DC2626] text-white text-[12px] font-semibold"
                >
                  Confirmar restablecimiento
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
