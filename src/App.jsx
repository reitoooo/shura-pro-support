import { useAppState } from './context/AppContext';
import { useAuth } from './context/AuthContext';
import { useFirestoreSync } from './hooks/useFirestoreSync';
import { Routes, Route, Navigate } from 'react-router-dom';
import Dashboard from './components/Layout/Dashboard';
import PlayerLayout from './components/Layout/PlayerLayout';
import AdminDashboard from './components/Admin/AdminDashboard';
import AdminMemberDetail from './components/Admin/AdminMemberDetail';
import MentorDashboard from './components/Mentor/MentorDashboard';
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
      <Routes>
        <Route path="/" element={<Dashboard />}>
          {/* 一般プレイヤー画面のレイアウト */}
          <Route index element={<PlayerLayout />} />
          
          {/* 運営画面 */}
          <Route path="admin" element={<AdminDashboard />} />

          {/* メンター画面 */}
          <Route path="mentor" element={<MentorDashboard />} />
          
          {/* 共通詳細画面 */}
          <Route path="members/:id" element={<AdminMemberDetail />} />
        </Route>
      </Routes>
      <Toast />
      <HeatFeedback celebration={celebration} />
    </>
  );
}
