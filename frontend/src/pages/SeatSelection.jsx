import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SeatLayout from '../components/SeatLayout';
import { getBusById } from '../data/buses';

const SeatSelection = () => {
  const navigate = useNavigate();
  const { busId } = useParams();
  const [busInfo, setBusInfo] = useState(null);
  const [bookedSeats, setBookedSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [showBookingConfirm, setShowBookingConfirm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');
    const timer = setTimeout(() => {
      const id = busId ? parseInt(busId, 10) : 1;
      const data = getBusById(id);
      if (!data) {
        setError('Unable to load the selected bus. Please return to search and choose another route.');
        setBusInfo(null);
      } else {
        setBusInfo(data);
        setBookedSeats(data.bookedSeats || []);
      }
      setSelectedSeats([]);
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [busId]);

  const handleSeatSelect = (seatNumber) => {
    if (selectedSeats.includes(seatNumber)) {
      setSelectedSeats(selectedSeats.filter((seat) => seat !== seatNumber));
    } else {
      setSelectedSeats([...selectedSeats, seatNumber]);
    }
  };

  const totalFare = busInfo ? selectedSeats.length * busInfo.fare : 0;
  const availableSeatsCount = busInfo ? busInfo.totalSeats - bookedSeats.length : 0;

  const handleProceedToBooking = () => {
    if (selectedSeats.length === 0) {
      alert('Please select at least one seat');
      return;
    }
    setShowBookingConfirm(true);
  };

  const handleConfirmBooking = () => {
    if (!busInfo) return;

    navigate('/payment', {
      state: {
        busId: busInfo.id,
        busName: busInfo.busName,
        from: busInfo.from,
        to: busInfo.to,
        departureTime: busInfo.departureTime,
        arrivalTime: busInfo.arrivalTime,
        busType: busInfo.busType,
        selectedSeats: selectedSeats.sort((a, b) => a - b),
        totalFare: totalFare,
        farePerSeat: busInfo.fare,
        passengers: selectedSeats.length,
      },
    });
  };

  const handleCancelConfirm = () => {
    setShowBookingConfirm(false);
  };

  const handleContinueShopping = () => {
    navigate('/search-bus');
  };

  if (loading) {
    return (
      <div className="search-results-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading seat layout...</p>
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
            <button className="search-buses-btn" onClick={handleContinueShopping}>
              🔍 Search Buses
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (busInfo && availableSeatsCount <= 0) {
    return (
      <div className="search-results-container">
        <div className="no-results">
          <p>There are no seats available on this bus right now.</p>
          <button className="search-buses-btn" onClick={handleContinueShopping}>
            🔍 Search Other Buses
          </button>
        </div>
      </div>
    );
  }

  const generateSeats = () => {
    const seats = [];
    let seatNumber = 1;
    for (let row = 0; row < 8; row++) {
      const rowSeats = [];
      for (let col = 0; col < 5; col++) {
        rowSeats.push(seatNumber);
        seatNumber++;
      }
      seats.push(rowSeats);
    }
    return seats;
  };

  const allSeats = generateSeats();

  return (
    <div className="seat-selection-page">
      <div className="seat-selection-container">
        {/* Header */}
        <div className="seat-selection-header">
          <h1>Select Your Seats</h1>
          <div className="bus-route-info">
            <span className="route-from">{busInfo.from}</span>
            <span className="route-arrow">→</span>
            <span className="route-to">{busInfo.to}</span>
          </div>
          <p className="bus-info-text">
            {busInfo.busName} • {busInfo.busType} • {busInfo.departureTime} - {busInfo.arrivalTime}
          </p>
        </div>

        {/* Seat Statistics */}
        <div className="seat-statistics">
          <div className="stat available">
            <span className="stat-dot"></span>
            <span>Available: {availableSeatsCount}</span>
          </div>
          <div className="stat selected">
            <span className="stat-dot"></span>
            <span>Selected: {selectedSeats.length}</span>
          </div>
          <div className="stat booked">
            <span className="stat-dot"></span>
            <span>Booked: {bookedSeats.length}</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="seat-selection-content">
          <div className="seat-layout-wrapper">
            <div className="seat-layout-header">
              <h2>Bus Layout</h2>
              <p>Click on seats to select/deselect</p>
            </div>

            <SeatLayout
              seats={allSeats}
              selectedSeats={selectedSeats}
              bookedSeats={bookedSeats}
              onSeatSelect={handleSeatSelect}
              farePerSeat={busInfo.fare}
            />
          </div>

          {/* Booking Summary Sidebar */}
          <div className="seat-actions">
            <div className="seat-action-card">
              <h3>Booking Summary</h3>

              {/* Journey Details */}
              <div className="summary-section journey-details">
                <div className="journey-item">
                  <span className="journey-label">From</span>
                  <span className="journey-value">{busInfo.from}</span>
                </div>
                <div className="journey-item">
                  <span className="journey-label">To</span>
                  <span className="journey-value">{busInfo.to}</span>
                </div>
                <div className="journey-item">
                  <span className="journey-label">Departure</span>
                  <span className="journey-value">{busInfo.departureTime}</span>
                </div>
                <div className="journey-item">
                  <span className="journey-label">Arrival</span>
                  <span className="journey-value">{busInfo.arrivalTime}</span>
                </div>
              </div>

              <div className="summary-divider"></div>

              {/* Seats Summary */}
              <div className="summary-section">
                <div className="summary-item">
                  <span className="label">Selected Seats:</span>
                  <span className="value seat-list">
                    {selectedSeats.length > 0
                      ? selectedSeats.sort((a, b) => a - b).join(', ')
                      : 'No seats selected'}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="label">Number of Seats:</span>
                  <span className="value">{selectedSeats.length}</span>
                </div>
                <div className="summary-item">
                  <span className="label">Passengers:</span>
                  <span className="value">{selectedSeats.length}</span>
                </div>
              </div>

              <div className="summary-divider"></div>

              {/* Fare Breakdown */}
              <div className="summary-section fare-section">
                <div className="fare-breakdown">
                  <div className="fare-item">
                    <span className="fare-label">Fare per Seat</span>
                    <span className="fare-value">₹{busInfo.fare}</span>
                  </div>
                  <div className="fare-item">
                    <span className="fare-label">×</span>
                    <span className="fare-value">{selectedSeats.length} Seat{selectedSeats.length !== 1 ? 's' : ''}</span>
                  </div>
                  <div className="fare-divider-line"></div>
                  <div className="fare-item total">
                    <span className="fare-label">Total Fare</span>
                    <span className="total-value">₹{totalFare}</span>
                  </div>
                </div>
              </div>

              <div className="summary-divider"></div>

              {/* Action Buttons */}
              <div className="action-buttons">
                <button
                  className="proceed-btn"
                  onClick={handleProceedToBooking}
                  disabled={selectedSeats.length === 0}
                >
                  {selectedSeats.length === 0 ? 'Select Seats to Proceed' : 'Proceed to Booking'}
                </button>

                <button className="continue-shopping-btn" onClick={handleContinueShopping}>
                  Change Bus
                </button>
              </div>

              {/* Info Box */}
              {selectedSeats.length > 0 && (
                <div className="booking-info">
                  <p>
                    <strong>Ready to book?</strong> You have selected {selectedSeats.length} seat
                    {selectedSeats.length !== 1 ? 's' : ''} for a total of ₹{totalFare}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Confirmation Modal */}
      {showBookingConfirm && (
        <div className="modal-overlay" onClick={handleCancelConfirm}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Confirm Your Booking</h2>
              <button className="modal-close" onClick={handleCancelConfirm}>
                ✕
              </button>
            </div>

            <div className="modal-body">
              <div className="booking-details">
                <div className="detail-row">
                  <span className="detail-label">Bus</span>
                  <span className="detail-value">{busInfo.busName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Route</span>
                  <span className="detail-value">{busInfo.from} → {busInfo.to}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Selected Seats</span>
                  <span className="detail-value">{selectedSeats.sort((a, b) => a - b).join(', ')}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Total Fare</span>
                  <span className="detail-value">₹{totalFare}</span>
                </div>
              </div>
              <div className="modal-actions">
                <button className="confirm-btn" onClick={handleConfirmBooking}>
                  Confirm Booking
                </button>
                <button className="cancel-btn" onClick={handleCancelConfirm}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SeatSelection;
