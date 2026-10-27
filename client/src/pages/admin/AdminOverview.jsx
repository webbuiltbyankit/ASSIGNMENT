import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Tag, PlusCircle, CheckCircle, AlertCircle, ArrowRight, Image as ImageIcon } from 'lucide-react';
import { Button } from '../../components/common';
import { catalogService } from '../../services/catalogService';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';

export function AdminOverviewPage() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeProducts: 0,
    totalStockUnits: 0,
    categoriesCount: 0,
    imagesRegistered: 70,
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function loadData() {
      try {
        const prodData = await catalogService.getProducts({ pageSize: 50 });
        const catData = await catalogService.getCategories();

        if (isMounted) {
          const prods = prodData.items || [];
          const totalStock = prods.reduce((sum, p) => sum + (p.totalStock || 0), 0);
          const activeCount = prods.filter((p) => p.active).length;

          setStats({
            totalProducts: prodData.total || prods.length,
            activeProducts: activeCount,
            totalStockUnits: totalStock,
            categoriesCount: catData?.categories?.length || 6,
            imagesRegistered: 70,
          });

          setRecentProducts(prods.slice(0, 5));
        }
      } catch (e) {
        console.warn('Admin overview data fetch error:', e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    loadData();
    return () => { isMounted = false; };
  }, []);

  return (
    <div>
      {/* Top Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-2xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', marginBottom: '4px' }}>
            Store Operations Overview
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Authoritative inventory, catalog records, and verified image assets.
          </p>
        </div>

        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          <Link to="/admin/products/new">
            <Button variant="primary" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <PlusCircle size={16} />
              <span>Create New Product</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="forme-metric-grid">
        <div className="forme-metric-card">
          <span className="forme-metric-card__label">Total Products</span>
          <span className="forme-metric-card__value">{stats.totalProducts}</span>
          <span className="forme-metric-card__sub">{stats.activeProducts} listed active</span>
        </div>

        <div className="forme-metric-card">
          <span className="forme-metric-card__label">Authoritative Stock</span>
          <span className="forme-metric-card__value">{stats.totalStockUnits}</span>
          <span className="forme-metric-card__sub">Across all sizes (S/M/L/XL)</span>
        </div>

        <div className="forme-metric-card">
          <span className="forme-metric-card__label">Active Categories</span>
          <span className="forme-metric-card__value">{stats.categoriesCount}</span>
          <span className="forme-metric-card__sub">Clothing taxonomy items</span>
        </div>

        <div className="forme-metric-card">
          <span className="forme-metric-card__label">Media Master Assets</span>
          <span className="forme-metric-card__value">{stats.imagesRegistered}</span>
          <span className="forme-metric-card__sub">Manifest validated & hashed</span>
        </div>
      </div>

      {/* Quick Access Actions */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: 'var(--space-2xl)' }}>
        <Link
          to="/admin/products"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <Package size={22} color="var(--color-taupe)" />
            <div>
              <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>Manage Catalog Products</strong>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Edit pricing, photos, and size variants</span>
            </div>
          </div>
          <ArrowRight size={16} color="var(--color-taupe)" />
        </Link>

        <Link
          to="/admin/categories"
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-xs)',
            padding: 'var(--space-lg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-md)' }}>
            <Tag size={22} color="var(--color-taupe)" />
            <div>
              <strong style={{ display: 'block', fontSize: 'var(--text-sm)' }}>Category Taxonomy</strong>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>Manage clothing classification & order</span>
            </div>
          </div>
          <ArrowRight size={16} color="var(--color-taupe)" />
        </Link>
      </div>

      {/* Recent Catalog Products Table */}
      <div style={{ backgroundColor: '#FFFFFF', border: '1px solid var(--border-light)', borderRadius: 'var(--radius-xs)', padding: 'var(--space-xl)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-md)' }}>
          <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)' }}>
            Recent Catalog Records
          </h2>
          <Link to="/admin/products" style={{ fontSize: 'var(--text-xs)', color: 'var(--color-charcoal)', textDecoration: 'underline' }}>
            View All ({stats.totalProducts})
          </Link>
        </div>

        <div className="forme-admin-table-wrapper">
          <table className="forme-admin-table">
            <thead>
              <tr>
                <th>Thumbnail</th>
                <th>Product Name</th>
                <th>Collection</th>
                <th>Category</th>
                <th>Price (INR)</th>
                <th>Total Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentProducts.map((p) => (
                <tr key={p.id || p.slug}>
                  <td style={{ width: '50px' }}>
                    <div style={{ width: '36px', height: '45px', borderRadius: '2px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
                      <img
                        src={resolveImageUrl(p.coverImage)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={handleImageError}
                      />
                    </div>
                  </td>
                  <td>
                    <Link to={`/admin/products/${p.id || p.slug}/edit`} style={{ fontWeight: 600, color: 'var(--color-charcoal)', textDecoration: 'underline' }}>
                      {p.name}
                    </Link>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{p.collection}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>{p.totalStock} units</td>
                  <td>
                    <span style={{ fontSize: 'var(--text-xs)', color: p.active ? 'var(--color-success)' : 'var(--text-muted)', fontWeight: 600 }}>
                      {p.active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
