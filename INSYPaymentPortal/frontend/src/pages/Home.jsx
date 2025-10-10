import React from "react";
import { useNavigate } from "react-router-dom";
import './Home.css';

export default function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    navigate("/login");
  };

  const handleRegister = () => {
    navigate("/register");
  };

  return (
    <div className="home-container">
      {/* Navigation Bar */}
      <nav className="home-nav">
        <div className="nav-content">
          <div className="nav-logo">
            <h1>GlobalTrust Bank</h1>
          </div>
          <div className="nav-actions">
            <button onClick={handleLogin} className="nav-login-btn">Sign In</button>
            <button onClick={handleRegister} className="nav-register-btn">Open Account</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              Secure International Payments
            </h1>
            <p className="hero-subtitle">
              Bank-level security meets global financial connectivity. Send payments worldwide with confidence.
            </p>
            <p className="hero-description">
              Our advanced SWIFT integration ensures your international transactions are processed securely, 
              efficiently, and with complete transparency. Experience banking redefined.
            </p>
            <div className="hero-buttons">
              <button onClick={handleLogin} className="btn-primary">
                Access Your Account
              </button>
              <button onClick={handleRegister} className="btn-secondary">
                Start Banking Today
              </button>
            </div>
          </div>
          <div className="hero-visual">
            <div className="visual-card">
              <div className="card-shape shape-1"></div>
              <div className="card-shape shape-2"></div>
              <div className="card-shape shape-3"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Why Choose GlobalTrust?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-globe"></div>
              </div>
              <h3>Global Network</h3>
              <p>Connect with over 200 countries through our secure SWIFT network integration</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-shield"></div>
              </div>
              <h3>Military-Grade Security</h3>
              <p>End-to-end encryption and multi-layered authentication protect every transaction</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-speed"></div>
              </div>
              <h3>Rapid Processing</h3>
              <p>Advanced verification systems ensure quick payment processing and settlement</p>
            </div>
            
            <div className="feature-card">
              <div className="feature-icon">
                <div className="icon-currency"></div>
              </div>
              <h3>Multi-Currency</h3>
              <p>Support for all major currencies with real-time exchange rate calculations</p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Banner */}
      <section className="security-banner">
        <div className="security-content">
          <div className="security-icon"></div>
          <div className="security-text">
            <h3>Your Security is Our Priority</h3>
            <p>All transactions are protected with bank-level 256-bit encryption and monitored 24/7</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <p>&copy; 2024 GlobalTrust Bank International. All rights reserved.</p>
          <div className="footer-links">
            <span>Compliant with international banking regulations</span>
          </div>
        </div>
      </footer>
    </div>
  );
}