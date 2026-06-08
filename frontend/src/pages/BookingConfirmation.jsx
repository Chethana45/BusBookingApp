import React, { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingConfirmation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};

  const hasBookingData = Boolean(booking && Object.keys(booking).length > 0);

  const bookingId = useMemo(() => {
    if (booking.bookingId) return booking.bookingId;
    const now = new Date();
    return `BK${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
  }, [booking.bookingId]);

  if (!hasBookingData) {
    return (
      <div className="booking-confirmation-page">
        <div className="booking-confirmation-card no-booking-card">
          <div className="confirmation-header">
            <div className="confirmation-icon">⚠️</div>
            <h1>No booking found</h1>
            <p className="confirmation-message">Please complete a seat selection and payment to view confirmation details.</p>
          </div>
          <div className="confirmation-actions justify-center">
            <button className="primary-btn" onClick={() => navigate('/search-bus')}>
              Search Buses
            </button>
          </div>
        </div>
      </div>
    );
  }

  const {
    passengerName = 'Ananya Sharma',
    busName = 'RedBus Express',
    busType = 'AC Sleeper',
    from = 'New Delhi',
    to = 'Mumbai',
    journeyDate = '2026-06-15',
    departureTime = '20:30',
    arrivalTime = '08:45',
    selectedSeats = ['12', '13'],
    totalFare = 900,
    farePerSeat = 450,
    paymentMethod = 'UPI',
  } = booking;

  return (
    <div className="booking-confirmation-page">
      <div className="booking-confirmation-card">
        <div className="confirmation-header">
          <div className="confirmation-icon">✅</div>
          <h1>Booking Confirmed</h1>
          <p className="confirmation-message">
            Your bus booking is confirmed. A receipt has been emailed to you with all the travel details.
          </p>
        </div>

        <div className="confirmation-summary">
          <div className="summary-block">
            <span className="summary-label">Booking ID</span>
            <span className="summary-value">{bookingId}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Passenger</span>
            <span className="summary-value">{passengerName}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Bus</span>
            <span className="summary-value">{busName}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Bus Type</span>
            <span className="summary-value">{busType}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Route</span>
            <span className="summary-value">{from} → {to}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Journey Date</span>
            <span className="summary-value">{journeyDate}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Departure</span>
            <span className="summary-value">{departureTime}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Arrival</span>
            <span className="summary-value">{arrivalTime}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Selected Seats</span>
            <span className="summary-value">{selectedSeats.join(', ')}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Payment Method</span>
            <span className="summary-value">{paymentMethod}</span>
          </div>
          <div className="summary-block">
            <span className="summary-label">Fare per Seat</span>
            <span className="summary-value">₹{farePerSeat}</span>
          </div>
          <div className="summary-block total-fare-block">
            <span className="summary-label">Fare Paid</span>
            <span className="summary-value">₹{totalFare}</span>
          </div>
        </div>

        <div className="confirmation-actions">
          <button className="primary-btn" onClick={() => navigate('/booking-history')}>
            View Booking History
          </button>
          <button className="secondary-btn" onClick={() => navigate('/search-bus')}>
            Book Another Trip
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingConfirmation;
