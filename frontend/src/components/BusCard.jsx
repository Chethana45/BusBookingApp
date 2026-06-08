import React from 'react';
import { useNavigate } from 'react-router-dom';

const BusCard = ({ bus, onViewSeats }) => {
  const navigate = useNavigate();

  const handleViewSeats = () => {
    if (onViewSeats) {
      onViewSeats();
    } else {
      navigate(`/bus-details/${bus.id}`);
    }
  };

  return (
    <div className="bus-card">
      <div className="bus-card-header">
        <h3 className="bus-name">{bus.busName}</h3>
        <div className="bus-rating">
          <span className="star">⭐</span>
          <span>{bus.rating}</span>
        </div>
      </div>

      <div className="bus-type">
        <span className="badge">{bus.busType}</span>
      </div>

      <div className="bus-times">
        <div className="time-section">
          <div className="time">{bus.departureTime}</div>
          <div className="label">Departure</div>
        </div>
        <div className="duration-section">
          <div className="duration-line"></div>
          <div className="duration">{bus.duration}</div>
          <div className="duration-line"></div>
        </div>
        <div className="time-section">
          <div className="time">{bus.arrivalTime}</div>
          <div className="label">Arrival</div>
        </div>
      </div>

      <div className="bus-info">
        <div className="info-item">
          <span className="info-label">Seats Available</span>
          <span className="info-value">{bus.availableSeats}</span>
        </div>
        <div className="info-item">
          <span className="info-label">Fare</span>
          <span className="info-value">₹{bus.fare}</span>
        </div>
      </div>

      <button className="view-seats-btn" onClick={handleViewSeats}>
        View Seats
      </button>
    </div>
  );
};

export default BusCard;
