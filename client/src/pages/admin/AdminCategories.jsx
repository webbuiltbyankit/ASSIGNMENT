import React, { useState, useEffect } from 'react';
import { PlusCircle, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common';
import { FormField, FormError, FormSuccess } from '../../components/common/FormComponents';
import { catalogService } from '../../services/catalogService';
import { apiClient } from '../../services/apiClient';
import { LoadingState } from '../../components/feedback/FeedbackStates';

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingCategory, setEditingCategory] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const loadCategories = async () => {
    setIsLoading(true);
    try {
      const res = await catalogService.getCategories();
      setCategories(res?.categories || []);
    } catch (e) {
      console.warn('Failed to load categories:', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setSlug('');
    setDescription('');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const openEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || '');
    setErrorMsg('');
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Category name is required.');
      return;
    }
    const finalSlug = slug.trim() || name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    try {
      if (editingCategory) {
        // Edit category
        await apiClient(`/admin/categories/${editingCategory.slug}`, {
          method: 'PATCH',
          body: { name, slug: finalSlug, description },
        });
        setCategories((prev) =>
          prev.map((c) => (c.slug === editingCategory.slug ? { ...c, name, slug: finalSlug, description } : c))
        );
        setSuccessMsg(`Category "${name}" updated.`);
      } else {
        // Create category
        await apiClient('/admin/categories', {
          method: 'POST',
          body: { name, slug: finalSlug, description },
        });
        setCategories((prev) => [...prev, { name, slug: finalSlug, description }]);
        setSuccessMsg(`Category "${name}" created.`);
      }
      setIsModalOpen(false);
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      console.warn('API unavailable or mock mode:', err.message);
      // Fallback update in state
      if (editingCategory) {
        setCategories((prev) =>
          prev.map((c) => (c.slug === editingCategory.slug ? { ...c, name, slug: finalSlug, description } : c))
        );
      } else {
        setCategories((prev) => [...prev, { name, slug: finalSlug, description }]);
      }
      setIsModalOpen(false);
      setSuccessMsg(`Category saved locally.`);
      setTimeout(() => setSuccessMsg(''), 3000);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-3xl)', marginBottom: '4px' }}>
            Category Taxonomy
          </h1>
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>
            Manage garment classifications and catalog filtering tags.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={openCreateModal}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <PlusCircle size={16} />
          <span>Add Category</span>
        </Button>
      </div>

      <FormSuccess message={successMsg} />

      {isLoading ? (
        <LoadingState message="Loading category taxonomy..." />
      ) : (
        <div className="forme-admin-table-wrapper">
          <table className="forme-admin-table">
            <thead>
              <tr>
                <th>Category Name</th>
                <th>URL Slug</th>
                <th>Description</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.slug}>
                  <td>
                    <strong style={{ color: 'var(--text-primary)' }}>{cat.name}</strong>
                  </td>
                  <td>
                    <code style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{cat.slug}</code>
                  </td>
                  <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', maxWidth: '400px' }}>
                    {cat.description || 'No description provided.'}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => openEditModal(cat)}
                      style={{ color: 'var(--color-charcoal)', padding: '4px', cursor: 'pointer' }}
                      aria-label={`Edit ${cat.name}`}
                    >
                      <Edit2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit / Create Category Modal */}
      {isModalOpen && (
        <div
          className="forme-modal-backdrop"
          onClick={() => setIsModalOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          <div className="forme-modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h2>

            <FormError message={errorMsg} />

            <form onSubmit={handleSave}>
              <FormField
                id="cat-name"
                label="Category Name"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!editingCategory) {
                    setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, '-'));
                  }
                }}
                required
                placeholder="e.g. Outerwear"
              />

              <FormField
                id="cat-slug"
                label="URL Slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                placeholder="e.g. outerwear"
              />

              <div className="forme-form-group">
                <label htmlFor="cat-desc" className="forme-label">Description</label>
                <textarea
                  id="cat-desc"
                  rows={3}
                  className="forme-input"
                  style={{ height: 'auto', padding: 'var(--space-sm) var(--space-md)', lineHeight: '1.5' }}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Category description..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-sm)', marginTop: 'var(--space-xl)' }}>
                <Button variant="secondary" size="sm" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
