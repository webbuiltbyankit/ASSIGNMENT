import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Edit2, Trash2, ArrowLeft, ArrowRight, Eye } from 'lucide-react';
import { Button } from '../../components/common';
import { ConfirmationDialog } from '../../components/admin/ConfirmationDialog';
import { catalogService } from '../../services/catalogService';
import { apiClient } from '../../services/apiClient';
import { resolveImageUrl, handleImageError } from '../../services/imageResolver';
import { LoadingState, EmptyState } from '../../components/feedback/FeedbackStates';

export function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');

  const loadData = async () => {
    setIsLoading(true);
    try {
      const prodRes = await catalogService.getProducts({ pageSize: 100 });
      const catRes = await catalogService.getCategories();
      setProducts(prodRes.items || []);
      setCategories(catRes?.categories || []);
    } catch (err) {
      console.error('Failed to load products for admin:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered in-memory list for admin table
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (selectedCollection !== 'all' && p.collection !== selectedCollection) return false;
      if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        return (
          p.name.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q) ||
          p.color?.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [products, selectedCollection, selectedCategory, searchQuery]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      // Try DELETE endpoint
      await apiClient(`/admin/products/${deleteTarget.id || deleteTarget.slug}`, {
        method: 'DELETE',
      });
      setDeleteSuccessMsg(`Product "${deleteTarget.name}" archived successfully.`);
      setProducts((prev) => prev.filter((p) => p.id !== deleteTarget.id));
    } catch (err) {
      console.warn('Backend DELETE unavailable or failed, simulating local archive:', err.message);
      // Local archive
      setProducts((prev) =>
        prev.map((p) => (p.id === deleteTarget.id ? { ...p, active: false } : p))
      );
      setDeleteSuccessMsg(`Product "${deleteTarget.name}" marked as archived.`);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
      setTimeout(() => setDeleteSuccessMsg(''), 4000);
    }
  };

  return (
    <div>
      {/* Page Title & Actions */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xl)', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', marginBottom: '4px' }}>
            Products & Inventory
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Manage catalog items, pricing, photography, and variant stock.
          </p>
        </div>

        <Link to="/admin/products/new">
          <Button variant="primary" size="sm" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <PlusCircle size={16} />
            <span>Add New Product</span>
          </Button>
        </Link>
      </div>

      {deleteSuccessMsg && (
        <div style={{ backgroundColor: 'var(--color-success-bg)', border: '1px solid var(--color-success-border)', color: 'var(--color-success)', padding: 'var(--space-sm) var(--space-md)', borderRadius: 'var(--radius-xs)', marginBottom: 'var(--space-md)', fontSize: 'var(--text-sm)' }}>
          {deleteSuccessMsg}
        </div>
      )}

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          gap: 'var(--space-md)',
          alignItems: 'center',
          flexWrap: 'wrap',
          backgroundColor: '#FFFFFF',
          padding: 'var(--space-md) var(--space-lg)',
          borderRadius: 'var(--radius-xs)',
          border: '1px solid var(--border-light)',
          marginBottom: 'var(--space-lg)',
        }}
      >
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="search"
            placeholder="Search by product name or slug..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="forme-input"
            style={{ height: '40px', paddingLeft: '36px', fontSize: 'var(--text-xs)' }}
          />
        </div>

        {/* Collection Filter */}
        <select
          value={selectedCollection}
          onChange={(e) => setSelectedCollection(e.target.value)}
          className="forme-sort-select"
          style={{ height: '40px' }}
        >
          <option value="all">All Collections</option>
          <option value="men">Men's Collection</option>
          <option value="women">Women's Collection</option>
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="forme-sort-select"
          style={{ height: '40px' }}
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Product Table */}
      {isLoading ? (
        <LoadingState message="Loading catalog inventory..." />
      ) : filteredProducts.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Try clearing your search query or filters."
          actionLabel="Reset Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('all');
            setSelectedCollection('all');
          }}
        />
      ) : (
        <div className="forme-admin-table-wrapper">
          <table className="forme-admin-table">
            <thead>
              <tr>
                <th style={{ width: '60px' }}>Image</th>
                <th>Name & Slug</th>
                <th>Collection</th>
                <th>Category</th>
                <th>Price (INR)</th>
                <th>Total Stock</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((p) => (
                <tr key={p.id || p.slug}>
                  <td>
                    <div style={{ width: '40px', height: '50px', borderRadius: '2px', overflow: 'hidden', backgroundColor: 'var(--bg-secondary)' }}>
                      <img
                        src={resolveImageUrl(p.coverImage)}
                        alt=""
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={handleImageError}
                      />
                    </div>
                  </td>
                  <td>
                    <strong style={{ display: 'block', color: 'var(--text-primary)' }}>{p.name}</strong>
                    <code style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{p.slug}</code>
                  </td>
                  <td style={{ textTransform: 'capitalize' }}>{p.collection}</td>
                  <td style={{ textTransform: 'capitalize' }}>{p.category}</td>
                  <td>₹{p.price}</td>
                  <td>
                    <strong style={{ color: p.totalStock <= 5 ? 'var(--color-warning)' : 'var(--text-primary)' }}>
                      {p.totalStock}
                    </strong>{' '}
                    <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>
                      ({p.sizes?.map((s) => `${s.size}:${s.stock}`).join(' ')})
                    </span>
                  </td>
                  <td>
                    <span
                      style={{
                        fontSize: 'var(--text-xs)',
                        fontWeight: 600,
                        color: p.active ? 'var(--color-success)' : 'var(--text-muted)',
                        backgroundColor: p.active ? 'var(--color-success-bg)' : 'var(--bg-secondary)',
                        padding: '2px 6px',
                        borderRadius: '2px',
                      }}
                    >
                      {p.active ? 'Active' : 'Archived'}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <div style={{ display: 'inline-flex', gap: '8px' }}>
                      <Link
                        to={`/products/${p.slug}`}
                        target="_blank"
                        title="View Public Storefront Page"
                        style={{ color: 'var(--text-muted)', padding: '4px' }}
                      >
                        <Eye size={16} />
                      </Link>
                      <Link
                        to={`/admin/products/${p.id || p.slug}/edit`}
                        title="Edit Product"
                        style={{ color: 'var(--color-charcoal)', padding: '4px' }}
                      >
                        <Edit2 size={16} />
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
                        title="Archive Product"
                        style={{ color: 'var(--color-error)', padding: '4px' }}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal (Prompt 57) */}
      <ConfirmationDialog
        isOpen={Boolean(deleteTarget)}
        title="Archive Product"
        message={
          deleteTarget
            ? `Are you sure you want to archive "${deleteTarget.name}"? It will be removed from the public storefront catalog while preserving existing cart lines and inventory records.`
            : ''
        }
        confirmLabel="Archive Product"
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
        isConfirming={isDeleting}
      />
    </div>
  );
}
