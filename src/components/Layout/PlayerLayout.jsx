import { useState } from 'react';
import ObjectiveKPIPanel from '../ObjectiveKPI/ObjectiveKPIPanel';
import HeatPointPanel from '../HeatPoint/HeatPointPanel';
import ShuraCanvasPanel from '../ShuraCanvas/ShuraCanvasPanel';
import GrowthLogPanel from '../GrowthLog/GrowthLogPanel';
import CommunityPanel from '../Community/CommunityPanel';
import CalendarTimeline from '../Integration/CalendarTimeline';
import MeetingNotesPanel from '../Meeting/MeetingNotesPanel';
import { MessageSquare, Users, Calendar, Kanban, FileText } from 'lucide-react';

export default function PlayerLayout() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem('shurapro_player_tab') || 'canvas';
  });

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
    localStorage.setItem('shurapro_player_tab', tabKey);
  };

  return (
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
              { key: 'meeting', label: '面談記録', icon: <FileText size={14} /> },
              { key: 'community', label: 'コミュニティ', icon: <Users size={14} /> },
              { key: 'calendar', label: 'カレンダー', icon: <Calendar size={14} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleTabChange(tab.key)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.5rem',
                  padding: '0.625rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  border: 'none',
                  background: activeTab === tab.key ? 'var(--color-bg-hover)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  fontSize: '0.8125rem',
                  fontWeight: activeTab === tab.key ? 700 : 600,
                  cursor: 'pointer',
                  transition: 'all var(--transition-fast)',
                  boxShadow: activeTab === tab.key ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab content via Local State */}
          <div style={{ flex: 1, minHeight: 0 }}>
            {activeTab === 'canvas' && <ShuraCanvasPanel />}
            {activeTab === 'growth' && <GrowthLogPanel />}
            {activeTab === 'meeting' && <MeetingNotesPanel />}
            {activeTab === 'community' && <CommunityPanel />}
            {activeTab === 'calendar' && <CalendarTimeline />}
          </div>
        </div>
      </div>
    </div>
  );
}
