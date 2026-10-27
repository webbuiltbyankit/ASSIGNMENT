import React from 'react';

export function FilterControls({
  categories = [],
  activeFilters,
  onFilterChange,
}) {
  const collections = [
    { id: 'all', label: 'All Collections' },
    { id: 'men', label: 'Men' },
    { id: 'women', label: 'Women' },
  ];

  const handleCollectionChange = (val) => {
    onFilterChange('collection', val === 'all' ? null : val);
  };

  const handleCategoryChange = (slug) => {
    onFilterChange('category', slug === 'all' ? null : slug);
  };

  const handleStockChange = (e) => {
    onFilterChange('inStock', e.target.checked ? 'true' : null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Collection Group */}
      <div className="forme-filter-group">
        <span className="forme-filter-group__title">Collection</span>
        {collections.map((col) => {
          const isSelected =
            (!activeFilters.collection && col.id === 'all') ||
            activeFilters.collection === col.id;
          return (
            <label key={col.id} className="forme-filter-item">
              <input
                type="radio"
                name="collection_filter"
                value={col.id}
                checked={isSelected}
                onChange={() => handleCollectionChange(col.id)}
              />
              <span>{col.label}</span>
            </label>
          );
        })}
      </div>

      {/* Categories Group */}
      <div className="forme-filter-group">
        <span className="forme-filter-group__title">Garment Category</span>
        <label className="forme-filter-item">
          <input
            type="radio"
            name="category_filter"
            value="all"
            checked={!activeFilters.category}
            onChange={() => handleCategoryChange('all')}
          />
          <span>All Categories</span>
        </label>
        {categories.map((cat) => {
          const isSelected = activeFilters.category === cat.slug;
          return (
            <label key={cat.slug} className="forme-filter-item">
              <input
                type="radio"
                name="category_filter"
                value={cat.slug}
                checked={isSelected}
                onChange={() => handleCategoryChange(cat.slug)}
              />
              <span>{cat.name}</span>
            </label>
          );
        })}
      </div>

      {/* Stock Availability */}
      <div className="forme-filter-group">
        <span className="forme-filter-group__title">Availability</span>
        <label className="forme-filter-item">
          <input
            type="checkbox"
            name="stock_filter"
            checked={activeFilters.inStock === 'true' || activeFilters.inStock === true}
            onChange={handleStockChange}
          />
          <span>In Stock Only</span>
        </label>
      </div>
    </div>
  );
}

export function FilterSidebar({ categories = [], activeFilters, onFilterChange }) {
  return (
    <aside className="forme-filter-sidebar" aria-label="Catalog Filters">
      <FilterControls
        categories={categories}
        activeFilters={activeFilters}
        onFilterChange={onFilterChange}
      />
    </aside>
  );
}
