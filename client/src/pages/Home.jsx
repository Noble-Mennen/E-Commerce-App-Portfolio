// Home.jsx: Product listing page with search and loading/empty states.
// Fetches all products once on mount and filters client-side on the search term.

import { useEffect, useState } from 'react';
import { getProducts } from '../api/products.js';
import ProductCard from '../components/ProductCard.jsx';
import styles from './Home.module.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  // Fetch all products once on mount; no re-fetch on search because filtering is client-side.
  useEffect(() => {
    getProducts()
      .then(data => setProducts(data.products))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Filter by name against the current search term (case-insensitive).
  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  // Show skeleton grid while the initial product fetch is in flight.
  // 8 cards fill a typical viewport without overflow on the default grid layout.
  if (loading) {
    return (
      <main className={styles.page}>
        {/* Skeleton search bar — keeps layout stable while products load */}
        <div className={styles.searchBar}>
          <div className={styles.searchInputSkeleton} />
        </div>
        {/* Skeleton product cards that mirror the shape of a real ProductCard */}
        <div className={styles.grid}>
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className={styles.cardSkeleton}>
              <div className={styles.cardImageSkeleton} />
              <div className={styles.cardNameSkeleton} />
              <div className={styles.cardPriceSkeleton} />
              <div className={styles.cardBtnSkeleton} />
            </div>
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      {/* Search input — filters the already-loaded product list client-side */}
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* API error message */}
      {error && <p className={styles.error}>{error}</p>}

      {/* Empty state: shows the search term in the message so the user knows why
          there are no results; offers a clear button only when a search is active. */}
      {!error && filtered.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>
            {search ? `No products match "${search}".` : 'No products available.'}
          </p>
          {search && (
            <button onClick={() => setSearch('')} className={styles.clearSearchBtn}>
              Clear search
            </button>
          )}
        </div>
      )}

      {/* Product grid — rendered even when empty so the grid tracks with the DOM */}
      <div className={styles.grid}>
        {filtered.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}