import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import styles from './Cart.module.css';

export default function Cart() {
  const { cart, cartLoading, updateItem, removeItem, clearCartItems } = useCart();

  if (cartLoading) return <p className={styles.status}>Loading cart…</p>;

  const items = cart?.items ?? [];
  const total = items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

  if (items.length === 0) {
    return (
      <main className={styles.page}>
        <h1 className={styles.heading}>Your Cart</h1>
        <p className={styles.empty}>Your cart is empty.</p>
        <Link to="/" className={styles.shopLink}>Browse Products</Link>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>Your Cart</h1>

      <div className={styles.layout}>
        <div className={styles.items}>
          {items.map(item => (
            <CartItem
              key={item.product_id}
              item={item}
              onUpdate={updateItem}
              onRemove={removeItem}
            />
          ))}

          <button
            onClick={clearCartItems}
            className={styles.clearBtn}
          >
            Empty Cart
          </button>
        </div>

        <div className={styles.summary}>
          <h2 className={styles.summaryHeading}>
            Subtotal ({items.reduce((s, i) => s + i.quantity, 0)} items):
            <span className={styles.total}> ${total.toFixed(2)}</span>
          </h2>
          <Link to="/checkout" className={styles.checkoutBtn}>
            Proceed to Checkout
          </Link>
        </div>
      </div>
    </main>
  );
}

function CartItem({ item, onUpdate, onRemove }) {
  async function handleQtyChange(e) {
    const qty = Number(e.target.value);
    if (qty >= 1) {
      try {
        await onUpdate(item.product_id, qty);
      } catch {
        // Ignore; CartContext will stay consistent with the last known server state.
      }
    }
  }

  async function handleRemove() {
    try {
      await onRemove(item.product_id);
    } catch {
      // Ignore.
    }
  }

  return (
    <div className={styles.item}>
      {item.image_url ? (
        <img src={item.image_url} alt={item.product_name} className={styles.itemImage} />
      ) : (
        <div className={styles.itemImagePlaceholder} />
      )}
      <div className={styles.itemInfo}>
        <Link to={`/products/${item.product_id}`} className={styles.itemName}>
          {item.product_name}
        </Link>
        <p className={styles.itemPrice}>${Number(item.price).toFixed(2)} each</p>
        <p className={styles.itemStock}>
          {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
        </p>
        <div className={styles.itemControls}>
          <label className={styles.qtyLabel}>
            Qty:
            <input
              type="number"
              min={1}
              max={item.stock || 99}
              value={item.quantity}
              onChange={handleQtyChange}
              className={styles.qtyInput}
            />
          </label>
          <button onClick={handleRemove} className={styles.removeBtn}>
            Remove
          </button>
        </div>
      </div>
      <p className={styles.lineTotal}>
        ${(Number(item.price) * item.quantity).toFixed(2)}
      </p>
    </div>
  );
}