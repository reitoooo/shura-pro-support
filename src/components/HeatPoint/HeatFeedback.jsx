import { useEffect, useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';

export default function HeatFeedback({ celebration }) {
  const dispatch = useAppDispatch();
  const [visible, setVisible] = useState(false);
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (celebration) {
      setVisible(true);

      // Generate particles
      const newParticles = Array.from({ length: 30 }, (_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        delay: Math.random() * 0.5,
        duration: Math.random() * 1.5 + 1,
        color: ['#f59e0b', '#ef4444', '#dc2626', '#22c55e', '#06b6d4', '#fff'][Math.floor(Math.random() * 6)],
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setVisible(false);
        dispatch({ type: 'DISMISS_CELEBRATION' });
      }, 3500);

      return () => clearTimeout(timer);
    }
  }, [celebration, dispatch]);

  if (!celebration || !visible) return null;

  const levelColors = {
    mild: { bg: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', text: '#22c55e' },
    medium: { bg: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', text: '#f59e0b' },
    hot: { bg: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', text: '#ef4444' },
    blazing: { bg: 'rgba(220, 38, 38, 0.2)', border: '#dc2626', text: '#dc2626' },
    ascended: { bg: 'rgba(185, 28, 28, 0.2)', border: '#b91c1c', text: '#fbbf24' },
    legendary: { bg: 'rgba(124, 45, 18, 0.3)', border: '#b91c1c', text: '#fbbf24' },
  };

  const colors = levelColors[celebration.level] || levelColors.medium;

  return (
    <div
      onClick={() => {
        setVisible(false);
        dispatch({ type: 'DISMISS_CELEBRATION' });
      }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(10px)',
        cursor: 'pointer',
        animation: 'fade-in 0.3s ease-out',
      }}
    >
      {/* Particles */}
      {particles.map((p) => (
        <div
          key={p.id}
          style={{
            position: 'absolute',
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: `${p.size}px`,
            height: `${p.size}px`,
            background: p.color,
            borderRadius: '50%',
            animation: `confetti-fall ${p.duration}s ease-in ${p.delay}s forwards`,
            pointerEvents: 'none',
          }}
        />
      ))}

      {/* Celebration card */}
      <div
        style={{
          textAlign: 'center',
          padding: '3rem 4rem',
          background: colors.bg,
          border: `2px solid ${colors.border}`,
          borderRadius: 'var(--radius-2xl)',
          backdropFilter: 'blur(30px)',
          animation: 'scale-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards',
          boxShadow: `0 0 60px ${colors.border}40`,
        }}
      >
        <div style={{
          fontSize: '3rem',
          fontWeight: 900,
          color: colors.text,
          marginBottom: '0.75rem',
          animation: 'fire-flicker 1.5s ease-in-out infinite',
          lineHeight: 1.2,
        }}>
          {celebration.message}
        </div>
        <div style={{
          fontSize: '1rem',
          color: 'var(--color-text-secondary)',
          fontWeight: 500,
        }}>
          {celebration.subtext}
        </div>
        <div style={{
          fontSize: '0.75rem',
          color: 'var(--color-text-muted)',
          marginTop: '1.5rem',
        }}>
          タップして閉じる
        </div>
      </div>
    </div>
  );
}
