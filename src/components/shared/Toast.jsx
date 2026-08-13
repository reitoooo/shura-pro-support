import { useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const ICON_MAP = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const COLOR_MAP = {
  success: { bg: 'rgba(34, 197, 94, 0.15)', border: 'rgba(34, 197, 94, 0.3)', text: '#22c55e' },
  error: { bg: 'rgba(239, 68, 68, 0.15)', border: 'rgba(239, 68, 68, 0.3)', text: '#ef4444' },
  info: { bg: 'rgba(6, 182, 212, 0.15)', border: 'rgba(6, 182, 212, 0.3)', text: '#06b6d4' },
};

function ToastItem({ toast }) {
  const dispatch = useAppDispatch();
  const Icon = ICON_MAP[toast.type] || Info;
  const colors = COLOR_MAP[toast.type] || COLOR_MAP.info;

  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch({ type: 'REMOVE_TOAST', payload: toast.id });
    }, toast.duration || 3000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        padding: '0.875rem 1rem',
        background: colors.bg,
        border: `1px solid ${colors.border}`,
        borderRadius: 'var(--radius-lg)',
        backdropFilter: 'blur(20px)',
        animation: 'toast-in 0.3s ease-out forwards',
        minWidth: '280px',
        maxWidth: '400px',
      }}
    >
      <Icon size={18} color={colors.text} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '0.8125rem', color: 'var(--color-text-primary)', lineHeight: 1.4 }}>
        {toast.message}
      </span>
      <button
        onClick={() => dispatch({ type: 'REMOVE_TOAST', payload: toast.id })}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          padding: '2px',
          flexShrink: 0,
          display: 'flex',
        }}
      >
        <X size={14} />
      </button>
    </div>
  );
}

export default function Toast() {
  const { toasts } = useAppState();

  if (toasts.length === 0) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '1.5rem',
        right: '1.5rem',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}
