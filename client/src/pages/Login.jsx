// Login.jsx: Sign-in page supporting both local credentials and Google OAuth.
//
// Local login posts username and password through the AuthContext signIn function.
// Google login is a full-page browser redirect to the backend OAuth initiation route —
// not a fetch call — so Passport can set the session cookie via the normal redirect flow.
//
// After a successful Google sign-in the browser lands back on the frontend root and
// AuthContext.useEffect fires getMe(), restoring the session automatically.

import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Login.module.css';

// The API base URL is the same value used by apiFetch. In local development it is
// undefined so the Vite proxy handles /api/* requests. In production VITE_API_URL is
// set to the Render backend URL so the browser links directly to the backend.
const API_BASE = import.meta.env.VITE_API_URL ?? '/api';

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Redirect back to wherever the user came from, or home if navigated directly.
  const from = location.state?.from?.pathname ?? '/';

  // Success message passed from the Register page after account creation.
  const flashMessage = location.state?.message;

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await signIn(username, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.heading}>Sign In</h1>

        {flashMessage && <p className={styles.flash}>{flashMessage}</p>}
        {error && <p className={styles.error}>{error}</p>}

        <form onSubmit={handleSubmit} className={styles.form}>
          <label className={styles.label}>
            Username
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              required
              autoComplete="username"
              className={styles.input}
            />
          </label>

          <label className={styles.label}>
            Password
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className={styles.input}
            />
          </label>

          <button type="submit" disabled={loading} className={styles.submitBtn}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        {/* Divider between the local form and the Google OAuth option. */}
        <div className={styles.divider}>
          <span className={styles.dividerText}>or</span>
        </div>

        {/* Google OAuth button — a real anchor so the browser performs a full-page
            redirect rather than a fetch. Passport requires this redirect flow to
            send the user to Google's consent page and handle the callback. */}
        <a href={`${API_BASE}/auth/google`} className={styles.googleBtn}>
          Sign in with Google
        </a>

        <p className={styles.footer}>
          New customer?{' '}
          <Link to="/register" className={styles.link}>Create an account</Link>
        </p>
      </div>
    </main>
  );
}
