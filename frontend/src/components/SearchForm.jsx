import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SearchForm = ({ onSearch, minimal = false }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    from: '',
    to: '',
    travelDate: '',
    passengers: '1',
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.from || !formData.to) {
      alert('Please select departure and destination cities');
      return;
    }

    if (!formData.travelDate) {
      alert('Please select a travel date');
      return;
    }

    if (onSearch) {
      onSearch(formData);
    } else {
      navigate('/search-bus', {
        state: {
          from: formData.from,
          to: formData.to,
          travelDate: formData.travelDate,
          passengers: formData.passengers,
        },
      });
    }
  };

  // Popular routes for quick selection
  const popularRoutes = [
    { from: 'Delhi', to: 'Mumbai' },
    { from: 'Bangalore', to: 'Hyderabad' },
    { from: 'Chennai', to: 'Bangalore' },
    { from: 'Kolkata', to: 'Mumbai' },
  ];

  const handleQuickRoute = (route) => {
    setFormData({
      ...formData,
      from: route.from,
      to: route.to,
    });
  };

  if (minimal) {
    return (
      <form className="search-form search-form-minimal" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <input
              type="text"
              name="from"
              placeholder="From"
              value={formData.from}
              onChange={handleInputChange}
              className="form-input"
              list="cities-from"
            />
          </div>
          <div className="form-group">
            <input
              type="text"
              name="to"
              placeholder="To"
              value={formData.to}
              onChange={handleInputChange}
              className="form-input"
              list="cities-to"
            />
          </div>
          <div className="form-group">
            <input
              type="date"
              name="travelDate"
              value={formData.travelDate}
              onChange={handleInputChange}
              className="form-input"
            />
          </div>
          <button type="submit" className="btn btn-primary btn-search">
            🔍 Search
          </button>
        </div>
      </form>
    );
  }

  return (
    <form className="search-form" onSubmit={handleSubmit}>
      <h3>Book Your Bus Ticket</h3>
      
      <div className="quick-routes">
        <p className="quick-label">Popular routes:</p>
        <div className="route-buttons">
          {popularRoutes.map((route, idx) => (
            <button
              key={idx}
              type="button"
              className="quick-route-btn"
              onClick={() => handleQuickRoute(route)}
            >
              {route.from} → {route.to}
            </button>
          ))}
        </div>
      </div>

      <div className="form-grid">
        <div className="form-group">
          <label className="form-label">From</label>
          <input
            type="text"
            name="from"
            placeholder="Departure city"
            value={formData.from}
            onChange={handleInputChange}
            className="form-input"
            list="cities-from"
          />
          <datalist id="cities-from">
            <option value="Delhi" />
            <option value="Mumbai" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Chennai" />
            <option value="Kolkata" />
            <option value="Pune" />
            <option value="Jaipur" />
          </datalist>
        </div>

        <div className="form-group">
          <label className="form-label">To</label>
          <input
            type="text"
            name="to"
            placeholder="Destination city"
            value={formData.to}
            onChange={handleInputChange}
            className="form-input"
            list="cities-to"
          />
          <datalist id="cities-to">
            <option value="Delhi" />
            <option value="Mumbai" />
            <option value="Bangalore" />
            <option value="Hyderabad" />
            <option value="Chennai" />
            <option value="Kolkata" />
            <option value="Pune" />
            <option value="Goa" />
          </datalist>
        </div>

        <div className="form-group">
          <label className="form-label">Travel Date</label>
          <input
            type="date"
            name="travelDate"
            value={formData.travelDate}
            onChange={handleInputChange}
            className="form-input"
            min={new Date().toISOString().split('T')[0]}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Passengers</label>
          <select
            name="passengers"
            value={formData.passengers}
            onChange={handleInputChange}
            className="form-select"
          >
            {[1, 2, 3, 4, 5, 6].map((num) => (
              <option key={num} value={num}>
                {num} {num === 1 ? 'Passenger' : 'Passengers'}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button type="submit" className="btn btn-primary btn-lg">
        🔍 Search Buses
      </button>
    </form>
  );
};

export default SearchForm;
