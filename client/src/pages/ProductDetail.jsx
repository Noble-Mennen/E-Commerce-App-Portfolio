import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProduct } from '../api/products.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import styles from './ProductDetail.module.css';

export default function ProductDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [cartMsg, setCartMsg] = useState(null);
  const [cartError, setCartError] = useState(null);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    setLoading(true);
    getProduct(id)
      .then(data => {
        setProduct(data.product);
        setQuantity(1);
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAddToCart() {
    setCartMsg(null);
    setCartError(null);
    setAdding(true);
    try {
      await addItem(product.id, quantity);
      setCartMsg(`Added ${quantity} × "${product.name}" to your cart.`);
    } catch (err) {
      setCartError(err.message);
    } finally {
      setAdding(false);
    }
  }

  if (loading) return <p className={styles.status}>Loading…</p>;
  if (error) return <p className={styles.error}>{error}</p>;
  if (!product) return null;

  const inStock = product.stock > 0;
  const maxQty = inStock ? Math.min(product.stock, 99) : 0;

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>← Back to products</Link>

      <div className={styles.layout}>
        <div className={styles.imagePlaceholder} />

        <div className={styles.info}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>${Number(product.price).toFixed(2)}</p>

          <span className={inStock ? styles.inStock : styles.outOfStock}>
            {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </span>

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          {user ? (
            <div className={styles.buyBox}>
              <label className={styles.qtyLabel}>
                Quantity:
                <input
                  type="number"
                  min={1}
                  max={maxQty}
                  value={quantity}
                  disabled={!inStock}
                  onChange={e =>
                    setQuantity(Math.min(maxQty, Math.max(1, Number(e.target.value))))
                  }
                  className={styles.qtyInput}
                />
              </label>

              <button
                onClick={handleAddToCart}
                disabled={!inStock || adding}
                className={styles.addBtn}
              >
                {adding ? 'Adding…' : 'Add to Cart'}
              </button>

              {cartMsg && <p className={styles.success}>{cartMsg}</p>}
              {cartError && <p className={styles.error}>{cartError}</p>}
            </div>
          ) : (
            <Link to="/login" className={styles.addBtn}>
              Sign in to buy
            </Link>
          )}
        </div>
      </div>
    </main>
  );
}