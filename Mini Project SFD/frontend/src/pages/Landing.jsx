import { Link } from 'react-router-dom';
import { FiArrowRight, FiHeart, FiTruck, FiUsers, FiMapPin, FiShield, FiZap } from 'react-icons/fi';
import { GiWheat } from 'react-icons/gi';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-page">
      {/* Navbar */}
      <nav className="landing-nav">
        <div className="landing-nav-inner">
          <Link to="/" className="landing-logo">
            <GiWheat className="landing-logo-icon" />
            <span>Smart<span className="logo-green">Food</span></span>
          </Link>
          <div className="landing-nav-links">
            <a href="#how-it-works">How It Works</a>
            <a href="#features">Features</a>
            <Link to="/login" className="btn btn-secondary btn-sm">Log In</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Sign Up</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <div className="hero-bg-pattern" />
        <div className="hero-content animate-fade-in">
          <div className="hero-badge">🌱 Fighting Food Waste Together</div>
          <h1 className="hero-title">
            Reduce Food Waste,
            <br />
            <span className="hero-highlight">Feed Communities</span>
          </h1>
          <p className="hero-subtitle">
            Connect surplus food from donors with NGOs and volunteers who need it most.
            Our intelligent platform uses location matching and priority algorithms 
            to ensure food reaches people before it expires.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Get Started <FiArrowRight />
            </Link>
            <a href="#how-it-works" className="btn btn-secondary btn-lg">
              Learn More
            </a>
          </div>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">1,200+</span>
              <span className="hero-stat-label">Meals Saved</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">50+</span>
              <span className="hero-stat-label">Active Donors</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <span className="hero-stat-value">25+</span>
              <span className="hero-stat-label">NGO Partners</span>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="how-it-works" id="how-it-works">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Simple Process</span>
            <h2>How It Works</h2>
            <p>Three simple steps to make a difference</p>
          </div>
          <div className="steps-grid">
            <div className="step-card animate-fade-in">
              <div className="step-number">1</div>
              <div className="step-icon-wrap green">
                <FiHeart size={28} />
              </div>
              <h3>Donate Food</h3>
              <p>Restaurants, events, or individuals list surplus food with details, photos, and location.</p>
            </div>
            <div className="step-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="step-number">2</div>
              <div className="step-icon-wrap amber">
                <FiMapPin size={28} />
              </div>
              <h3>Smart Matching</h3>
              <p>Our algorithm matches donations with the nearest NGOs, prioritizing food expiring soon.</p>
            </div>
            <div className="step-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="step-number">3</div>
              <div className="step-icon-wrap blue">
                <FiTruck size={28} />
              </div>
              <h3>Deliver & Track</h3>
              <p>NGOs accept, pick up, and deliver food — with real-time status tracking throughout.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="features" id="features">
        <div className="section-container">
          <div className="section-header">
            <span className="section-badge">Powerful Features</span>
            <h2>Everything You Need</h2>
            <p>Built with cutting-edge technology for maximum impact</p>
          </div>
          <div className="features-grid">
            <div className="feature-card animate-slide-up stagger-1">
              <div className="feature-icon green"><FiMapPin size={24} /></div>
              <h4>Location Matching</h4>
              <p>GPS-based matching connects food with the nearest available NGOs automatically.</p>
            </div>
            <div className="feature-card animate-slide-up stagger-2">
              <div className="feature-icon amber"><FiZap size={24} /></div>
              <h4>Priority Algorithm</h4>
              <p>Smart prioritization ensures food expiring soonest gets distributed first.</p>
            </div>
            <div className="feature-card animate-slide-up stagger-3">
              <div className="feature-icon blue"><FiTruck size={24} /></div>
              <h4>Real-time Tracking</h4>
              <p>Track donation status from listing through pickup to final delivery.</p>
            </div>
            <div className="feature-card animate-slide-up stagger-4">
              <div className="feature-icon purple"><FiShield size={24} /></div>
              <h4>Role-Based Access</h4>
              <p>Secure dashboards for Donors, NGOs/Volunteers, and Administrators.</p>
            </div>
            <div className="feature-card animate-slide-up stagger-5">
              <div className="feature-icon green"><FiUsers size={24} /></div>
              <h4>Community Impact</h4>
              <p>Analytics dashboard showing meals saved, active participants, and community impact.</p>
            </div>
            <div className="feature-card animate-slide-up stagger-1">
              <div className="feature-icon amber"><FiHeart size={24} /></div>
              <h4>Notifications</h4>
              <p>Instant alerts when new donations are available or status changes occur.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <div className="section-container">
          <div className="cta-card animate-scale-in">
            <h2>Ready to Make a Difference?</h2>
            <p>Join our community of food donors and volunteers. Every meal saved counts.</p>
            <div className="cta-actions">
              <Link to="/register?role=donor" className="btn btn-primary btn-lg">
                I Want to Donate
              </Link>
              <Link to="/register?role=ngo" className="btn btn-secondary btn-lg" style={{ borderColor: 'white', color: 'white' }}>
                I'm an NGO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="section-container">
          <div className="footer-content">
            <div className="footer-brand">
              <GiWheat className="landing-logo-icon" />
              <span>Smart<span className="logo-green">Food</span> Redistribution</span>
            </div>
            <p className="footer-text">
              Reducing food waste, one donation at a time. 
              Built with ❤️ for communities everywhere.
            </p>
            <p className="footer-copyright">
              © {new Date().getFullYear()} Smart Food Redistribution System. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
