import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../css/LandingPage.css";

// Feature images (served from public/images)
import feature1 from "/images/plant4.jpg";
import feature2 from "/images/plant7.jpeg";
import feature3 from "/images/plant6.jpeg";

function LandingPage() {
  const [navOpen, setNavOpen] = useState(false);

  // Scroll reveal animations
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("visible");
        });
      },
      { threshold: 0.08 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  const closeNav = () => setNavOpen(false);

  return (
    <div className="landing-page">
      {/* Header / Navbar */}
      <header className="navbar">
        <div className="nav-left">
          <Link to="/" className="brand" onClick={closeNav}>Cardo</Link>
        </div>

        <button className="burger" aria-label="Toggle menu" onClick={() => setNavOpen((v) => !v)}>
          <span />
          <span />
          <span />
        </button>

        <nav className={`nav-right ${navOpen ? "open" : ""}`}>
          <a href="#features" onClick={closeNav}>Features</a>
          <a href="#how-it-works" onClick={closeNav}>How it works</a>
          <Link to="/login" className="login-link" onClick={closeNav}>Login</Link>
          <Link to="/register" className="btn small" onClick={closeNav}>Sign up</Link>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-inner">
          <div className="badge">Cardamom  Platform</div>
          <h1 className="hero-title">Grow smarter with Cardo</h1>
          <p className="hero-subtitle">
            Grading, Selling & Buying Cardamom — connect farmers and buyers with
            a smooth, transparent marketplace.
          </p>
          <div className="hero-buttons">
            <Link to="/login" className="btn primary">Get Started</Link>
            <a href="#features" className="btn ghost">Explore Features</a>
          </div>
        </div>
      </section>

      {/* Logos / Trust strip */}
      <section className="logos reveal" aria-label="Trusted by">
        <div className="logos-inner">
          <span className="logo">GreenFields</span>
          <span className="logo">SpiceHub</span>
          <span className="logo">AgriTrade</span>
          <span className="logo">FarmLink</span>
          <span className="logo">EcoSpice</span>
        </div>
      </section>

      {/* Key Features */}
      <section id="features" className="features reveal">
        <h2>Our Key Features</h2>
        <p className="section-sub">Designed to help you work faster and trade smarter.</p>
        <div className="feature-grid">
          <div className="feature-card">
            <img src={feature1} alt="Grading" />
            <h3>Smart Grading</h3>
            <p>AI-powered grading to ensure consistent, high-quality classification.</p>
          </div>
          <div className="feature-card">
            <img src={feature2} alt="E-commerce" />
            <h3>AgriCare E-Commerce</h3>
            <p>Shop fertilizers, medicines, tonics, and cardamom-related products.</p>
          </div>
          <div className="feature-card">
            <img src={feature3} alt="Marketplace" />
            <h3>Marketplace</h3>
            <p>Connect farmers with buyers directly for better prices and fair trade.</p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="how-it-works reveal">
        <h2>How it works</h2>
        <div className="steps">
          <div className="step">
            <div className="step-icon">🌱</div>
            <h4>Create your account</h4>
            <p>Sign up in under a minute and set your preferences.</p>
          </div>
          <div className="step">
            <div className="step-icon">📸</div>
            <h4>Grade your batch</h4>
            <p>Upload details to get AI-assisted grading and pricing hints.</p>
          </div>
          <div className="step">
            <div className="step-icon">🤝</div>
            <h4>Match & trade</h4>
            <p>Connect with buyers or suppliers and finalize deals securely.</p>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="stats reveal">
        <div className="stat"><span className="num">5k+</span><span className="label">Batches graded</span></div>
        <div className="stat"><span className="num">1.2k</span><span className="label">Active farmers</span></div>
        <div className="stat"><span className="num">800+</span><span className="label">Verified buyers</span></div>
        <div className="stat"><span className="num">98%</span><span className="label">On-time trades</span></div>
      </section>

      {/* AgriCare Section */}
      <section className="agri-care reveal">
        <h2>AgriCare for Farmers</h2>
        <p>One-stop solution for all cardamom-related needs.</p>
        <ul className="agri-list">
          <li>🌱 Fertilizers & Nutrients</li>
          <li>💊 Medicines & Tonics for Plantation</li>
          <li>🛡️ Organic & Chemical Pesticides</li>
          <li>📦 Farm Equipment & Tools</li>
        </ul>
      </section>

      {/* Testimonials */}
      <section className="testimonials reveal">
        <h2>What users say</h2>
        <div className="t-grid">
          <div className="t-card">
            <div className="avatar">VK</div>
            <p className="quote">“The grading insights improved my pricing and helped me sell faster.”</p>
            <div className="author">Vikram, Farmer</div>
          </div>
          <div className="t-card">
            <div className="avatar">AR</div>
            <p className="quote">“Smooth marketplace experience and verified buyers I can trust.”</p>
            <div className="author">Asha, Seller</div>
          </div>
          <div className="t-card">
            <div className="avatar">MB</div>
            <p className="quote">“AgriCare made it easy to get quality supplies at fair prices.”</p>
            <div className="author">Mohit, Grower</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="faq reveal">
        <h2>FAQs</h2>
        <div className="faq-list">
          <details>
            <summary>Is Cardo free to start?</summary>
            <p>Yes. You can create an account and explore features for free.</p>
          </details>
          <details>
            <summary>How does AI grading work?</summary>
            <p>We use a quality model and data you provide to estimate grade and price ranges.</p>
          </details>
          <details>
            <summary>Are payments secure?</summary>
            <p>All transactions are protected with industry-standard security and verification checks.</p>
          </details>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="cta-banner reveal">
        <h3>Ready to trade smarter?</h3>
        <div className="cta-actions">
          <Link to="/register" className="btn primary large">Create free account</Link>
          <Link to="/login" className="btn ghost large">Sign in</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2025 Cardo Project | All Rights Reserved</p>
        <div className="footer-links">
          <Link to="/about">About</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/contact">Contact</Link>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;