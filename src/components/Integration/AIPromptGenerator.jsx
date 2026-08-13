import { useState } from 'react';
import { useAppState } from '../../context/AppContext';
import { Bot, Copy, Check, Sparkles, X } from 'lucide-react';

export default function AIPromptGenerator({ onClose }) {
  const state = useAppState();
  const [copied, setCopied] = useState(false);

  // Generate the prompt based on current app state
  const generatePrompt = () => {
    const { 
      canvases, 
      growthLogs, 
      heatRecord 
    } = state;

    const activeTheme = canvases?.[0];
    
    // Get recent growth logs (last 3)
    const recentLogs = growthLogs?.slice(0, 3).map(log => 
      `- [${log.type === 'decision' ? '決定' : log.type === 'feedback' ? 'FB' : '気づき'}] ${log.content}`
    ).join('\n') || '特になし';

    // Get active hypotheses
    const hypothesesList = activeTheme?.hypotheses?.map((h, i) => 
      `${i + 1}. 【${h.status}】 ${h.hypothesis}\n   検証方法: ${h.verificationMethod}\n   判断基準: ${h.judgmentCriteria}`
    ).join('\n\n') || '現在設定されている仮説はありません。';

    return `あなたは私の専属のメンター（壁打ち相手）として、私の目標達成とモチベーション維持をサポートしてください。
現在、私は「修羅プロ」というプログラムに参加しており、以下の状況にあります。

## 1. 私の現在地と目標（修羅キャンバス）
- **TO-BE (理想像)**: ${activeTheme?.tobe || '未設定'}
- **AS-IS (現状)**: ${activeTheme?.asis || '未設定'}
- **GAP (課題)**: ${activeTheme?.gap || '未設定'}

## 2. 現在検証中の仮説
${hypothesesList}

## 3. 直近の記録・気づき（成長ログ）
${recentLogs}

## 4. 今週の熱量（活動量）
- 累計熱ポイント: ${heatRecord?.totalPoints || 0} pt
- 今週のセッション数: ${heatRecord?.weeklySessions || 0} 回

---

### お願いしたいこと
上記の現状を踏まえて、以下の点についてフィードバックやアドバイスをください。
1. 現在の仮説やアプローチに対する客観的な意見（もっと良い検証方法はないか等）
2. 私の取り組み（熱量や気づき）に対するポジティブなフィードバック
3. 次の1歩を踏み出すための、具体的で小さな「ネクストアクション」の提案`;
  };

  const promptText = generatePrompt();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        className="animate-scale-in"
        style={{
          background: 'var(--color-bg-surface)',
          border: '1px solid var(--color-glass-border)',
          borderRadius: 'var(--radius-xl)',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: 'var(--shadow-elevated)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '1.5rem',
          borderBottom: '1px solid var(--color-glass-border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'linear-gradient(to right, rgba(6, 182, 212, 0.05), rgba(59, 130, 246, 0.05))',
        }}>
          <h2 style={{ 
            fontSize: '1.125rem', 
            fontWeight: 700, 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem',
            margin: 0,
            color: 'var(--color-text-primary)'
          }}>
            <Bot size={20} className="text-cyan-400" />
            AIメンター相談プロンプト
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--color-text-muted)',
              cursor: 'pointer',
              padding: '0.25rem',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{
          padding: '1.5rem',
          overflowY: 'auto',
          flex: 1,
        }}>
          <p style={{ 
            fontSize: '0.875rem', 
            color: 'var(--color-text-secondary)',
            marginBottom: '1rem',
            lineHeight: 1.6
          }}>
            あなたの現在の「修羅キャンバス」や「成長ログ」のデータをもとに、ChatGPTやClaudeなどのAIに相談するためのプロンプト（指示文）を自動生成しました。<br/>
            下のテキストをコピーして、お使いのAIに貼り付けて壁打ちを始めてください。
          </p>

          <div style={{
            background: 'var(--color-bg-deep)',
            border: '1px solid var(--color-glass-border)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            position: 'relative',
          }}>
            <pre style={{
              margin: 0,
              fontSize: '0.8125rem',
              color: 'var(--color-text-secondary)',
              fontFamily: 'var(--font-family-mono)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
              maxHeight: '40vh',
              overflowY: 'auto',
            }}>
              {promptText}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '1.5rem',
          borderTop: '1px solid var(--color-glass-border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: '1rem',
          background: 'var(--color-bg-primary)',
        }}>
          <button
            onClick={onClose}
            className="btn-ghost"
          >
            閉じる
          </button>
          
          <button
            onClick={handleCopy}
            className="btn-primary"
            style={{ minWidth: '160px' }}
          >
            {copied ? (
              <>
                <Check size={16} />
                コピーしました！
              </>
            ) : (
              <>
                <Copy size={16} />
                プロンプトをコピー
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
