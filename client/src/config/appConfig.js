/**
 * FORME Application Configuration
 */
export const appConfig = {
  brand: {
    name: 'FORME',
    tagline: 'Modern Everyday Wear',
    description: 'Considered silhouettes, premium natural fabrics, and everyday essentials crafted for longevity.',
  },
  currency: {
    code: 'INR',
    symbol: '₹',
    locale: 'en-IN',
  },
  api: {
    baseUrl: import.meta.env.VITE_API_BASE_URL || '/api',
    // In dev mode, can switch between fixture and live API mode via VITE_USE_FIXTURES
    useFixtures: import.meta.env.VITE_USE_FIXTURES === 'true' || false,
    timeoutMs: 8000,
  },
  pagination: {
    defaultPageSize: 12,
  },
};
