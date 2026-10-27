# FORME — Full-Stack Clothing E-Commerce

> **Modern Everyday Wear** — A full-stack clothing store application built with React 19, Node.js/Express, MongoDB, and Cloudinary. Designed with restrained editorial aesthetics, warm neutral palettes, and an authoritative server-side inventory and pricing engine.

---

## Key Features

### 1. Customer Storefront
- **Editorial Brand Aesthetic**: Built with custom Vanilla CSS design tokens (warm ivory `#F5F2EC`, sand `#D8CBB8`, charcoal `#252525`, taupe `#8A7968`).
- **Responsive Navigation**: Desktop navigation, search modal, account action, live cart badge, and an accessible mobile drawer with focus management.
- **Dynamic Homepage**: Art-directed 16:9 desktop & 3:4 mobile heroes, collection panels, curated category strip, featured merchandise rows, and brand story features.
- **Catalog Browsing**: Real-time filtering by collection, category, and in-stock status; server-side product search (`q=...`); sort modes (`featured`, `newest`, `priceAsc`, `priceDesc`); URL-synchronized state; and responsive pagination.
- **Three-View Product Gallery**: Full interactive gallery with frontal, side drape, and macro fabric detail shots, accessible keyboard navigation, and error fallbacks.
- **Stock-Aware Purchase**: S, M, L, XL size selection, dynamic availability indicators, and bounded quantity controls.

### 2. Customer Accounts & Security
- **Email/Password Authentication**: BCrypt hashing (10 rounds), Zod input hygiene, and normalized email indexing.
- **Cookie-Based Sessions**: Signed JWT stored in `HttpOnly`, `SameSite=Lax/Strict` cookies. No bearer tokens in `localStorage`.
- **Role-Based Access Control**: Server-enforced separation between `customer` and `admin` roles.
- **Threat Defenses**: NoSQL injection defense, Helmet CSP, CORS allowlisting, anti-CSRF origin checks, and rate limiting on auth endpoints.

### 3. Shopping Bag & Authoritative Quotation
- **Authoritative Calculations**: Server recalculates actual unit prices and subtotals in integer paise. Client prices are completely ignored.
- **Variant Validation**: Detects archived products, removed sizes, and out-of-stock variants.
- **Cross-Session Cart**: Seamless guest localStorage cart with server-side synchronization upon login.

### 4. Admin Operations Dashboard (`/admin`)
- **Restricted Access**: Role-gated operations console (`RequireAdmin` route guard & backend RBAC middleware).
- **Inventory Metrics**: Real-time counts for active listings, total stock units, and media completeness.
- **Product Management**: Full CRUD capabilities with size variant inventory editor, primary photo designation, gallery reordering, and soft-delete/archival.
- **Category Taxonomy**: Management of clothing classifications and display ordering.

### 5. Verified Media Pipeline
- **70 Photographic Master Assets**:
  - 60 Catalog masters (20 SKUs × 3 views: front, angle, detail).
  - 6 Campaign & collection editorial masters.
  - 4 Brand craftsmanship and textile story masters.
- **Asset Manifest (`asset-manifest.json`)**: Every asset is registered with its file path, SHA-256 hash, dimensions, and provenance.
- **Resilient Fallback**: Branded SVG fallback (`fallback-image.svg`) prevents broken image icons.

---

## Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 6, React Router 7, Lucide Icons, Vanilla CSS |
| **Backend** | Node.js, Express.js 4, Mongoose 8 |
| **Database** | MongoDB (Local or Atlas) |
| **Media Hosting** | Cloudinary SDK with Local Master Manifest Fallback |
| **Security** | BCrypt.js, JsonWebToken, Helmet, Express-Rate-Limit, Zod |
| **Testing** | Vitest, Supertest |

---

## Local Setup & Quick Start

### Prerequisites
- Node.js (v18+)
- MongoDB running locally on port 27017 or a MongoDB Atlas URI

### 1. Clone & Configure Environment
```bash
git clone <repository-url>
cd "assignment ecommerce"

# Copy environment template
cp .env.example server/.env
```

### 2. Install Dependencies
```bash
# Install root, client, and server dependencies
npm --prefix client install
npm --prefix server install
```

### 3. Bootstrap Identities & Seed Catalog
```bash
# Create initial admin & demo customer accounts
npm run seed:admin

# Seed 20 clothing products and 6 categories
npm run seed:db
```

### 4. Start Development Servers
In two separate terminal tabs:

**Tab 1: Backend API**
```bash
npm run dev:server
# Server runs on http://localhost:5001 (Health check: http://localhost:5001/api/health)
```

**Tab 2: Frontend Client**
```bash
npm run dev:client
# Frontend runs on http://localhost:5173
```

---

## Demo Credentials

| Role | Email | Password |
|---|---|---|
| **Store Administrator** | `admin@forme-studio.com` | `AdminSecurePassword2026!` |
| **Customer Shopper** | `customer@forme-studio.com` | `CustomerDemo2026!` |

---

## Automated Test Suites

```bash
# Run backend auth, RBAC, and cart quote tests
npm test

# Run asset manifest integrity check
npm run media:validate

# Run frontend build test
npm run build
```

---

## Project Structure

```
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/         # Common primitives, product cards, nav, admin components
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── fixtures/           # Catalog blueprint & development fixtures
│   │   ├── layouts/            # StorefrontLayout, AdminLayout
│   │   ├── pages/              # Home, Shop, Collection, ProductDetails, Cart, Admin
│   │   ├── services/           # apiClient, catalogService, authService, imageResolver
│   │   └── styles/             # tokens.css, global.css, components.css, etc.
│   └── public/assets/          # Served static media masters & fallback
├── server/                     # Express.js + Mongoose Backend
│   ├── src/
│   │   ├── config/             # env.js, database.js
│   │   ├── controllers/        # auth, catalog, cart, admin controllers
│   │   ├── middleware/         # auth (RBAC), validation, security, errorHandler
│   │   ├── models/             # User, Product, Category, Cart schemas
│   │   └── services/           # cloudinaryService
│   ├── scripts/                # bootstrap-admin.js, seed-database.js
│   └── tests/                  # auth.test.js, cartQuote.test.js
├── assets/                     # Master photographic source files
│   ├── source/campaign/        # Hero, collection, and promo masters
│   ├── source/catalog/         # 20 product folders with front/angle/detail shots
│   └── source/story/           # Craftsmanship and textile detail shots
├── data/                       # catalog-blueprint.json (20 seed SKUs)
├── docs/                       # ARCHITECTURE.md, API_CONTRACT.md, IMAGE_ART_DIRECTION.md
├── scripts/                    # validate-manifest.mjs, publish-manifest.mjs, build-catalog-assets.py
├── asset-manifest.json         # Master asset registry with SHA-256 hashes
├── render.yaml                 # Render backend deployment blueprint
└── vercel.json                 # Vercel frontend deployment configuration
```

---

## License
Proprietary — Developed for FORME Clothing Studio hiring assignment.
