import { appConfig } from '../config/appConfig';
import { apiClient } from './apiClient';
import {
  queryFixturesCatalog,
  getFixtureProductBySlug,
  fixturesCategories,
} from '../fixtures/seedCatalog';

export const catalogService = {
  /**
   * Fetch paginated products with filters & sorting
   */
  async getProducts(params = {}, { signal } = {}) {
    if (appConfig.api.useFixtures) {
      // Simulate minimal async delay for realistic UI states
      await new Promise((r) => setTimeout(r, 60));
      return queryFixturesCatalog(params);
    }

    const query = new URLSearchParams();
    if (params.page) query.set('page', params.page);
    if (params.pageSize) query.set('pageSize', params.pageSize);
    if (params.collection && params.collection !== 'all') query.set('collection', params.collection);
    if (params.category && params.category !== 'all') query.set('category', params.category);
    if (params.sort) query.set('sort', params.sort);
    if (params.q) query.set('q', params.q);
    if (params.inStock) query.set('inStock', 'true');
    if (params.size) query.set('size', params.size);

    const queryString = query.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    return apiClient(endpoint, { signal });
  },

  /**
   * Fetch single product detail by slug
   */
  async getBySlug(slug, { signal } = {}) {
    if (appConfig.api.useFixtures) {
      await new Promise((r) => setTimeout(r, 60));
      const product = getFixtureProductBySlug(slug);
      if (!product) {
        const error = new Error(`Product not found with slug: ${slug}`);
        error.status = 404;
        error.code = 'ERR_PRODUCT_NOT_FOUND';
        throw error;
      }
      return { product };
    }

    return apiClient(`/products/${encodeURIComponent(slug)}`, { signal });
  },

  /**
   * Fetch category taxonomy
   */
  async getCategories({ signal } = {}) {
    if (appConfig.api.useFixtures) {
      await new Promise((r) => setTimeout(r, 40));
      return { categories: fixturesCategories };
    }

    return apiClient('/categories', { signal });
  },

  /**
   * Fetch featured products for homepage
   */
  async getFeatured(limit = 4, { signal } = {}) {
    if (appConfig.api.useFixtures) {
      await new Promise((r) => setTimeout(r, 50));
      const res = queryFixturesCatalog({ sort: 'featured', pageSize: limit });
      return { items: res.items };
    }

    return apiClient(`/products?featured=true&pageSize=${limit}`, { signal });
  },

  /**
   * Fetch new arrival products
   */
  async getNewArrivals(limit = 4, { signal } = {}) {
    if (appConfig.api.useFixtures) {
      await new Promise((r) => setTimeout(r, 50));
      const res = queryFixturesCatalog({ sort: 'newest', pageSize: limit });
      return { items: res.items };
    }

    return apiClient(`/products?sort=newest&pageSize=${limit}`, { signal });
  },
};
