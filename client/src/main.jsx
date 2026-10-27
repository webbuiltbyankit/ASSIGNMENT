import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Global & Component Styles
import './styles/tokens.css';
import './styles/global.css';
import './styles/components.css';
import './styles/navigation.css';
import './styles/home.css';
import './styles/shop.css';
import './styles/product.css';
import './styles/product-detail.css';
import './styles/cart.css';
import './styles/form.css';
import './styles/admin.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
