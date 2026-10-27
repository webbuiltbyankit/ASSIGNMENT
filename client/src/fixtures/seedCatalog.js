import blueprint from './catalogBlueprint.json';

export const fixturesCategories = blueprint.categories;

export const fixturesCatalog = blueprint.products.map((p) => {
  const totalStock = p.sizes.reduce((sum, s) => sum + s.stock, 0);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    collection: p.collection,
    category: p.category,
    price: p.price,
    pricePaise: p.price * 100,
    featured: Boolean(p.featured),
    active: Boolean(p.active),
    color: p.color,
    fabric: p.fabric,
    description: p.description,
    care: p.care,
    sizes: p.sizes,
    totalStock,
    inStock: totalStock > 0,
    // Provide primary cover image and gallery
    coverImage: p.imageShotPlan.front.assetId,
    images: [
      {
        assetId: p.imageShotPlan.front.assetId,
        role: 'primary',
        view: 'front',
        alt: `${p.name} in ${p.color} - Frontal View`,
      },
      {
        assetId: p.imageShotPlan.angle.assetId,
        role: 'gallery',
        view: 'angle',
        alt: `${p.name} in ${p.color} - Side / Movement View`,
      },
      {
        assetId: p.imageShotPlan.detail.assetId,
        role: 'gallery',
        view: 'detail',
        alt: `${p.name} - ${p.fabric} Detail & Stitching`,
      },
    ],
    createdAt: new Date('2026-01-15T08:00:00Z').toISOString(),
  };
});

/**
 * Filter, sort, and paginate development fixtures
 */
export function queryFixturesCatalog({
  collection,
  category,
  q,
  sort = 'featured',
  inStock,
  size,
  page = 1,
  pageSize = 12,
} = {}) {
  let results = [...fixturesCatalog].filter((p) => p.active);

  if (collection && collection !== 'all') {
    results = results.filter(
      (p) => p.collection.toLowerCase() === collection.toLowerCase()
    );
  }

  if (category && category !== 'all') {
    results = results.filter(
      (p) => p.category.toLowerCase() === category.toLowerCase()
    );
  }

  if (inStock === true || inStock === 'true') {
    results = results.filter((p) => p.inStock);
  }

  if (size) {
    results = results.filter((p) =>
      p.sizes.some((s) => s.size.toLowerCase() === size.toLowerCase() && s.stock > 0)
    );
  }

  if (q && typeof q === 'string') {
    const term = q.trim().toLowerCase();
    if (term.length > 0) {
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(term) ||
          p.description.toLowerCase().includes(term) ||
          p.color.toLowerCase().includes(term) ||
          p.fabric.toLowerCase().includes(term)
      );
    }
  }

  // Sorting
  switch (sort) {
    case 'newest':
      results.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      break;
    case 'priceAsc':
      results.sort((a, b) => a.price - b.price);
      break;
    case 'priceDesc':
      results.sort((a, b) => b.price - a.price);
      break;
    case 'featured':
    default:
      results.sort((a, b) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0));
      break;
  }

  const total = results.length;
  const numPage = Math.max(1, parseInt(page, 10) || 1);
  const numPageSize = Math.max(1, parseInt(pageSize, 10) || 12);
  const start = (numPage - 1) * numPageSize;
  const items = results.slice(start, start + numPageSize);

  return {
    items,
    total,
    page: numPage,
    pageSize: numPageSize,
    totalPages: Math.ceil(total / numPageSize) || 1,
    filters: {
      collection: collection || null,
      category: category || null,
      q: q || null,
      sort,
    },
  };
}

export function getFixtureProductBySlug(slug) {
  return fixturesCatalog.find((p) => p.slug === slug) || null;
}

export function getFixtureProductById(id) {
  return fixturesCatalog.find((p) => p.id === id) || null;
}
