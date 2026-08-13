import { useState } from 'react';
import ObjectiveKPIPanel from '../ObjectiveKPI/ObjectiveKPIPanel';
import HeatPointPanel from '../HeatPoint/HeatPointPanel';
import ShuraCanvasPanel from '../ShuraCanvas/ShuraCanvasPanel';
import CommunityPanel from '../Community/CommunityPanel';
import CalendarTimeline from '../Integration/CalendarTimeline';
import GrowthLogPanel from '../GrowthLog/GrowthLogPanel';
import InboxFab from '../Inbox/InboxFab';
import AdminDashboard from '../Admin/AdminDashboard';
import ProfileSettingsModal from '../Profile/ProfileSettingsModal';
import { Flame, LayoutDashboard, Menu, X, LogOut, Shield, Settings, MessageSquare, Users, Calendar, User, Kanban } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function Dashboard() {
  const [activeBottomTab, setActiveBottomTab] = useState(() => {
    return localStorage.getItem('shurapro_active_tab') || 'canvas';
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  const handleTabChange = (tab) => {
    setActiveBottomTab(tab);
    localStorage.setItem('shurapro_active_tab', tab);
  };
  const [showSettings, setShowSettings] = useState(false);
  const { logout, isAdmin } = useAuth();

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
          left: sidebarOpen ? 0 : undefined,
          bottom: 0,
          zIndex: 1000,
          transition: 'left var(--transition-base)',
        }}
        className="sidebar"
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
            background: activeBottomTab !== 'admin' ? 'rgba(6, 182, 212, 0.15)' : 'transparent',
            color: activeBottomTab !== 'admin' ? 'var(--color-cool-primary)' : 'var(--color-text-muted)',
            cursor: 'pointer',
            gap: '2px',
          }}
        >
          <User size={18} />
          <span style={{ fontSize: '0.5rem', fontWeight: 'bold' }}>自分</span>
        </div>

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
          {activeBottomTab === 'admin' && isAdmin ? (
            <div className="animate-fade-in-up">
              <AdminDashboard />
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: '320px 1fr',
              gap: 'var(--spacing-panel)',
              flex: 1,
              minHeight: 0,
            }} className="dashboard-grid">
              
              {/* Left Column: Heat Points */}
              <div className="animate-fade-in-up" style={{ 
                alignSelf: 'start',
                position: 'sticky',
                top: 0
              }}>
                <HeatPointPanel />
              </div>

              {/* Right Column: Objective & Tabs */}
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 'var(--spacing-panel)',
                minWidth: 0 // prevent grid blowout
              }}>
                {/* Top Area — Objective KPI */}
                <div className="animate-fade-in-up delay-100">
                  <ObjectiveKPIPanel />
                </div>

                {/* Tabbed area */}
                <div className="animate-fade-in-up delay-200" style={{ 
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  minHeight: '600px'
                }}>
                  {/* Tab Navigation */}
                  <div style={{
                    display: 'flex',
                    gap: '0.5rem',
                    marginBottom: '1rem',
                    background: 'var(--color-bg-surface)',
                    padding: '0.375rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--color-glass-border)',
                  }}>
                    {[
                      { key: 'canvas', label: '修羅キャンバス', icon: <Kanban size={14} /> },
                      { key: 'growth', label: '成長ログ', icon: <MessageSquare size={14} /> },
                      { key: 'community', label: 'コミュニティ', icon: <Users size={14} /> },
                      { key: 'calendar', label: 'カレンダー', icon: <Calendar size={14} /> },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setActiveBottomTab(tab.key)}
                        style={{
                          flex: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          padding: '0.625rem 1rem',
                          borderRadius: 'var(--radius-md)',
                          border: 'none',
                          background: activeBottomTab === tab.key ? 'var(--color-bg-hover)' : 'transparent',
                          color: activeBottomTab === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                          fontSize: '0.8125rem',
                          fontWeight: activeBottomTab === tab.key ? 700 : 600,
                          cursor: 'pointer',
                          transition: 'all var(--transition-fast)',
                          boxShadow: activeBottomTab === tab.key ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                        }}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab content */}
                  <div style={{ flex: 1, minHeight: 0 }}>
                    {activeBottomTab === 'canvas' && <ShuraCanvasPanel />}
                    {activeBottomTab === 'growth' && <GrowthLogPanel />}
                    {activeBottomTab === 'community' && <CommunityPanel />}
                    {activeBottomTab === 'calendar' && <CalendarTimeline />}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {showSettings && <ProfileSettingsModal onClose={() => setShowSettings(false)} />}
      <style>{`
        @media (max-width: 1024px) {
          .sidebar {
            display: none !important;
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
