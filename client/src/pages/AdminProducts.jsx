// AdminProducts.jsx: Admin product management page at /admin/products.
//
// Displays all products in a table with Edit and Delete actions per row.
// An inline form appears above the table when the user starts a create or edit
// operation; it collapses back to idle on save or cancel.
//
// This page is wrapped by AdminRoute in App.jsx, so only admin users reach it.

import { useEffect, useState } from 'react';
import { getProducts, createProduct, updateProduct, deleteProduct } from '../api/products.js';
import styles from './AdminProducts.module.css';

// Default form values used when opening the create form or resetting after a save.
const EMPTY_FORM = { name: '', description: '', price: '', stock: '', image_url: '' };

export default function AdminProducts() {
  // Product list state
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  // pageError covers both load failures and delete failures.
  const [pageError, setPageError] = useState(null);

  //  Form state 
  // formMode drives which UI is shown:
  //   'idle': form hidden, "Add Product" button visible
  //   'create': empty form shown, submits POST
  //   'edit': pre-filled form shown, submits PUT to editId
  const [formMode, setFormMode] = useState('idle');
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);

  //  Delete state 
  // Tracks which product's delete is in flight so only that row's button
  // shows "Deleting…" and is disabled while the request is pending.
  const [deletingId, setDeletingId] = useState(null);

  // Fetch products on initial mount.
  useEffect(() => {
    loadProducts();
  }, []);

  //  Data loading 

  // Fetches the full product list from the server and updates local state.
  // Called on mount and after any create or update so the list stays in sync.
  async function loadProducts() {
    setLoading(true);
    setPageError(null);
    try {
      const data = await getProducts();
      setProducts(data.products);
    } catch (err) {
      setPageError(err.message);
    } finally {
      setLoading(false);
    }
  }

  //  Form open / close 
  // Switch to create mode: reset the form to blank values and show it.
  function openCreateForm() {
    setEditId(null);
    setFormData(EMPTY_FORM);
    setSaveError(null);
    setFormMode('create');
  }

  // Switch to edit mode: pre-fill the form with the selected product's current
  // values so the user can see what they're changing before saving.
  function openEditForm(product) {
    setEditId(product.id);
    setFormData({
      name: product.name ?? '',
      description: product.description ?? '',
      price: product.price ?? '',
      stock: product.stock ?? '',
      image_url: product.image_url ?? '',
    });
    setSaveError(null);
    setFormMode('edit');
  }

  // Collapse the form without saving and clear any error message.
  function closeForm() {
    setFormMode('idle');
    setEditId(null);
    setFormData(EMPTY_FORM);
    setSaveError(null);
  }

  // Sync a single field in formData as the user types.
  function handleField(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }

  //  Form submission 

  async function handleSubmit(e) {
    e.preventDefault();
    setSaveError(null);
    setSaving(true);

    // Convert the string values coming from controlled inputs to the types
    // the backend expects: numbers for price/stock, null for empty optional fields.
    const payload = {
      name: formData.name.trim(),
      description: formData.description.trim() || null,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10),
      image_url: formData.image_url.trim() || null,
    };

    try {
      if (formMode === 'create') {
        await createProduct(payload);
      } else {
        await updateProduct(editId, payload);
      }
      // Close the form before re-fetching so the UI snaps back to the table
      // immediately; the list refresh then fills in the saved values.
      closeForm();
      await loadProducts();
    } catch (err) {
      // Keep the form open so the user can correct the error without losing
      // what they typed.
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  //  Delete 
  async function handleDelete(product) {
    // Require explicit confirmation before sending a destructive request.
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;

    setDeletingId(product.id);
    try {
      await deleteProduct(product.id);
      // Remove from local state immediately; no need to re-fetch the whole
      // list for a single deletion; the server is the source of truth for
      // everything else but we know this row is gone.
      setProducts(prev => prev.filter(p => p.id !== product.id));
    } catch (err) {
      setPageError(err.message);
    } finally {
      setDeletingId(null);
    }
  }

  //  Render 

  return (
    <main className={styles.page}>
      {/* Page header: the "Add Product" button is hidden while the form is
          already open to avoid showing two overlapping entry points. */}
      <div className={styles.pageHeader}>
        <h1 className={styles.heading}>Product Management</h1>
        {formMode === 'idle' && (
          <button onClick={openCreateForm} className={styles.addBtn}>
            + Add Product
          </button>
        )}
      </div>

      {/* Top-level error banner, shown for load failures or delete failures. */}
      {pageError && <p className={styles.pageError}>{pageError}</p>}

      {/* Inline create / edit form, only rendered when formMode is not 'idle'. */}
      {formMode !== 'idle' && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>
            {formMode === 'create' ? 'Add Product' : 'Edit Product'}
          </h2>
          <form onSubmit={handleSubmit}>
            {/* Two-column grid; description spans both columns via formGridFull. */}
            <div className={styles.formGrid}>
              <label className={styles.label}>
                Name *
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleField}
                  required
                  className={styles.input}
                />
              </label>

              <label className={styles.label}>
                Price ($) *
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleField}
                  required
                  min="0.01"
                  step="0.01"
                  className={styles.input}
                />
              </label>

              <label className={styles.label}>
                Stock *
                <input
                  type="number"
                  name="stock"
                  value={formData.stock}
                  onChange={handleField}
                  required
                  min="0"
                  step="1"
                  className={styles.input}
                />
              </label>

              <label className={styles.label}>
                Image URL
                <input
                  type="text"
                  name="image_url"
                  value={formData.image_url}
                  onChange={handleField}
                  placeholder="/images/example.jpg"
                  className={styles.input}
                />
              </label>

              {/* Description is optional and gets a full-width row. */}
              <label className={`${styles.label} ${styles.formGridFull}`}>
                Description
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleField}
                  className={styles.textarea}
                />
              </label>
            </div>

            {/* Per-form error shown below the fields so the user knows what failed. */}
            {saveError && <p className={styles.formError}>{saveError}</p>}

            <div className={styles.formActions}>
              <button type="submit" disabled={saving} className={styles.saveBtn}>
                {saving ? 'Saving…' : formMode === 'create' ? 'Create Product' : 'Save Changes'}
              </button>
              <button type="button" onClick={closeForm} className={styles.cancelBtn}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading and empty states  shown only while the list is loading or empty. */}
      {loading && <p className={styles.status}>Loading products…</p>}

      {!loading && products.length === 0 && !pageError && (
        <p className={styles.status}>No products yet. Add one above.</p>
      )}

      {/* Product table, rendered once loading is done and there is at least one product. */}
      {!loading && products.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead className={styles.thead}>
              <tr>
                <th className={styles.th}>Image</th>
                <th className={styles.th}>Name</th>
                <th className={styles.th}>Price</th>
                <th className={styles.th}>Stock</th>
                <th className={styles.th}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product.id} className={styles.tr}>
                  {/* Thumbnail: falls back to a plain placeholder div when no image is set. */}
                  <td className={styles.td}>
                    {product.image_url ? (
                      <img
                        src={product.image_url}
                        alt={product.name}
                        className={styles.thumb}
                      />
                    ) : (
                      <div className={styles.noThumb} />
                    )}
                  </td>

                  <td className={styles.td}>
                    <span className={styles.productName}>{product.name}</span>
                  </td>

                  {/* Format price with two decimal places to match currency display elsewhere. */}
                  <td className={styles.td}>${Number(product.price).toFixed(2)}</td>

                  <td className={styles.td}>{product.stock}</td>

                  {/* Action buttons: Edit opens the inline form, Delete requires confirmation. */}
                  <td className={`${styles.td} ${styles.actionCell}`}>
                    <button
                      onClick={() => openEditForm(product)}
                      className={styles.editBtn}
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product)}
                      disabled={deletingId === product.id}
                      className={styles.deleteBtn}
                    >
                      {deletingId === product.id ? 'Deleting…' : 'Delete'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}