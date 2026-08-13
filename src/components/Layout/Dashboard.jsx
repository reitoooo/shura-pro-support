import { useState } from 'react';
import { useLocation, useNavigate, Outlet } from 'react-router-dom';
import InboxFab from '../Inbox/InboxFab';
import ProfileSettingsModal from '../Profile/ProfileSettingsModal';
import { Flame, Menu, X, LogOut, Shield, Settings, User, BookOpen } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { logout, isAdmin, isMentor } = useAuth();
  
  // URLパスを元にサイドバーのアクティブ状態を判定
  let activeBottomTab = 'canvas';
  if (location.pathname.includes('/admin')) {
    activeBottomTab = 'admin';
  } else if (location.pathname.includes('/mentor')) {
    activeBottomTab = 'mentor';
  } else if (location.pathname.includes('/members/')) {
    const source = location.state?.source;
    if (source === 'admin') activeBottomTab = 'admin';
    else if (source === 'mentor') activeBottomTab = 'mentor';
  }

  const handleTabChange = (tab) => {
    navigate(tab === 'canvas' ? '/' : `/${tab}`);
    setSidebarOpen(false);
  };

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      position: 'relative',
    }}>
      {/* Ambient background */}
      <div className="ambient-bg" />

      {/* Mobile menu button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: 'fixed',
          top: '1rem',
          left: '1rem',
          zIndex: 1001,
          display: 'none',
          width: '2.5rem',
          height: '2.5rem',
          borderRadius: 'var(--radius-md)',
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-glass-border)',
          color: 'var(--color-text-primary)',
          cursor: 'pointer',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        className="mobile-menu-btn"
      >
        {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? 'open' : ''}`}
        style={{
          width: '60px',
          background: 'var(--color-bg-primary)',
          borderRight: '1px solid var(--color-glass-border)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '1.25rem 0',
          gap: '0.5rem',
          position: 'fixed',
          top: 0,
          bottom: 0,
          zIndex: 1000,
        }}
      >
        {/* Logo */}
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: 'var(--radius-lg)',
          background: 'linear-gradient(135deg, var(--color-heat-low), var(--color-heat-mid))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1rem',
          boxShadow: 'var(--shadow-glow-heat)',
        }}>
          <Flame color="white" size={24} />
        </div>

          <div
            title="プレイヤーダッシュボード"
            onClick={() => handleTabChange('canvas')}
            style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              background: activeBottomTab === 'canvas' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
              color: activeBottomTab === 'canvas' ? 'var(--color-cool-primary)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              gap: '2px',
            }}
          >
            <User size={18} />
            <span style={{ fontSize: '0.5rem', fontWeight: 'bold' }}>自分</span>
          </div>

          {isMentor && (
            <div
              title="メンターダッシュボード"
              onClick={() => handleTabChange('mentor')}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: activeBottomTab === 'mentor' ? 'rgba(34, 197, 94, 0.15)' : 'transparent', // Greenish
                color: activeBottomTab === 'mentor' ? 'var(--color-success)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                gap: '2px',
              }}
            >
              <BookOpen size={18} />
              <span style={{ fontSize: '0.5rem', fontWeight: 'bold' }}>メンター</span>
            </div>
          )}

          {isAdmin && (
            <div
              title="運営ダッシュボード"
              onClick={() => handleTabChange('admin')}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: activeBottomTab === 'admin' ? 'rgba(239, 68, 68, 0.15)' : 'transparent',
                color: activeBottomTab === 'admin' ? 'var(--color-danger)' : 'var(--color-text-muted)',
                cursor: 'pointer',
                gap: '2px',
              }}
            >
              <Shield size={18} />
              <span style={{ fontSize: '0.5rem', fontWeight: 'bold' }}>運営</span>
            </div>
          )}

        <div style={{ flex: 1 }} />

        {/* Settings */}
        <div
          title="プロフィール設定"
          onClick={() => setShowSettings(true)}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-primary)';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <Settings size={18} />
        </div>

        {/* Logout */}
        <div
          title="ログアウト"
          onClick={logout}
          style={{
            width: '40px',
            height: '40px',
            borderRadius: 'var(--radius-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--color-text-muted)',
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--color-danger)';
            e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--color-text-muted)';
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <LogOut size={18} />
        </div>

        {/* Version */}
        <span style={{
          fontSize: '0.5rem',
          color: 'var(--color-text-muted)',
          writingMode: 'vertical-lr',
          letterSpacing: '0.1em',
        }}>
          MVP v1.0
        </span>
      </aside>

      {/* Main content */}
      <main style={{
        flex: 1,
        marginLeft: '60px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        maxWidth: 'calc(100vw - 60px)',
      }}>
        {/* Top bar */}
        <header style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.875rem 1.5rem',
          borderBottom: '1px solid var(--color-glass-border)',
          background: 'rgba(17, 17, 24, 0.8)',
          backdropFilter: 'blur(20px)',
          position: 'sticky',
          top: 0,
          zIndex: 100,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <h1 style={{
              fontSize: '1.125rem',
              fontWeight: 800,
              letterSpacing: '-0.01em',
            }}>
              <span className="heat-gradient-text">修羅プロ</span>
              <span style={{ color: 'var(--color-text-muted)', fontWeight: 500, fontSize: '0.75rem', marginLeft: '0.5rem' }}>
                サポートアプリ
              </span>
            </h1>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <div className="animate-fire" style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.375rem',
              padding: '0.375rem 0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-full)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}>
              <Flame size={14} color="var(--color-heat-low)" />
              <span style={{
                fontSize: '0.75rem',
                fontWeight: 700,
                fontFamily: 'var(--font-family-mono)',
                color: 'var(--color-heat-low)',
              }}>
                LIVE
              </span>
            </div>
          </div>
        </header>

        {/* Dashboard content */}
        <div style={{
          flex: 1,
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem',
          overflowY: 'auto',
        }}>
          {/* Route Content */}
          <Outlet />
        </div>
      </main>

      {showSettings && <ProfileSettingsModal onClose={() => setShowSettings(false)} />}
      <style>{`
        .sidebar {
          left: 0;
          transition: transform 0.3s ease;
        }
        @media (max-width: 1024px) {
          .sidebar {
            transform: translateX(-100%);
          }
          .sidebar.open {
            transform: translateX(0);
          }
          .mobile-menu-btn {
            display: flex !important;
          }
          main {
            margin-left: 0 !important;
            max-width: 100vw !important;
          }
        }
      `}</style>
      <InboxFab />
    </div>
  );
}
