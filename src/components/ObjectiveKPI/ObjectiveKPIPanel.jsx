import { useState } from 'react';
import { useAppState, useAppDispatch, getAllHypotheses } from '../../context/AppContext';
import ProgressBar from './ProgressBar';
import VelocityChart from './VelocityChart';
import MilestoneSmartImport from './MilestoneSmartImport';
import { Target, Clock, TrendingUp, Plus, Trash2, CheckSquare, Square, Sparkles } from 'lucide-react';

export default function ObjectiveKPIPanel() {
  const { commitments, canvases, calendarEvents = [] } = useAppState();
  const dispatch = useAppDispatch();
  const [newMilestone, setNewMilestone] = useState('');
  const [newCategory, setNewCategory] = useState('shura');
  const [isEditing, setIsEditing] = useState(false);
  const [showImport, setShowImport] = useState(false);

  const { milestones, weeklyGoals, velocityHistory } = commitments;

  // Helper to check recurrence
  const occursOnDate = (event, targetDateStr) => {
    const eventDate = new Date(event.date);
    const targetDate = new Date(targetDateStr);
    eventDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);
    if (targetDate < eventDate) return false;
    if (event.recurrence === 'none') return eventDate.getTime() === targetDate.getTime();
    if (event.recurrence === 'daily') return true;
    if (event.recurrence === 'weekly') return eventDate.getDay() === targetDate.getDay();
    if (event.recurrence === 'monthly') return eventDate.getDate() === targetDate.getDate();
    return false;
  };

  const todayStr = new Date().toDateString();
  const todayTasks = calendarEvents
    .filter(e => e.eventType === 'task' && occursOnDate(e, todayStr))
    .map(e => ({
      id: e.id,
      title: `${e.time ? `${e.time} ` : ''}${e.title}`, // Prefix with time
      completed: e.completed,
      category: e.category || 'shura',
      isTask: true,
    }));

  const mergedList = [
    ...milestones.map(m => ({ ...m, category: m.category || 'shura', isTask: false })),
    ...todayTasks,
  ];

  // Calculate milestone & task completion
  const completedCount = mergedList.filter((m) => m.completed).length;
  const totalCount = mergedList.length;

  const handleToggle = (m) => {
    const isCompleting = !m.completed;
    dispatch({ type: m.isTask ? 'TOGGLE_CALENDAR_EVENT' : 'TOGGLE_MILESTONE', payload: m.id });
    
    if (isCompleting) {
      const points = m.category === 'shura' ? 50 : 10;
      const typeLabel = m.isTask ? 'タスク' : 'マイルストーン';
      dispatch({
        type: 'ADD_HEAT_RECORD',
        payload: { points, description: `${typeLabel}完了: ${m.title}`, mode: 'Focus' }
      });
      dispatch({
        type: 'ADD_TOAST',
        payload: { type: 'success', message: `${points}pt 獲得！ (${m.category === 'shura' ? '🔥修羅' : '☕その他'})` }
      });
    }
  };

  // Completed hypothesis count for velocity (across all canvases)
  const allHypotheses = getAllHypotheses(canvases);
  const completedHypotheses = allHypotheses.filter((h) => h.status === 'completed').length;

  // Weekly goal achievement rate
  const weeklyAchievement = weeklyGoals.targetHours > 0
    ? Math.round((weeklyGoals.actualHours / weeklyGoals.targetHours) * 100)
    : 0;

  const handleAddMilestone = () => {
    if (newMilestone.trim()) {
      dispatch({ type: 'ADD_MILESTONE', payload: { title: newMilestone.trim(), category: newCategory } });
      setNewMilestone('');
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleAddMilestone();
  };

  return (
    <div className="glass-panel-static" style={{ padding: 'var(--spacing-panel)', width: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.25rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Target size={16} color="var(--color-cool-primary)" />
          <h2 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.02em',
          }}>
            客観的現在地
          </h2>
        </div>
        <span className="badge badge-active" style={{ fontSize: '0.625rem' }}>
          OBJECTIVE
        </span>
      </div>

      {/* 3-column KPI grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {/* Milestone Progress */}
        <div style={{
          padding: '1rem',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-glass-border)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
              <CheckSquare size={14} color="var(--color-cool-primary)" />
              <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                マイルストーン消化率
              </span>
            </div>
            <button
              className="btn-ghost"
              onClick={() => setShowImport(!showImport)}
              style={{ fontSize: '0.625rem', padding: '0.25rem 0.5rem', color: 'var(--color-cool-primary)' }}
            >
              <Sparkles size={10} />
              AI連携
            </button>
          </div>
          
          {showImport && (
            <MilestoneSmartImport onClose={() => setShowImport(false)} canvases={canvases} />
          )}

          <ProgressBar
            value={completedCount}
            max={totalCount || 1}
            showPercentage={true}
            variant="cool"
          />
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            {completedCount} / {totalCount} タスク完了
          </div>

          {/* Unified list */}
          <div style={{ marginTop: '0.75rem', flex: 1, overflowY: 'auto' }}>
            {mergedList.map((m) => (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.375rem 0',
                  borderBottom: '1px solid var(--color-glass-border)',
                }}
              >
                <button
                  onClick={() => handleToggle(m)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: m.completed ? 'var(--color-success)' : 'var(--color-text-muted)',
                    display: 'flex',
                    padding: 0,
                  }}
                >
                  {m.completed ? <CheckSquare size={14} /> : <Square size={14} />}
                </button>
                <span style={{ fontSize: '0.875rem' }}>
                  {m.category === 'shura' ? '🔥' : '☕'}
                </span>
                <span style={{
                  flex: 1,
                  fontSize: '0.75rem',
                  color: m.completed ? 'var(--color-text-muted)' : 'var(--color-text-primary)',
                  textDecoration: m.completed ? 'line-through' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem',
                }}>
                  {m.title}
                  {m.isTask && (
                    <span style={{ fontSize: '0.5625rem', color: 'var(--color-cool-primary)', border: '1px solid var(--color-cool-primary)', borderRadius: '2px', padding: '1px 3px' }}>TODAY</span>
                  )}
                </span>
                {!m.isTask && (
                  <button
                    onClick={() => dispatch({ type: 'DELETE_MILESTONE', payload: m.id })}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--color-text-muted)',
                      display: 'flex',
                      padding: 0,
                      opacity: 0.5,
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Add milestone */}
          <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.5rem', alignItems: 'center' }}>
            <select
              className="input-field"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ fontSize: '0.6875rem', padding: '0.375rem', width: 'auto', minWidth: '40px' }}
              title="種別"
            >
              <option value="shura">🔥</option>
              <option value="other">☕</option>
            </select>
            <input
              className="input-field"
              value={newMilestone}
              onChange={(e) => setNewMilestone(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="新規マイルストーン..."
              style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', flex: 1 }}
            />
            <button className="btn-icon" onClick={handleAddMilestone} style={{ flexShrink: 0 }}>
              <Plus size={14} />
            </button>
          </div>
        </div>

        {/* Velocity Chart */}
        <div style={{
          padding: '1rem',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-glass-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <TrendingUp size={14} color="var(--color-cool-primary)" />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              仮説検証サイクル
            </span>
          </div>
          <VelocityChart data={velocityHistory} />
          <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', marginTop: '0.5rem' }}>
            累計完了: {completedHypotheses} 仮説
          </div>
        </div>

        {/* Plan vs Actual */}
        <div style={{
          padding: '1rem',
          background: 'var(--color-bg-surface)',
          borderRadius: 'var(--radius-lg)',
          border: '1px solid var(--color-glass-border)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <Clock size={14} color="var(--color-cool-primary)" />
            <span style={{ fontSize: '0.6875rem', fontWeight: 600, color: 'var(--color-text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              活動時間（今週）
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.375rem', marginBottom: '0.75rem' }}>
            <span style={{
              fontSize: '2rem',
              fontWeight: 800,
              fontFamily: 'var(--font-family-mono)',
              color: weeklyAchievement >= 100 ? 'var(--color-success)' : weeklyAchievement >= 50 ? 'var(--color-cool-primary)' : 'var(--color-text-primary)',
            }}>
              {weeklyGoals.actualHours.toFixed(1)}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
              / {weeklyGoals.targetHours}h
            </span>
          </div>

          <ProgressBar
            value={weeklyGoals.actualHours}
            max={weeklyGoals.targetHours}
            showPercentage={true}
            variant={weeklyAchievement >= 100 ? 'success' : 'cool'}
          />

          {/* Quick edit target */}
          {isEditing ? (
            <div style={{ display: 'flex', gap: '0.375rem', marginTop: '0.75rem' }}>
              <input
                type="number"
                className="input-field"
                value={weeklyGoals.targetHours}
                onChange={(e) => dispatch({ type: 'UPDATE_WEEKLY_GOAL', payload: { targetHours: Number(e.target.value) || 0 } })}
                style={{ fontSize: '0.75rem', padding: '0.375rem 0.5rem', width: '80px' }}
              />
              <button className="btn-ghost" onClick={() => setIsEditing(false)} style={{ fontSize: '0.6875rem', padding: '0.375rem 0.75rem' }}>
                OK
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: '0.6875rem',
                color: 'var(--color-text-muted)',
                marginTop: '0.5rem',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              目標時間を変更
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
