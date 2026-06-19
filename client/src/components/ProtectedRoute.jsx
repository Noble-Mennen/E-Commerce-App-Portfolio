import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

// Wraps protected routes. Shows nothing while the initial auth check is in flight
// to prevent a false redirect to /login on page refresh when a session already exists.
export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
  }

  if (!user) {
    // Pass the current path so Login can redirect back after a successful login.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}