import { useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { parseMilestoneSmartImport, getMilestoneAIPromptTemplate } from '../../utils/smartImportParser';
import { Sparkles } from 'lucide-react';

const AI_LINKS = [
  { name: 'Gemini', url: 'https://gemini.google.com/', color: '#4285f4' },
  { name: 'ChatGPT', url: 'https://chat.openai.com/', color: '#10a37f' },
  { name: 'Claude', url: 'https://claude.ai/', color: '#cc785c' },
];

export default function MilestoneSmartImport({ onClose, canvases = [] }) {
  const dispatch = useAppDispatch();
  const [pasteText, setPasteText] = useState('');
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    if (!pasteText.trim()) return;

    setIsImporting(true);
    const result = parseMilestoneSmartImport(pasteText);

    setTimeout(() => {
      if (result.success && result.data) {
        dispatch({ type: 'IMPORT_MILESTONES', payload: result.data });
        dispatch({
          type: 'ADD_TOAST',
          payload: { type: 'success', message: `✅ ${result.data.length}件のマイルストーンをインポートしました` },
        });
        setPasteText('');
        if (onClose) onClose();
      } else {
        dispatch({
          type: 'ADD_TOAST',
          payload: { type: 'error', message: result.errors[0] || 'インポートに失敗しました' },
        });
      }
      setIsImporting(false);
    }, 500);
  };

  const handleCopyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(getMilestoneAIPromptTemplate(canvases));
      dispatch({
        type: 'ADD_TOAST',
        payload: { type: 'success', message: '📋 AIプロンプトをコピーしました' },
      });
    } catch {
      dispatch({
        type: 'ADD_TOAST',
        payload: { type: 'error', message: 'コピーに失敗しました' },
      });
    }
  };

  return (
    <div className="animate-fade-in-down" style={{
      background: 'var(--color-bg-deep)',
      borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--color-cool-accent)',
      padding: '1rem',
      marginBottom: '1rem',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.75rem',
      }}>
        <Sparkles size={14} color="var(--color-cool-primary)" />
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          AIロードマップ生成
        </span>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
        {AI_LINKS.map((ai) => (
          <a
            key={ai.name}
            href={ai.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.375rem',
              fontSize: '0.6875rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-sm)',
              background: 'rgba(255, 255, 255, 0.05)',
              color: ai.color,
              textDecoration: 'none',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            {ai.name}
          </a>
        ))}
      </div>

      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
        <button
          className="btn-ghost"
          onClick={handleCopyPrompt}
          style={{ flex: 1, fontSize: '0.75rem', padding: '0.5rem' }}
        >
          プロンプトをコピー
        </button>
      </div>

      <textarea
        className="input-field"
        placeholder="AIの回答（[SHURA_MILESTONES]タグを含む）をここにペースト..."
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        rows={4}
        style={{ marginBottom: '0.75rem', fontSize: '0.75rem' }}
      />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
        {onClose && (
          <button className="btn-ghost" onClick={onClose} style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}>
            キャンセル
          </button>
        )}
        <button
          className="btn-primary"
          onClick={handleImport}
          disabled={!pasteText.trim() || isImporting}
          style={{ fontSize: '0.75rem', padding: '0.375rem 0.75rem' }}
        >
          {isImporting ? 'インポート中...' : 'インポート'}
        </button>
      </div>
    </div>
  );
}
