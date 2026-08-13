import ProgressBar from '../ObjectiveKPI/ProgressBar';

// Mock member data
const MOCK_MEMBERS = [
  {
    name: '佐藤さん',
    avatar: '🧑‍💻',
    heatPoints: 142,
    milestoneProgress: 65,
    velocityThisWeek: 3,
    commitHours: 12.5,
    targetHours: 20,
    status: 'On stage 🔥',
  },
  {
    name: '鈴木さん',
    avatar: '👩‍🎓',
    heatPoints: 87,
    milestoneProgress: 40,
    velocityThisWeek: 2,
    commitHours: 8.0,
    targetHours: 15,
    status: 'いい調子！',
  },
  {
    name: '田中さん',
    avatar: '🧑‍🔬',
    heatPoints: 215,
    milestoneProgress: 80,
    velocityThisWeek: 5,
    commitHours: 18.0,
    targetHours: 20,
    status: '超On stage!! 🔥🔥',
  },
];

export default function MemberProgress({ selectedMember = null }) {
  const members = selectedMember
    ? MOCK_MEMBERS.filter((m) => m.name === selectedMember)
    : MOCK_MEMBERS;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.75rem',
    }}>
      {members.map((member) => (
        <div
          key={member.name}
          style={{
            padding: '0.875rem',
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-glass-border)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {/* Member header */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
          }}>
            <span style={{ fontSize: '1.25rem' }}>{member.avatar}</span>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '0.8125rem',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}>
                {member.name}
              </div>
              <div style={{
                fontSize: '0.625rem',
                color: 'var(--color-heat-low)',
                fontWeight: 600,
              }}>
                {member.status}
              </div>
            </div>
            <div style={{
              textAlign: 'right',
            }}>
              <div style={{
                fontSize: '1.125rem',
                fontWeight: 800,
                fontFamily: 'var(--font-family-mono)',
              }}>
                <span className="heat-gradient-text">{member.heatPoints}</span>
              </div>
              <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)' }}>
                pt（今日）
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <ProgressBar
              label="マイルストーン"
              value={member.milestoneProgress}
              max={100}
              variant="cool"
            />
            <div style={{
              display: 'flex',
              gap: '1rem',
              fontSize: '0.6875rem',
              color: 'var(--color-text-muted)',
            }}>
              <span>ベロシティ: <strong style={{ color: 'var(--color-cool-primary)' }}>{member.velocityThisWeek}/週</strong></span>
              <span>コミット: <strong style={{ color: 'var(--color-text-secondary)' }}>{member.commitHours}/{member.targetHours}h</strong></span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
