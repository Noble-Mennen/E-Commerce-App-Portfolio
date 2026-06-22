// ProductDetail.jsx: Shows a single product with its image, price, stock, and add-to-cart form.
// The quantity input is clamped to the available stock on every change so it can never
// exceed what the server will accept at checkout.

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

  // Product data and fetch state.
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add-to-cart form state.
  const [quantity, setQuantity] = useState(1);
  const [cartMsg, setCartMsg] = useState(null);
  const [cartError, setCartError] = useState(null);
  const [adding, setAdding] = useState(false);

  // Re-fetch whenever the id param changes (e.g. navigating between products).
  useEffect(() => {
    setLoading(true);
    setError(null);
    getProduct(id)
      .then(data => {
        setProduct(data.product);
        setQuantity(1); // Reset quantity so it doesn't carry over from a previous product.
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Adds the selected quantity to the cart, then shows a confirmation message.
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

  // Show a skeleton that mirrors the two-column product layout while the fetch is in flight.
  if (loading) {
    return (
      <main className={styles.page}>
        {/* Back-link placeholder */}
        <div className={`${styles.skeletonLine} ${styles.skeletonBack}`} />

        {/* Two-column skeleton: square image on the left, info lines on the right. */}
        <div className={styles.layout}>
          <div className={styles.skeletonImage} />
          <div className={styles.skeletonInfo}>
            <div className={`${styles.skeletonLine} ${styles.skeletonName}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonPrice}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonStock}`} />
            {/* Two description bars — second is shorter to look like a partial line. */}
            <div className={`${styles.skeletonLine} ${styles.skeletonDesc}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonDesc} ${styles.skeletonDescShort}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonBtn}`} />
          </div>
        </div>
      </main>
    );
  }

  if (error)    return <p className={styles.error}>{error}</p>;
  if (!product) return null;

  const inStock = product.stock > 0;
  // Cap the quantity input at the available stock (max 99 to avoid absurd values).
  const maxQty = inStock ? Math.min(product.stock, 99) : 0;

  return (
    <main className={styles.page}>
      <Link to="/" className={styles.back}>← Back to products</Link>

      {/* Two-column layout: image on the left, product info on the right. */}
      <div className={styles.layout}>
        {product.image_url ? (
          <img src={product.image_url} alt={product.name} className={styles.productImage} />
        ) : (
          <div className={styles.imagePlaceholder} />
        )}

        <div className={styles.info}>
          <h1 className={styles.name}>{product.name}</h1>
          <p className={styles.price}>${Number(product.price).toFixed(2)}</p>

          <span className={inStock ? styles.inStock : styles.outOfStock}>
            {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
          </span>

          {product.description && (
            <p className={styles.description}>{product.description}</p>
          )}

          {/* Buy box is only shown to logged-in users; guests see a sign-in link instead. */}
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
                    // Clamp to [1, maxQty] so the value is always valid before submission.
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

              {cartMsg   && <p className={styles.success}>{cartMsg}</p>}
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