import { useState } from 'react';
import { useAppDispatch } from '../../context/AppContext';
import { ChevronDown, ChevronUp, ExternalLink, Trash2 } from 'lucide-react';
import ConfirmDialog from '../shared/ConfirmDialog';

const STATUS_CONFIG = {
  unverified: { label: '未検証', className: 'badge-pending' },
  verifying: { label: '検証中', className: 'badge-active' },
  completed: { label: '完了', className: 'badge-complete' },
};

export default function CanvasCard({ hypothesis, canvasId }) {
  const dispatch = useAppDispatch();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const status = STATUS_CONFIG[hypothesis.status] || STATUS_CONFIG.unverified;

  const handleStatusChange = (newStatus) => {
    dispatch({
      type: 'UPDATE_HYPOTHESIS',
      payload: { canvasId, hypothesisId: hypothesis.id, status: newStatus },
    });
  };

  const handleFieldChange = (field, value) => {
    dispatch({
      type: 'UPDATE_HYPOTHESIS',
      payload: { canvasId, hypothesisId: hypothesis.id, [field]: value },
    });
  };

  const handleSyncToTasks = () => {
    dispatch({
      type: 'ADD_TOAST',
      payload: { type: 'success', message: '✅ Google Tasks に同期しました（モック）' },
    });
  };

  const executeDelete = () => {
    dispatch({ type: 'DELETE_HYPOTHESIS', payload: { canvasId, hypothesisId: hypothesis.id } });
    dispatch({
      type: 'ADD_TOAST',
      payload: { type: 'success', message: '✅ 仮説を削除しました' },
    });
    setShowConfirmDelete(false);
  };

  // Hypothesis-level fields only (no tobe/asis/gap — those are at canvas level)
  const fields = [
    { key: 'hypothesis', label: '仮説', placeholder: '検証したい仮説...' },
    { key: 'verificationMethod', label: '検証方法', placeholder: '具体的なアクション...' },
    { key: 'judgmentCriteria', label: '判断基準', placeholder: '定量的・客観的な判断基準...' },
  ];

  return (
    <div
      className="animate-fade-in"
      style={{
        background: 'var(--color-bg-deep)',
        border: '1px solid var(--color-glass-border)',
        borderRadius: 'var(--radius-md)',
        overflow: 'hidden',
        transition: 'all var(--transition-base)',
      }}
    >
      {/* Header */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.625rem 0.75rem',
          cursor: 'pointer',
          transition: 'background var(--transition-fast)',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
      >
        <span className={`badge ${status.className}`} style={{ fontSize: '0.5625rem' }}>{status.label}</span>
        <div style={{
          flex: 1,
          fontSize: '0.75rem',
          fontWeight: 600,
          color: 'var(--color-text-primary)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          minWidth: 0,
        }}>
          {hypothesis.hypothesis || '（仮説未入力）'}
        </div>
        {isExpanded ? <ChevronUp size={12} color="var(--color-text-muted)" /> : <ChevronDown size={12} color="var(--color-text-muted)" />}
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div style={{ padding: '0 0.75rem 0.75rem' }}>
          {/* Status selector */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.625rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>ステータス:</span>
            <select
              className="select-field"
              value={hypothesis.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              style={{ width: 'auto', fontSize: '0.6875rem', padding: '0.25rem 2rem 0.25rem 0.5rem' }}
            >
              <option value="unverified">未検証</option>
              <option value="verifying">検証中</option>
              <option value="completed">完了（学び・ピボット）</option>
            </select>
          </div>

          {/* Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.625rem' }}>
            {fields.map((field) => (
              <div key={field.key} style={{ minWidth: 0 }}>
                <label style={{
                  display: 'block',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--color-text-secondary)',
                  marginBottom: '0.1875rem',
                  letterSpacing: '0.02em',
                }}>
                  {field.label}
                </label>
                <textarea
                  className="input-field"
                  value={hypothesis[field.key] || ''}
                  onChange={(e) => handleFieldChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={2}
                  style={{ fontSize: '0.6875rem', minHeight: '2rem' }}
                />
              </div>
            ))}

            {/* Learnings (shown when completed) */}
            {hypothesis.status === 'completed' && (
              <div>
                <label style={{
                  display: 'block',
                  fontSize: '0.625rem',
                  fontWeight: 600,
                  color: 'var(--color-success)',
                  marginBottom: '0.1875rem',
                }}>
                  学び・ピボット内容
                </label>
                <textarea
                  className="input-field"
                  value={hypothesis.learnings || ''}
                  onChange={(e) => handleFieldChange('learnings', e.target.value)}
                  placeholder="この仮説検証から得た学びや次の方向性..."
                  rows={2}
                  style={{ fontSize: '0.6875rem', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{
            display: 'flex',
            gap: '0.375rem',
            marginTop: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid var(--color-glass-border)',
          }}>
            <button className="btn-ghost" onClick={handleSyncToTasks} style={{ fontSize: '0.625rem', padding: '0.25rem 0.5rem' }}>
              <ExternalLink size={10} />
              Google Tasks に同期
            </button>
            <div style={{ flex: 1 }} />
            <button
              onClick={() => setShowConfirmDelete(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.25rem',
                padding: '0.25rem 0.5rem',
                fontSize: '0.625rem',
                background: 'none',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: 'var(--radius-md)',
                color: 'var(--color-error)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
                opacity: 0.7,
              }}
              onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
              onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}
            >
              <Trash2 size={10} />
              削除
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showConfirmDelete}
        title="仮説の削除"
        message="この仮説を削除しますか？この操作は元に戻せません。"
        onConfirm={executeDelete}
        onCancel={() => setShowConfirmDelete(false)}
      />
    </div>
  );
}
