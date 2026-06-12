import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const popularRoutes = [
  { from: 'Delhi', to: 'Mumbai', demand: 'High demand' },
  { from: 'Bangalore', to: 'Hyderabad', demand: 'Popular route' },
  { from: 'Kolkata', to: 'Pune', demand: 'Best value' },
];

const featureItems = [
  { icon: '⚡', title: 'Smart Fare Alerts', description: 'Get instant updates on price drops and seat availability.' },
  { icon: '🧠', title: 'AI Route Planner', description: 'Choose the best bus and timing based on travel habits.' },
  { icon: '⭐', title: 'Premium Comfort', description: 'Book high-rated buses with extra amenities and legroom.' },
  { icon: '💳', title: 'Secure Checkout', description: 'Fast, safe payments with UPI, cards, and net banking.' },
];

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    travelDate: '',
  });
  const [searchError, setSearchError] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (!formData.travelDate) {
      setSearchError('Please select a valid future travel date.');
      return;
    }

    if (formData.travelDate < today) {
      setSearchError('Please select a valid future travel date.');
      return;
    }

    if (formData.from && formData.to && formData.travelDate) {
      setSearchError('');
      navigate('/search-bus', {
        state: {
          from: formData.from,
          to: formData.to,
          travelDate: formData.travelDate,
        },
      });
    } else {
      setSearchError('Please fill in all fields.');
    }
  };

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero hero-modern">
        <div className="hero-overlay"></div>
        <div className="hero-grid">
          <div className="hero-copy">
            <span className="eyebrow">AI-powered bus booking</span>
            <h1>Find the smartest bus routes in seconds.</h1>
            <p>Discover top-rated buses, real-time availability, and intelligent travel recommendations backed by bus booking AI.</p>
            <div className="hero-highlights">
              <div>
                <strong>95% uptime</strong>
                <p>Live availability</p>
              </div>
              <div>
                <strong>250+</strong>
                <p>Routes covered</p>
              </div>
              <div>
                <strong>4.8★</strong>
                <p>User trust score</p>
              </div>
            </div>
          </div>

          <div className="hero-card glass-card">
            <div className="hero-card-header">
              <div>
                <span className="badge badge-primary">Fast search</span>
                <h2>Book your next bus trip</h2>
              </div>
              <div className="banner-pill">AI assistant ready</div>
            </div>

            <form className="search-form" onSubmit={handleSearch}>
              <div className="form-group">
                <label htmlFor="from">From</label>
                <input
                  type="text"
                  id="from"
                  name="from"
                  className="input-field"
                  placeholder="City, station or route"
                  value={formData.from}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="to">To</label>
                <input
                  type="text"
                  id="to"
                  name="to"
                  className="input-field"
                  placeholder="Destination city"
                  value={formData.to}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="travelDate">Travel Date</label>
                <input
                  type="date"
                  id="travelDate"
                  name="travelDate"
                  className="input-field"
                  value={formData.travelDate}
                  onChange={handleInputChange}
                  min={today}
                  required
                />
              </div>
              {searchError && <div className="form-error">{searchError}</div>}
              <button type="submit" className="search-button">
                Search buses
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* Popular Routes Section */}
      <section className="routes-section">
        <div className="section">
          <h2 className="section-title-gradient">Popular routes</h2>
          <p className="section-subtitle-muted">Top journeys travellers book today</p>

          <div className="routes-grid">
            {popularRoutes.map((route) => (
              <div 
                key={`${route.from}-${route.to}`} 
                className="route-card"
                onClick={() => navigate('/search-bus', { state: { from: route.from, to: route.to } })}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="route-cities">{route.from} → {route.to}</div>
                    <div className="route-city">Comfortable buses with flexible cancellation</div>
                  </div>
                  <div className="route-arrow">→</div>
                </div>
                  <div className="route-demand" data-demand={route.demand}>{route.demand}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section">
          <h2 className="section-title-gradient">Why choose BusBook</h2>
          <p className="section-subtitle-muted">Modern travel experiences for every journey</p>

          <div className="features-grid">
            {featureItems.map((item) => (
              <div key={item.title} className="feature-card">
                <div className="feature-icon">{item.icon}</div>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI Assistant Section */}
      <section className="ai-assistant-section">
        <div className="ai-card">
          <div className="ai-icon">🤖</div>
          <h2>AI Travel Assistant</h2>
          <p>Personalized bus recommendations powered by AI. Get tailored route insights, seat suggestions, and travel reminders so you can focus on the journey, not the booking.</p>
          <button className="ai-button" onClick={() => navigate('/search-bus')}>
            Explore routes →
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
