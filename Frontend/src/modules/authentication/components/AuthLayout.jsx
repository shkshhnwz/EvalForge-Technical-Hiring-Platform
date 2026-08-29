import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import '../styles/authentication.css';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-layout-container">
      {/* Background Overlay */}
      <div className="auth-bg-overlay"></div>

      {/* Minimal Floating Header */}
      <header className="auth-header-pill auth-header-minimal">
        <div className="auth-header-logo">
          <Logo className="auth-logo-svg" width={28} height={28} />
          <span className="auth-brand-name">EvalForge</span>
        </div>
        
        <div className="auth-header-actions">
          <Link to="/" className="auth-back-link">
            <svg viewBox="0 0 24 24" width="16" height="16" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '6px', verticalAlign: 'middle'}}>
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back to Home
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="auth-main-content">
        <div className="auth-form-wrapper">
          {children}
        </div>
      </main>
    </div>
  );
};

export default AuthLayout;
