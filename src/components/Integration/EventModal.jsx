import { useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { Calendar, X, Clock, Repeat, ExternalLink } from 'lucide-react';

export default function EventModal({ initialDate, onClose }) {
  const dispatch = useAppDispatch();
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(
    initialDate ? new Date(initialDate).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  );
  const [time, setTime] = useState('10:00');
  const [endTime, setEndTime] = useState('11:00');
  const [eventType, setEventType] = useState('event'); // 'event' | 'task'
  const [category, setCategory] = useState('shura'); // 'shura' | 'other'
  const [recurrence, setRecurrence] = useState('none'); // 'none' | 'daily' | 'weekly' | 'monthly'

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    dispatch({
      type: 'ADD_CALENDAR_EVENT',
      payload: {
        title: title.trim(),
        date,
        time,
        endTime,
        eventType,
        category: eventType === 'task' ? category : 'shura',
        recurrence,
      },
    });

    dispatch({
      type: 'ADD_TOAST',
      payload: { type: 'success', message: '予定を追加しました' },
    });

    onClose();
  };

  const handleGoogleSync = () => {
    if (!title.trim()) return;
    
    if (eventType === 'task') {
      // Google Tasks does not support URL parameters for pre-filling data.
      // We open the Google Tasks panel directly for the user to enter it.
      window.open('https://calendar.google.com/calendar/u/0/r/tasks', '_blank', 'noopener,noreferrer');
      return;
    }

    // Convert local date/time to ISO format strings for Google Calendar
    // Format: YYYYMMDDTHHmmssZ
    const startDate = new Date(`${date}T${time}:00`);
    let endDate = new Date(`${date}T${endTime}:00`);
    
    // Fallback if end time is invalid or before start time
    if (isNaN(endDate.getTime()) || endDate <= startDate) {
      endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // Default to 1 hour duration
    }

    const formatToGCalString = (d) => {
      return d.toISOString().replace(/-|:|\.\d\d\d/g, '');
    };

    const startStr = formatToGCalString(startDate);
    const endStr = formatToGCalString(endDate);

    let recurParam = '';
    if (recurrence === 'daily') recurParam = '&recur=RRULE:FREQ=DAILY';
    if (recurrence === 'weekly') recurParam = '&recur=RRULE:FREQ=WEEKLY';
    if (recurrence === 'monthly') recurParam = '&recur=RRULE:FREQ=MONTHLY';

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title.trim())}&dates=${startStr}/${endStr}${recurParam}`;
    
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 1001,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-glass-border)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '400px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-elevated)',
          animation: 'fade-in 0.2s ease-out',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <Calendar size={18} color="var(--color-cool-primary)" />
            予定・タスクの追加
          </h2>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Type Selection */}
          <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '0.25rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: eventType === 'event' ? 'var(--color-cool-primary)' : 'var(--color-text-secondary)' }}>
              <input type="radio" name="eventType" value="event" checked={eventType === 'event'} onChange={(e) => setEventType(e.target.value)} style={{ accentColor: 'var(--color-cool-primary)' }} />
              予定 (スケジュール)
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.875rem', color: eventType === 'task' ? 'var(--color-heat-mid)' : 'var(--color-text-secondary)' }}>
              <input type="radio" name="eventType" value="task" checked={eventType === 'task'} onChange={(e) => setEventType(e.target.value)} style={{ accentColor: 'var(--color-heat-mid)' }} />
              タスク (ToDo)
            </label>
          </div>

          {/* Category Selection (Only for Task) */}
          {eventType === 'task' && (
            <div style={{ display: 'flex', gap: '1rem', background: 'rgba(239, 68, 68, 0.05)', padding: '0.5rem', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>種別:</span>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.75rem', color: category === 'shura' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <input type="radio" name="category" value="shura" checked={category === 'shura'} onChange={(e) => setCategory(e.target.value)} style={{ accentColor: 'var(--color-heat-mid)' }} />
                🔥 修羅プロ関連
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.75rem', color: category === 'other' ? 'var(--color-text-primary)' : 'var(--color-text-muted)' }}>
                <input type="radio" name="category" value="other" checked={category === 'other'} onChange={(e) => setCategory(e.target.value)} style={{ accentColor: 'var(--color-text-muted)' }} />
                ☕ その他 (日常など)
              </label>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              タイトル
            </label>
            <input
              type="text"
              className="input-field"
              placeholder="例: 仮説検証のMTG"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              autoFocus
              required
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                日付
              </label>
              <input
                type="date"
                className="input-field"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div style={{ flex: 1, display: 'flex', gap: '0.5rem' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  <Clock size={12} />
                  開始
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                  required
                />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                  終了
                </label>
                <input
                  type="time"
                  className="input-field"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              <Repeat size={12} />
              繰り返し
            </label>
            <select
              className="input-field"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">繰り返さない（1回のみ）</option>
              <option value="daily">毎日</option>
              <option value="weekly">毎週</option>
              <option value="monthly">毎月</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button
              type="submit"
              className="btn-primary"
              style={{ flex: 1 }}
              disabled={!title.trim()}
            >
              保存する
            </button>
            
            <button
              type="button"
              className="btn-ghost"
              onClick={handleGoogleSync}
              disabled={!title.trim()}
              title={eventType === 'task' ? "Google Tasksを開きます" : "Googleカレンダーの予定作成画面を開きます"}
              style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.25rem', border: '1px solid var(--color-glass-border)' }}
            >
              {eventType === 'task' ? 'Google Tasks' : 'Googleカレンダー'} <ExternalLink size={12} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
