import { HURDLE_LEVELS } from '../../utils/heatPointCalculator';

export default function HurdleSelector({ value, onChange }) {
  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.5rem',
      }}>
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          心理的ハードル（重みづけ）
        </span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: HURDLE_LEVELS[value - 1]?.color || '#22c55e',
          fontFamily: 'var(--font-family-mono)',
        }}>
          ×{HURDLE_LEVELS[value - 1]?.multiplier || 1}
        </span>
      </div>

      <div style={{
        display: 'flex',
        gap: '4px',
        width: '100%',
      }}>
        {HURDLE_LEVELS.map((hurdle) => {
          const isActive = value >= hurdle.level;
          const isSelected = value === hurdle.level;

          return (
            <button
              key={hurdle.level}
              onClick={() => onChange(hurdle.level)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '0.5rem 0.25rem',
                background: isActive
                  ? `${hurdle.color}20`
                  : 'var(--color-bg-surface)',
                border: isSelected
                  ? `2px solid ${hurdle.color}`
                  : '2px solid transparent',
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                outline: 'none',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{hurdle.emoji}</span>
              <span style={{
                fontSize: '0.5625rem',
                fontWeight: 600,
                color: isActive ? hurdle.color : 'var(--color-text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {hurdle.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
