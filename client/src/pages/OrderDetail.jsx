import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrder } from '../api/orders.js';
import styles from './OrderDetail.module.css';

const STATUS_CLASS = {
  pending:   'statusPending',
  paid:      'statusPaid',
  shipped:   'statusShipped',
  cancelled: 'statusCancelled',
};

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrder(id)
      .then(data => setOrder(data.order))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className={styles.status}>Loading order…</p>;
  if (error)   return <p className={styles.error}>{error}</p>;
  if (!order)  return null;

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