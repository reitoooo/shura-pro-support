import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Activity, Target, LayoutDashboard, User, Edit2, Save, X } from 'lucide-react';
import ShuraCanvasPanel from '../ShuraCanvas/ShuraCanvasPanel';
import HeatPointPanel from '../HeatPoint/HeatPointPanel';
import ObjectiveKPIPanel from '../ObjectiveKPI/ObjectiveKPIPanel';
import { AppContext, AppDispatchContext } from '../../context/AppContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';

export default function AdminMemberDetail() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Try to get member from router state, otherwise start as null and fetch
  const [member, setMember] = useState(location.state?.member || null);
  const [loading, setLoading] = useState(!member);

  const [activeTab, setActiveTab] = useState('canvas');
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [team, setTeam] = useState(member?.profile?.team || '');
  const [tagsText, setTagsText] = useState((member?.profile?.tags || []).join(', '));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    // If we already have the member from state, we can skip fetching
    if (member) {
      setLoading(false);
      return;
    }

    const fetchMember = async () => {
      try {
        const userRef = doc(db, 'users', id);
        const docSnap = await getDoc(userRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setMember(data);
          setTeam(data.profile?.team || '');
          setTagsText((data.profile?.tags || []).join(', '));
        } else {
          console.error("No such member!");
        }
      } catch (error) {
        console.error("Error fetching member details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, member]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
        メンバーデータを読み込み中...
      </div>
    );
  }

  if (!member) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '1rem' }}>
        <div style={{ color: 'var(--color-text-muted)' }}>メンバーが見つかりませんでした。</div>
        <button className="btn-ghost" onClick={() => navigate('/admin')}>運営ダッシュボードに戻る</button>
      </div>
    );
  }

  // Create a read-only mock dispatch that does nothing
  const mockDispatch = () => {
    console.warn("Read-only mode: actions are disabled in Admin view.");
  };

  // Reconstruct the state shape expected by the panels
  const memberState = {
    heatPoints: member.heatPoints || { totalPoints: 0, todayPoints: 0, sessions: [], streak: 0 },
    canvases: member.canvases || [],
    commitments: member.commitments || { milestones: [], weeklyGoals: { targetHours: 15, actualHours: 0 }, velocityHistory: [] },
    activityLog: member.activityLog || [],
    toasts: [],
    celebration: null,
    profile: member.profile || {},
  };

  const profile = memberState.profile;

  const handleSaveProfile = async () => {
    setIsSaving(true);
    const parsedTags = tagsText.split(',').map(t => t.trim()).filter(t => t.length > 0);
    
    const updatedProfile = {
      ...profile,
      team,
      tags: parsedTags
    };

    const updatedMember = {
      ...member,
      profile: updatedProfile
    };

    try {
      // Attempt to update Firestore. (This will fail for mock users, which is fine)
      const userRef = doc(db, 'users', member.id);
      await updateDoc(userRef, { profile: updatedProfile });
    } catch (error) {
      console.warn("Firestore update failed (likely a mock user):", error);
    }
    
    // Update local member state instead of relying on callback
    setMember(updatedMember);
    
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <AppContext.Provider value={memberState}>
      <AppDispatchContext.Provider value={mockDispatch}>
        <div style={{ padding: '2rem', height: '100%', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

          {/* Header */}
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            position: 'sticky',
            top: '-2rem', // Compensate for the parent's 2rem padding
            margin: '-2rem -2rem 0 -2rem',
            padding: '1.5rem 2rem',
            background: 'rgba(10, 10, 10, 0.95)',
            backdropFilter: 'blur(10px)',
            borderBottom: '1px solid var(--color-glass-border)',
            zIndex: 100
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <button
                onClick={() => navigate(-1)}
                className="btn-ghost"
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: 'var(--color-bg-elevated)',
                  border: '1px solid var(--color-glass-border)',
                  color: 'var(--color-text-primary)'
                }}
              >
                <ArrowLeft size={24} />
              </button>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" style={{ width: '48px', height: '48px', borderRadius: '50%' }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-surface-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <User size={24} color="var(--color-text-muted)" />
                  </div>
                )}
                <div>
                  <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)', margin: 0, lineHeight: 1.2 }}>
                    {profile.displayName || '名無し修羅'}
                  </h2>
                  <div style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {profile.email || member.id}
                  </div>
                </div>
              </div>
              
              {/* Profile Editor */}
              <div style={{ padding: '1rem', background: 'var(--color-bg-surface)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-glass-border)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 'bold', margin: 0 }}>管理情報</h3>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      style={{ background: 'transparent', border: '1px solid var(--color-glass-border)', color: 'var(--color-text-primary)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.75rem' }}
                    >
                      <Edit2 size={12} /> 編集
                    </button>
                  ) : (
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setTeam(profile.team || '');
                          setTagsText((profile.tags || []).join(', '));
                        }}
                        style={{ background: 'transparent', border: '1px solid var(--color-glass-border)', color: 'var(--color-text-muted)', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.5rem', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        キャンセル
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        style={{ background: 'var(--color-cool-primary)', border: 'none', color: '#ffffff', borderRadius: 'var(--radius-sm)', padding: '0.25rem 0.75rem', display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                      >
                        <Save size={12} /> {isSaving ? '保存中...' : '保存'}
                      </button>
                    </div>
                  )}
                </div>
                
                {isEditing ? (
                  <div style={{ display: 'grid', gap: '0.75rem' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>所属チーム名</label>
                      <input
                        type="text"
                        value={team}
                        onChange={(e) => setTeam(e.target.value)}
                        placeholder="例: フロントエンド修羅"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--color-text-muted)', marginBottom: '0.25rem' }}>タグ (カンマ区切り)</label>
                      <input
                        type="text"
                        value={tagsText}
                        onChange={(e) => setTagsText(e.target.value)}
                        placeholder="例: React, Firebase, リーダー"
                        style={{ width: '100%', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--color-glass-border)', borderRadius: 'var(--radius-sm)', padding: '0.5rem', color: 'var(--color-text-primary)', outline: 'none', fontSize: '0.875rem' }}
                      />
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-text-muted)', width: '80px' }}>チーム:</span>
                      <span>{profile.team || <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>未設定</span>}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '1rem', fontSize: '0.875rem' }}>
                      <span style={{ color: 'var(--color-text-muted)', width: '80px' }}>タグ:</span>
                      <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
                        {profile.tags && profile.tags.length > 0 ? profile.tags.map(tag => (
                          <span key={tag} style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--color-cool-primary)', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem' }}>
                            {tag}
                          </span>
                        )) : <span style={{ color: 'var(--color-text-muted)', fontStyle: 'italic' }}>未設定</span>}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Tab Selector */}
          <div style={{
            display: 'flex',
            gap: '4px',
            background: 'var(--color-bg-surface)',
            borderRadius: 'var(--radius-md)',
            padding: '3px',
            border: '1px solid var(--color-glass-border)',
            alignSelf: 'flex-start'
          }}>
            {[
              { key: 'canvas', label: '修羅キャンバス', icon: <Activity size={16} /> },
              { key: 'heat', label: '熱ポイント', icon: <Target size={16} /> },
              { key: 'kpi', label: '客観的現在地', icon: <LayoutDashboard size={16} /> },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem 1rem',
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  cursor: 'pointer',
                  background: activeTab === tab.key ? 'var(--color-bg-elevated)' : 'transparent',
                  color: activeTab === tab.key ? 'var(--color-text-primary)' : 'var(--color-text-muted)',
                  transition: 'all var(--transition-fast)',
                }}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Read-Only Banner */}
          <div style={{
            padding: '0.75rem',
            background: 'rgba(239, 68, 68, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
            borderRadius: 'var(--radius-md)',
            color: 'var(--color-danger)',
            fontSize: '0.875rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 500
          }}>
            閲覧モード (Read-Only): この画面でデータを変更することはできません。
          </div>

          {/* Detail Content */}
          <div style={{ flex: 1, minHeight: '500px', pointerEvents: 'none' }}>
            {/* We use pointerEvents: 'none' to block all interactions (clicks, inputs) globally in this area */}
            <div style={{ pointerEvents: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem', height: '100%' }}>
              {activeTab === 'canvas' && <ShuraCanvasPanel />}
              {activeTab === 'heat' && (
                <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.25rem' }}>
                  <HeatPointPanel />
                </div>
              )}
              {activeTab === 'kpi' && <ObjectiveKPIPanel />}
            </div>
          </div>

        </div>
      </AppDispatchContext.Provider>
    </AppContext.Provider>
  );
}
