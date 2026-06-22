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

  // Order data and fetch state.
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Cancel request state — separate from the fetch state so the two don't conflict.
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState(null);

  // Re-fetch whenever the id param changes (e.g. browser back/forward).
  useEffect(() => {
    setLoading(true);
    setError(null);
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
      // Flip the status in local state; avoids a full re-fetch for a single field change.
      setOrder(prev => ({ ...prev, status: 'cancelled' }));
    } catch (err) {
      setCancelError(err.message);
    } finally {
      setCancelling(false);
    }
  }

  // Show a skeleton that mirrors the two-column header and items card layout.
  if (loading) {
    return (
      <main className={styles.page}>
        {/* Back-link placeholder */}
        <div className={`${styles.skeletonLine} ${styles.skeletonBack}`} />

        {/* Header skeleton: left (title + date) and right (badge + total) columns */}
        <div className={styles.header}>
          <div className={styles.skeletonHeadLeft}>
            <div className={`${styles.skeletonLine} ${styles.skeletonTitle}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonDate}`} />
          </div>
          <div className={styles.skeletonHeadRight}>
            <div className={`${styles.skeletonLine} ${styles.skeletonBadge}`} />
            <div className={`${styles.skeletonLine} ${styles.skeletonTotal}`} />
          </div>
        </div>

        {/* Items card skeleton: section heading + 3 table row placeholders */}
        <div className={styles.card}>
          <div className={`${styles.skeletonLine} ${styles.skeletonSectionTitle}`} />
          <div className={styles.skeletonRows}>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={styles.skeletonTableRow}>
                {/* Product name cell is wider (flex: 3) than the numeric cells (flex: 1). */}
                <div className={`${styles.skeletonLine} ${styles.skeletonCell}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonCellSm}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonCellSm}`} />
                <div className={`${styles.skeletonLine} ${styles.skeletonCellSm}`} />
              </div>
            ))}
          </div>
        </div>
      </main>
    );
  }

  if (error)  return <p className={styles.error}>{error}</p>;
  if (!order) return null;

  // Resolve the badge class name once; falls back to pending style for unknown statuses.
  const statusClass = STATUS_CLASS[order.status] ?? 'statusPending';

  return (
    <main className={styles.page}>
      <Link to="/orders" className={styles.back}>← Back to Orders</Link>

      {/* Two-column header: order ID and date on the left; badge, total, and cancel on the right. */}
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

          {/* Inline error shown below the cancel button when the request fails. */}
          {cancelError && <p className={styles.cancelError}>{cancelError}</p>}
        </div>
      </div>

      {/* Items table with a totals row in tfoot. */}
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