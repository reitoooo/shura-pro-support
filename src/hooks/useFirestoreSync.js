import { useEffect, useState, useRef } from 'react';
import { doc, onSnapshot, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useAppState, useAppDispatch } from '../context/AppContext';

export function useFirestoreSync() {
  const { user, memberData } = useAuth();
  const state = useAppState();
  const dispatch = useAppDispatch();
  const [isInitialized, setIsInitialized] = useState(false);
  const [syncStatus, setSyncStatus] = useState('idle');
  
  const isRemoteUpdate = useRef(false);

  useEffect(() => {
    if (!user) {
      setIsInitialized(false);
      return;
    }

    const userDocRef = doc(db, 'users', user.uid);
    setSyncStatus('syncing');

    const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
      if (docSnap.exists()) {
        const remoteData = docSnap.data();
        if (!isInitialized) {
          isRemoteUpdate.current = true;
          dispatch({ type: 'HYDRATE_FROM_REMOTE', payload: remoteData });
          setIsInitialized(true);
          setSyncStatus('idle');
        }
      } else {
        // Doc doesn't exist yet, initialize with current local state
        if (!isInitialized) {
           isRemoteUpdate.current = true;
           // Inject memberData directly into the local state
           if (memberData) {
             dispatch({ 
               type: 'UPDATE_PROFILE', 
               payload: {
                 team: memberData.teams?.join('/') || '', // Join array with slashes
                 tags: memberData.attributes || [],
                 type: memberData.type || 'player'
               } 
             });
           }
           setIsInitialized(true);
           setSyncStatus('idle');
        }
      }
    }, (error) => {
      console.error("Firestore sync error:", error);
      setSyncStatus('error');
      dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: `DB読み込みエラー: ${error.message}` } });
    });

    return () => unsubscribe();
  }, [user, dispatch, isInitialized, memberData]);

  useEffect(() => {
    if (!user || !isInitialized) return;
    
    if (isRemoteUpdate.current) {
      isRemoteUpdate.current = false;
      return;
    }

    const syncToRemote = async () => {
      try {
        setSyncStatus('syncing');
        const userDocRef = doc(db, 'users', user.uid);
        
        const { toasts, celebration, ...persistableState } = state;
        
        await setDoc(userDocRef, {
          ...persistableState,
          profile: {
            ...persistableState.profile,
            displayName: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
          },
          lastUpdated: serverTimestamp()
        }, { merge: true });
        
        setSyncStatus('idle');
      } catch (error) {
        console.error("Failed to sync to Firestore:", error);
        setSyncStatus('error');
        dispatch({ type: 'ADD_TOAST', payload: { type: 'error', message: `DB保存エラー: ${error.message}` } });
      }
    };

    const timeoutId = setTimeout(() => {
      syncToRemote();
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [state, user, isInitialized, dispatch]);

  return { syncStatus, isInitialized };
}
