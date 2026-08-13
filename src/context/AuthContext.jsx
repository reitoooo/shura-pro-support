import { createContext, useContext, useEffect, useState } from 'react';
import { auth, provider, db } from '../lib/firebase';
import { signInWithPopup, signOut, onAuthStateChanged, GoogleAuthProvider } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userRole, setUserRole] = useState('member');
  const [memberData, setMemberData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const [accessToken, setAccessToken] = useState(() => sessionStorage.getItem('googleAccessToken') || null);

  // Superadmin
  const SUPERADMIN_EMAIL = 'njaiiwaka@gmail.com';

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setAuthError('');
      if (currentUser) {
        try {
          if (currentUser.email === SUPERADMIN_EMAIL) {
            setUserRole('admin');
            setMemberData({ email: SUPERADMIN_EMAIL, role: 'admin', teams: [], attributes: [], type: 'player' });
            setUser(currentUser);
          } else {
            const membersRef = collection(db, 'members');
            const q = query(membersRef, where('email', '==', currentUser.email));
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
              await signOut(auth);
              setAuthError('このアカウントは事前登録されていません。管理者に連絡してください。');
              setUser(null);
              setMemberData(null);
            } else {
              const data = querySnapshot.docs[0].data();
              setUserRole(data.role || 'member');
              setMemberData(data);
              setUser(currentUser);
            }
          }
        } catch (err) {
          console.error("Error checking member status:", err);
          await signOut(auth);
          setAuthError('認証エラーが発生しました。');
          setUser(null);
          setMemberData(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const isAdmin = user && (user.email === SUPERADMIN_EMAIL || userRole === 'admin');
  const isMentor = user && (isAdmin || userRole === 'mentor');

  const loginWithGoogle = async () => {
    try {
      setAuthError('');
      const result = await signInWithPopup(auth, provider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        setAccessToken(credential.accessToken);
        sessionStorage.setItem('googleAccessToken', credential.accessToken);
      }
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setAccessToken(null);
      setUserRole('member');
      setMemberData(null);
      sessionStorage.removeItem('googleAccessToken');
    } catch (error) {
      console.error("Error signing out", error);
    }
  };

  const value = {
    user,
    userRole,
    memberData,
    loading,
    isAdmin,
    isMentor,
    authError,
    loginWithGoogle,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
