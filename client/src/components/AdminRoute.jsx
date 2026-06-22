// AdminRoute.jsx: Route guard that requires the current user to be an admin.
//
// Used as a layout route in App.jsx to wrap any route that should only be
// accessible to admin users. Produces one of three outcomes after the initial
// auth check resolves:
//   1. Not authenticated  → redirect to /login (same behaviour as ProtectedRoute)
//   2. Authenticated, not admin → inline 403 message (no redirect; the "Admin"
//      nav link is hidden from non-admins, so only URL manipulation lands here)
//   3. Authenticated and admin → render the child route via <Outlet />

import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function AdminRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Wait for the session check to finish before making any routing decision.
  // Without this guard, AuthContext starts with user = null and would flash
  // a redirect to /login on every page refresh for logged-in admin users.
  if (loading) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading…</div>;
  }

  // Unauthenticated: send to /login, preserving the intended destination
  // so the login page can redirect back here after a successful sign-in.
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Authenticated but not an admin: show an inline error.
  // A redirect would be confusing since there is no specific page to fall back to.
  if (!user.is_admin) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h2>403: Access Denied</h2>
        <p style={{ marginTop: '0.5rem' }}>This page requires admin privileges.</p>
      </div>
    );
  }

  // Admin confirmed: render the wrapped child route.
  return <Outlet />;
}