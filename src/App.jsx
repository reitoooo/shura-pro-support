import { useAppState } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import Dashboard from './components/Layout/Dashboard';
import LoginScreen from './components/Layout/LoginScreen';
import Toast from './components/shared/Toast';
import HeatFeedback from './components/HeatPoint/HeatFeedback';

export default function App() {
  const { celebration } = useAppState();
  const { user } = useAuth();
  
  // Start syncing to/from Firestore if user is logged in
  useFirestoreSync();

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <>
      <Dashboard />
      <Toast />
      <HeatFeedback celebration={celebration} />
    </>
  );
}
