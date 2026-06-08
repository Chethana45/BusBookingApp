import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getBusById } from '../data/buses';

const placeholderImage = "data:image/svg+xml;charset=UTF-8,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 800 450'%3E%3Crect width='800' height='450' fill='%23edf2f7'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Arial, sans-serif' font-size='32' fill='%23666'%3EBus%20image%20unavailable%3C/text%3E%3C/svg%3E";

const AMENITY_ICONS = {
  wifi: '📶',
  ac: '❄️',
  'charging port': '🔌',
  charging: '🔌',
  'charging points': '🔌',
  'usb charging': '🔌',
  'water bottle': '💧',
  water: '💧',
  'gps tracking': '📡',
  blanket: '🧣',
  blankets: '🧣',
  'reading light': '💡',
  'reclining seats': '🛋️',
  snacks: '🍪',
  breakfast: '🥐',
  dinner: '🍽️',
  pillow: '🛏️',
  'basic seating': '🪑',
};

const getAmenityIcon = (amenity) => {
  return AMENITY_ICONS[amenity.toLowerCase()] || '✨';
};

const BusDetails = () => {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [busDetails, setBusDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [imageSrc, setImageSrc] = useState(placeholderImage);

  useEffect(() => {
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      const id = busId ? parseInt(busId, 10) : 1;
      const data = getBusById(id);
      if (!data) {
        setError('Bus details not found. Please return to search and select another bus.');
        setBusDetails(null);
        setImageSrc(placeholderImage);
      } else {
        setBusDetails(data);
        setImageSrc(data.image || placeholderImage);
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
    <div className="bus-details-container bus-details-page">
      <div className="bus-details-wrapper">
        <div className="bus-image-section">
          <img
            src={imageSrc}
            alt={busDetails?.busName || 'Bus details'}
            className="bus-image"
            onError={() => setImageSrc(placeholderImage)}
          />
          <div className="bus-overlay-info">
            <div className="operator-badge">{busDetails.operator}</div>
          </div>
        </div>

        <div className="bus-details-content">
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

          <p className="bus-description">{busDetails.description}</p>

          <div className="detail-highlights">
            <div className="highlight-card">
              <span>Available seats</span>
              <strong>
                {busDetails.availableSeats} / {busDetails.totalSeats}
              </strong>
            </div>
            <div className="highlight-card">
              <span>Starting fare</span>
              <strong>₹{busDetails.fare}</strong>
            </div>
            <div className="highlight-card">
              <span>Journey duration</span>
              <strong>{busDetails.duration}</strong>
            </div>
          </div>

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

          <div className="amenities-section">
            <h2>Amenities & Facilities</h2>
            <div className="amenities-grid">
              {busDetails.amenities.map((amenity) => (
                <div key={amenity} className="amenity-card">
                  <div className="amenity-icon">{getAmenityIcon(amenity)}</div>
                  <div className="amenity-name">{amenity}</div>
                </div>
              ))}
            </div>
          </div>

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

          <div className="policy-section">
            <h2>Cancellation Policy</h2>
            <p className="policy-text">{busDetails.cancellationPolicy}</p>
          </div>
        </div>

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
                    style={{ width: `${(busDetails.availableSeats / busDetails.totalSeats) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="total-fare">
              <span>Total Fare (1 seat)</span>
              <span className="total-amount">₹{busDetails.fare}</span>
            </div>

            <button className="select-seats-btn" onClick={handleSelectSeats}>
              Select Seats
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
