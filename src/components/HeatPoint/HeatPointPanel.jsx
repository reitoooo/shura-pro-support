import { useState, useEffect } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import Stopwatch from './Stopwatch';
import Counter from './Counter';
import HurdleSelector from './HurdleSelector';
import { calculateTimePoints, calculateCountPoints, checkCelebration, getCurrentHeatLevel, formatDuration } from '../../utils/heatPointCalculator';
import { useAuth } from '../../context/AuthContext';
import { Flame, Timer, Hash, TrendingUp } from 'lucide-react';

export default function HeatPointPanel() {
  const { heatPoints } = useAppState();
  const dispatch = useAppDispatch();
  const { accessToken } = useAuth();
  const [mode, setMode] = useState('time'); // 'time' | 'count'
  const [hurdle, setHurdle] = useState(1);
  const [description, setDescription] = useState('');
  
  // Post-session reflection state
  const [pendingSession, setPendingSession] = useState(null);
  const [reflectionText, setReflectionText] = useState('');

  const { totalPoints, todayPoints, sessions, lastActiveDate } = heatPoints;
  const heatLevel = getCurrentHeatLevel(todayPoints);

  // Auto-reset daily points if day changed while app was open or on mount
  useEffect(() => {
    const todayStr = new Date().toDateString();
    // If lastActiveDate is missing (old state) or not today, reset!
    if (!lastActiveDate || lastActiveDate !== todayStr) {
      dispatch({ type: 'RESET_DAILY_POINTS' });
    }
    
    // Also set up a listener for window focus to check date
    const handleFocus = () => {
      const currentDay = new Date().toDateString();
      if (!lastActiveDate || lastActiveDate !== currentDay) {
        dispatch({ type: 'RESET_DAILY_POINTS' });
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [lastActiveDate, dispatch]);

  const handleTimeComplete = async (durationMs) => {
    const points = calculateTimePoints(durationMs, hurdle);
    const previousTotal = todayPoints;

    const sessionData = {
      points,
      description: description || '時間記録',
      mode: 'time',
      unit: '分',
      amount: Math.round(durationMs / 60000),
      hurdle,
      duration: durationMs,
    };

    setPendingSession(sessionData);
  };

  const handleCountComplete = async (count, unit) => {
    const points = calculateCountPoints(count, hurdle);
    const previousTotal = todayPoints;

    const sessionData = {
      points,
      description: description || `${count}${unit}`,
      mode: 'count',
      unit,
      amount: count,
      hurdle,
      duration: 0,
    };

    setPendingSession(sessionData);
  };

  const finalizeSession = (skipReflection = false) => {
    if (!pendingSession) return;

    const finalSession = {
      ...pendingSession,
      reflection: skipReflection ? '' : reflectionText,
    };

    const previousTotal = todayPoints;

    // Record the Heat Session
    dispatch({
      type: 'RECORD_HEAT_SESSION',
      payload: finalSession,
    });

    // Also log commit hours if it was a time session
    if (finalSession.mode === 'time') {
      const hours = finalSession.duration / (1000 * 60 * 60);
      dispatch({ type: 'LOG_COMMIT_HOURS', payload: hours });
    }

    // Auto-log to Growth Logs if reflection is provided
    if (!skipReflection && reflectionText.trim()) {
      dispatch({
        type: 'ADD_GROWTH_LOG',
        payload: {
          type: 'insight',
          content: `【${finalSession.description}】${reflectionText}`,
          tags: ['reflection'],
        }
      });
    }

    // Check celebration
    const celebration = checkCelebration(previousTotal, previousTotal + finalSession.points);
    if (celebration) {
      dispatch({ type: 'TRIGGER_CELEBRATION', payload: celebration });
    }

    dispatch({
      type: 'ADD_TOAST',
      payload: { 
        type: 'success', 
        message: `🔥 ${finalSession.points}pt 獲得！（${finalSession.mode === 'time' ? formatDuration(finalSession.duration) : finalSession.amount + finalSession.unit}）` 
      },
    });

    // Reset states
    setDescription('');
    setReflectionText('');
    setPendingSession(null);
  };

  return (
    <div className="glass-panel-static" style={{ padding: 'var(--spacing-panel)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Flame size={16} color="var(--color-heat-low)" />
          <h2 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.02em',
          }}>
            熱ポイント
          </h2>
        </div>
        <span className="badge badge-pending" style={{ fontSize: '0.625rem' }}>
          HEAT
        </span>
      </div>

      {/* Heat Points Display */}
      <div style={{
        textAlign: 'center',
        padding: '1rem',
        marginBottom: '1rem',
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-glass-border)',
      }}>
        <div style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--color-text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: '0.25rem',
        }}>
          今日の熱量
        </div>
        <div className="animate-fire" style={{
          fontSize: '2.5rem',
          fontWeight: 900,
          fontFamily: 'var(--font-family-mono)',
          lineHeight: 1,
        }}>
          <span className="heat-gradient-text">{todayPoints}</span>
          <span style={{ fontSize: '1rem', color: 'var(--color-text-muted)', fontWeight: 500, marginLeft: '4px' }}>pt</span>
        </div>
        <div style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: heatLevel.color,
          marginTop: '0.375rem',
        }}>
          {heatLevel.label}
        </div>
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '1.5rem',
          marginTop: '0.75rem',
          fontSize: '0.6875rem',
          color: 'var(--color-text-muted)',
        }}>
          <span>累計: <strong style={{ color: 'var(--color-text-secondary)' }}>{totalPoints}pt</strong></span>
          <span>今日: <strong style={{ color: 'var(--color-text-secondary)' }}>{sessions.filter(s => {
            const today = new Date().toDateString();
            return new Date(s.timestamp).toDateString() === today;
          }).length}セッション</strong></span>
        </div>
      </div>

      {/* Mode Toggle */}
      <div style={{
        display: 'flex',
        gap: '4px',
        marginBottom: '1rem',
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        padding: '3px',
      }}>
        <button
          onClick={() => setMode('time')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: mode === 'time' ? 'var(--color-bg-elevated)' : 'transparent',
            color: mode === 'time' ? 'var(--color-heat-low)' : 'var(--color-text-muted)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Timer size={14} />
          時間モード
        </button>
        <button
          onClick={() => setMode('count')}
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.375rem',
            padding: '0.5rem',
            fontSize: '0.75rem',
            fontWeight: 600,
            borderRadius: 'var(--radius-sm)',
            border: 'none',
            cursor: 'pointer',
            background: mode === 'count' ? 'var(--color-bg-elevated)' : 'transparent',
            color: mode === 'count' ? 'var(--color-heat-low)' : 'var(--color-text-muted)',
            transition: 'all var(--transition-fast)',
          }}
        >
          <Hash size={14} />
          回数モード
        </button>
      </div>

      {/* Main Content Area */}
      {pendingSession ? (
        <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1rem' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>お疲れ様でした！🎉</div>
            <div style={{ fontSize: '0.875rem', color: 'var(--color-heat-low)', marginTop: '0.5rem', fontWeight: 600 }}>
              獲得予定: +{pendingSession.points} pt
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginTop: '0.25rem' }}>
              「{pendingSession.description}」
            </div>
          </div>
          
          <div style={{ flex: 1 }}>
            <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: 600, color: 'var(--color-cool-primary)', marginBottom: '0.5rem' }}>
              内省・振り返り（任意）
            </label>
            <textarea
              className="input-field"
              value={reflectionText}
              onChange={(e) => setReflectionText(e.target.value)}
              placeholder="このセッションでの気づきや反省点、次に活かしたいこと..."
              rows={4}
              style={{ fontSize: '0.875rem' }}
            />
            <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
              ※ 入力した内容は自動的に「成長ログ（気づき）」にも記録されます。
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: 'auto' }}>
            <button className="btn-ghost" style={{ flex: 1 }} onClick={() => finalizeSession(true)}>
              スキップ
            </button>
            <button className="btn-heat" style={{ flex: 2 }} onClick={() => finalizeSession(false)}>
              記録を保存する
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Active Session Mode */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', margin: '1rem 0' }}>
            {mode === 'time' ? (
              <Stopwatch onComplete={handleTimeComplete} />
            ) : (
              <Counter onComplete={handleCountComplete} />
            )}
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem',
          }}>
            {/* Context input */}
            <div>
              <input
                type="text"
                className="input-field"
                placeholder="何に取り組みますか？ (例: 技術書の読書)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{ fontSize: '0.8125rem' }}
              />
            </div>

            {/* Hurdle Selector */}
            <HurdleSelector value={hurdle} onChange={setHurdle} />
          </div>
        </>
      )}

      {/* Recent sessions */}
      {sessions.length > 0 && (
        <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--color-glass-border)' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.375rem',
            marginBottom: '0.5rem',
          }}>
            <TrendingUp size={12} color="var(--color-text-muted)" />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-muted)' }}>
              最近の記録
            </span>
          </div>
          <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
            {sessions.slice(0, 5).map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.375rem 0',
                  borderBottom: '1px solid var(--color-glass-border)',
                  fontSize: '0.6875rem',
                }}
              >
                <span style={{ color: 'var(--color-text-secondary)' }}>
                  {s.description}
                </span>
                <span style={{ fontWeight: 700, color: 'var(--color-heat-low)', fontFamily: 'var(--font-family-mono)' }}>
                  +{s.points}pt
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
