import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ChevronDown, ChevronUp, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { Breadcrumb, Price, Button, Skeleton } from '../components/common';
import { ProductGallery } from '../components/product/ProductGallery';
import { SizeSelector } from '../components/product/SizeSelector';
import { ProductCard } from '../components/product/ProductCard';
import { catalogService } from '../services/catalogService';
import { useCart } from '../context/CartContext';
import { ErrorState, EmptyState } from '../components/feedback/FeedbackStates';

export function ProductDetailsPage() {
  const { slug } = useParams();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openAccordion, setOpenAccordion] = useState('fabric');

  const fetchProduct = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await catalogService.getBySlug(slug);
      if (res?.product) {
        setProduct(res.product);
        // Load related items in same category
        if (res.product.category) {
          catalogService
            .getProducts({ category: res.product.category, pageSize: 4 })
            .then((relatedRes) => {
              const filtered = (relatedRes.items || []).filter(
                (p) => p.slug !== slug
              );
              setRelatedProducts(filtered.slice(0, 3));
            })
            .catch(() => {});
        }
      } else {
        const notFoundErr = new Error('Garment not found');
        notFoundErr.status = 404;
        throw notFoundErr;
      }
    } catch (err) {
      console.error('Error loading product details:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [slug]);

  const toggleAccordion = (id) => {
    setOpenAccordion((prev) => (prev === id ? null : id));
  };

  if (isLoading) {
    return (
      <div className="container forme-pdp" style={{ paddingTop: 'var(--space-md)' }}>
        <Skeleton variant="text" width="220px" height="16px" style={{ marginBottom: 'var(--space-md)' }} />
        <div className="forme-pdp__layout">
          <Skeleton variant="image" height="580px" />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <Skeleton variant="text" width="30%" height="14px" />
            <Skeleton variant="text" width="75%" height="32px" />
            <Skeleton variant="text" width="25%" height="24px" />
            <Skeleton variant="text" width="100%" height="80px" />
            <Skeleton variant="text" width="100%" height="50px" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    const is404 = error?.status === 404;
    return (
      <div className="container" style={{ padding: 'var(--space-4xl) var(--space-md)' }}>
        <EmptyState
          title={is404 ? 'Garment Not Found' : 'Unable to Load Product'}
          description={
            is404
              ? 'The garment you are looking for may have been archived or does not exist.'
              : error?.message || 'A network error occurred while loading this garment.'
          }
          actionLabel="Return to Shop"
          onAction={() => (window.location.href = '/shop')}
        />
      </div>
    );
  }

  const breadcrumbItems = [
    { label: 'Home', href: '/' },
    {
      label: `${product.collection.charAt(0).toUpperCase() + product.collection.slice(1)}’s`,
      href: `/collections/${product.collection}`,
    },
    { label: product.category, href: `/shop?category=${product.category}` },
    { label: product.name },
  ];

  return (
    <div className="container forme-pdp" style={{ paddingTop: 'var(--space-md)' }}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb items={breadcrumbItems} />

      {/* Main Two-Column Editorial PDP Layout */}
      <div className="forme-pdp__layout">
        {/* Left Column: Accessible Image Gallery */}
        <ProductGallery images={product.images} productName={product.name} />

        {/* Right Column: Product Info & Purchase Form */}
        <div className="forme-pdp-info">
          <div className="forme-pdp-info__header">
            <span className="forme-pdp-info__category">
              {product.collection}’s / {product.category}
            </span>
            <h1 className="forme-pdp-info__title">{product.name}</h1>
            <div className="forme-pdp-info__price-row">
              <Price amount={product.price} />
              {product.color && (
                <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
                  Color: <strong style={{ color: 'var(--text-primary)' }}>{product.color}</strong>
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="forme-pdp-info__desc">{product.description}</p>

          {/* Stock-Aware Size Variant Selector */}
          <SizeSelector
            product={product}
            sizes={product.sizes}
            onAddToCart={addItem}
          />

          {/* Value Props & Assurances */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 'var(--space-sm)',
              padding: 'var(--space-md) 0',
              borderTop: '1px solid var(--border-light)',
              borderBottom: '1px solid var(--border-light)',
              marginTop: 'var(--space-md)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <Truck size={18} color="var(--color-taupe)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Complimentary Shipping
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <RotateCcw size={18} color="var(--color-taupe)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                14-Day Exchanges
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={18} color="var(--color-taupe)" />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                100% Genuine Natural Fiber
              </span>
            </div>
          </div>

          {/* Details & Care Accordion */}
          <div className="forme-accordion">
            {/* Fabric & Composition */}
            <div className="forme-accordion-item">
              <button
                type="button"
                className="forme-accordion-btn"
                onClick={() => toggleAccordion('fabric')}
                aria-expanded={openAccordion === 'fabric'}
              >
                <span>Fabric & Composition</span>
                {openAccordion === 'fabric' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === 'fabric' && (
                <div className="forme-accordion-content">
                  <p>{product.fabric}</p>
                </div>
              )}
            </div>

            {/* Garment Care */}
            {product.care && (
              <div className="forme-accordion-item">
                <button
                  type="button"
                  className="forme-accordion-btn"
                  onClick={() => toggleAccordion('care')}
                  aria-expanded={openAccordion === 'care'}
                >
                  <span>Care Instructions</span>
                  {openAccordion === 'care' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
                {openAccordion === 'care' && (
                  <div className="forme-accordion-content">
                    <p>{product.care}</p>
                  </div>
                )}
              </div>
            )}

            {/* Delivery & Shipping */}
            <div className="forme-accordion-item">
              <button
                type="button"
                className="forme-accordion-btn"
                onClick={() => toggleAccordion('delivery')}
                aria-expanded={openAccordion === 'delivery'}
              >
                <span>Shipping & Delivery across India</span>
                {openAccordion === 'delivery' ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {openAccordion === 'delivery' && (
                <div className="forme-accordion-content">
                  <p>
                    All domestic orders are carefully packed in plastic-free recycled paper packaging.
                    Metro deliveries are fulfilled within 2–4 business days. Standard pan-India delivery
                    within 4–7 business days.
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Back to Shopping link */}
          <div style={{ marginTop: 'var(--space-md)' }}>
            <Link
              to="/shop"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2xs)',
                fontSize: 'var(--text-xs)',
                color: 'var(--text-muted)',
                textDecoration: 'underline',
              }}
            >
              <ArrowLeft size={14} />
              <span>Continue exploring all garments</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Related Garments Section */}
      {relatedProducts.length > 0 && (
        <section style={{ marginTop: 'var(--space-4xl)', paddingTop: 'var(--space-3xl)', borderTop: '1px solid var(--border-light)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)', marginBottom: 'var(--space-xl)' }}>
            Complete the Silhouette
          </h2>
          <div className="forme-product-grid">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id || p.slug} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
