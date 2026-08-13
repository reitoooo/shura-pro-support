import { useState } from 'react';
import { useAppState, useAppDispatch } from '../../context/AppContext';
import { Plus, Users, Calendar, MessageSquare, Bot, Copy, Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react';

export default function MeetingNotesPanel() {
  const { meetingNotes = [] } = useAppState();
  const dispatch = useAppDispatch();
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [partner, setPartner] = useState('');
  const [date, setDate] = useState(new Date().toISOString().substring(0, 10));
  const [content, setContent] = useState('');
  
  const [expandedNoteId, setExpandedNoteId] = useState(null);
  
  // Prompt Generator State
  const [promptNote, setPromptNote] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    // Use selected date, but keep current time for ordering
    const submitDate = new Date(date);
    const now = new Date();
    submitDate.setHours(now.getHours(), now.getMinutes());

    dispatch({
      type: 'ADD_MEETING_NOTE',
      payload: {
        partner: partner.trim(),
        content: content.trim(),
        date: submitDate.toISOString(),
      }
    });

    setPartner('');
    setContent('');
    setIsFormOpen(false);
    
    dispatch({
      type: 'ADD_TOAST',
      payload: { type: 'success', message: '面談記録を保存しました' }
    });
  };

  const handleDelete = (id) => {
    if (confirm('この記録を削除してもよろしいですか？')) {
      dispatch({ type: 'DELETE_MEETING_NOTE', payload: id });
    }
  };

  const openPromptGenerator = (note) => {
    setPromptNote(note);
  };

  const getPromptText = (note) => {
    return `以下の1on1/面談の議事録（メモ）を読んで、私の成長とアクションに繋がるように以下の3つのカテゴリで要約・抽出してください。

【抽出してほしいカテゴリ】
1. 決定事項（合意したネクストアクションや方針）
2. フィードバック（他者からの客観的な指摘や評価）
3. 気づき（自分自身の内省、学び、感情の動き）

また、議事録の内容に不明瞭な点や、さらに深掘りした方が良い点があれば、要約のあとに「壁打ちのための質問」をいくつか提示してください。私がそれに答えることで、思考をよりクリアに整理したいと考えています。

【議事録（メモ）内容】
日時: ${new Date(note.date || note.timestamp).toLocaleDateString()}
相手: ${note.partner || '未設定'}
内容:
${note.content}

抽出結果は箇条書きで簡潔にまとめてください。`;
  };

  const handleCopyPrompt = async () => {
    if (!promptNote) return;
    try {
      await navigator.clipboard.writeText(getPromptText(promptNote));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Copy failed', err);
    }
  };

  // Sort notes by date descending
  const sortedNotes = [...meetingNotes].sort((a, b) => {
    const dateA = new Date(a.date || a.timestamp).getTime();
    const dateB = new Date(b.date || b.timestamp).getTime();
    return dateB - dateA;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '1.25rem' }}>
      
      {/* Header & Add Button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-text-primary)' }}>
          <MessageSquare size={18} className="text-cyan-400" />
          面談・1on1 記録
        </h2>
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="btn-primary"
          style={{ padding: '0.5rem 1rem', fontSize: '0.8125rem' }}
        >
          {isFormOpen ? 'キャンセル' : <><Plus size={16} /> 記録を追加</>}
        </button>
      </div>

      {/* Form Area */}
      {isFormOpen && (
        <form onSubmit={handleSubmit} style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-cool-primary)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          animation: 'fade-in 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                日付
              </label>
              <div style={{ position: 'relative' }}>
                <Calendar size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'var(--color-bg-deep)',
                    border: '1px solid var(--color-glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>
            <div style={{ flex: 2 }}>
              <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
                相手 (メンターなど)
              </label>
              <div style={{ position: 'relative' }}>
                <Users size={14} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
                <input
                  type="text"
                  value={partner}
                  onChange={(e) => setPartner(e.target.value)}
                  placeholder="例: メンターの〇〇さん"
                  style={{
                    width: '100%',
                    background: 'var(--color-bg-deep)',
                    border: '1px solid var(--color-glass-border)',
                    borderRadius: 'var(--radius-md)',
                    padding: '0.5rem 0.75rem 0.5rem 2.25rem',
                    color: 'var(--color-text-primary)',
                  }}
                />
              </div>
            </div>
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-secondary)', marginBottom: '0.5rem' }}>
              議事録・メモ (生データ)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="1on1でのフィードバックや会話のメモをここに残します..."
              style={{
                width: '100%',
                minHeight: '120px',
                background: 'var(--color-bg-deep)',
                border: '1px solid var(--color-glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                color: 'var(--color-text-primary)',
                resize: 'vertical',
                lineHeight: 1.5,
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              type="submit"
              disabled={!content.trim()}
              className="btn-primary"
            >
              保存する
            </button>
          </div>
        </form>
      )}

      {/* Timeline List */}
      <div style={{
        flex: 1,
        background: 'var(--color-bg-surface)',
        border: '1px solid var(--color-glass-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        overflowY: 'auto',
      }}>
        {sortedNotes.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>
            まだ面談記録がありません。
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {sortedNotes.map((note) => {
              const isExpanded = expandedNoteId === note.id;
              const displayDate = new Date(note.date || note.timestamp).toLocaleDateString();
              
              return (
                <div key={note.id} style={{
                  background: 'var(--color-bg-deep)',
                  border: '1px solid var(--color-glass-border)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  transition: 'all 0.2s ease',
                }}>
                  {/* Summary row (always visible) */}
                  <div 
                    onClick={() => setExpandedNoteId(isExpanded ? null : note.id)}
                    style={{
                      padding: '1rem',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      background: isExpanded ? 'rgba(255,255,255,0.02)' : 'transparent',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div style={{ color: 'var(--color-cool-primary)', fontWeight: 600, fontSize: '0.875rem' }}>
                        {displayDate}
                      </div>
                      {note.partner && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8125rem', color: 'var(--color-text-secondary)', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '12px' }}>
                          <Users size={12} />
                          {note.partner}
                        </div>
                      )}
                    </div>
                    <div style={{ color: 'var(--color-text-muted)' }}>
                      {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </div>
                  </div>

                  {/* Expanded content */}
                  {isExpanded && (
                    <div style={{
                      padding: '1rem',
                      borderTop: '1px solid var(--color-glass-border)',
                      background: 'rgba(0,0,0,0.1)',
                      animation: 'fade-in 0.2s ease-out'
                    }}>
                      <div style={{ 
                        fontSize: '0.875rem', 
                        lineHeight: 1.6, 
                        color: 'var(--color-text-primary)',
                        whiteSpace: 'pre-wrap',
                        marginBottom: '1.5rem',
                      }}>
                        {note.content}
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--color-glass-border)', paddingTop: '1rem' }}>
                        <button
                          onClick={() => openPromptGenerator(note)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            background: 'rgba(6, 182, 212, 0.1)',
                            color: 'var(--color-cool-primary)',
                            border: '1px solid rgba(6, 182, 212, 0.3)',
                            padding: '0.5rem 1rem',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          <Bot size={14} />
                          AIで「3大ログ」に要約する
                        </button>

                        <button
                          onClick={() => handleDelete(note.id)}
                          style={{
                            background: 'transparent',
                            border: 'none',
                            color: 'var(--color-danger)',
                            padding: '0.5rem',
                            cursor: 'pointer',
                            opacity: 0.7,
                          }}
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Prompt Generator Modal */}
      {promptNote && (
        <div
          onClick={() => setPromptNote(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 3000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'var(--color-bg-surface)',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 'var(--radius-xl)',
              width: '100%',
              maxWidth: '600px',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: 'var(--shadow-elevated)',
              overflow: 'hidden',
            }}
          >
            <div style={{ padding: '1.25rem 1.5rem', borderBottom: '1px solid var(--color-glass-border)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Bot size={20} className="text-cyan-400" />
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-primary)' }}>AI要約プロンプト</h3>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontSize: '0.8125rem', color: 'var(--color-text-secondary)', marginBottom: '1rem', lineHeight: 1.5 }}>
                以下のテキストをコピーして、ChatGPTやClaudeに貼り付けてください。<br/>
                要約された結果は、隣の「成長ログ」パネルから記録すると便利です。
              </p>
              <pre style={{
                background: 'var(--color-bg-deep)',
                border: '1px solid var(--color-glass-border)',
                borderRadius: 'var(--radius-md)',
                padding: '1rem',
                fontSize: '0.75rem',
                color: 'var(--color-text-primary)',
                fontFamily: 'var(--font-family-mono)',
                whiteSpace: 'pre-wrap',
                maxHeight: '40vh',
                overflowY: 'auto',
                margin: 0,
              }}>
                {getPromptText(promptNote)}
              </pre>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--color-glass-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', background: 'var(--color-bg-primary)' }}>
              <button onClick={() => setPromptNote(null)} className="btn-ghost" style={{ fontSize: '0.8125rem' }}>
                閉じる
              </button>
              <button onClick={handleCopyPrompt} className="btn-primary" style={{ fontSize: '0.8125rem', minWidth: '140px' }}>
                {copied ? <><Check size={14} /> コピー完了</> : <><Copy size={14} /> コピーする</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
