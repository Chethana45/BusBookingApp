import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Home = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    travelDate: '',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (formData.from && formData.to && formData.travelDate) {
      navigate('/search-bus', {
        state: {
          from: formData.from,
          to: formData.to,
          travelDate: formData.travelDate,
        },
      });
    } else {
      alert('Please fill in all fields');
    }
  };

  return (
    <div className="home">
      <section className="hero">
        <div className="hero-overlay"></div>
        <div className="hero-content">
          <h1>Book Your Bus Tickets</h1>
          <p>Easy, affordable, and convenient bus booking</p>

          <form className="search-form" onSubmit={handleSearch}>
            <div className="form-group">
              <label htmlFor="from">From</label>
              <input
                type="text"
                id="from"
                name="from"
                placeholder="Departure city"
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
                value={formData.travelDate}
                onChange={handleInputChange}
                required
              />
            </div>

            <button type="submit" className="search-btn">
              Search Buses
            </button>
          </form>
        </div>
      </section>

      <section className="features">
        <div className="features-container">
          <div className="feature-card">
            <div className="feature-icon">✓</div>
            <h3>Best Prices</h3>
            <p>Compare and book buses at the best prices</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🛡️</div>
            <h3>Secure Booking</h3>
            <p>Your booking information is safe with us</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⏱️</div>
            <h3>Easy Cancellation</h3>
            <p>Cancel your booking anytime with ease</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🎧</div>
            <h3>24/7 Support</h3>
            <p>Our support team is always here to help</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
