import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import styles from './ProductCard.module.css';

export default function ProductCard({ product }) {
  const { user } = useAuth();
  const { addItem } = useCart();

  async function handleAddToCart() {
    if (!user) return;
    try {
      await addItem(product.id, 1);
    } catch {
      // Errors are silently ignored here; ProductDetail gives full error feedback.
    }
  }

  const inStock = product.stock > 0;

  return (
    <div className={styles.card}>
      <Link to={`/products/${product.id}`} className={styles.nameLink}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.productImage} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}
        <h3 className={styles.name}>{product.name}</h3>
      </Link>

      <p className={styles.price}>${Number(product.price).toFixed(2)}</p>

      <span className={inStock ? styles.inStock : styles.outOfStock}>
        {inStock ? `In Stock (${product.stock})` : 'Out of Stock'}
      </span>

      {user ? (
        <button
          onClick={handleAddToCart}
          disabled={!inStock}
          className={styles.addBtn}
        >
          Add to Cart
        </button>
      ) : (
        <Link to="/login" className={styles.addBtn}>
          Sign in to buy
        </Link>
      )}
    </div>
  );
}