import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import apiFetch from '../api/client.js';
import { useAuth } from '../context/AuthContext.jsx';
import styles from './Account.module.css';

export default function Account() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState(user?.email ?? '');
  const [emailMsg, setEmailMsg] = useState(null);
  const [emailError, setEmailError] = useState(null);
  const [emailSaving, setEmailSaving] = useState(false);

  const [password, setPassword] = useState('');
  const [pwMsg, setPwMsg] = useState(null);
  const [pwError, setPwError] = useState(null);
  const [pwSaving, setPwSaving] = useState(false);

  const [deleteError, setDeleteError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  async function handleEmailUpdate(e) {
    e.preventDefault();
    setEmailMsg(null);
    setEmailError(null);
    setEmailSaving(true);
    try {
      await apiFetch(`/users/${user.id}`, {
        method: 'PUT',
        body: { email },
      });
      setEmailMsg('Email updated successfully.');
    } catch (err) {
      setEmailError(err.message);
    } finally {
      setEmailSaving(false);
    }
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault();
    setPwMsg(null);
    setPwError(null);
    setPwSaving(true);
    try {
      await apiFetch(`/users/${user.id}`, {
        method: 'PUT',
        body: { password },
      });
      setPassword('');
      setPwMsg('Password updated successfully.');
    } catch (err) {
      setPwError(err.message);
    } finally {
      setPwSaving(false);
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('Permanently delete your account? This cannot be undone.')) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      await apiFetch(`/users/${user.id}`, { method: 'DELETE' });
      await signOut();
      navigate('/', { replace: true });
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Account Settings</h1>

      <div className={styles.sections}>
        {/* Account info */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Account Info</h2>
          <dl className={styles.dl}>
            <dt>Username</dt>
            <dd>{user.username}</dd>
            <dt>Member since</dt>
            <dd>{new Date(user.created_at).toLocaleDateString()}</dd>
          </dl>
        </section>

        {/* Update email */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Update Email</h2>
          {emailMsg && <p className={styles.success}>{emailMsg}</p>}
          {emailError && <p className={styles.error}>{emailError}</p>}
          <form onSubmit={handleEmailUpdate} className={styles.form}>
            <label className={styles.label}>
              New email address
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={styles.input}
              />
            </label>
            <button type="submit" disabled={emailSaving} className={styles.saveBtn}>
              {emailSaving ? 'Saving…' : 'Save Email'}
            </button>
          </form>
        </section>

        {/* Update password */}
        <section className={styles.card}>
          <h2 className={styles.sectionTitle}>Change Password</h2>
          {pwMsg && <p className={styles.success}>{pwMsg}</p>}
          {pwError && <p className={styles.error}>{pwError}</p>}
          <form onSubmit={handlePasswordUpdate} className={styles.form}>
            <label className={styles.label}>
              New password
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
                className={styles.input}
              />
              <span className={styles.hint}>Minimum 8 characters</span>
            </label>
            <button type="submit" disabled={pwSaving} className={styles.saveBtn}>
              {pwSaving ? 'Saving…' : 'Change Password'}
            </button>
          </form>
        </section>

        {/* Danger zone */}
        <section className={styles.card}>
          <h2 className={styles.dangerTitle}>Danger Zone</h2>
          {deleteError && <p className={styles.error}>{deleteError}</p>}
          <p className={styles.dangerText}>
            Permanently deletes your account, cart, and all orders. This cannot be undone.
          </p>
          <button
            onClick={handleDeleteAccount}
            disabled={deleting}
            className={styles.deleteBtn}
          >
            {deleting ? 'Deleting…' : 'Delete Account'}
          </button>
        </section>
      </div>
    </main>
  );
}