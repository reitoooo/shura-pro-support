import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Users, Flame, Target, ChevronRight, Search, BookOpen } from 'lucide-react';
import { getCurrentHeatLevel } from '../../utils/heatPointCalculator';

export default function MentorDashboard() {
  const navigate = useNavigate();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: 'var(--color-text-muted)' }}>
        メンバーデータを読み込み中...
      </div>
    );
  }

  return (
    <div style={{ padding: '2rem', height: '100%', overflowY: 'auto' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <BookOpen size={24} color="var(--color-success)" />
          <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--color-text-primary)' }}>
            メンターダッシュボード
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
        </div>
      </div>

      <div style={{
        background: 'var(--color-bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--color-glass-border)',
        overflow: 'hidden',
      }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--color-glass-border)', background: 'rgba(255, 255, 255, 0.02)' }}>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>メンバー</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>チーム</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>熱量 (Heat Point)</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>キャンバス数</th>
                <th style={{ padding: '1rem 1.5rem', fontWeight: 600, color: 'var(--color-text-muted)', fontSize: '0.875rem' }}>アクション</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => {
                const profile = member.profile || {};
                const heatPoints = member.heatPoints || { todayPoints: 0, totalPoints: 0 };
                const level = getCurrentHeatLevel(heatPoints.todayPoints);
                const canvases = member.canvases || [];
                
                return (
                  <tr key={member.id} style={{ borderBottom: '1px solid var(--color-glass-border)', transition: 'background 0.2s' }} className="table-row-hover">
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {profile.photoURL ? (
                          <img src={profile.photoURL} alt="Avatar" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover', border: `2px solid ${level.color}` }} />
                        ) : (
                          <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--color-bg-elevated)', border: `2px solid ${level.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Users size={20} color="var(--color-text-muted)" />
                          </div>
                        )}
                        <div>
                          <div style={{ fontWeight: 'bold', color: 'var(--color-text-primary)', fontSize: '1rem' }}>
                            {profile.displayName || '名無し修羅'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                            {profile.email || member.id}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                      {profile.team || '-'}
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Flame size={16} color={level.color} />
                        <span style={{ fontWeight: 'bold', color: level.color }}>
                          {heatPoints.todayPoints} pt
                        </span>
                        <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>
                          ({level.label})
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem', color: 'var(--color-text-secondary)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Target size={16} color="var(--color-text-muted)" />
                        {canvases.length} 個
                      </div>
                    </td>
                    <td style={{ padding: '1rem 1.5rem' }}>
                      <button 
                        onClick={() => navigate(`/members/${member.id}`, { state: { member, source: 'mentor' } })}
                        className="btn-ghost"
                        style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', color: 'var(--color-success)', borderColor: 'rgba(34, 197, 94, 0.3)' }}
                      >
                        レビューする <ChevronRight size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredMembers.length === 0 && !loading && (
                <tr>
                  <td colSpan="5" style={{ padding: '2rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>
                    条件に一致するメンバーデータがありません。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
