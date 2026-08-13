import { useState } from 'react';
import { Plus, Minus, Check } from 'lucide-react';

export default function Counter({ onComplete, isDisabled = false }) {
  const [count, setCount] = useState(0);
  const [unit, setUnit] = useState('回');

  const handleIncrement = () => setCount((c) => c + 1);
  const handleDecrement = () => setCount((c) => Math.max(0, c - 1));

  const handleComplete = () => {
    if (count > 0) {
      onComplete(count, unit);
      setCount(0);
    }
  };

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Unit selector */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.375rem',
        marginBottom: '1rem',
      }}>
        {['回', 'ページ', '分', 'セット', 'km'].map((u) => (
          <button
            key={u}
            onClick={() => setUnit(u)}
            style={{
              padding: '0.25rem 0.75rem',
              fontSize: '0.6875rem',
              fontWeight: unit === u ? 700 : 500,
              borderRadius: 'var(--radius-full)',
              border: `1px solid ${unit === u ? 'var(--color-heat-low)' : 'var(--color-glass-border)'}`,
              background: unit === u ? 'rgba(245, 158, 11, 0.15)' : 'transparent',
              color: unit === u ? 'var(--color-heat-low)' : 'var(--color-text-muted)',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Counter display */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '1.5rem',
      }}>
        <button
          onClick={handleDecrement}
          disabled={count === 0}
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-glass-border)',
            background: 'var(--color-bg-surface)',
            color: count === 0 ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
            cursor: count === 0 ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
            fontSize: '1.25rem',
            opacity: count === 0 ? 0.3 : 1,
          }}
        >
          <Minus size={20} />
        </button>

        <div>
          <div style={{
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'center',
            gap: '0.375rem',
          }}>
            <input
              type="number"
              value={count}
              onChange={(e) => setCount(Math.max(0, parseInt(e.target.value) || 0))}
              style={{
                width: '100px',
                fontSize: '2.5rem',
                fontWeight: 800,
                fontFamily: 'var(--font-family-mono)',
                color: count > 0 ? 'var(--color-heat-low)' : 'var(--color-text-primary)',
                background: 'transparent',
                border: 'none',
                textAlign: 'center',
                outline: 'none',
              }}
            />
            <span style={{
              fontSize: '1rem',
              fontWeight: 600,
              color: 'var(--color-text-secondary)',
            }}>
              {unit}
            </span>
          </div>
        </div>

        <button
          onClick={handleIncrement}
          style={{
            width: '3rem',
            height: '3rem',
            borderRadius: 'var(--radius-full)',
            border: '2px solid var(--color-heat-low)',
            background: 'rgba(245, 158, 11, 0.1)',
            color: 'var(--color-heat-low)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Complete button */}
      <button
        className="btn-heat"
        onClick={handleComplete}
        disabled={count === 0 || isDisabled}
        style={{
          marginTop: '1.25rem',
          padding: '0.75rem 2rem',
          fontSize: '0.875rem',
          opacity: count === 0 ? 0.5 : 1,
          cursor: count === 0 ? 'not-allowed' : 'pointer',
        }}
      >
        <Check size={16} />
        記録する
      </button>
    </div>
  );
}
