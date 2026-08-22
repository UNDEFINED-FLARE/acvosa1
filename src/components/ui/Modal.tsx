import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
}

export function Modal({ open, onClose, children, title }: ModalProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in">
      <div className="absolute inset-0 bg-ink-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-md bg-ink-white rounded-t-3xl sm:rounded-3xl shadow-lift border border-ink-light-grey animate-slide-up max-h-[90vh] overflow-y-auto scrollbar-thin">
        {title && (
          <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-light-grey sticky top-0 bg-ink-white rounded-t-3xl z-10">
            <h3 className="text-base font-semibold text-ink-charcoal tracking-tight">{title}</h3>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full flex items-center justify-center text-ink-dark-grey hover:bg-ink-light-grey transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
