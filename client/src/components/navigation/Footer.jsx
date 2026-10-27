import React from 'react';
import { Link } from 'react-router-dom';

export function Footer() {
  return (
    <footer className="forme-footer" role="contentinfo">
      <div className="container">
        <div className="forme-footer__grid">
          {/* Brand Info */}
          <div>
            <h3 className="forme-footer__brand-title">FORME</h3>
            <p className="forme-footer__tagline">
              Modern everyday clothing designed with quiet confidence, natural textiles, and purposeful restraint.
            </p>
            <p style={{ fontSize: 'var(--text-xs)', color: '#9E9589' }}>
              All prices shown in Indian Rupees (INR ₹).
            </p>
          </div>

          {/* Collections */}
          <div>
            <h4 className="forme-footer__col-heading">Collections</h4>
            <ul className="forme-footer__list">
              <li><Link to="/shop">Shop All</Link></li>
              <li><Link to="/collections/men">Men's Apparel</Link></li>
              <li><Link to="/collections/women">Women's Apparel</Link></li>
              <li><Link to="/shop?category=shirts">Linen & Shirts</Link></li>
              <li><Link to="/shop?category=denim">Selvedge Denim</Link></li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="forme-footer__col-heading">Customer Care</h4>
            <ul className="forme-footer__list">
              <li><Link to="/cart">Shopping Bag</Link></li>
              <li><Link to="/account">Order Assistance</Link></li>
              <li><span style={{ color: '#8C847A', fontSize: 'var(--text-xs)' }}>Garment Care Guides</span></li>
              <li><span style={{ color: '#8C847A', fontSize: 'var(--text-xs)' }}>Size & Silhouette Guide</span></li>
              <li><span style={{ color: '#8C847A', fontSize: 'var(--text-xs)' }}>Delivery Across India</span></li>
            </ul>
          </div>

          {/* Studio Contact */}
          <div>
            <h4 className="forme-footer__col-heading">Studio & Inquiry</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', color: '#C7BFB5', fontSize: 'var(--text-sm)' }}>
              <p>Email: <a href="mailto:care@forme-studio.com" style={{ textDecoration: 'underline' }}>care@forme-studio.com</a></p>
              <p>Inquiries: Mon – Fri, 10:00 – 18:00 IST</p>
              <p style={{ fontSize: 'var(--text-xs)', color: '#8C847A', marginTop: 'var(--space-xs)' }}>
                Sample studio showroom. Online catalog orders processed digitally.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="forme-footer__bottom">
          <p>© {new Date().getFullYear()} FORME Clothing Studio. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 'var(--space-lg)' }}>
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Accessibility</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
