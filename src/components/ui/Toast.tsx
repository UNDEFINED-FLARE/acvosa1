import { useApp } from '@/context/AppContext';
import { CheckCircle2, Info, X, AlertCircle } from 'lucide-react';

export function ToastStack() {
  const { toasts, dismissToast } = useApp();
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-24 sm:bottom-6 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 w-full max-w-sm px-4 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="pointer-events-auto flex items-start gap-3 bg-ink-charcoal text-ink-white rounded-2xl px-4 py-3 shadow-lift animate-toast-in"
        >
          <span className="mt-0.5 shrink-0">
            {t.tone === 'success' && <CheckCircle2 size={18} className="text-ink-white" />}
            {t.tone === 'info' && <Info size={18} className="text-ink-white opacity-80" />}
            {t.tone === 'error' && <AlertCircle size={18} className="text-ink-white" />}
          </span>
          <p className="text-sm leading-snug flex-1">{t.message}</p>
          <button
            onClick={() => dismissToast(t.id)}
            className="shrink-0 text-ink-white/60 hover:text-ink-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>
      ))}
    </div>
  );
}
