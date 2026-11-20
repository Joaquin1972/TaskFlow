import React, { useEffect } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

export const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Eliminar',
  cancelLabel = 'Cancelar',
  isDestructive = true,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/30 backdrop-blur-[4px]"
      onClick={onClose}
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-description"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] rounded-2xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-[0_20px_25px_-5px_rgba(15,23,42,0.08),0_8px_10px_-6px_rgba(15,23,42,0.04)] overflow-hidden"
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E2E8F0]">
          <div className="flex items-center gap-2.5">
            {isDestructive && (
              <div className="w-8 h-8 rounded-lg bg-[#FEE2E2] text-[#DC2626] flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
            )}
            <h2 id="confirm-modal-title" className="text-[17px] font-semibold text-[#0F172A]">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de confirmación"
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#0F172A] hover:bg-[#F1F5F9] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6">
          <p id="confirm-modal-description" className="text-[14px] text-[#475569] leading-relaxed">
            {message}
          </p>

          <div className="mt-6 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg border border-[#E2E8F0] bg-[#FFFFFF] hover:bg-[#F8FAFC] text-[13px] font-medium text-[#475569] transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              type="button"
              autoFocus
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className={`px-4 py-2 rounded-lg text-[13px] font-semibold text-white transition-colors tf-focus-ring ${
                isDestructive
                  ? 'bg-[#DC2626] hover:bg-[#B91C1C]'
                  : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
              }`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
