import { useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { parseSmartImport, getAIPromptTemplate } from '../../utils/smartImportParser';
import { Upload, Copy, ExternalLink, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';

const AI_LINKS = [
  { name: 'Gemini', url: 'https://gemini.google.com/', color: '#4285f4', icon: '✦' },
  { name: 'ChatGPT', url: 'https://chat.openai.com/', color: '#10a37f', icon: '◈' },
  { name: 'Claude', url: 'https://claude.ai/', color: '#cc785c', icon: '◆' },
];

export default function SmartImport() {
  const dispatch = useAppDispatch();
  const [pasteText, setPasteText] = useState('');
  const [showPrompt, setShowPrompt] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const handleImport = () => {
    if (!pasteText.trim()) return;

    setIsImporting(true);
    const result = parseSmartImport(pasteText);

    setTimeout(() => {
      if (result.success && result.data && result.data.length > 0) {
        let totalHyp = 0;
        
        // Loop backwards so the first parsed canvas appears at the top (since IMPORT_CANVAS_DATA unshifts)
        for (let i = result.data.length - 1; i >= 0; i--) {
          const canvasData = result.data[i];
          dispatch({ type: 'IMPORT_CANVAS_DATA', payload: canvasData });
          totalHyp += canvasData.hypotheses?.length || 0;
        }

        dispatch({
          type: 'ADD_TOAST',
          payload: { type: 'success', message: `✅ ${result.data.length}件のテーマと${totalHyp}件の仮説をインポートしました` },
        });
        setPasteText('');
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
      await navigator.clipboard.writeText(getAIPromptTemplate());
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
    <div style={{
      background: 'var(--color-bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--color-glass-border)',
      padding: '1rem',
    }}>
      {/* AI Quick Launch */}
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
          AIメンター起動
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
              gap: '0.375rem',
              padding: '0.5rem',
              fontSize: '0.75rem',
              fontWeight: 600,
              borderRadius: 'var(--radius-md)',
              border: `1px solid ${ai.color}30`,
              background: `${ai.color}10`,
              color: ai.color,
              textDecoration: 'none',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = `${ai.color}20`;
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = `${ai.color}10`;
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>{ai.icon}</span>
            {ai.name}
            <ExternalLink size={10} />
          </a>
        ))}
      </div>

      {/* Prompt template toggle */}
      <button
        onClick={() => setShowPrompt(!showPrompt)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.375rem',
          width: '100%',
          padding: '0.5rem 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '0.6875rem',
          color: 'var(--color-text-muted)',
          fontWeight: 500,
        }}
      >
        {showPrompt ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
        AIに渡すプロンプトを表示
      </button>

      {showPrompt && (
        <div style={{ marginBottom: '0.75rem' }}>
          <pre style={{
            fontSize: '0.6875rem',
            color: 'var(--color-text-secondary)',
            background: 'var(--color-bg-deep)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            whiteSpace: 'pre-wrap',
            lineHeight: 1.5,
            maxHeight: '200px',
            overflowY: 'auto',
          }}>
            {getAIPromptTemplate()}
          </pre>
          <button
            className="btn-ghost"
            onClick={handleCopyPrompt}
            style={{ marginTop: '0.5rem', fontSize: '0.6875rem', padding: '0.375rem 0.75rem' }}
          >
            <Copy size={12} />
            プロンプトをコピー
          </button>
        </div>
      )}

      {/* Smart Import Area */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        marginBottom: '0.5rem',
        marginTop: '0.5rem',
      }}>
        <Upload size={14} color="var(--color-cool-primary)" />
        <span style={{
          fontSize: '0.6875rem',
          fontWeight: 600,
          color: 'var(--color-text-secondary)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}>
          スマートインポート
        </span>
      </div>

      <textarea
        className="input-field"
        value={pasteText}
        onChange={(e) => setPasteText(e.target.value)}
        placeholder="AIの出力をここにペースト...&#10;[SHURAPRO_DATA] タグ付きテキストを自動解析します"
        rows={4}
        style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}
      />

      <button
        className="btn-primary"
        onClick={handleImport}
        disabled={!pasteText.trim() || isImporting}
        style={{
          width: '100%',
          fontSize: '0.8125rem',
          padding: '0.625rem',
          opacity: !pasteText.trim() ? 0.5 : 1,
        }}
      >
        <Upload size={14} />
        {isImporting ? 'インポート中...' : 'キャンバスにインポート'}
      </button>
    </div>
  );
}
