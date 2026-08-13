import { useState, useRef, useEffect } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { PenLine, Snowflake, X } from 'lucide-react';

export default function InboxFab() {
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState('');
  const dispatch = useAppDispatch();
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    dispatch({
      type: 'ADD_INBOX_MEMO',
      payload: { content: content.trim() }
    });

    dispatch({
      type: 'ADD_TOAST',
      payload: {
        type: 'success',
        message: '感情をメモとして残しました📝',
      }
    });

    setContent('');
    setIsOpen(false);
  };

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'var(--color-heat-mid)',
          color: '#fff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 1000,
          transition: 'transform 0.2s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.05)')}
        onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
        title="感情メモ"
      >
        <PenLine size={24} />
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 1001,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          {/* Modal Content - Slides up from bottom for mobile feel */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '500px',
              padding: '1.5rem',
              boxShadow: '0 -8px 24px rgba(0,0,0,0.4)',
              animation: 'slideUp 0.3s ease-out forwards',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                <Snowflake size={18} color="var(--color-cool-accent)" />
                感情メモ
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--color-text-muted)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <p style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', marginTop: 0 }}>
              移動中やふとした時の「気づき」「焦燥感」を、整形せずにそのまま放り込んでください。
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <textarea
                ref={inputRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="今は整理しなくてOK。何を感じた？"
                style={{
                  width: '100%',
                  minHeight: '120px',
                  background: 'var(--color-bg-deep)',
                  border: '1px solid var(--color-glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  color: 'var(--color-text-primary)',
                  fontSize: '1rem',
                  resize: 'none',
                }}
              />

              <button
                type="submit"
                disabled={!content.trim()}
                style={{
                  background: content.trim() ? 'var(--color-cool-primary)' : 'var(--color-glass-border)',
                  color: content.trim() ? '#000' : 'var(--color-text-muted)',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  cursor: content.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.2s',
                }}
              >
                <Snowflake size={16} />
                メモして残す
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </>
  );
}
