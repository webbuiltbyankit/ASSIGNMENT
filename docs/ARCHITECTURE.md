# FORME Clothing E-Commerce — Technical Architecture & Security Design

## 1. System Architecture Overview

FORME is built on a clean decoupled architecture:

```
┌──────────────────────────────────────────────────────────────────┐
│                      Client Layer (React 19 + Vite)              │
│  - Editorial Storefront (Home, Shop, Collections, Details, Cart) │
│  - Customer Accounts (Register, Login, Profile)                  │
│  - Protected Admin Operations Console (/admin/*)                 │
│  - Design System: Vanilla CSS Tokens (Ivory, Sand, Charcoal)     │
│  - Unified Image Resolver (Local Masters ↔ Cloudinary CDN)       │
└─────────────────────────────────┬────────────────────────────────┘
                                  │ Same-Origin Proxy / Rewrite (/api/*)
                                  ▼
┌──────────────────────────────────────────────────────────────────┐
│                     API Layer (Node.js + Express)                │
│  - Helmet Security Headers & Content Security Policy             │
│  - Rate Limiting (express-rate-limit) & CSRF Origin Checks       │
│  - HttpOnly Cookie Session Middleware (JWT)                      │
│  - Strict RBAC: Customer vs. Admin Authorization                 │
│  - Authoritative Pricing & Inventory Quotation (Integer Paise)   │
│  - Centralized Error Envelope & Credential Redaction Logger      │
└──────────────────┬───────────────────────────────┬───────────────┘
                   │ Mongoose ODM                  │ Cloudinary SDK
                   ▼                               ▼
      ┌─────────────────────────┐     ┌─────────────────────────┐
      │   MongoDB Persistent    │     │   Cloudinary Media      │
      │   - Users & Roles       │     │   - Catalog Originals   │
      │   - Products & Sizes    │     │   - Campaign & Story    │
      │   - Categories Taxonomy │     │   - f_auto, q_auto      │
      │   - Customer Carts      │     └─────────────────────────┘
      └─────────────────────────┘
```

---

## 2. Security & Threat Defense

### Authentication & Sessions
- **Session Mechanism**: Signed JSON Web Tokens (JWT) stored exclusively in `HttpOnly`, `SameSite=Lax` (or `Strict`), `Secure` cookies (`forme_session`).
- **No Token Leakage**: Bearer tokens are NEVER persisted in `localStorage` or `sessionStorage`.
- **Credential Storage**: Passwords are salted and hashed using `bcrypt` (10 rounds). Passwords and hashes are excluded by default in Mongoose schemas (`select: false`) and filtered via `toPublicJSON()`.

### Role-Based Access Control (RBAC)
- All public registrations default strictly to `role: "customer"`.
- Role tampering payloads (`{ "role": "admin" }`) during registration are ignored on the server.
- All `/api/admin/*` endpoints strictly enforce `requireAuth` and `requireRole('admin')`. Customer tokens attempting admin routes receive `403 Forbidden`.
- Administrative identities are created solely via a secure server-side CLI (`npm run seed:admin`).

### Input Hygiene & Injection Defense
- Request bodies are validated using strict Zod schemas with length constraints.
- Payload validator recursively inspects and rejects any object properties starting with `$` to defend against NoSQL injection (e.g. `{"email": {"$ne": null}}`).
- User search queries are escaped using regex metacharacter filtering.

### Rate Limiting & Denial of Service Protection
- Authentication routes (`/api/auth/login` and `/api/auth/register`) are rate-limited to 20 attempts per 15 minutes per IP.
- Payloads are restricted to a 1MB ceiling.
- Express runs with `trust proxy: 1` to correctly parse reverse-proxy client IPs.

### Structured Audit Logging & Redaction
- All security events (login success, bad password, duplicate registration, RBAC denial) are emitted in structured JSON.
- A recursive redaction filter (`logger.js`) ensures passwords, tokens, cookies, secrets, and raw request bodies NEVER appear in application logs.

---

## 3. Media Pipeline Architecture

### Manifest-Driven Architecture (`asset-manifest.json`)
The application requires 70 photographic master assets:
- **60 Catalog Masters**: 20 SKUs × 3 views (`front`, `angle`, `detail`).
- **6 Campaign & Collection Masters**: Hero Desktop (16:9), Hero Mobile (3:4), Men's Collection (3:4), Women's Collection (3:4), Seasonal Edit (3:4), Everyday Wardrobe (3:4).
- **4 Brand Story Masters**: Textile Weave (4:3), Tailoring Craft (4:3), Folded Wardrobe (4:3), On-Body Editorial (3:4).

### Key Pipeline Features
1. **Zero Fake Images**: All 70 assets are real files on disk with SHA-256 hashes and dimension verification.
2. **Unified Image Resolver**: `resolveImageUrl()` transparently resolves local files in development and Cloudinary HTTPS URLs when deployed.
3. **Resilient Fallback**: Checked-in neutral SVG fallback (`/fallback-image.svg`) prevents broken image icons.

---

## 4. Deployment Topology

### Production Blueprint
1. **Frontend**: Vercel (or Netlify)
   - Configuration: `vercel.json`
   - Single-Page Application (SPA) catch-all rewrite to `/index.html`.
   - `/api/*` reverse proxy to Render backend ensuring first-party cookie context.
2. **Backend**: Render Web Service
   - Blueprint: `render.yaml`
   - Node.js runtime, environment variables configured via dashboard.
   - Health check: `/api/health`.
3. **Database**: MongoDB Atlas
   - MONGODB_URI connection string with TLS and retryWrites.
