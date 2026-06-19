import { createContext, useContext, useEffect, useState } from 'react';
import { getMe, login, logout } from '../api/auth.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  // loading stays true until the initial session check resolves so ProtectedRoute
  // doesn't flash a redirect to /login before we know if a session exists.
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMe()
      .then(data => setUser(data.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  async function signIn(username, password) {
    const data = await login(username, password);
    setUser(data.user);
    return data.user;
  }

  async function signOut() {
    await logout().catch(() => {});
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}