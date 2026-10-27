import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ErrorBoundary } from './components/common/ErrorBoundary';

// Layouts
import { StorefrontLayout } from './layouts/StorefrontLayout';
import { AdminLayout } from './components/admin/AdminLayout';

// Storefront Pages
import { HomePage } from './pages/Home';
import { ShopPage } from './pages/Shop';
import { CollectionPage } from './pages/Collection';
import { ProductDetailsPage } from './pages/ProductDetails';
import { CartPage } from './pages/Cart';
import { LoginPage } from './pages/Login';
import { RegisterPage } from './pages/Register';
import { AccountPage } from './pages/Account';
import { NotFoundPage } from './pages/NotFound';

// Admin Pages
import { AdminOverviewPage } from './pages/admin/AdminOverview';
import { AdminProductsPage } from './pages/admin/AdminProducts';
import { AdminProductFormPage } from './pages/admin/AdminProductForm';
import { AdminCategoriesPage } from './pages/admin/AdminCategories';

// Route Guards
import { RequireAuth, RequireAdmin } from './routes/RouteGuards';

export function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Storefront Routes */}
              <Route element={<StorefrontLayout />}>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<ShopPage />} />
                <Route
                  path="/collections/men"
                  element={<CollectionPage collection="men" />}
                />
                <Route
                  path="/collections/women"
                  element={<CollectionPage collection="women" />}
                />
                <Route path="/products/:slug" element={<ProductDetailsPage />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Account / Auth Routes */}
                <Route path="/account/login" element={<LoginPage />} />
                <Route path="/account/register" element={<RegisterPage />} />
                <Route
                  path="/account"
                  element={
                    <RequireAuth>
                      <AccountPage />
                    </RequireAuth>
                  }
                />

                {/* Catch-all 404 for Public Storefront */}
                <Route path="/404" element={<NotFoundPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>

              {/* Admin Protected Routes */}
              <Route
                path="/admin"
                element={
                  <RequireAdmin>
                    <AdminLayout />
                  </RequireAdmin>
                }
              >
                <Route index element={<AdminOverviewPage />} />
                <Route path="products" element={<AdminProductsPage />} />
                <Route path="products/new" element={<AdminProductFormPage />} />
                <Route path="products/:id/edit" element={<AdminProductFormPage />} />
                <Route path="categories" element={<AdminCategoriesPage />} />
                <Route path="*" element={<Navigate to="/admin" replace />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </CartProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
export default App;
