import { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import TimelineItem from './TimelineItem';
import MemberProgress from './MemberProgress';
import { Users, Activity, UserCheck } from 'lucide-react';

// Mock community activity
const MOCK_COMMUNITY_FEED = [
  { id: 'mock-1', type: 'heat_record', message: '45pt 獲得！ — プログラミング学習', timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), user: '佐藤さん' },
  { id: 'mock-2', type: 'hypothesis_update', message: '仮説のステータスを「検証中」に変更', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), user: '鈴木さん' },
  { id: 'mock-3', type: 'heat_record', message: '120pt 獲得！ — 英語リスニング', timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(), user: '田中さん' },
  { id: 'mock-4', type: 'milestone', message: 'マイルストーン「MVP完成」を達成！', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), user: '佐藤さん' },
  { id: 'mock-5', type: 'hypothesis_update', message: '仮説のステータスを「完了」に変更', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), user: '田中さん' },
  { id: 'mock-6', type: 'heat_record', message: '30pt 獲得！ — 読書', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), user: '鈴木さん' },
];

export default function CommunityPanel() {
  const { activityLog, profile } = useAppState();
  const [activeTab, setActiveTab] = useState('timeline');

  // Combine user's activity with mock community feed
  const allActivity = [
    ...activityLog,
    ...MOCK_COMMUNITY_FEED,
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <div className="glass-panel-static" style={{ padding: 'var(--spacing-panel)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} color="var(--color-success)" />
            <h2 style={{
              fontSize: '0.875rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              letterSpacing: '0.02em',
            }}>
              コミュニティ
            </h2>
          </div>
          {profile?.team && (
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.25rem' }}>
              所属チーム: <span style={{ color: 'var(--color-primary)', fontWeight: 600 }}>{profile.team}</span>
            </div>
          )}
        </div>
        <span className="badge badge-complete" style={{ fontSize: '0.625rem' }}>
          LIVE
        </span>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '1rem',
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '3px',
      }}>
        <button
          onClick={() => setActiveTab('timeline')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.5rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'timeline' ? 'var(--color-bg-elevated)' : 'transparent',
            color: activeTab === 'timeline' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Activity size={12} />
          タイムライン
        </button>
        <button
          onClick={() => setActiveTab('members')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.5rem',
            fontSize: '0.6875rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: activeTab === 'members' ? 'var(--color-bg-elevated)' : 'transparent',
            color: activeTab === 'members' ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <UserCheck size={12} />
          メンバー進捗
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {activeTab === 'timeline' ? (
          <div>
            {allActivity.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '2rem 1rem',
                color: 'var(--color-text-muted)',
              }}>
                <Activity size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
                <div style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                  まだアクティビティがありません
                </div>
              </div>
            ) : (
              allActivity.slice(0, 20).map((item) => (
                <TimelineItem key={item.id} item={item} />
              ))
            )}
          </div>
        ) : (
          <MemberProgress />
        )}
      </div>
    </div>
  );
}
