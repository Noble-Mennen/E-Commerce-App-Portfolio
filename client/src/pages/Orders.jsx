// Orders.jsx: Lists all orders placed by the current user.
// Each order card links to its detail page. Pending orders also show a
// Cancel button that sits alongside the link (not inside it) to keep the
// HTML valid — a button cannot be nested inside an anchor element.

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders, cancelOrder } from '../api/orders.js';
import styles from './Orders.module.css';

// Maps each order status to the CSS module class name for its badge.
const STATUS_CLASS = {
  pending:   'statusPending',
  paid:      'statusPaid',
  shipped:   'statusShipped',
  cancelled: 'statusCancelled',
};

export default function Orders() {
  // Order list state.
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Tracks which order's cancel request is in flight so only that button
  // shows "Cancelling…" and is disabled while the request is pending.
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelError, setCancelError] = useState(null);

  // Fetch all orders on mount.
  useEffect(() => {
    getOrders()
      .then(data => setOrders(data.orders))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Confirm with the user, then send the cancel request.
  // On success, flip the order's status in local state so the badge updates
  // immediately without re-fetching the whole list from the server.
  async function handleCancel(order) {
    if (!window.confirm(`Cancel Order #${order.id}? This cannot be undone.`)) return;
    setCancelError(null);
    setCancellingId(order.id);
    try {
      await cancelOrder(order.id);
      // Update the status in local state; no need to re-fetch the full list.
      setOrders(prev =>
        prev.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o)
      );
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancellingId(null);
    }
  }

  if (loading) return <p className={styles.status}>Loading orders…</p>;
  if (error)   return <p className={styles.error}>{error}</p>;

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Your Orders</h1>

      {/* Error banner shown when a cancel request fails. */}
      {cancelError && <p className={styles.cancelError}>{cancelError}</p>}

      {/* Empty state with a call-to-action link, or the order list. */}
      {orders.length === 0 ? (
        <div>
          <p className={styles.empty}>You have not placed any orders yet.</p>
          <Link to="/" className={styles.shopLink}>Start Shopping</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            // Card is a div so the cancel button can sit alongside the Link
            // without nesting a button inside an anchor (invalid HTML).
            <div key={order.id} className={styles.orderCard}>
              <Link to={`/orders/${order.id}`} className={styles.orderLink}>
                <div className={styles.orderMeta}>
                  <span className={styles.orderId}>Order #{order.id}</span>
                  <span className={styles.orderDate}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className={styles.orderRight}>
                  <span className={styles.orderTotal}>
                    ${Number(order.total).toFixed(2)}
                  </span>
                  <span className={styles[STATUS_CLASS[order.status] ?? 'statusPending']}>
                    {order.status}
                  </span>
                </div>
              </Link>

              {/* Cancel button only shown for orders that are still pending. */}
              {order.status === 'pending' && (
                <button
                  onClick={() => handleCancel(order)}
                  disabled={cancellingId === order.id}
                  className={styles.cancelBtn}
                >
                  {cancellingId === order.id ? 'Cancelling…' : 'Cancel'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}