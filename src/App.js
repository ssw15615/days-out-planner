import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ToastProvider } from './lib/toast';
import AuthPage from './pages/AuthPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import MapPage from './pages/MapPage';
import ExplorePage from './pages/ExplorePage';
import AdminPage from './pages/AdminPage';
import './index.css';

function PrivateRoute({ children }) {
  const { session, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!session) return <Navigate to="/login" replace />;
  return children;
}

function AdminRoute({ children }) {
  const { isAdmin, loading } = useAuth();
  if (loading) return <div className="loading"><div className="spinner" /></div>;
  if (!isAdmin) return <Navigate to="/trips" replace />;
  return children;
}

function AppRoutes() {
  const { session, loading } = useAuth();
  if (loading) return <div className="loading" style={{ minHeight: '100vh' }}><div className="spinner" /></div>;

  return (
    <Routes>
      <Route path="/login" element={session ? <Navigate to="/trips" replace /> : <AuthPage />} />
      <Route path="/trips" element={<PrivateRoute><TripsPage /></PrivateRoute>} />
      <Route path="/trips/:id" element={<PrivateRoute><TripDetailPage /></PrivateRoute>} />
      <Route path="/map" element={<PrivateRoute><MapPage /></PrivateRoute>} />
      <Route path="/explore" element={<PrivateRoute><ExplorePage /></PrivateRoute>} />
      <Route path="/admin" element={<AdminRoute><AdminPage /></AdminRoute>} />
      <Route path="*" element={<Navigate to={session ? '/trips' : '/login'} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
