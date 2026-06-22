// OrderDetail.jsx: Shows a single order with its line items.
// Pending orders display a Cancel button in the header. On success, the local
// order state is updated so the status badge flips without a page re-fetch.

import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder, cancelOrder } from '../api/orders.js';
import styles from './OrderDetail.module.css';

// Maps each order status to the CSS module class name for its badge.
const STATUS_CLASS = {
  pending:   'statusPending',
  paid:      'statusPaid',
  shipped:   'statusShipped',
  cancelled: 'statusCancelled',
};

export default function OrderDetail() {
  const { id } = useParams();

  // Order data state.
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancel request state.
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Fetch the order (with its items) whenever the id param changes.
  useEffect(() => {
    getOrder(id)
      .then(data => setOrder(data.order))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  // Confirm with the user, send the cancel request, then update local state
  // so the status badge and button disappear without a round-trip re-fetch.
  async function handleCancel() {
    if (!window.confirm(`Cancel Order #${id}? This cannot be undone.`)) return;
    setCancelError(null);
    setCancelling(true);
    try {
      await cancelOrder(id);
      // Flip the status in local state; no need to re-fetch the full order.
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  if (loading) return <p className={styles.status}>Loading order…</p>;
  if (error)   return <p className={styles.error}>{error}</p>;
  if (!order)  return null;

  // Resolve the badge class name once; falls back to pending style for unknown statuses.
  const statusClass = STATUS_CLASS[order.status] ?? 'statusPending';

  return (
    <main className={styles.page}>
      <Link to="/orders" className={styles.back}>← Back to Orders</Link>

      <div className={styles.header}>
        <div>
          <h1 className={styles.heading}>Order #{order.id}</h1>
          <p className={styles.date}>
            Placed {new Date(order.created_at).toLocaleDateString('en-US', {
              year: 'numeric', month: 'long', day: 'numeric',
            })}
          </p>
        </div>
        <div className={styles.headerRight}>
          <span className={styles[statusClass]}>{order.status}</span>
          <span className={styles.total}>${Number(order.total).toFixed(2)}</span>

          {/* Cancel button only shown while the order is still pending. */}
          {order.status === 'pending' && (
            <button
              onClick={handleCancel}
              disabled={cancelling}
              className={styles.cancelBtn}
            >
              {cancelling ? 'Cancelling…' : 'Cancel Order'}
            </button>
          )}

          {cancelError && <p className={styles.cancelError}>{cancelError}</p>}
        </div>
      </div>

      <div className={styles.card}>
        <h2 className={styles.sectionTitle}>Items</h2>
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
            {order.items.map(item => (
              <tr key={item.id}>
                <td>{item.product_name}</td>
                <td>{item.quantity}</td>
                <td>${Number(item.unit_price).toFixed(2)}</td>
                <td>${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className={styles.totalLabel}>Order Total</td>
              <td className={styles.totalAmount}>${Number(order.total).toFixed(2)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </main>
  );
}