import { AlertTriangle } from 'lucide-react';

export default function ConfirmDialog({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel, 
  confirmText = '削除する', 
  cancelText = 'キャンセル' 
}) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
    }}>
      <div className="animate-fade-in-up" style={{
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.5rem',
        maxWidth: '400px',
        width: '90%',
        boxShadow: 'var(--shadow-elevation-high)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1rem' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: 'var(--radius-full)',
            background: 'rgba(239, 68, 68, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <AlertTriangle size={16} color="var(--color-error)" />
          </div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>{title}</h3>
        </div>
        
        <p style={{ fontSize: '0.875rem', color: 'var(--color-text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          {message}
        </p>
        
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
          <button className="btn-ghost" onClick={onCancel} style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            style={{
              background: 'var(--color-error)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '0.5rem 1.25rem',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              transition: 'background var(--transition-fast)'
            }}
            onMouseEnter={(e) => e.target.style.background = '#dc2626'}
            onMouseLeave={(e) => e.target.style.background = 'var(--color-error)'}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
