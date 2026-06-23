// Home.jsx: Product listing page with search, price-range filter, and sort controls.
// All products are fetched once on mount. Filtering and sorting run client-side on
// every control change so no additional network requests are made.

import { useEffect, useState } from 'react';
import { getProducts } from '../api/products.js';
import ProductCard from '../components/ProductCard.jsx';
import styles from './Home.module.css';

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and filter state. Price bounds are kept as strings so the inputs
  // stay controlled; conversion to numbers only happens during filtering.
  const [search, setSearch] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('');

  // Fetch all products once on mount. No re-fetch on filter changes because
  // the full list is already in memory and all narrowing is done here.
  useEffect(() => {
    getProducts()
      .then(data => setProducts(data.products))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  // Convert the price bound strings to numbers for comparison.
  // An empty string produces null so the bound is treated as unlimited.
  const minNum = minPrice !== '' ? parseFloat(minPrice) : null;
  const maxNum = maxPrice !== '' ? parseFloat(maxPrice) : null;

  // Filter by name search and price range. Each check is skipped when its
  // bound is absent so unset controls never narrow the results.
  const filtered = products.filter(p => {
    const price = Number(p.price);
    if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (minNum !== null && !isNaN(minNum) && price < minNum) return false;
    if (maxNum !== null && !isNaN(maxNum) && price > maxNum) return false;
    return true;
  });

  // Sort a shallow copy of filtered so the original server order is restored
  // when the sort control is cleared back to the default option.
  const sorted = sortBy
    ? [...filtered].sort((a, b) => {
        switch (sortBy) {
          case 'price-asc':  return Number(a.price) - Number(b.price);
          case 'price-desc': return Number(b.price) - Number(a.price);
          case 'name-asc':   return a.name.localeCompare(b.name);
          case 'name-desc':  return b.name.localeCompare(a.name);
          default:           return 0;
        }
      })
    : filtered;

  // True when any control has a non-default value; used to show the clear button.
  const hasFilters = search || minPrice || maxPrice || sortBy;

  function clearAll() {
    setSearch('');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('');
  }

  // Build a contextual empty-state message that names whichever filters are active.
  function emptyMessage() {
    const hasPriceFilter = minPrice || maxPrice;
    if (search && hasPriceFilter) return `No products match "${search}" in this price range.`;
    if (search)        return `No products match "${search}".`;
    if (hasPriceFilter) return 'No products found in this price range.';
    return 'No products available.';
  }

  // Show skeleton placeholders while the initial product fetch is in flight.
  // The skeleton mirrors the search bar, filter bar, and product grid so the
  // layout does not shift when real content arrives.
  if (loading) {
    return (
      <main className={styles.page}>
        <div className={styles.searchBar}>
          <div className={styles.searchInputSkeleton} />
        </div>
        <div className={styles.filterBar}>
          <div className={styles.skeletonPriceInput} />
          <div className={styles.skeletonPriceInput} />
          <div className={styles.skeletonSortSelect} />
        </div>
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
      <div className={styles.searchBar}>
        <input
          type="text"
          placeholder="Search products…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      {/* Filter bar: price range inputs, sort select, and a clear button.
          All controls sit in one flex row and wrap on narrow screens. */}
      <div className={styles.filterBar}>
        <label className={styles.filterLabel}>
          Min $
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={minPrice}
            onChange={e => setMinPrice(e.target.value)}
            className={styles.priceInput}
          />
        </label>

        <label className={styles.filterLabel}>
          Max $
          <input
            type="number"
            min="0"
            step="0.01"
            placeholder="Any"
            value={maxPrice}
            onChange={e => setMaxPrice(e.target.value)}
            className={styles.priceInput}
          />
        </label>

        <label className={styles.filterLabel}>
          Sort
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="">Default</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </select>
        </label>

        {/* Only rendered when at least one control is non-default. */}
        {hasFilters && (
          <button onClick={clearAll} className={styles.clearFiltersBtn}>
            Clear all
          </button>
        )}
      </div>

      {error && <p className={styles.error}>{error}</p>}

      {/* Empty state: message reflects whichever filters produced zero results,
          and the clear button lets the user reset everything in one click. */}
      {!error && sorted.length === 0 && (
        <div className={styles.emptyState}>
          <p className={styles.emptyText}>{emptyMessage()}</p>
          {hasFilters && (
            <button onClick={clearAll} className={styles.clearSearchBtn}>
              Clear filters
            </button>
          )}
        </div>
      )}

      <div className={styles.grid}>
        {sorted.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
