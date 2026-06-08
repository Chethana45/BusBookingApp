import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = location.state || {};

  const {
    busName = 'RedBus Express',
    from = 'New Delhi',
    to = 'Mumbai',
    departureTime = '20:30',
    arrivalTime = '08:45',
    busType = 'AC Sleeper',
    selectedSeats = [12, 13],
    totalFare = 900,
    farePerSeat = 450,
    passengers = selectedSeats.length,
  } = booking;

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [passengerName, setPassengerName] = useState(booking.passengerName || 'Ananya Sharma');
  const [email, setEmail] = useState(booking.email || 'ananya.sharma@example.com');
  const [phone, setPhone] = useState(booking.phone || '+91 98765 43210');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const serviceFee = Math.round(totalFare * 0.05);
  const taxes = Math.round(totalFare * 0.08);
  const amountPayable = totalFare + serviceFee + taxes;

  const handlePayNow = () => {
    if (!selectedSeats || selectedSeats.length === 0) {
      setError('Please select a bus and seats before proceeding.');
      return;
    }

    setError('');
    setIsProcessing(true);

    setTimeout(() => {
      setIsProcessing(false);
      navigate('/booking-confirmation', {
        state: {
          ...booking,
          passengerName,
          email,
          phone,
          paymentMethod: paymentMethod.toUpperCase().replace('-', ' '),
          totalFare: amountPayable,
        },
      });
    }, 1000);
  };

  if (!booking || !booking.busId) {
    return (
      <div className="payment-container">
        <div className="payment-card empty-state-card">
          <h2>No booking selected</h2>
          <p>Choose a bus and seats before continuing to payment.</p>
          <button className="primary-btn" onClick={() => navigate('/search-bus')}>
            Search Buses
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-container">
      <div className="payment-page-header">
        <div>
          <p className="eyebrow">Payment</p>
          <h1>Complete your bus booking</h1>
          <p className="header-copy">
            Review your booking details, add passenger information, and pay securely using your preferred payment method.
          </p>
        </div>
        <div className="payment-status-chip">Secure checkout</div>
      </div>

      <div className="payment-grid">
        <div className="payment-card payment-details-card">
          <div className="section-head">
            <div>
              <h2>Booking summary</h2>
              <p className="section-subtitle">Your journey details and selected seats</p>
            </div>
          </div>

          <div className="detail-row">
            <div>
              <span className="detail-label">Route</span>
              <p className="detail-value">{from} → {to}</p>
            </div>
            <span className="badge">{busType}</span>
          </div>

          <div className="route-row">
            <div>
              <span className="detail-label">Departure</span>
              <p className="detail-value">{departureTime}</p>
            </div>
            <div>
              <span className="detail-label">Arrival</span>
              <p className="detail-value">{arrivalTime}</p>
            </div>
          </div>

          <div className="selected-seats-card">
            <h3>Selected seats</h3>
            <div className="seat-list">
              {selectedSeats.map((seat) => (
                <span key={seat} className="seat-pill">
                  {seat}
                </span>
              ))}
            </div>
          </div>

          <div className="section-head">
            <div>
              <h2>Passenger details</h2>
              <p className="section-subtitle">Who is travelling?</p>
            </div>
          </div>

          <div className="form-grid">
            <label>
              Full name
              <input value={passengerName} onChange={(e) => setPassengerName(e.target.value)} placeholder="Enter full name" />
            </label>
            <label>
              Email address
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter email" />
            </label>
            <label>
              Phone number
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number" />
            </label>
          </div>
        </div>

        <div className="payment-card payment-summary-card">
          <div className="section-head">
            <div>
              <h2>Payment method</h2>
              <p className="section-subtitle">Choose how you want to pay</p>
            </div>
          </div>

          <div className="payment-method-grid payment-method-grid-large">
            {[
              { id: 'upi', label: 'UPI' },
              { id: 'credit-card', label: 'Credit Card' },
              { id: 'debit-card', label: 'Debit Card' },
              { id: 'net-banking', label: 'Net Banking' },
            ].map((method) => (
              <button
                key={method.id}
                type="button"
                className={`payment-method ${paymentMethod === method.id ? 'active' : ''}`}
                onClick={() => setPaymentMethod(method.id)}
              >
                <span className="method-label">{method.label}</span>
              </button>
            ))}
          </div>

          <div className="fare-card payment-summary-due">
            <div className="fare-line">
              <span>Fare per seat</span>
              <span>₹{farePerSeat}</span>
            </div>
            <div className="fare-line">
              <span>Seats booked</span>
              <span>{selectedSeats.length}</span>
            </div>
            <div className="fare-line">
              <span>Subtotal</span>
              <span>₹{totalFare}</span>
            </div>
            <div className="fare-line">
              <span>Service fee</span>
              <span>₹{serviceFee}</span>
            </div>
            <div className="fare-line">
              <span>Taxes</span>
              <span>₹{taxes}</span>
            </div>

            <div className="fare-total amount-due">
              <span>Amount due</span>
              <span>₹{amountPayable}</span>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button className="primary-btn pay-now-btn" onClick={handlePayNow} disabled={isProcessing}>
            {isProcessing ? 'Processing payment...' : `Pay Now ₹${amountPayable}`}
          </button>

          <p className="payment-note">
            Bank-level encryption. No card details are stored on our servers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Payment;
