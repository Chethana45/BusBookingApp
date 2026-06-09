import { useNavigate } from 'react-router-dom';

const AMENITY_ICONS = {
  WiFi: '📶',
  'Charging Point': '🔌',
  Blanket: '🛏️',
  'Water Bottle': '💧',
  AC: '❄️',
  'Non-AC': '🌡️',
};

const BusCard = ({ bus, onViewSeats, travelDate }) => {
  const navigate = useNavigate();
  const amenities = bus.amenities || bus.features || [];
  const origin = bus.from || bus.origin || bus.source || 'Start';
  const destination = bus.to || bus.destination || bus.target || 'End';

  const handleViewSeats = () => {
    if (onViewSeats) {
      onViewSeats();
    } else {
      navigate(`/bus-details/${bus._id}`, {
        state: {
          travelDate: travelDate || '',
        },
      });
    }
  };

  return (
    <div className="bus-card">
      <div className="bus-card-top">
        <div>
          <h3 className="bus-name">{bus.busName}</h3>
          <p className="bus-subtitle">{origin} → {destination}</p>
        </div>
        <div className="bus-rating-pill">
          <span>⭐</span>
          <strong>{bus.rating || '4.5'}</strong>
        </div>
      </div>

      <div className="bus-card-meta">
        <span className="bus-badge">{bus.busType || 'AC'}</span>
        <span className="bus-seats">{bus.availableSeats || 32} seats left</span>
      </div>

      <div className="bus-route-timeline">
        <div className="route-point">
          <span className="route-time">{bus.departureTime || '06:30'}</span>
          <span className="route-label">Departure</span>
        </div>

        <div className="route-line-wrapper">
          <div className="route-line"></div>
          <div className="route-duration">{bus.duration || '10h 45m'}</div>
        </div>

        <div className="route-point route-end">
          <span className="route-time">{bus.arrivalTime || '17:15'}</span>
          <span className="route-label">Arrival</span>
        </div>
      </div>

      <div className="bus-details-row">
        <div className="fare-block">
          <span className="fare-label">Starting fare</span>
          <strong className="fare-amount">₹{bus.fare || 999}</strong>
        </div>
        <div className="amenity-list">
          {amenities.slice(0, 4).map((amenity) => (
            <span key={amenity} className="amenity-pill">
              <span>{AMENITY_ICONS[amenity] || '✔️'}</span>
              {amenity}
            </span>
          ))}
        </div>
      </div>

      <div className="bus-card-footer">
        <div className="bus-operator">
          <span>{bus.operator || 'Elite Travels'}</span>
          <small>{bus.boardingPoint?.name || 'Main Stand'}</small>
        </div>
        <button className="view-seats-btn" onClick={handleViewSeats}>
          View Seats
        </button>
      </div>
    </div>
  );
};

export default BusCard;
