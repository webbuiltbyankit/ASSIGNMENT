# FORME — Architectural Decision Log

## Decision 001: Monorepo Clean Separation
- **Date**: 2026-10-25
- **Status**: Accepted
- **Context**: Project requires Vite+React client and Express+Node.js server with MongoDB, plus media pipelines and shared contracts.
- **Decision**: Scaffold `/client` for frontend, `/server` for API backend, `/assets` for media masters, `/scripts` for media/db automation, and `/docs` for specifications. Root `package.json` coordinates running dev, lint, and test scripts across both workspaces.
- **Consequences**: Clear separation of concerns, zero credential leakage into browser client, shared fixtures and contracts during Phase 1-3 development.

## Decision 002: Currency & Pricing Storage
- **Date**: 2026-10-25
- **Status**: Accepted
- **Context**: Need precise pricing in Indian Rupees (INR ₹) without floating point math issues.
- **Decision**: Store all prices internally in integer paise (1 INR = 100 paise) in backend models and cart validation. Format consistently as ₹{amount} on the client display boundary via a dedicated `formatCurrency` helper. Never parse formatted strings back to numbers on server.

## Decision 003: Design System Tokens & Styling Strategy
- **Date**: 2026-10-25
- **Status**: Accepted
- **Context**: User requirements specify custom Vanilla CSS, avoiding generic Tailwind templates and ensuring high-end editorial aesthetics (warm ivory #F5F2EC, sand #D8CBB8, charcoal #252525, taupe #8A7968).
- **Decision**: Implement a CSS custom property token system (`tokens.css`, `global.css`, `components.css`) respecting WCAG AA contrast, responsive typography clamp, and `prefers-reduced-motion`.

## Decision 004: Manifest-Driven Media Pipeline
- **Date**: 2026-10-25
- **Status**: Accepted
- **Context**: Image rules require real saved photo files, 70 masters target, SHA-256 hashes, provenance records, and Cloudinary hosting when configured.
- **Decision**: Create `asset-manifest.json` with deterministic schema. Frontend uses a unified `resolveImageUrl` helper that resolves local assets in development and Cloudinary HTTPS URLs when deployed, with an SVG fallback that never fails.
