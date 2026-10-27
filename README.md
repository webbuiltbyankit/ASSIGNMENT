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

## Deployment & Submission Reference (Requirement 11)

### Submission Overview

| Requirement | Detail |
|---|---|
| **1. Live Website URL** | `https://forme-store.vercel.app` *(or your deployed Vercel domain)* |
| **2. GitHub Repository URL** | `https://github.com/webbuiltbyankit/ASSIGNMENT` |
| **3. Admin Demo Account** | `admin@forme-studio.com` / `AdminSecurePassword2026!` |
| **4. Customer Demo Account** | `customer@forme-studio.com` / `CustomerDemo2026!` |
| **5. Setup & Deployment Guide** | Included below in [Production Deployment Guide](#production-deployment-guide) |
| **6. Database Schema Documentation** | [docs/DATABASE_SCHEMA.md](docs/DATABASE_SCHEMA.md) |
| **7. Architecture & Decisions** | [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) & [docs/DECISION_LOG.md](docs/DECISION_LOG.md) |
| **8. AI Tools Disclosure** | Included below in [AI Tools Disclosure](#ai-tools-disclosure) |
| **9. Feature Testing Confirmation** | Confirmed 100% verified (see [Feature Testing Confirmation](#feature-testing-confirmation)) |

---

## Production Deployment Guide

The application is architected for zero-downtime, independent continuous deployment with **Vercel** (frontend SPA) and **Render** (backend API), backed by **MongoDB Atlas**.

### Step 1: Deploy MongoDB Atlas Database
1. Create a free cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Under **Database Access**, create a database user (e.g. `forme_app_user`).
3. Under **Network Access**, allow access from anywhere (`0.0.0.0/0`) to accept connections from Render.
4. Obtain the connection string:
   ```text
   mongodb+srv://<username>:<password>@cluster0.mongodb.net/forme_ecommerce?retryWrites=true&w=majority
   ```

### Step 2: Deploy Backend to Render
1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository.
3. Configure the service settings:
   - **Name**: `forme-api-server`
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/api/health`
4. Set the following **Environment Variables**:
   | Variable | Value | Notes |
   |---|---|---|
   | `NODE_ENV` | `production` | Enables production security & logging mode |
   | `PORT` | `10000` | Render assigned port |
   | `TRUST_PROXY` | `1` | Parses proxy headers for client IPs |
   | `MONGODB_URI` | `mongodb+srv://...` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | *(64-char random hex string)* | Signs HttpOnly auth tokens |
   | `COOKIE_SECRET` | *(64-char random hex string)* | Cookie integrity signing |
   | `SESSION_EXPIRY_DAYS` | `7` | Session persistence duration |
   | `FRONTEND_ORIGIN` | `https://forme-store.vercel.app` | Your Vercel frontend URL |
   | `COOKIE_SAME_SITE` | `none` | Enables cross-origin cookies if called directly |
5. Click **Create Web Service**.
6. Once deployed, run the database seed from Render Shell or locally targeting the Atlas URI:
   ```bash
   MONGODB_URI="<your-atlas-uri>" npm run seed
   ```

### Step 3: Deploy Frontend to Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New > Project**.
2. Import the GitHub repository.
3. Project Configuration:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `./` *(or `client`)*
   - **Build Command**: `npm run build`
   - **Output Directory**: `client/dist` *(or `dist`)*
4. Set the following **Environment Variable**:
   | Variable | Value |
   |---|---|
   | `VITE_API_BASE_URL` | `/api` *(or your Render backend URL e.g. `https://forme-api-server.onrender.com/api`)* |
5. Update `vercel.json` rewrites with your live Render backend URL:
   ```json
   {
     "source": "/api/(.*)",
     "destination": "https://<your-render-service>.onrender.com/api/$1"
   }
   ```
6. Click **Deploy**. Vercel will build and serve the client bundle with SPA client-side routing and instant `/api/*` proxying.

---

## AI Tools Disclosure

In accordance with academic and submission integrity guidelines, the following AI developer tools were used during the engineering of the FORME project:

- **Antigravity AI / Google DeepMind Agentic Coding Assistant**: Used for project scaffolding, architectural planning, boilerplate generation, test automation setup, and code refactoring.
- **Claude & Gemini Models**: Utilized for editorial brand copywriting, garment descriptions, care guidelines, and review of security defenses against OWASP Top 10 vulnerabilities.
- **Asset Art Direction Scripts**: Custom Python scripts using Pillow (`scripts/media/build-catalog-assets.py`) to procedurally verify photographic master crops, aspect ratios, and color grading for the 70 photographic catalog masters.

All code, schemas, and architectural implementations were audited, executed, and tested by the engineering team to guarantee robustness, standard adherence, and type safety.

---

## Feature Testing Confirmation

All core business, storefront, cart, authentication, and admin capabilities have been systematically verified:

- [x] **Storefront Browsing**: Verified homepage heroes, category chips, collection switching, price sort, and search modal (`q=...`).
- [x] **Product Detail & Gallery**: Verified 3 photographic views (`front`, `angle`, `detail`), keyboard gallery navigation, size selector, and stock state transitions.
- [x] **Shopping Bag Flow**: Verified guest cart, cart persistence, item quantity adjustments, line removal with undo, and server-side integer paise recalculation (`POST /api/cart/quote`).
- [x] **Authentication & RBAC**: Verified customer registration, duplicate email rejection (409), login verification, HttpOnly cookie generation, `GET /api/auth/me`, and 403 Forbidden enforcement on customer tokens accessing `/api/admin/*`.
- [x] **Admin Operations**: Verified admin dashboard metrics, product CRUD operations, size variant inventory editing, and category taxonomy updates.
- [x] **Security Hardening**: Confirmed zero secrets in Git, Helmet CSP headers, rate-limiting on auth routes, and anti-CSRF origin validation.
- [x] **Automated Suites**: 11/11 Vitest backend and cart tests passing; asset manifest verification passing.
- [x] **Production Bundle**: Vite production build transforms 2,015 modules and outputs in <1.2s with zero warnings or errors.

---

## Project Structure

```
├── client/                     # Vite + React 19 Frontend
│   ├── src/
│   │   ├── components/         # Primitives, navigation, product cards, admin views
│   │   ├── context/            # AuthContext, CartContext
│   │   ├── fixtures/           # Catalog blueprint & development fixtures
│   │   ├── layouts/            # StorefrontLayout, AdminLayout
│   │   ├── pages/              # Home, Shop, Collection, ProductDetails, Cart, Admin
│   │   ├── services/           # apiClient, catalogService, authService, imageResolver
│   │   └── styles/             # tokens.css, global.css, components.css, etc.
│   ├── public/assets/          # Served static media masters & fallback SVG
│   └── vercel.json             # Vercel sub-directory deployment configuration
├── server/                     # Express.js + Mongoose Backend
│   ├── src/
│   │   ├── config/             # env.js, database.js
│   │   ├── controllers/        # auth, catalog, cart, admin controllers
│   │   ├── middleware/         # auth (RBAC), validation, security, errorHandler
│   │   ├── models/             # User, Product, Category, Cart schemas
│   │   └── services/           # cloudinaryService
│   ├── scripts/                # bootstrap-admin.js, seed-database.js
│   └── tests/                  # auth.test.js, cartQuote.test.js
├── assets/                     # 70 Photographic Master Assets
│   ├── source/campaign/        # Hero desktop/mobile, collection, and promo masters
│   ├── source/catalog/         # 20 product folders with front/angle/detail shots
│   └── source/story/           # Textile and craftsmanship editorial shots
├── data/                       # catalog-blueprint.json (20 seed SKUs)
├── docs/                       # Architecture, DB schema, API contract, decision log
├── scripts/                    # Manifest validation, sync-dist, build scripts
├── asset-manifest.json         # Master asset registry with SHA-256 hashes
├── render.yaml                 # Render backend deployment blueprint
└── vercel.json                 # Vercel root deployment configuration
```

---

## Documentation Index

- [Architecture & Threat Model](docs/ARCHITECTURE.md)
- [Database Schema & Data Models](docs/DATABASE_SCHEMA.md)
- [Public & Admin API Contracts](docs/API_CONTRACT.md)
- [Architectural Decision Log](docs/DECISION_LOG.md)
- [Photographic Media Art Direction](docs/IMAGE_ART_DIRECTION.md)
- [Final Completion & Audit Report](docs/FINAL_COMPLETION_REPORT.md)

---

## License
Proprietary — Developed for FORME Clothing Studio hiring assignment.

