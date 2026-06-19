import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useTheme } from '../hooks/useTheme.js';
import styles from './Header.module.css';

export default function Header() {
  const { user, signOut } = useAuth();
  const { itemCount } = useCart();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  async function handleSignOut() {
    await signOut();
    navigate('/');
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link to="/" className={styles.logo}>ShopPort</Link>

        <nav className={styles.nav}>
          <Link to="/" className={styles.navLink}>Products</Link>
          {user && (
            <>
              <Link to="/orders" className={styles.navLink}>Orders</Link>
              <Link to="/account" className={styles.navLink}>Account</Link>
            </>
          )}
        </nav>

        <div className={styles.actions}>
          <Link to="/cart" className={styles.cartLink}>
            <span className={styles.cartIcon}>🛒</span>
            {itemCount > 0 && (
              <span className={styles.badge}>{itemCount}</span>
            )}
            <span className={styles.cartLabel}>Cart</span>
          </Link>

          <button onClick={toggle} className={styles.themeBtn} aria-label="Toggle theme">
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>

          {user ? (
            <button onClick={handleSignOut} className={styles.authBtn}>
              Sign Out
            </button>
          ) : (
            <Link to="/login" className={styles.authBtn}>
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}