import { useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { Flame, FlaskConical, Trophy, Zap } from 'lucide-react';

const TYPE_CONFIG = {
  heat_record: { icon: Flame, color: 'var(--color-heat-low)', label: '熱ポイント' },
  hypothesis_update: { icon: FlaskConical, color: 'var(--color-cool-accent)', label: '仮説検証' },
  milestone: { icon: Trophy, color: 'var(--color-success)', label: 'マイルストーン' },
  default: { icon: Zap, color: 'var(--color-text-muted)', label: 'アクティビティ' },
};

export default function TimelineItem({ item }) {
  const config = TYPE_CONFIG[item.type] || TYPE_CONFIG.default;
  const Icon = config.icon;
  const timeAgo = getTimeAgo(item.timestamp);
  
  // Local state for reactions (in a real app, this would be persisted to DB)
  const [reactions, setReactions] = useState({
    fire: Math.floor(Math.random() * 3), // random initial count for mock
    clap: Math.floor(Math.random() * 2),
    rocket: 0,
  });
  
  const [hasReacted, setHasReacted] = useState({
    fire: false, clap: false, rocket: false
  });
  const dispatch = useAppDispatch();

  const handleReact = (type, emoji) => {
    if (!hasReacted[type]) {
      setReactions(prev => ({ ...prev, [type]: prev[type] + 1 }));
      setHasReacted(prev => ({ ...prev, [type]: true }));
      
      // Dispatch toast notification to simulate sending peer support
      dispatch({
        type: 'ADD_TOAST',
        payload: {
          type: 'success',
          message: `${item.user} さんに ${emoji} を送りました！`,
        }
      });
    }
  };

  return (
    <div
      className="animate-fade-in"
      style={{
        display: 'flex',
        gap: '0.75rem',
        padding: '0.875rem 0',
        borderBottom: '1px solid var(--color-glass-border)',
      }}
    >
      {/* Icon */}
      <div style={{
        width: '2.25rem',
        height: '2.25rem',
        borderRadius: 'var(--radius-full)',
        background: `${config.color}15`,
        border: `1px solid ${config.color}30`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={14} color={config.color} />
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.25rem' }}>
          <span style={{
            fontSize: '0.75rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
          }}>
            {item.user}
          </span>
          <span style={{
            fontSize: '0.625rem',
            color: 'var(--color-text-muted)',
          }}>
            {timeAgo}
          </span>
        </div>
        <div style={{
          fontSize: '0.8125rem',
          color: 'var(--color-text-secondary)',
          lineHeight: 1.5,
          marginBottom: '0.5rem',
        }}>
          {item.message}
        </div>
        
        {/* Reactions (Peer Support) */}
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <ReactionButton 
            emoji="🔥" 
            count={reactions.fire} 
            reacted={hasReacted.fire} 
            onClick={() => handleReact('fire', '🔥')} 
          />
          <ReactionButton 
            emoji="👏" 
            count={reactions.clap} 
            reacted={hasReacted.clap} 
            onClick={() => handleReact('clap', '👏')} 
          />
          <ReactionButton 
            emoji="🚀" 
            count={reactions.rocket} 
            reacted={hasReacted.rocket} 
            onClick={() => handleReact('rocket', '🚀')} 
          />
        </div>
      </div>
    </div>
  );
}

function ReactionButton({ emoji, count, reacted, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.25rem',
        padding: '0.25rem 0.5rem',
        background: reacted ? 'rgba(239, 68, 68, 0.15)' : 'var(--color-bg-deep)',
        border: `1px solid ${reacted ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-glass-border)'}`,
        borderRadius: 'var(--radius-full)',
        fontSize: '0.6875rem',
        color: reacted ? 'var(--color-heat-low)' : 'var(--color-text-muted)',
        cursor: reacted ? 'default' : 'pointer',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={(e) => {
        if (!reacted) e.currentTarget.style.background = 'var(--color-bg-elevated)';
      }}
      onMouseLeave={(e) => {
        if (!reacted) e.currentTarget.style.background = 'var(--color-bg-deep)';
      }}
    >
      <span>{emoji}</span>
      {count > 0 && <span style={{ fontWeight: 600 }}>{count}</span>}
    </button>
  );
}

function getTimeAgo(timestamp) {
  const now = Date.now();
  const diff = now - new Date(timestamp).getTime();
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}日前`;
  if (hours > 0) return `${hours}時間前`;
  if (minutes > 0) return `${minutes}分前`;
  return 'たった今';
}
