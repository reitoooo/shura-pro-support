export default function VelocityChart({ data = [], label = '仮説検証サイクル' }) {
  const maxVal = Math.max(...data, 1);
  const weekLabels = ['7w前', '6w前', '5w前', '4w前', '3w前', '2w前', '今週'];

  return (
    <div style={{ width: '100%' }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '0.75rem',
      }}>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 500,
          color: 'var(--color-text-secondary)',
          letterSpacing: '0.02em',
        }}>
          {label}
        </span>
        <span style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          color: 'var(--color-cool-primary)',
          fontFamily: 'var(--font-family-mono)',
        }}>
          {data[data.length - 1] || 0} cycles
        </span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-end',
          gap: '6px',
          height: '80px',
          padding: '0 4px',
        }}
      >
        {data.map((value, i) => {
          const height = maxVal > 0 ? (value / maxVal) * 100 : 0;
          const isLatest = i === data.length - 1;

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                height: '100%',
                justifyContent: 'flex-end',
              }}
            >
              <span style={{
                fontSize: '0.625rem',
                fontWeight: 600,
                color: isLatest ? 'var(--color-cool-primary)' : 'var(--color-text-muted)',
                fontFamily: 'var(--font-family-mono)',
              }}>
                {value}
              </span>
              <div
                className="animate-progress"
                style={{
                  width: '100%',
                  height: `${height}%`,
                  minHeight: value > 0 ? '4px' : '2px',
                  background: isLatest
                    ? 'linear-gradient(180deg, var(--color-cool-primary), var(--color-cool-secondary))'
                    : 'var(--color-bg-hover)',
                  borderRadius: '4px 4px 2px 2px',
                  boxShadow: isLatest ? '0 0 10px var(--color-cool-glow)' : 'none',
                  transition: 'height 0.6s ease-out',
                }}
              />
              <span style={{
                fontSize: '0.5625rem',
                color: 'var(--color-text-muted)',
                whiteSpace: 'nowrap',
              }}>
                {weekLabels[i] || ''}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
