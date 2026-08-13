import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { getCurrentHeatLevel } from '../../utils/heatPointCalculator';
import { Calendar, Clock, Plus, Trash2, Repeat } from 'lucide-react';
import EventModal from './EventModal';

export default function CalendarTimeline() {
  const { heatPoints, calendarEvents = [] } = useAppState();
  const dispatch = useAppDispatch();
  const { sessions } = heatPoints;
  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // 14-day view: 3 days past, today, 10 days future
  const today = new Date();
  const days = Array.from({ length: 14 }, (_, i) => {
    const date = new Date(today);
    date.setDate(date.getDate() - 3 + i);
    return date;
  });

  // Helper to check if an event occurs on a specific date based on recurrence
  const occursOnDate = (event, targetDateStr) => {
    const eventDate = new Date(event.date);
    const targetDate = new Date(targetDateStr);
    
    // Ignore time for date comparison
    eventDate.setHours(0, 0, 0, 0);
    targetDate.setHours(0, 0, 0, 0);

    // If target date is before the event starts, it doesn't occur
    if (targetDate < eventDate) return false;

    if (event.recurrence === 'none') {
      return eventDate.getTime() === targetDate.getTime();
    }
    
    if (event.recurrence === 'daily') {
      return true;
    }
    
    if (event.recurrence === 'weekly') {
      return eventDate.getDay() === targetDate.getDay();
    }
    
    if (event.recurrence === 'monthly') {
      return eventDate.getDate() === targetDate.getDate();
    }

    return false;
  };

  const groupedSessions = days.map((date) => {
    const dateStr = date.toDateString();
    
    // Heat points (Routine / Defense)
    const daySessions = sessions.filter(
      (s) => new Date(s.timestamp).toDateString() === dateStr
    );
    const totalMinutes = daySessions.reduce((sum, s) => sum + (s.duration || 0) / 60000, 0);
    const totalPoints = daySessions.reduce((sum, s) => sum + s.points, 0);

    // Calendar Events (User created)
    const events = calendarEvents.filter(e => occursOnDate(e, dateStr));

    return {
      date,
      sessions: daySessions,
      totalMinutes,
      totalPoints,
      events,
    };
  });

  const maxMinutes = Math.max(...groupedSessions.map((d) => d.totalMinutes), 60);
  const dayLabels = ['日', '月', '火', '水', '木', '金', '土'];

  const handleAddClick = (dateStr) => {
    setSelectedDate(dateStr);
    setShowEventModal(true);
  };

  const handleTrashClick = (id, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setConfirmDeleteId(id);
  };

  const handleConfirmDelete = (id, e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    dispatch({ type: 'DELETE_CALENDAR_EVENT', payload: id });
    dispatch({ type: 'ADD_TOAST', payload: { type: 'info', message: '予定を削除しました' } });
    setConfirmDeleteId(null);
  };

  const handleCancelDelete = (e) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    setConfirmDeleteId(null);
  };

  const handleToggleEvent = (id, e, ev) => {
    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }
    const isCompleting = !ev.completed;
    dispatch({ type: 'TOGGLE_CALENDAR_EVENT', payload: id });
    
    if (isCompleting) {
      const points = ev.category === 'shura' ? 50 : 10;
      dispatch({
        type: 'ADD_HEAT_RECORD',
        payload: { points, description: `タスク完了: ${ev.title}`, mode: 'Focus' }
      });
      dispatch({
        type: 'ADD_TOAST',
        payload: { type: 'success', message: `${points}pt 獲得！ (${ev.category === 'shura' ? '🔥修羅' : '☕その他'})` }
      });
    }
  };

  return (
    <div style={{
      background: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-glass-border)',
      padding: '1.25rem',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Calendar size={18} color="var(--color-cool-primary)" />
          <h2 style={{
            fontSize: '1rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.02em',
            margin: 0,
          }}>
            カレンダータイムライン
          </h2>
        </div>
        <button
          className="btn-ghost"
          onClick={() => handleAddClick()}
          style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', color: 'var(--color-cool-primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus size={14} />
          予定を追加
        </button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.625rem', fontWeight: 600, marginBottom: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'var(--color-cool-primary)' }} />
            <span style={{ color: 'var(--color-text-secondary)' }}>予定 (スケジュール)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>🔥</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>修羅タスク / 熱ポイント</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <span>☕</span>
            <span style={{ color: 'var(--color-text-secondary)' }}>その他タスク</span>
          </div>
        </div>

      {/* Timeline Grid */}
      <div style={{
        flex: 1,
        display: 'grid',
        gridTemplateColumns: `repeat(14, 1fr)`,
        gap: '4px',
        alignItems: 'end',
        minHeight: '200px',
      }}>
        {groupedSessions.map((dayData, i) => {
          const isToday = dayData.date.toDateString() === today.toDateString();
          const height = maxMinutes > 0 ? (dayData.totalMinutes / maxMinutes) * 80 : 0; // Max 80px for heat bar
          const heatLevel = getCurrentHeatLevel(dayData.totalPoints);

          return (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '0.5rem' }}>
              
              {/* Top Layer: Events */}
              <div style={{ 
                flex: 1, 
                display: 'flex', 
                flexDirection: 'column-reverse', 
                gap: '4px',
                borderBottom: '1px dashed var(--color-glass-border)',
                paddingBottom: '0.5rem',
                minHeight: '60px'
              }}>
                {dayData.events.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    {dayData.events.map((ev, idx) => {
                      const isTask = ev.eventType === 'task';
                      const isShura = ev.category === 'shura';
                      const primaryColor = isTask ? (isShura ? 'var(--color-heat-low)' : 'var(--color-text-muted)') : 'var(--color-cool-primary)';
                      const bgRgba = isTask ? (isShura ? 'rgba(239, 68, 68, 0.1)' : 'rgba(255, 255, 255, 0.05)') : 'rgba(249, 115, 22, 0.1)';
                      const borderRgba = isTask ? (isShura ? 'rgba(239, 68, 68, 0.2)' : 'rgba(255, 255, 255, 0.1)') : 'rgba(249, 115, 22, 0.2)';
                      const icon = isTask ? (isShura ? '🔥' : '☕') : '';

                      return (
                      <div
                        key={`${ev.id}-${idx}`}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: bgRgba,
                          border: `1px solid ${borderRgba}`,
                          borderRadius: '4px',
                          padding: '4px 8px',
                          fontSize: '0.6875rem',
                          color: primaryColor,
                          opacity: ev.completed ? 0.6 : 1,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {isTask && (
                            <input
                              type="checkbox"
                              checked={ev.completed}
                              onChange={(e) => handleToggleEvent(ev.id, e, ev)}
                              style={{ cursor: 'pointer', accentColor: primaryColor }}
                            />
                          )}
                          {!isTask && <div style={{ width: '4px', height: '4px', borderRadius: '50%', background: primaryColor }} />}
                          <span style={{ textDecoration: ev.completed ? 'line-through' : 'none' }}>
                            {icon && <span style={{ marginRight: '4px' }}>{icon}</span>}
                            {ev.time}{ev.endTime ? `-${ev.endTime}` : ''} {ev.title}
                          </span>
                          {ev.recurrence !== 'none' && <Repeat size={10} style={{ marginLeft: '2px', opacity: 0.7 }} />}
                        </div>
                        {confirmDeleteId === ev.id ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={(e) => handleConfirmDelete(ev.id, e)}
                              style={{
                                background: 'var(--color-heat-mid)',
                                color: '#fff',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.625rem',
                                padding: '2px 4px',
                                cursor: 'pointer',
                              }}
                            >
                              削除
                            </button>
                            <button
                              onClick={(e) => handleCancelDelete(e)}
                              style={{
                                background: 'var(--color-bg-hover)',
                                color: 'var(--color-text-secondary)',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '0.625rem',
                                padding: '2px 4px',
                                cursor: 'pointer',
                              }}
                            >
                              取消
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleTrashClick(ev.id, e)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'var(--color-text-muted)',
                              cursor: 'pointer',
                              padding: '4px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <Trash2 size={10} />
                          </button>
                        )}
                      </div>
                    )})}
                  </div>
                )}
              </div>

              {/* Bottom Layer: Heat Points (Defense) */}
              <div style={{ 
                height: '100px', 
                display: 'flex', 
                flexDirection: 'column', 
                justifyContent: 'flex-end',
                alignItems: 'center',
                gap: '2px' 
              }}>
                {/* Points label */}
                {dayData.totalPoints > 0 && (
                  <span style={{
                    fontSize: '0.5625rem',
                    fontWeight: 700,
                    color: 'var(--color-heat-low)',
                    fontFamily: 'var(--font-family-mono)',
                  }}>
                    {dayData.totalPoints}pt
                  </span>
                )}

                {/* Heat Bar */}
                <div
                  style={{
                    width: '100%',
                    height: `${Math.max(height, dayData.totalMinutes > 0 ? 8 : 2)}px`,
                    borderRadius: '4px 4px 2px 2px',
                    background: dayData.totalMinutes > 0
                      ? isToday
                        ? 'linear-gradient(180deg, var(--color-heat-low), var(--color-heat-mid))'
                        : 'linear-gradient(180deg, rgba(239, 68, 68, 0.5), rgba(220, 38, 38, 0.5))'
                      : 'var(--color-bg-hover)',
                    transition: 'height 0.6s ease-out',
                    position: 'relative',
                  }}
                />

                {/* Date Label */}
                <div style={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  marginTop: '0.25rem',
                  background: isToday ? 'var(--color-cool-primary)' : 'transparent',
                  color: isToday ? '#fff' : 'var(--color-text-muted)',
                  borderRadius: '4px',
                  padding: '2px 4px',
                }}>
                  <span style={{ fontSize: '0.5rem', fontWeight: isToday ? 700 : 400 }}>
                    {dayLabels[dayData.date.getDay()]}
                  </span>
                  <span style={{ fontSize: '0.625rem', fontWeight: 700 }}>
                    {dayData.date.getDate()}
                  </span>
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {showEventModal && (
        <EventModal
          initialDate={selectedDate}
          onClose={() => setShowEventModal(false)}
        />
      )}
    </div>
  );
}
