import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, X, ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { Breadcrumb, Button, Skeleton } from '../components/common';
import { ProductCard } from '../components/product/ProductCard';
import { FilterSidebar } from '../components/shop/FilterSidebar';
import { FilterDrawer } from '../components/shop/FilterDrawer';
import { catalogService } from '../services/catalogService';
import { LoadingState, EmptyState, ErrorState } from '../components/feedback/FeedbackStates';

export function ShopPage({ collectionFilter = null, pageTitle = 'All Garments', pageSubtitle = 'Considered everyday clothing crafted from natural French linen, combed organic cotton, and raw denim.' }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);

  // Read URL query params
  const currentCollection = collectionFilter || searchParams.get('collection') || null;
  const currentCategory = searchParams.get('category') || null;
  const currentSort = searchParams.get('sort') || 'featured';
  const currentQuery = searchParams.get('q') || '';
  const currentInStock = searchParams.get('inStock') || null;
  const currentPage = Math.max(1, parseInt(searchParams.get('page') || '1', 10));

  const activeFilters = useMemo(() => ({
    collection: currentCollection,
    category: currentCategory,
    sort: currentSort,
    q: currentQuery,
    inStock: currentInStock,
  }), [currentCollection, currentCategory, currentSort, currentQuery, currentInStock]);

  // Load categories taxonomy
  useEffect(() => {
    let isMounted = true;
    catalogService.getCategories().then((res) => {
      if (isMounted && res?.categories) {
        setCategories(res.categories);
      }
    }).catch((e) => console.warn('Failed to load categories:', e));
    return () => { isMounted = false; };
  }, []);

  // Fetch products whenever filters or page changes
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await catalogService.getProducts({
        collection: currentCollection,
        category: currentCategory,
        sort: currentSort,
        q: currentQuery,
        inStock: currentInStock,
        page: currentPage,
        pageSize: 12,
      });

      setProducts(res.items || []);
      setTotalCount(res.total || 0);
      setTotalPages(res.totalPages || Math.ceil((res.total || 0) / 12) || 1);
    } catch (err) {
      console.error('Error fetching catalog products:', err);
      setError(err.message || 'Unable to retrieve products at this time.');
    } finally {
      setIsLoading(false);
    }
  }, [currentCollection, currentCategory, currentSort, currentQuery, currentInStock, currentPage]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Helper to update query string parameters
  const updateQueryParam = (key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value === null || value === undefined || value === '') {
      next.delete(key);
    } else {
      next.set(key, value);
    }
    // Any filter modification resets page to 1
    if (key !== 'page') {
      next.delete('page');
    }
    setSearchParams(next);
  };

  const handleClearAllFilters = () => {
    const next = new URLSearchParams();
    if (collectionFilter) {
      // Preserve fixed route collection if on dedicated collection page
      next.set('collection', collectionFilter);
    }
    setSearchParams(next);
  };

  const handleApplyDrawerFilters = (drafts) => {
    const next = new URLSearchParams(searchParams);
    if (drafts.collection && !collectionFilter) next.set('collection', drafts.collection);
    else if (!collectionFilter) next.delete('collection');

    if (drafts.category) next.set('category', drafts.category);
    else next.delete('category');

    if (drafts.inStock) next.set('inStock', drafts.inStock);
    else next.delete('inStock');

    next.delete('page');
    setSearchParams(next);
  };

  // Compute display range string (e.g. "Showing 1-12 of 20")
  const startItem = totalCount > 0 ? (currentPage - 1) * 12 + 1 : 0;
  const endItem = Math.min(currentPage * 12, totalCount);

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    { label: collectionFilter ? `${collectionFilter.charAt(0).toUpperCase() + collectionFilter.slice(1)}’s Collection` : 'Shop All' },
  ];

  return (
    <div className="container" style={{ paddingTop: 'var(--space-md)' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Shop Header */}
      <header className="forme-shop-header">
        <div className="forme-shop-header__top">
          <h1 className="forme-shop-header__title">{pageTitle}</h1>
          <p className="forme-shop-header__desc">{pageSubtitle}</p>
        </div>

        {/* Controls Bar */}
        <div className="forme-shop-controls">
          <div className="forme-shop-controls__left">
            {/* Mobile Filter Drawer Trigger */}
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsFilterDrawerOpen(true)}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <SlidersHorizontal size={14} />
              <span>Filters</span>
            </Button>

            <span className="forme-shop-controls__count">
              {totalCount > 0
                ? `Showing ${startItem}–${endItem} of ${totalCount} garments`
                : isLoading
                ? 'Searching garments...'
                : '0 garments'}
            </span>
          </div>

          <div className="forme-shop-controls__right">
            <label htmlFor="shop-sort-select" className="sr-only">Sort Garments By</label>
            <select
              id="shop-sort-select"
              className="forme-sort-select"
              value={currentSort}
              onChange={(e) => updateQueryParam('sort', e.target.value)}
            >
              <option value="featured">Featured First</option>
              <option value="newest">Newest Arrivals</option>
              <option value="priceAsc">Price: Low to High</option>
              <option value="priceDesc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {(currentCollection || currentCategory || currentQuery || currentInStock) && (
          <div className="forme-filter-chips">
            {currentQuery && (
              <span className="forme-chip">
                <Search size={12} />
                <span>"{currentQuery}"</span>
                <button
                  type="button"
                  className="forme-chip__remove"
                  onClick={() => updateQueryParam('q', null)}
                  aria-label="Remove search query filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {currentCollection && !collectionFilter && (
              <span className="forme-chip">
                <span>Collection: {currentCollection}</span>
                <button
                  type="button"
                  className="forme-chip__remove"
                  onClick={() => updateQueryParam('collection', null)}
                  aria-label="Remove collection filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {currentCategory && (
              <span className="forme-chip">
                <span>Category: {currentCategory}</span>
                <button
                  type="button"
                  className="forme-chip__remove"
                  onClick={() => updateQueryParam('category', null)}
                  aria-label="Remove category filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            {currentInStock && (
              <span className="forme-chip">
                <span>In Stock Only</span>
                <button
                  type="button"
                  className="forme-chip__remove"
                  onClick={() => updateQueryParam('inStock', null)}
                  aria-label="Remove in-stock filter"
                >
                  <X size={12} />
                </button>
              </span>
            )}

            <button
              type="button"
              className="forme-chip-clear-all"
              onClick={handleClearAllFilters}
            >
              Clear All Filters
            </button>
          </div>
        )}
      </header>

      {/* Main Listing Layout: Sidebar + Grid */}
      <div className="forme-shop-layout">
        {/* Desktop Filter Sidebar */}
        <FilterSidebar
          categories={categories}
          activeFilters={activeFilters}
          onFilterChange={(key, val) => updateQueryParam(key, val)}
        />

        {/* Product Grid Area */}
        <section aria-label="Product Listings" style={{ minWidth: 0 }}>
          {isLoading && (
            <div className="forme-product-grid">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="forme-skeleton--card">
                  <Skeleton variant="image" />
                  <Skeleton variant="text" width="40%" height="12px" />
                  <Skeleton variant="text" width="85%" height="16px" />
                  <Skeleton variant="text" width="30%" height="16px" />
                </div>
              ))}
            </div>
          )}

          {!isLoading && error && (
            <ErrorState
              title="Unable to load catalog"
              message={error}
              onRetry={fetchProducts}
            />
          )}

          {!isLoading && !error && products.length === 0 && (
            <EmptyState
              title="No garments match your criteria"
              description="We couldn't find any clothing matching your active combination of filters and search terms."
              actionLabel="Clear All Filters"
              onAction={handleClearAllFilters}
            />
          )}

          {!isLoading && !error && products.length > 0 && (
            <>
              <div className="forme-product-grid">
                {products.map((product) => (
                  <ProductCard key={product.id || product.slug} product={product} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <nav className="forme-pagination" aria-label="Catalog Pagination">
                  <button
                    type="button"
                    className="forme-page-btn"
                    disabled={currentPage <= 1}
                    onClick={() => updateQueryParam('page', currentPage - 1)}
                    aria-label="Go to previous page"
                  >
                    <ArrowLeft size={16} />
                  </button>

                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const pageNum = idx + 1;
                    const isActive = pageNum === currentPage;
                    return (
                      <button
                        key={pageNum}
                        type="button"
                        className={`forme-page-btn ${isActive ? 'forme-page-btn--active' : ''}`}
                        onClick={() => updateQueryParam('page', pageNum)}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    className="forme-page-btn"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateQueryParam('page', currentPage + 1)}
                    aria-label="Go to next page"
                  >
                    <ArrowRight size={16} />
                  </button>
                </nav>
              )}
            </>
          )}
        </section>
      </div>

      {/* Mobile Filter Drawer */}
      <FilterDrawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        categories={categories}
        activeFilters={activeFilters}
        onApplyFilters={handleApplyDrawerFilters}
        onClearFilters={handleClearAllFilters}
      />
    </div>
  );
}
