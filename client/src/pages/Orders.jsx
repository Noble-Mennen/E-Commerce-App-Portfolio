import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getOrders } from '../api/orders.js';
import styles from './Orders.module.css';

const STATUS_CLASS = {
  pending:   'statusPending',
  paid:      'statusPaid',
  shipped:   'statusShipped',
  cancelled: 'statusCancelled',
};

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getOrders()
      .then(data => setOrders(data.orders))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className={styles.status}>Loading orders…</p>;
  if (error)   return <p className={styles.error}>{error}</p>;

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Your Orders</h1>

      {orders.length === 0 ? (
        <div>
          <p className={styles.empty}>You have not placed any orders yet.</p>
          <Link to="/" className={styles.shopLink}>Start Shopping</Link>
        </div>
      ) : (
        <div className={styles.list}>
          {orders.map(order => (
            <Link
              key={order.id}
              to={`/orders/${order.id}`}
              className={styles.orderCard}
            >
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
          ))}
        </div>
      )}
    </main>
  );
}