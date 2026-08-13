import { useState, useRef, useEffect, useCallback } from 'react';
import { formatStopwatch } from '../../utils/heatPointCalculator';
import { Play, Pause, Square, RotateCcw, Edit2, Timer, Check } from 'lucide-react';

export default function Stopwatch({ onComplete, isDisabled = false }) {
  const [elapsed, setElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isManual, setIsManual] = useState(false);
  const [manualMinutes, setManualMinutes] = useState('');
  
  const intervalRef = useRef(null);
  const startTimeRef = useRef(null);
  const accumulatedRef = useRef(0);

  const tick = useCallback(() => {
    if (startTimeRef.current) {
      setElapsed(accumulatedRef.current + (Date.now() - startTimeRef.current));
    }
  }, []);

  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(tick, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (startTimeRef.current) {
        accumulatedRef.current += Date.now() - startTimeRef.current;
        startTimeRef.current = null;
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, tick]);

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);

  const handleStop = () => {
    setIsRunning(false);
    if (elapsed > 0) {
      onComplete(elapsed);
    }
    setElapsed(0);
    accumulatedRef.current = 0;
    startTimeRef.current = null;
  };

  const handleReset = () => {
    setIsRunning(false);
    setElapsed(0);
    accumulatedRef.current = 0;
    startTimeRef.current = null;
  };

  const handleManualSubmit = () => {
    const mins = parseInt(manualMinutes, 10);
    if (isNaN(mins) || mins <= 0) return;
    
    // Convert minutes to milliseconds and complete
    onComplete(mins * 60 * 1000);
    setManualMinutes('');
  };

  const displayTime = formatStopwatch(elapsed);
  const isActive = elapsed > 0 || isRunning;

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Mode Toggle */}
      {!isActive && (
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            background: 'var(--color-bg-deep)',
            borderRadius: 'var(--radius-full)',
            padding: '0.25rem',
            gap: '0.25rem',
            border: '1px solid var(--color-glass-border)',
          }}>
            <button
              onClick={() => setIsManual(false)}
              className={!isManual ? 'btn-ghost' : ''}
              style={{
                background: !isManual ? 'var(--color-bg-elevated)' : 'transparent',
                color: !isManual ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Timer size={14} />
              タイマー
            </button>
            <button
              onClick={() => setIsManual(true)}
              className={isManual ? 'btn-ghost' : ''}
              style={{
                background: isManual ? 'var(--color-bg-elevated)' : 'transparent',
                color: isManual ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                padding: '0.375rem 0.75rem',
                fontSize: '0.75rem',
                borderRadius: 'var(--radius-full)',
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                border: 'none',
                cursor: 'pointer',
              }}
            >
              <Edit2 size={14} />
              手入力
            </button>
          </div>
        </div>
      )}

      {isManual ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', padding: '1rem 0' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem' }}>
            <input
              type="number"
              className="input-field"
              value={manualMinutes}
              onChange={(e) => setManualMinutes(e.target.value)}
              placeholder="0"
              min="1"
              style={{
                fontSize: '2.5rem',
                fontWeight: 800,
                width: '120px',
                textAlign: 'center',
                padding: '0.5rem',
                color: 'var(--color-heat-low)',
              }}
            />
            <span style={{ fontSize: '1rem', color: 'var(--color-text-secondary)', fontWeight: 600 }}>分</span>
          </div>
          <button
            className="btn-heat"
            onClick={handleManualSubmit}
            disabled={!manualMinutes || parseInt(manualMinutes) <= 0}
            style={{ padding: '0.75rem 2rem', fontSize: '0.875rem' }}
          >
            <Check size={16} />
            記録して完了
          </button>
        </div>
      ) : (
        <>
          {/* Timer display */}
      <div
        className={isRunning ? 'animate-pulse-heat' : ''}
        style={{
          fontSize: '2.5rem',
          fontWeight: 800,
          fontFamily: 'var(--font-family-mono)',
          color: isRunning ? 'var(--color-heat-low)' : 'var(--color-text-primary)',
          letterSpacing: '0.05em',
          padding: '1rem 0',
          borderRadius: 'var(--radius-lg)',
          transition: 'color var(--transition-base)',
        }}
      >
        {displayTime}
      </div>

      {/* Controls */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '0.75rem',
        marginTop: '0.75rem',
      }}>
        {!isRunning ? (
          <button
            className="btn-heat"
            onClick={handleStart}
            disabled={isDisabled}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '0.875rem',
              opacity: isDisabled ? 0.5 : 1,
            }}
          >
            <Play size={16} />
            {isActive ? '再開' : 'スタート'}
          </button>
        ) : (
          <button
            className="btn-ghost"
            onClick={handlePause}
            style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
          >
            <Pause size={16} />
            一時停止
          </button>
        )}

        {isActive && (
          <>
            <button
              className="btn-primary"
              onClick={handleStop}
              style={{ padding: '0.75rem 1.5rem', fontSize: '0.875rem' }}
            >
              <Square size={16} />
              記録して完了
            </button>
            <button
              className="btn-icon"
              onClick={handleReset}
              title="リセット"
              style={{ width: '2.75rem', height: '2.75rem' }}
            >
              <RotateCcw size={16} />
            </button>
          </>
        )}
      </div>
        </>
      )}
    </div>
  );
}
