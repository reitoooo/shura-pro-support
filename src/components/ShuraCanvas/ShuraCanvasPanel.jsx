import { useState } from 'react';
import { useAppState, useAppDispatch, getAllHypotheses } from '../../context/AppContext';
import CanvasCard from './CanvasCard';
import SmartImport from './SmartImport';
import ConfirmDialog from '../shared/ConfirmDialog';
import AIPromptGenerator from '../Integration/AIPromptGenerator';
import { FlaskConical, Plus, ChevronDown, ChevronUp, Trash2, Target, History, RefreshCcw, Bot } from 'lucide-react';

export default function ShuraCanvasPanel() {
  const { canvases } = useAppState();
  const dispatch = useAppDispatch();
  const [showImport, setShowImport] = useState(false);
  const [showPromptGenerator, setShowPromptGenerator] = useState(false);
  const [expandedCanvases, setExpandedCanvases] = useState({});
  const [expandedHistory, setExpandedHistory] = useState({});
  const [showPivotInput, setShowPivotInput] = useState({});
  const [pivotReason, setPivotReason] = useState({});
  const [deleteTargetCanvasId, setDeleteTargetCanvasId] = useState(null);

  const allHypotheses = getAllHypotheses(canvases);
  const statusCounts = {
    all: allHypotheses.length,
    unverified: allHypotheses.filter((h) => h.status === 'unverified').length,
    verifying: allHypotheses.filter((h) => h.status === 'verifying').length,
    completed: allHypotheses.filter((h) => h.status === 'completed').length,
  };

  const toggleCanvas = (id) => {
    setExpandedCanvases((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleAddCanvas = () => {
    const newCanvas = { id: Date.now().toString() };
    dispatch({ type: 'ADD_CANVAS', payload: {} });
    setExpandedCanvases((prev) => ({ ...prev, [newCanvas.id]: true }));
  };

  const handleAddHypothesis = (canvasId) => {
    dispatch({ type: 'ADD_HYPOTHESIS', payload: { canvasId } });
  };

  const handleCanvasFieldChange = (canvasId, field, value) => {
    dispatch({ type: 'UPDATE_CANVAS', payload: { id: canvasId, [field]: value } });
  };

  const initiatePivot = (canvasId) => {
    setShowPivotInput((prev) => ({ ...prev, [canvasId]: true }));
  };

  const cancelPivot = (canvasId) => {
    setShowPivotInput((prev) => ({ ...prev, [canvasId]: false }));
    setPivotReason((prev) => ({ ...prev, [canvasId]: '' }));
  };

  const submitPivot = (canvasId) => {
    dispatch({ type: 'PIVOT_CANVAS', payload: { canvasId, reason: pivotReason[canvasId] } });
    dispatch({
      type: 'ADD_TOAST',
      payload: { type: 'success', message: '✅ ピボット履歴を保存しました' },
    });
    setShowPivotInput((prev) => ({ ...prev, [canvasId]: false }));
    setPivotReason((prev) => ({ ...prev, [canvasId]: '' }));
    setExpandedHistory((prev) => ({ ...prev, [canvasId]: true }));
  };

  const toggleHistory = (canvasId) => {
    setExpandedHistory((prev) => ({ ...prev, [canvasId]: !prev[canvasId] }));
  };

  const executeDeleteCanvas = () => {
    if (deleteTargetCanvasId) {
      dispatch({ type: 'DELETE_CANVAS', payload: deleteTargetCanvasId });
      dispatch({
        type: 'ADD_TOAST',
        payload: { type: 'success', message: '✅ テーマを削除しました' },
      });
      setDeleteTargetCanvasId(null);
    }
  };

  return (
    <div className="glass-panel-static" style={{ padding: 'var(--spacing-panel)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1rem',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <FlaskConical size={16} color="var(--color-cool-accent)" />
          <h2 style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            color: 'var(--color-text-primary)',
            letterSpacing: '0.02em',
          }}>
            修羅キャンバス
          </h2>
        </div>
        <div style={{ display: 'flex', gap: '0.375rem' }}>
          <button
            className="btn-ghost"
            onClick={() => setShowPromptGenerator(true)}
            style={{ fontSize: '0.6875rem', padding: '0.375rem 0.625rem' }}
          >
            <Bot size={12} className="text-cyan-400" />
            AIメンターに相談
          </button>
          <button
            className="btn-ghost"
            onClick={() => setShowImport(!showImport)}
            style={{ fontSize: '0.6875rem', padding: '0.375rem 0.625rem' }}
          >
            {showImport ? '閉じる' : 'AI連携'}
          </button>
          <button
            className="btn-primary"
            onClick={handleAddCanvas}
            style={{ fontSize: '0.6875rem', padding: '0.375rem 0.625rem' }}
          >
            <Plus size={12} />
            新規テーマ
          </button>
        </div>
      </div>

      {/* Smart Import (collapsible) */}
      {showImport && (
        <div style={{ marginBottom: '1rem' }}>
          <SmartImport />
        </div>
      )}

      {/* Summary stats */}
      <div style={{
        display: 'flex',
        gap: '0.75rem',
        marginBottom: '1rem',
        padding: '0.625rem 0.75rem',
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--color-glass-border)',
        fontSize: '0.6875rem',
        color: 'var(--color-text-muted)',
      }}>
        <span>テーマ: <strong style={{ color: 'var(--color-text-secondary)' }}>{canvases.length}</strong></span>
        <span style={{ color: 'var(--color-glass-border)' }}>|</span>
        <span>仮説: <strong style={{ color: 'var(--color-text-secondary)' }}>{statusCounts.all}</strong></span>
        <span style={{ color: 'var(--color-glass-border)' }}>|</span>
        <span className="badge-pending" style={{
          padding: '0.125rem 0.375rem',
          fontSize: '0.5625rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(245, 158, 11, 0.15)',
          color: '#f59e0b',
        }}>
          未検証 {statusCounts.unverified}
        </span>
        <span style={{
          padding: '0.125rem 0.375rem',
          fontSize: '0.5625rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(6, 182, 212, 0.15)',
          color: '#06b6d4',
        }}>
          検証中 {statusCounts.verifying}
        </span>
        <span style={{
          padding: '0.125rem 0.375rem',
          fontSize: '0.5625rem',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(34, 197, 94, 0.15)',
          color: '#22c55e',
        }}>
          完了 {statusCounts.completed}
        </span>
      </div>

      {/* Canvas list */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
      }}>
        {canvases.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '2rem 1rem',
            color: 'var(--color-text-muted)',
          }}>
            <FlaskConical size={32} style={{ opacity: 0.3, marginBottom: '0.75rem' }} />
            <div style={{ fontSize: '0.8125rem', fontWeight: 500, marginBottom: '0.375rem' }}>
              テーマがまだありません
            </div>
            <div style={{ fontSize: '0.6875rem' }}>
              「新規テーマ」から To-be / As-is / Gap を定義し、仮説を追加しましょう
            </div>
          </div>
        ) : (
          canvases.map((canvas) => {
            const isExpanded = expandedCanvases[canvas.id] !== false; // default open
            const hypothesisCount = canvas.hypotheses.length;
            const completedCount = canvas.hypotheses.filter(h => h.status === 'completed').length;

            return (
              <div
                key={canvas.id}
                className="animate-fade-in"
                style={{
                  background: 'var(--color-bg-surface)',
                  border: '1px solid var(--color-glass-border)',
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                }}
              >
                {/* Canvas header (To-be / As-is / Gap) */}
                <div
                  onClick={() => toggleCanvas(canvas.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.875rem 1rem',
                    cursor: 'pointer',
                    transition: 'background var(--transition-fast)',
                    borderBottom: isExpanded ? '1px solid var(--color-glass-border)' : 'none',
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = 'var(--color-bg-elevated)'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <Target size={14} color="var(--color-cool-primary)" />
                  <div style={{
                    flex: 1,
                    fontSize: '0.8125rem',
                    fontWeight: 700,
                    color: 'var(--color-text-primary)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    minWidth: 0,
                  }}>
                    {canvas.tobe || canvas.gap || '（テーマ未入力）'}
                  </div>
                  <span style={{
                    fontSize: '0.625rem',
                    color: 'var(--color-text-muted)',
                    fontFamily: 'var(--font-family-mono)',
                    whiteSpace: 'nowrap',
                  }}>
                    {completedCount}/{hypothesisCount} 仮説
                  </span>
                  {isExpanded ? <ChevronUp size={14} color="var(--color-text-muted)" /> : <ChevronDown size={14} color="var(--color-text-muted)" />}
                </div>

                {/* Expanded canvas content */}
                {isExpanded && (
                  <div style={{ padding: '1rem' }}>
                    {/* To-be / As-is / Gap fields */}
                    <div style={{
                      display: 'grid',
                      gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                      gap: '0.75rem',
                      marginBottom: '0.5rem',
                    }}>
                      {[
                        { key: 'tobe', label: 'To-be（理想像）', placeholder: '達成したい理想の状態...' },
                        { key: 'asis', label: 'As-is（現状）', placeholder: '今の現実の状態...' },
                        { key: 'gap', label: 'Gap（課題）', placeholder: '理想と現実のギャップ...' },
                      ].map((field) => (
                        <div key={field.key} style={{ minWidth: 0 }}>
                          <label style={{
                            display: 'block',
                            fontSize: '0.625rem',
                            fontWeight: 700,
                            color: 'var(--color-cool-primary)',
                            marginBottom: '0.25rem',
                            letterSpacing: '0.05em',
                            textTransform: 'uppercase',
                          }}>
                            {field.label}
                          </label>
                          <textarea
                            className="input-field"
                            value={canvas[field.key] || ''}
                            onChange={(e) => handleCanvasFieldChange(canvas.id, field.key, e.target.value)}
                            placeholder={field.placeholder}
                            rows={2}
                            style={{ fontSize: '0.75rem', minHeight: '2.5rem' }}
                          />
                        </div>
                      ))}
                    </div>

                    {/* Pivot Button & History Section */}
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.5rem' }}>
                        {!showPivotInput[canvas.id] ? (
                          <button
                            className="btn-ghost"
                            onClick={() => initiatePivot(canvas.id)}
                            style={{ fontSize: '0.625rem', padding: '0.25rem 0.5rem', color: 'var(--color-text-secondary)' }}
                          >
                            <RefreshCcw size={10} />
                            このテーマからピボットする
                          </button>
                        ) : (
                          <div style={{
                            width: '100%',
                            background: 'var(--color-bg-deep)',
                            padding: '0.75rem',
                            borderRadius: 'var(--radius-md)',
                            border: '1px solid var(--color-cool-accent)',
                          }} className="animate-fade-in">
                            <label style={{
                              display: 'block',
                              fontSize: '0.625rem',
                              fontWeight: 700,
                              color: 'var(--color-cool-primary)',
                              marginBottom: '0.375rem',
                            }}>
                              ピボットの理由・学び
                            </label>
                            <textarea
                              className="input-field"
                              value={pivotReason[canvas.id] || ''}
                              onChange={(e) => setPivotReason(prev => ({ ...prev, [canvas.id]: e.target.value }))}
                              placeholder="なぜピボットするのか、何が分かったのか..."
                              rows={2}
                              style={{ fontSize: '0.75rem', marginBottom: '0.5rem' }}
                            />
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem' }}>
                              <button
                                className="btn-ghost"
                                onClick={() => cancelPivot(canvas.id)}
                                style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
                              >
                                キャンセル
                              </button>
                              <button
                                className="btn-primary"
                                onClick={() => submitPivot(canvas.id)}
                                style={{ fontSize: '0.6875rem', padding: '0.25rem 0.625rem' }}
                              >
                                履歴に保存
                              </button>
                            </div>
                          </div>
                        )}
                      </div>

                      {canvas.history && canvas.history.length > 0 && (
                        <div style={{
                          background: 'rgba(0, 0, 0, 0.2)',
                          borderRadius: 'var(--radius-md)',
                          border: '1px dashed var(--color-glass-border)',
                          overflow: 'hidden',
                        }}>
                          <div
                            onClick={() => toggleHistory(canvas.id)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '0.5rem',
                              padding: '0.5rem 0.75rem',
                              cursor: 'pointer',
                              fontSize: '0.6875rem',
                              color: 'var(--color-text-muted)',
                            }}
                          >
                            <History size={12} />
                            <span style={{ flex: 1 }}>ピボット履歴 ({canvas.history.length}件)</span>
                            {expandedHistory[canvas.id] ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          </div>
                          
                          {expandedHistory[canvas.id] && (
                            <div style={{ padding: '0 0.75rem 0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                              {canvas.history.map((snapshot) => (
                                <div key={snapshot.id} style={{
                                  background: 'var(--color-bg-deep)',
                                  padding: '0.625rem',
                                  borderRadius: 'var(--radius-sm)',
                                  border: '1px solid var(--color-glass-border)',
                                }}>
                                  <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)', marginBottom: '0.5rem' }}>
                                    {new Date(snapshot.timestamp).toLocaleString('ja-JP')}
                                  </div>
                                  
                                  {snapshot.reason && (
                                    <div style={{ marginBottom: '0.75rem', padding: '0.5rem', background: 'rgba(6, 182, 212, 0.1)', borderRadius: 'var(--radius-sm)' }}>
                                      <div style={{ fontSize: '0.5625rem', color: 'var(--color-cool-primary)', marginBottom: '0.125rem', fontWeight: 600 }}>ピボットの理由・学び</div>
                                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-primary)', whiteSpace: 'pre-wrap' }}>{snapshot.reason}</div>
                                    </div>
                                  )}

                                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                                    <div>
                                      <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)', marginBottom: '0.125rem' }}>TO-BE</div>
                                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{snapshot.tobe || '-'}</div>
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)', marginBottom: '0.125rem' }}>AS-IS</div>
                                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{snapshot.asis || '-'}</div>
                                    </div>
                                    <div>
                                      <div style={{ fontSize: '0.5625rem', color: 'var(--color-text-muted)', marginBottom: '0.125rem' }}>GAP</div>
                                      <div style={{ fontSize: '0.6875rem', color: 'var(--color-text-secondary)', whiteSpace: 'pre-wrap' }}>{snapshot.gap || '-'}</div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Hypotheses section */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '0.625rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--color-glass-border)',
                    }}>
                      <span style={{
                        fontSize: '0.6875rem',
                        fontWeight: 700,
                        color: 'var(--color-text-secondary)',
                        letterSpacing: '0.02em',
                      }}>
                        仮説（{canvas.hypotheses.length}件）
                      </span>
                      <button
                        className="btn-ghost"
                        onClick={(e) => { e.stopPropagation(); handleAddHypothesis(canvas.id); }}
                        style={{ fontSize: '0.625rem', padding: '0.25rem 0.5rem' }}
                      >
                        <Plus size={10} />
                        仮説を追加
                      </button>
                    </div>

                    {/* Hypothesis cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      {canvas.hypotheses.length === 0 ? (
                        <div style={{
                          textAlign: 'center',
                          padding: '1rem',
                          fontSize: '0.6875rem',
                          color: 'var(--color-text-muted)',
                          background: 'var(--color-bg-deep)',
                          borderRadius: 'var(--radius-md)',
                        }}>
                          このテーマにはまだ仮説がありません。「仮説を追加」で検証したい仮説を追加しましょう。
                        </div>
                      ) : (
                        canvas.hypotheses.map((h) => (
                          <CanvasCard key={h.id} hypothesis={h} canvasId={canvas.id} />
                        ))
                      )}
                    </div>

                    {/* Canvas actions */}
                    <div style={{
                      display: 'flex',
                      justifyContent: 'flex-end',
                      marginTop: '0.75rem',
                      paddingTop: '0.5rem',
                      borderTop: '1px solid var(--color-glass-border)',
                    }}>
                      <button
                        onClick={() => setDeleteTargetCanvasId(canvas.id)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.25rem',
                          padding: '0.375rem 0.75rem',
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
                        テーマを削除
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Confirmation Dialog for Canvas Deletion */}
      <ConfirmDialog
        isOpen={!!deleteTargetCanvasId}
        title="テーマの削除"
        message="このテーマと、含まれるすべての仮説を削除しますか？この操作は元に戻せません。"
        onConfirm={executeDeleteCanvas}
        onCancel={() => setDeleteTargetCanvasId(null)}
      />

      {showPromptGenerator && (
        <AIPromptGenerator onClose={() => setShowPromptGenerator(false)} />
      )}
    </div>
  );
}
