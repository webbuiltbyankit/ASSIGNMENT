import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { SectionHeading, Button, Skeleton } from '../common';
import { ProductCard } from '../product/ProductCard';
import { catalogService } from '../../services/catalogService';
import { ErrorState, EmptyState } from '../feedback/FeedbackStates';

export function FeaturedRow({
  type = 'featured', // 'featured' or 'newArrivals'
  title,
  eyebrow,
  subtitle,
  viewAllLink = '/shop',
  viewAllText = 'View All Garments',
  limit = 4,
}) {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchItems = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data =
        type === 'newArrivals'
          ? await catalogService.getNewArrivals(limit)
          : await catalogService.getFeatured(limit);
      setProducts(data?.items || []);
    } catch (err) {
      console.error(`Error loading ${type} products:`, err);
      setError(err.message || 'Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [type, limit]);

  return (
    <section className="container" style={{ padding: 'var(--space-3xl) var(--space-md)' }} aria-label={title}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          subtitle={subtitle}
          align="left"
          className="m-0"
        />
        <Link to={viewAllLink}>
          <Button variant="outline" size="sm">
            {viewAllText}
          </Button>
        </Link>
      </div>

      {isLoading && (
        <div className="forme-product-grid">
          {Array.from({ length: limit }).map((_, idx) => (
            <div key={idx} className="forme-skeleton--card">
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
          title={`Unable to load ${title}`}
          message={error}
          onRetry={fetchItems}
        />
      )}

      {!isLoading && !error && products.length === 0 && (
        <EmptyState
          title="No products featured currently"
          description="Check back soon as new seasonal editions are introduced."
          actionLabel="Browse Full Shop"
          onAction={() => (window.location.href = '/shop')}
        />
      )}

      {!isLoading && !error && products.length > 0 && (
        <div className="forme-product-grid">
          {products.map((product) => (
            <ProductCard key={product.id || product.slug} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
