import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { Project, ProjectAccent } from '../types/taskflow';

interface ProjectModalProps {
  isOpen: boolean;
  editingProject?: Project | null;
  onClose: () => void;
  onSave: (input: { name: string; description: string; accent: ProjectAccent }) => void;
}

const ACCENTS: { id: ProjectAccent; label: string; swatch: string }[] = [
  { id: 'blue', label: 'Azul cobalto', swatch: 'bg-[#2563EB]' },
  { id: 'indigo', label: 'Índigo', swatch: 'bg-[#4F46E5]' },
  { id: 'emerald', label: 'Esmeralda', swatch: 'bg-[#10B981]' },
  { id: 'slate', label: 'Pizarra', swatch: 'bg-[#64748B]' },
];

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  editingProject,
  onClose,
  onSave,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [accent, setAccent] = useState<ProjectAccent>('blue');

  useEffect(() => {
    if (isOpen) {
      setName(editingProject?.name ?? '');
      setDescription(editingProject?.description ?? '');
      setAccent(editingProject?.accent ?? 'blue');
    }
  }, [isOpen, editingProject]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name, description, accent });
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/30 backdrop-blur-[4px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={editingProject ? 'Editar proyecto' : 'Crear proyecto'}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[440px] rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <h2 className="text-[18px] font-semibold text-[#0F172A]">
            {editingProject ? 'Editar proyecto' : 'Nuevo proyecto'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label
              htmlFor="project-name"
              className="block text-[12px] font-semibold text-[#334155] mb-1.5"
            >
              Nombre del proyecto
            </label>
            <input
              id="project-name"
              type="text"
              autoFocus
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="ej. Plan de Infraestructura Q1"
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3.5 py-2 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] tf-input"
            />
          </div>

          <div>
            <label
              htmlFor="project-desc"
              className="block text-[12px] font-semibold text-[#334155] mb-1.5"
            >
              Objetivo / Descripción
            </label>
            <textarea
              id="project-desc"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe brevemente el alcance o resultado esperado..."
              className="w-full rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] px-3.5 py-2 text-[14px] text-[#0F172A] placeholder:text-[#94A3B8] tf-input"
            />
          </div>

          <div>
            <span className="block text-[12px] font-semibold text-[#334155] mb-2">
              Color distintivo
            </span>
            <div className="grid grid-cols-2 gap-2">
              {ACCENTS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setAccent(item.id)}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-lg border text-[13px] font-medium transition-colors ${
                    accent === item.id
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                      : 'border-[#E2E8F0] bg-[#FFFFFF] text-[#334155] hover:bg-[#F8FAFC]'
                  }`}
                >
                  <span className={`w-2.5 h-2.5 rounded-full ${item.swatch}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-[13px] font-semibold text-[#334155] hover:bg-[#F1F5F9] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!name.trim()}
              className="px-4 py-2 rounded-lg bg-[#2563EB] hover:bg-[#1D4ED8] active:scale-[0.98] text-white text-[13px] font-semibold disabled:opacity-40 transition-all tf-btn-primary"
            >
              {editingProject ? 'Guardar cambios' : 'Crear proyecto'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
