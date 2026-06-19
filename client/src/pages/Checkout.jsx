import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { checkout } from '../api/orders.js';
import { useCart } from '../context/CartContext.jsx';
import { useState } from 'react';
import styles from './Checkout.module.css';

export default function Checkout() {
  const { cart, cartLoading, fetchCart } = useCart();
  const navigate = useNavigate();
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState(null);

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  // Redirect to cart if it's empty (nothing to check out).
  useEffect(() => {
    if (!cartLoading && items.length === 0) {
      navigate('/cart', { replace: true });
    }
  }, [cartLoading, items.length, navigate]);

  async function handlePlaceOrder() {
    setError(null);
    setPlacing(true);
    try {
      const data = await checkout();
      // The backend cleared the cart; refresh context so the badge resets.
      await fetchCart();
      navigate(`/orders/${data.order.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setPlacing(false);
    }
  }

  if (cartLoading) return <p className={styles.status}>Loading…</p>;

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Checkout</h1>

      <div className={styles.layout}>
        <div className={styles.orderSummary}>
          <h2 className={styles.sectionTitle}>Order Summary</h2>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Qty</th>
                <th>Unit price</th>
                <th>Line total</th>
              </tr>
            </thead>
            <tbody>
              {items.map(item => (
                <tr key={item.product_id}>
                  <td>{item.product_name}</td>
                  <td>{item.quantity}</td>
                  <td>${Number(item.price).toFixed(2)}</td>
                  <td>${(Number(item.price) * item.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className={styles.placeBox}>
          <div className={styles.totalRow}>
            <span>Order Total:</span>
            <span className={styles.totalAmount}>${total.toFixed(2)}</span>
          </div>

          {error && <p className={styles.error}>{error}</p>}

          <button
            onClick={handlePlaceOrder}
            disabled={placing}
            className={styles.placeBtn}
          >
            {placing ? 'Placing order…' : 'Place Order'}
          </button>

          <p className={styles.disclaimer}>
            Payment is simulated — no real charge will occur.
          </p>
        </div>
      </div>
    </main>
  );
}