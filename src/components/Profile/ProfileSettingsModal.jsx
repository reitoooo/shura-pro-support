import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { X, Save, Users, Tag as TagIcon } from 'lucide-react';

export default function ProfileSettingsModal({ onClose }) {
  const { profile } = useAppState();
  const dispatch = useAppDispatch();
  
  const [isSaving, setIsSaving] = useState(false);

  // Stop propagation to prevent closing when clicking inside
  const handleContentClick = (e) => e.stopPropagation();

  const handleSave = () => {
    setIsSaving(true);
    
    // In the future, other profile fields (e.g. displayName, bio) can be added here.
    dispatch({
      type: 'UPDATE_PROFILE',
      payload: {
        // Only saving other fields, team/tags are managed by admin.
      }
    });
    
    dispatch({
      type: 'ADD_TOAST',
      payload: { type: 'success', message: 'プロフィールを更新しました' }
    });
    
    setTimeout(() => {
      setIsSaving(false);
      onClose();
    }, 500);
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '1rem',
      }}
    >
      <div
        onClick={handleContentClick}
        className="glass-panel"
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--color-bg-elevated)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          animation: 'fade-in-up 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--color-glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
            プロフィール設定
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--radius-sm)',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-surface-hover)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem', lineHeight: '1.5' }}>
            <p>※チームやタグの設定は、現在運営側で行うよう変更されました。</p>
            <p style={{ marginTop: '0.5rem' }}>その他のプロフィール情報（表示名やアイコンなど）の編集機能は、今後のアップデートで追加予定です。</p>
          </div>
        </div>

        <div style={{
          padding: '1.25rem 1.5rem',
          borderTop: '1px solid var(--color-glass-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          background: 'rgba(0,0,0,0.1)'
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '0.5rem 1rem',
              background: 'transparent',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              fontWeight: 500,
            }}
          >
            キャンセル
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            style={{
              padding: '0.5rem 1.25rem',
              background: 'var(--color-primary)',
              border: 'none',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--color-bg-primary)',
              cursor: 'pointer',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              opacity: isSaving ? 0.7 : 1,
            }}
          >
            <Save size={16} />
            {isSaving ? '保存中...' : '保存'}
          </button>
        </div>
      </div>
    </div>
  );
}
