import { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, Flame, Target, ChevronRight, Search } from 'lucide-react';
import { getCurrentHeatLevel, formatDuration } from '../../utils/heatPointCalculator';
import AdminMemberDetail from './AdminMemberDetail';
import AdminMemberManager from './AdminMemberManager';

export default function AdminDashboard() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);

  useEffect(() => {
    const fetchMembers = async () => {
      try {
        const usersRef = collection(db, 'users');
        const q = query(usersRef, orderBy('lastUpdated', 'desc'));
        const querySnapshot = await getDocs(q);
        
        const fetchedMembers = [];
        querySnapshot.forEach((doc) => {
          fetchedMembers.push({ id: doc.id, ...doc.data() });
        });
        setMembers(fetchedMembers);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, []);

  const filteredMembers = members.filter(member => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const profile = member.profile || {};
    const team = (profile.team || '').toLowerCase();
    const tags = (profile.tags || []).map(t => t.toLowerCase());
    
    return team.includes(term) || tags.some(t => t.includes(term));
  });

  const cleanupFirestoreMocks = async () => {
    try {
      if (!window.confirm('Firestore上のモックデータ（IDが mock-user- で始まるもの、または名前に「佐藤」等が含まれるもの）を物理削除しますか？')) return;
      setLoading(true);
      const q = query(collection(db, 'users'));
      const snapshot = await getDocs(q);
      let count = 0;
      for (const d of snapshot.docs) {
        const data = d.data();
        const name = data.profile?.displayName || '';
        if (d.id.startsWith('mock-user-') || name.includes('佐藤') || name.includes('鈴木') || name.includes('田中 修羅男')) {
          await deleteDoc(doc(db, 'users', d.id));
          count++;
        }
      }
      alert(`${count}件のモックデータをデータベースから削除しました！\n画面をリロードしてください。`);
      window.location.reload();
    } catch (e) {
      console.error(e);
      alert('削除エラー: ' + e.message);
      setLoading(false);
    }
  };

  const handleMemberUpdate = (updatedMember) => {
    // Update local state directly
    setMembers(prev => prev.map(m => m.id === updatedMember.id ? updatedMember : m));
    setSelectedMember(updatedMember);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
        メンバーデータを読み込み中...
      </div>
    );
  }

  if (selectedMember) {
    return <AdminMemberDetail member={selectedMember} onBack={() => setSelectedMember(null)} onUpdate={handleMemberUpdate} />;
  }

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Users size={24} color="var(--color-primary)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
            運営ダッシュボード
          </h1>
        </div>

        {/* Search Bar & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <div style={{ position: 'relative', minWidth: '250px' }}>
            <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--color-text-muted)' }} />
            <input
              type="text"
              placeholder="チーム名やタグで絞り込み..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              style={{ paddingLeft: '2.25rem', borderRadius: 'var(--radius-full)' }}
            />
          </div>
          <button
            onClick={cleanupFirestoreMocks}
            className="btn-ghost"
            style={{ fontSize: '0.75rem', padding: '0.5rem 1rem', color: 'var(--color-error)', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            DBからモック完全消去（一時機能）
          </button>
        </div>
      </div>

      <div style={{ marginBottom: '2rem' }}>
        <AdminMemberManager />
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '1.5rem',
      }}>
        {filteredMembers.map((member) => {
          const profile = member.profile || {};
          const heatPoints = member.heatPoints || { todayPoints: 0, totalPoints: 0 };
          const level = getCurrentHeatLevel(heatPoints.todayPoints);
          const canvases = member.canvases || [];
          
          return (
            <div key={member.id} className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', position: 'relative', overflow: 'hidden' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '4px', background: level.color }} />
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                {profile.photoURL ? (
                  <img src={profile.photoURL} alt="Avatar" style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${level.color}` }} />
                ) : (
                  <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--color-bg-elevated)', border: `2px solid ${level.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Users size={24} color="var(--color-text-muted)" />
                  </div>
                )}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '1.125rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.displayName || '名無し修羅'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {profile.email || member.id}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Flame size={14} /> 今日の熱量
                  </span>
                  <span style={{ fontWeight: 'bold', color: level.color }}>
                    {heatPoints.todayPoints} pt ({level.label})
                  </span>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem' }}>
                  <span style={{ color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                    <Target size={14} /> 作成キャンバス数
                  </span>
                  <span style={{ fontWeight: 'bold', color: 'var(--color-text-secondary)' }}>
                    {canvases.length} 個
                  </span>
                </div>
              </div>


              <button 
                onClick={() => setSelectedMember(member)}
                className="btn-ghost"
                style={{ width: '100%', marginTop: 'auto', justifyContent: 'center', gap: '0.5rem' }}
              >
                詳細を見る <ChevronRight size={16} />
              </button>
            </div>
          );
        })}
        {filteredMembers.length === 0 && !loading && (
          <div style={{ color: 'var(--color-text-muted)' }}>条件に一致するメンバーデータがありません。</div>
        )}
      </div>
    </div>
  );
}
