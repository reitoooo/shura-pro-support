import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Lightbulb, MessageSquare, Target, User, Send, Check, Snowflake, Trash2, ArrowDown } from 'lucide-react';

const CATEGORY_CONFIG = {
  decision: { id: 'decision', icon: Target, label: '決定事項', color: 'var(--color-cool-primary)', desc: '1on1等での合意事項' },
  feedback: { id: 'feedback', icon: MessageSquare, label: 'フィードバック', color: 'var(--color-heat-mid)', desc: '他者からの評価・指摘' },
  insight: { id: 'insight', icon: Lightbulb, label: '気づき', color: 'var(--color-cool-accent)', desc: '自己の気づき・感情' },
};

export default function GrowthLogPanel() {
  const { growthLogs = [], inboxMemos = [] } = useAppState();
  const dispatch = useAppDispatch();
  
  const [activeCategory, setActiveCategory] = useState('decision');
  const [message, setMessage] = useState('');
  const [partner, setPartner] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    dispatch({
      type: 'ADD_GROWTH_LOG',
      payload: {
        category: activeCategory,
        message: message.trim(),
        partner: partner.trim(),
      }
    });

    setMessage('');
    setPartner('');
    
    // Add success toast
    dispatch({
      type: 'ADD_TOAST',
      payload: {
        type: 'success',
        message: 'ログを記録しました',
      }
    });
  };

  const handleUseMemo = (memo) => {
    setMessage(memo.content);
    dispatch({ type: 'REMOVE_INBOX_MEMO', payload: memo.id });
  };

  const handleDeleteMemo = (memoId) => {
    dispatch({ type: 'REMOVE_INBOX_MEMO', payload: memoId });
  };

  const formatDate = (isoString) => {
    const d = new Date(isoString);
    return `${d.getMonth() + 1}/${d.getDate()} ${d.getHours()}:${d.getMinutes().toString().padStart(2, '0')}`;
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      gap: '1.25rem',
    }}>
      {/* Inbox / Freezer Section */}
      {inboxMemos.length > 0 && (
        <div style={{
          background: 'var(--color-bg-deep)',
          borderRadius: 'var(--radius-lg)',
          padding: '1rem',
          border: '1px solid var(--color-cool-accent)',
          animation: 'fade-in 0.3s ease-out',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginBottom: '0.75rem',
            color: 'var(--color-cool-accent)',
            fontSize: '0.75rem',
            fontWeight: 700,
          }}>
            <Snowflake size={14} />
            未整理メモ（感情・アイデア）
          </div>
          
          <div style={{
            display: 'flex',
            gap: '0.75rem',
            overflowX: 'auto',
            paddingBottom: '0.5rem',
          }}>
            {inboxMemos.map((memo) => (
              <div
                key={memo.id}
                style={{
                  minWidth: '200px',
                  maxWidth: '240px',
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-glass-border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '0.5rem',
                  flexShrink: 0,
                }}
              >
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap', flex: 1 }}>
                  {memo.content}
                </div>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '0.25rem',
                  paddingTop: '0.5rem',
                  borderTop: '1px dashed var(--color-glass-border)',
                }}>
                  <div style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                    {formatDate(memo.timestamp)}
                  </div>
                  <div style={{ display: 'flex', gap: '0.25rem' }}>
                    <button
                      onClick={() => handleUseMemo(memo)}
                      style={{
                        background: 'rgba(6, 182, 212, 0.1)',
                        color: 'var(--color-cool-primary)',
                        border: 'none',
                        borderRadius: 'var(--radius-sm)',
                        padding: '0.25rem 0.5rem',
                        fontSize: '0.625rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem',
                      }}
                    >
                      <ArrowDown size={10} />
                      ログにする
                    </button>
                    <button
                      onClick={() => handleDeleteMemo(memo.id)}
                      style={{
                        background: 'none',
                        color: 'var(--color-text-muted)',
                        border: 'none',
                        padding: '0.25rem',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-glass-border)',
        padding: '1.25rem',
      }}>
        <h2 style={{
          fontSize: '0.875rem',
          fontWeight: 700,
          color: 'var(--color-text-primary)',
          marginBottom: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <span style={{ fontSize: '1rem' }}>💬</span>
          3大ログを「一言・二言」で残す
        </h2>

        {/* Category Tabs */}
        <div style={{
          display: 'flex',
          gap: '0.5rem',
          marginBottom: '1rem',
        }}>
          {Object.values(CATEGORY_CONFIG).map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.375rem',
                  padding: '0.625rem',
                  borderRadius: 'var(--radius-md)',
                  border: `1px solid ${isActive ? cat.color : 'var(--color-glass-border)'}`,
                  background: isActive ? `${cat.color}15` : 'rgba(255, 255, 255, 0.03)',
                  color: isActive ? cat.color : 'var(--color-text-muted)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                title={cat.desc}
              >
                <Icon size={14} />
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Form Fields */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder={`${CATEGORY_CONFIG[activeCategory].label}を一言で記録...`}
            style={{
              width: '100%',
              minHeight: '60px',
              background: 'var(--color-bg-deep)',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0.75rem',
              color: 'var(--color-text-primary)',
              fontSize: '0.875rem',
              resize: 'none',
            }}
          />

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            {/* Optional Partner Input */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: 'var(--color-bg-deep)',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 'var(--radius-md)',
              padding: '0 0.75rem',
              flex: 1,
            }}>
              <User size={14} color="var(--color-text-muted)" />
              <input
                type="text"
                value={partner}
                onChange={(e) => setPartner(e.target.value)}
                placeholder="相手 (任意) 例: メンターのAさん"
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  padding: '0.5rem 0.5rem',
                  color: 'var(--color-text-primary)',
                  fontSize: '0.75rem',
                  outline: 'none',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={!message.trim()}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                background: message.trim() ? 'var(--color-heat-mid)' : 'var(--color-glass-border)',
                color: message.trim() ? '#fff' : 'var(--color-text-muted)',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                padding: '0.5rem 1.25rem',
                fontSize: '0.8125rem',
                fontWeight: 600,
                cursor: message.trim() ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              <Send size={14} />
              記録する
            </button>
          </div>
        </form>
      </div>

      {/* Timeline of Logs */}
      <div style={{
        flex: 1,
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-glass-border)',
        padding: '1.25rem',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0, // important for nested flex scroll
      }}>
        <h3 style={{
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          marginBottom: '1rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          過去のログ
        </h3>

        <div style={{
          flex: 1,
          overflowY: 'auto',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          paddingRight: '0.5rem',
        }}>
          {growthLogs.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '2rem 0',
              color: 'var(--color-text-muted)',
              fontSize: '0.75rem',
            }}>
              まだログがありません。日々の気づきを記録しましょう。
            </div>
          ) : (
            growthLogs.map((log) => {
              const config = CATEGORY_CONFIG[log.category] || CATEGORY_CONFIG.insight;
              const Icon = config.icon;
              return (
                <div key={log.id} style={{
                  display: 'flex',
                  gap: '1rem',
                }}>
                  {/* Icon Column */}
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: `${config.color}20`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: config.color,
                      flexShrink: 0,
                    }}>
                      <Icon size={16} />
                    </div>
                    <div style={{ width: '1px', flex: 1, background: 'var(--color-glass-border)' }} />
                  </div>

                  {/* Content Column */}
                  <div style={{
                    flex: 1,
                    background: 'var(--color-bg-deep)',
                    borderRadius: 'var(--radius-md)',
                    border: '1px solid var(--color-glass-border)',
                    padding: '0.75rem 1rem',
                    marginBottom: '0.5rem',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <span style={{
                          fontSize: '0.625rem',
                          fontWeight: 700,
                          color: config.color,
                          background: `${config.color}15`,
                          padding: '2px 6px',
                          borderRadius: '4px',
                        }}>
                          {config.label}
                        </span>
                        {log.partner && (
                          <span style={{ fontSize: '0.6875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <User size={10} /> {log.partner}
                          </span>
                        )}
                      </div>
                      <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)' }}>
                        {formatDate(log.timestamp)}
                      </span>
                    </div>
                    <p style={{
                      fontSize: '0.8125rem',
                      color: 'var(--color-text-primary)',
                      lineHeight: '1.5',
                      whiteSpace: 'pre-wrap',
                      margin: 0,
                    }}>
                      {log.message}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
