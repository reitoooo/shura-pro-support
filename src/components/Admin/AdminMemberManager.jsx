import { useState, useEffect, useRef } from 'react';
import { collection, query, getDocs, addDoc, deleteDoc, doc, updateDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { Shield, UserPlus, Trash2, Mail, Loader, Upload, Tag, Users, Award } from 'lucide-react';

export default function AdminMemberManager() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form states
  const [newEmail, setNewEmail] = useState('');
  const [newRole, setNewRole] = useState('member');
  const [newTeams, setNewTeams] = useState('');
  const [newAttributes, setNewAttributes] = useState('');
  const [newType, setNewType] = useState('player');
  
  const [adding, setAdding] = useState(false);
  const [csvLoading, setCsvLoading] = useState(false);
  const [message, setMessage] = useState('');
  const fileInputRef = useRef(null);

  const fetchMembers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, 'members'));
      const snapshot = await getDocs(q);
      const membersData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMembers(membersData);
    } catch (err) {
      console.error("Error fetching members:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setAdding(true);
      setMessage('');
      
      const existing = members.find(m => m.email === newEmail.trim());
      if (existing) {
        setMessage('このメールアドレスは既に登録されています。');
        return;
      }

      await addDoc(collection(db, 'members'), {
        email: newEmail.trim(),
        role: newRole,
        teams: newTeams ? newTeams.split('/').map(t => t.trim()).filter(Boolean) : [],
        attributes: newAttributes ? newAttributes.split('/').map(a => a.trim()).filter(Boolean) : [],
        type: newType,
        addedAt: serverTimestamp()
      });

      setMessage(`${newEmail} を追加しました！`);
      setNewEmail('');
      setNewTeams('');
      setNewAttributes('');
      setNewRole('member');
      setNewType('player');
      fetchMembers();
    } catch (err) {
      console.error("Error adding member:", err);
      setMessage('追加に失敗しました。');
    } finally {
      setAdding(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        setCsvLoading(true);
        setMessage('');
        const text = event.target.result;
        const lines = text.split('\n').map(line => line.trim()).filter(Boolean);
        
        if (lines.length < 2) {
          setMessage('データがありません。ヘッダー行を含めてください。');
          return;
        }

        // Basic CSV parsing
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        const emailIdx = headers.indexOf('email');
        const roleIdx = headers.indexOf('role');
        const teamsIdx = headers.indexOf('teams');
        const attributesIdx = headers.indexOf('attributes');
        const typeIdx = headers.indexOf('type');

        if (emailIdx === -1) {
          setMessage('エラー: ヘッダーに email が見つかりません。');
          return;
        }

        const batch = writeBatch(db);
        let addCount = 0;
        let skipCount = 0;

        for (let i = 1; i < lines.length; i++) {
          const cols = lines[i].split(',').map(c => c.trim());
          const email = cols[emailIdx];
          if (!email) continue;

          if (members.some(m => m.email === email)) {
            skipCount++;
            continue;
          }

          const role = (roleIdx !== -1 && cols[roleIdx]) ? cols[roleIdx] : 'member';
          const type = (typeIdx !== -1 && cols[typeIdx]) ? cols[typeIdx] : 'player';
          const teamsStr = (teamsIdx !== -1 && cols[teamsIdx]) ? cols[teamsIdx] : '';
          const attrsStr = (attributesIdx !== -1 && cols[attributesIdx]) ? cols[attributesIdx] : '';

          const newDocRef = doc(collection(db, 'members'));
          batch.set(newDocRef, {
            email,
            role,
            type,
            teams: teamsStr ? teamsStr.split('/').map(t => t.trim()).filter(Boolean) : [],
            attributes: attrsStr ? attrsStr.split('/').map(a => a.trim()).filter(Boolean) : [],
            addedAt: serverTimestamp()
          });
          addCount++;
        }

        if (addCount > 0) {
          await batch.commit();
          setMessage(`${addCount}件追加、${skipCount}件スキップしました！`);
          fetchMembers();
        } else {
          setMessage(`追加するデータがありませんでした。(スキップ: ${skipCount}件)`);
        }
      } catch (err) {
        console.error("CSV Parse/Upload error:", err);
        setMessage('エラーが発生しました。CSVの形式を確認してください。');
      } finally {
        setCsvLoading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    };
    reader.readAsText(file);
  };

  const handleRemoveMember = async (id) => {
    if (!window.confirm('本当にこのメンバーを削除しますか？')) return;
    try {
      await deleteDoc(doc(db, 'members', id));
      fetchMembers();
    } catch (err) {
      console.error("Error removing member:", err);
      alert('削除に失敗しました。');
    }
  };

  return (
    <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Shield size={20} color="var(--color-primary)" />
          <h2 style={{ fontSize: '1.125rem', fontWeight: 'bold' }}>事前登録メンバー管理</h2>
        </div>
        
        <div>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            style={{ display: 'none' }} 
            onChange={handleFileUpload}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={csvLoading}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'var(--color-surface-hover)',
              color: 'var(--color-text-primary)',
              border: '1px solid var(--color-glass-border)',
              borderRadius: 'var(--radius-md)',
              cursor: csvLoading ? 'not-allowed' : 'pointer',
              fontSize: '0.875rem',
              opacity: csvLoading ? 0.7 : 1
            }}
          >
            {csvLoading ? <Loader size={16} className="animate-spin" /> : <Upload size={16} />}
            CSVで一括登録
          </button>
        </div>
      </div>

      <form onSubmit={handleAddMember} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: 'rgba(0,0,0,0.1)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-glass-border)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Mail size={12}/> メールアドレス</label>
          <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="招待するGoogleアカウント" className="base-input" />
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Users size={12}/> チーム (複数可・/区切り)</label>
          <input type="text" value={newTeams} onChange={(e) => setNewTeams(e.target.value)} placeholder="例: Alpha/Beta" className="base-input" />
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
          <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}><Tag size={12}/> 属性・タグ (/区切り)</label>
          <input type="text" value={newAttributes} onChange={(e) => setNewAttributes(e.target.value)} placeholder="例: 学年/学部/興味領域" className="base-input" />
        </div>

        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>ロール</label>
            <select value={newRole} onChange={(e) => setNewRole(e.target.value)} className="base-input">
              <option value="member">一般メンバー</option>
              <option value="admin">管理者</option>
            </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <label style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)' }}>タイプ</label>
            <select value={newType} onChange={(e) => setNewType(e.target.value)} className="base-input">
              <option value="player">プレイヤー</option>
              <option value="mentor">メンター</option>
            </select>
          </div>
          <button type="submit" disabled={adding} style={{ height: '38px', padding: '0 1rem', background: 'var(--color-primary)', color: 'white', border: 'none', borderRadius: 'var(--radius-md)', cursor: adding ? 'not-allowed' : 'pointer', fontWeight: 'bold' }}>
            {adding ? <Loader size={16} className="animate-spin" /> : '追加'}
          </button>
        </div>
        
        {message && <div style={{ gridColumn: '1 / -1', fontSize: '0.75rem', color: message.includes('失敗') || message.includes('エラー') || message.includes('既') ? 'var(--color-danger)' : 'var(--color-success)' }}>{message}</div>}
      </form>

      <style>{`
        .base-input {
          width: 100%; padding: 0.5rem 0.75rem; background: rgba(0,0,0,0.2); border: 1px solid var(--color-glass-border); border-radius: var(--radius-md); color: var(--color-text-primary); outline: none;
        }
      `}</style>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--color-text-muted)', padding: '2rem' }}>読み込み中...</div>
      ) : (
        <div style={{ background: 'rgba(0,0,0,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid var(--color-glass-border)', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8125rem' }}>
            <thead>
              <tr style={{ background: 'rgba(255,255,255,0.05)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-glass-border)' }}>メールアドレス</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-glass-border)' }}>所属/属性</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-glass-border)' }}>タイプ/権限</th>
                <th style={{ padding: '0.75rem 1rem', borderBottom: '1px solid var(--color-glass-border)', width: '60px', textAlign: 'center' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {members.length === 0 ? (
                <tr><td colSpan="4" style={{ padding: '1rem', textAlign: 'center', color: 'var(--color-text-muted)' }}>登録されているメンバーはいません。</td></tr>
              ) : (
                members.map(member => (
                  <tr key={member.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-primary)' }}>{member.email}</td>
                    <td style={{ padding: '0.75rem 1rem', color: 'var(--color-text-secondary)' }}>
                      <div>{member.teams?.join(', ') || '-'}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)' }}>{member.attributes?.join(', ') || '-'}</div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <span style={{ padding: '0.125rem 0.375rem', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem' }}>
                          {member.type === 'mentor' ? 'メンター' : 'プレイヤー'}
                        </span>
                        <span style={{ padding: '0.125rem 0.375rem', background: member.role === 'admin' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(6, 182, 212, 0.1)', color: member.role === 'admin' ? 'var(--color-danger)' : 'var(--color-cool-primary)', borderRadius: 'var(--radius-sm)', fontSize: '0.7rem' }}>
                          {member.role === 'admin' ? '管理者' : '一般'}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: '0.75rem 1rem', textAlign: 'center' }}>
                      <button onClick={() => handleRemoveMember(member.id)} style={{ background: 'transparent', border: 'none', color: 'var(--color-text-muted)', cursor: 'pointer' }} onMouseEnter={(e) => e.currentTarget.style.color = 'var(--color-danger)'} onMouseLeave={(e) => e.currentTarget.style.color = 'var(--color-text-muted)'} title="削除"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
