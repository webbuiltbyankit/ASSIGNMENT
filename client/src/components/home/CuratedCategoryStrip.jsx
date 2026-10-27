import React from 'react';
import { Link } from 'react-router-dom';

const CURATED_CATEGORIES = [
  { slug: 'all', label: 'All Garments', link: '/shop' },
  { slug: 'shirts', label: 'Linen & Poplin Shirts', link: '/shop?category=shirts' },
  { slug: 't-shirts', label: 'Heavyweight T-Shirts', link: '/shop?category=t-shirts' },
  { slug: 'dresses', label: 'Linen Dresses', link: '/shop?category=dresses' },
  { slug: 'trousers', label: 'Pleated Trousers', link: '/shop?category=trousers' },
  { slug: 'denim', label: 'Selvedge Denim', link: '/shop?category=denim' },
  { slug: 'outerwear', label: 'Chore Jackets & Coats', link: '/shop?category=outerwear' },
];

export function CuratedCategoryStrip() {
  return (
    <nav className="forme-category-strip" aria-label="Curated Categories">
      <div className="container">
        <div className="forme-category-strip__inner">
          {CURATED_CATEGORIES.map((cat) => (
            <Link
              key={cat.slug}
              to={cat.link}
              className="forme-category-strip__item"
            >
              {cat.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
