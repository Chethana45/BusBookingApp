import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBusById } from '../data/buses';

const BusDetails = () => {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [selectedSeats, setSelectedSeats] = useState(0);
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      const id = busId ? parseInt(busId, 10) : 1;
      const data = getBusById(id);
      if (!data) {
        setError('Bus details not found. Please return to search and select another bus.');
        setBusDetails(null);
      } else {
        setBusDetails(data);
      }
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [busId]);

  const handleSelectSeats = () => {
    if (busDetails) {
      navigate(`/seat-selection/${busDetails.id}`);
    }
  };

  if (loading) {
    return (
      <div className="search-results-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading bus details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="search-results-container">
        <div className="error-message">
          {error}
          <div style={{ marginTop: '1rem' }}>
            <button className="search-buses-btn" onClick={() => navigate('/search-bus')}>
              🔍 Search Buses
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bus-details-container">
      <div className="bus-details-wrapper">
        {/* Bus Image Section */}
        <div className="bus-image-section">
          <img src={busDetails.image} alt={busDetails.busName} className="bus-image" />
          <div className="bus-overlay-info">
            <div className="operator-badge">{busDetails.operator}</div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bus-details-content">
          {/* Header Section */}
          <div className="details-header">
            <div>
              <h1 className="bus-name">{busDetails.busName}</h1>
              <p className="bus-type">{busDetails.busType}</p>
            </div>
            <div className="rating-section">
              <div className="rating-badge">
                <span className="rating-star">⭐</span>
                <span className="rating-value">{busDetails.rating}</span>
              </div>
              <span className="reviews-count">({busDetails.reviews} reviews)</span>
            </div>
          </div>

          {/* Description */}
          <p className="bus-description">{busDetails.description}</p>

          {/* Journey Details */}
          <div className="journey-details-section">
            <h2>Journey Details</h2>
            <div className="journey-grid">
              <div className="journey-card">
                <div className="journey-time">{busDetails.departureTime}</div>
                <div className="journey-label">Departure</div>
                <div className="journey-place">{busDetails.boardingPoint.name}</div>
              </div>
              <div className="journey-duration">
                <div className="duration-line"></div>
                <div className="duration-text">{busDetails.duration}</div>
              </div>
              <div className="journey-card">
                <div className="journey-time">{busDetails.arrivalTime}</div>
                <div className="journey-label">Arrival</div>
                <div className="journey-place">{busDetails.droppingPoint.name}</div>
              </div>
            </div>
          </div>

          {/* Boarding and Dropping Points */}
          <div className="boarding-dropping-section">
            <div className="point-card boarding-point">
              <h3>🚀 Boarding Point</h3>
              <p className="point-name">{busDetails.boardingPoint.name}</p>
              <p className="point-address">{busDetails.boardingPoint.address}</p>
              <p className="point-time">Pick-up: {busDetails.boardingPoint.time}</p>
            </div>
            <div className="point-card dropping-point">
              <h3>🏁 Dropping Point</h3>
              <p className="point-name">{busDetails.droppingPoint.name}</p>
              <p className="point-address">{busDetails.droppingPoint.address}</p>
              <p className="point-time">Drop-off: {busDetails.droppingPoint.time}</p>
            </div>
          </div>

          {/* Amenities Section */}
          <div className="amenities-section">
            <h2>Amenities & Facilities</h2>
            <div className="amenities-grid">
              {busDetails.amenities.map((amenity) => (
                <div key={amenity.id} className="amenity-card">
                  <div className="amenity-icon">{amenity.icon}</div>
                  <div className="amenity-name">{amenity.name}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Route Stops */}
          <div className="route-stops-section">
            <h2>Route Stops</h2>
            <div className="stops-timeline">
              {busDetails.stops.map((stop, index) => (
                <div key={`${stop.name}-${index}`} className={`stop-item ${stop.type}`}>
                  <div className="stop-marker"></div>
                  <div className="stop-content">
                    <div className="stop-time">{stop.time}</div>
                    <div className="stop-name">{stop.name}</div>
                  </div>
                  {index < busDetails.stops.length - 1 && <div className="stop-connector"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="policy-section">
            <h2>Cancellation Policy</h2>
            <p className="policy-text">{busDetails.cancellationPolicy}</p>
          </div>
        </div>

        {/* Sidebar - Booking Summary */}
        <div className="booking-sidebar">
          <div className="fare-card">
            <div className="fare-header">
              <h3>Fare Summary</h3>
            </div>

            <div className="fare-breakdown">
              <div className="fare-item">
                <span>Seats Available</span>
                <span className="fare-value">{busDetails.availableSeats} / {busDetails.totalSeats}</span>
              </div>
              <div className="fare-item">
                <span>Base Fare</span>
                <span className="fare-value">₹{busDetails.fare}</span>
              </div>
              <div className="seat-availability">
                <div className="availability-bar">
                  <div
                    className="availability-fill"
                    style={{
                      width: `${(busDetails.availableSeats / busDetails.totalSeats) * 100}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="total-fare">
              <span>Total Fare (1 seat)</span>
              <span className="total-amount">₹{busDetails.fare}</span>
            </div>

            <button className="book-now-btn" onClick={handleSelectSeats}>
              Continue to Seats
            </button>

            <div className="payment-info">
              <p>✓ Secure payment gateway</p>
              <p>✓ Instant confirmation</p>
              <p>✓ 24/7 Customer support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BusDetails;
