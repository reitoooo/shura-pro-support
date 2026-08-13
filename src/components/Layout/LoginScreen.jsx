import { useAuth } from '../../context/AuthContext';
import { Target, Lock, AlertCircle, LogIn } from 'lucide-react';
import { useState } from 'react';

export default function LoginScreen() {
  const { loginWithGoogle, authError } = useAuth();
  const [localError, setLocalError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const error = localError || authError;

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      setLocalError('');
      await loginWithGoogle();
    } catch (err) {
      setLocalError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem',
      position: 'relative',
    }}>
      <div className="animate-fade-in-up glass-panel" style={{
        maxWidth: '400px',
        width: '100%',
        padding: '3rem 2rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 10,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          marginBottom: '1.5rem',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--color-brand-primary), var(--color-brand-secondary))',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 8px 16px rgba(239, 68, 68, 0.3)',
          }}>
            <Target size={32} color="#fff" />
          </div>
        </div>

        <h1 style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: 'var(--color-text-primary)',
          letterSpacing: '0.05em',
          marginBottom: '0.5rem',
        }}>
          修羅プロ
        </h1>
        <p style={{
          fontSize: '0.875rem',
          color: 'var(--color-text-secondary)',
          marginBottom: '2.5rem',
        }}>
          仮説検証と熱量のサポートプラットフォーム
        </p>

        {error && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: '0.75rem',
            marginBottom: '1.5rem',
            textAlign: 'left',
          }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <button
          onClick={handleLogin}
          disabled={isLoading}
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            padding: '1rem',
            background: '#ffffff',
            color: '#1f2937',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.875rem',
            fontWeight: 700,
            cursor: isLoading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            opacity: isLoading ? 0.7 : 1,
          }}
          onMouseEnter={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(-2px)';
              e.currentTarget.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.15)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isLoading) {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            }
          }}
        >
          {isLoading ? (
            <span className="spinner" style={{ width: '18px', height: '18px', border: '2px solid rgba(0,0,0,0.1)', borderTopColor: '#1f2937' }} />
          ) : (
            <>
              <svg width="18" height="18" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              <span>Googleでログイン</span>
            </>
          )}
        </button>

        <div style={{
          marginTop: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.375rem',
          color: 'var(--color-text-muted)',
          fontSize: '0.6875rem',
        }}>
          <Lock size={12} />
          <span>Google連携によりカレンダー・タスク同期を利用します</span>
        </div>
      </div>
    </div>
  );
}
