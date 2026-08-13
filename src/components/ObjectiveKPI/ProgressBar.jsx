export default function ProgressBar({ value, max = 100, label, showPercentage = true, variant = 'cool' }) {
  const percentage = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;

  const gradients = {
    cool: 'linear-gradient(90deg, var(--color-cool-primary), var(--color-cool-secondary))',
    heat: 'linear-gradient(90deg, var(--color-heat-low), var(--color-heat-high))',
    success: 'linear-gradient(90deg, var(--color-success), var(--color-cool-primary))',
  };

  const glows = {
    cool: '0 0 12px var(--color-cool-glow)',
    heat: '0 0 12px var(--color-heat-glow)',
    success: '0 0 12px rgba(16, 185, 129, 0.3)',
  };

  return (
    <div style={{ width: '100%' }}>
      {(label || showPercentage) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '0.5rem',
        }}>
          {label && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              color: 'var(--color-text-secondary)',
              letterSpacing: '0.02em',
            }}>
              {label}
            </span>
          )}
          {showPercentage && (
            <span style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              color: 'var(--color-text-primary)',
              fontFamily: 'var(--font-family-mono)',
            }}>
              {percentage}%
            </span>
          )}
        </div>
      )}
      <div
        style={{
          width: '100%',
          height: '8px',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-full)',
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        <div
          className="animate-progress"
          style={{
            height: '100%',
            width: `${percentage}%`,
            background: gradients[variant],
            borderRadius: 'var(--radius-full)',
            boxShadow: glows[variant],
            transition: 'width 0.6s ease-out',
            position: 'relative',
          }}
        >
          {/* Shimmer effect */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.2) 50%, transparent 100%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 2s linear infinite',
              borderRadius: 'var(--radius-full)',
            }}
          />
        </div>
      </div>
    </div>
  );
}
