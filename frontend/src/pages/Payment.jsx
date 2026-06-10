import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { getBusById } from '../services/busService';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const booking = useMemo(() => location.state || {}, [location.state]);
  const routeBus = booking.bus || null;
  const routeTravelDate = booking.travelDate || '';
  const routeSelectedSeats = booking.selectedSeats || [];
  const routeTotalFare = booking.totalFare;
  const routeFarePerSeat = booking.farePerSeat || 0;

  const [busData, setBusData] = useState(routeBus);
  const [loadingDetails, setLoadingDetails] = useState(!routeBus && Boolean(booking.busId));
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    const loadDetails = async () => {
      if (routeBus) {
        setBusData(routeBus);
        setLoadingDetails(false);
        return;
      }
      if (!booking || !booking.busId) {
        setBusData(null);
        setLoadingDetails(false);
        return;
      }
      setLoadingDetails(true);
      try {
        const data = await getBusById(booking.busId);
        if (!mounted) return;
        setBusData(data || null);
      } catch (err) {
        console.error('Failed to load bus details for payment page', err);
        if (!mounted) return;
        setError('Failed to load bus details.');
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    };

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [booking, routeBus]);

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [passengerName, setPassengerName] = useState(booking.passengerName || '');
  const [email, setEmail] = useState(booking.email || '');
  const [phone, setPhone] = useState(booking.phone || '');

  const effectiveBus = busData || routeBus;
  const effectiveSelectedSeats = routeSelectedSeats;
  const effectiveFarePerSeat = routeFarePerSeat || effectiveBus?.fare || 0;
  const effectiveTotalFare = routeTotalFare !== undefined ? routeTotalFare : effectiveFarePerSeat * effectiveSelectedSeats.length;
  const effectiveTravelDate = routeTravelDate || effectiveBus?.travelDate || '';

  const serviceFee = Math.round(effectiveTotalFare * 0.05);
  const taxes = Math.round(effectiveTotalFare * 0.08);
  const amountPayable = effectiveTotalFare + serviceFee + taxes;

  const displayFrom = effectiveBus?.from || '';
  const displayTo = effectiveBus?.to || '';
  const displayDeparture = effectiveBus?.departureTime || '';
  const displayArrival = effectiveBus?.arrivalTime || '';
  const displayBusType = effectiveBus?.busType || '';

  const handlePayNow = async () => {
    if (!effectiveSelectedSeats || effectiveSelectedSeats.length === 0) {
      setError('Please select a bus and seats before proceeding.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const payload = {
        busId: booking.busId || effectiveBus?._id || effectiveBus?.id,
        seats: effectiveSelectedSeats,
        travelDate: effectiveTravelDate,
        passenger: {
          name: passengerName,
          email,
          phone,
        },
        amount: amountPayable,
        farePerSeat: effectiveFarePerSeat,
        paymentMethod,
      };

      const res = await api.post('/bookings', payload);

      const bookingResponse = res?.data || {};
const existingBookings =
  JSON.parse(localStorage.getItem("bookings")) || [];

existingBookings.push({
  ...bookingResponse,
  busId: booking.busId || effectiveBus?._id,
  busName: effectiveBus?.busName,
  from: effectiveBus?.from,
  to: effectiveBus?.to,
  seats: effectiveSelectedSeats,
  totalFare: amountPayable,
  status: "completed",
  bookingDate: new Date().toISOString(),
});

localStorage.setItem(
  "bookings",
  JSON.stringify(existingBookings)
);
      // Navigate to confirmation with returned booking details
      navigate('/booking-confirmation', {
        state: {
          ...bookingResponse,
          passengerName,
          email,
          phone,
          paymentMethod: paymentMethod.toUpperCase().replace('-', ' '),
          totalFare: amountPayable,
        },
      });
    } catch (err) {
      console.error('Payment/booking error:', err);
      const msg = err?.response?.data?.message || 'Payment failed. Please try again.';
      setError(msg);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!booking || (!booking.busId && !routeBus)) {
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

  if (loadingDetails) {
    return (
      <div className="payment-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading bus details...</p>
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
              <p className="detail-value">{displayFrom} → {displayTo}</p>
            </div>
            <span className="badge">{displayBusType}</span>
          </div>

          <div className="route-row">
            <div>
              <span className="detail-label">Departure</span>
              <p className="detail-value">{displayDeparture}</p>
            </div>
            <div>
              <span className="detail-label">Arrival</span>
              <p className="detail-value">{displayArrival}</p>
            </div>
          </div>

          {effectiveTravelDate && (
            <div className="detail-row">
              <div>
                <span className="detail-label">Travel Date</span>
                <p className="detail-value">{effectiveTravelDate}</p>
              </div>
            </div>
          )}

          <div className="selected-seats-card">
            <h3>Selected seats</h3>
            <div className="seat-list">
              {effectiveSelectedSeats.map((seat) => (
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
              <span>₹{effectiveFarePerSeat}</span>
            </div>
            <div className="fare-line">
              <span>Seats booked</span>
              <span>{effectiveSelectedSeats.length}</span>
            </div>
            <div className="fare-line">
              <span>Subtotal</span>
              <span>₹{effectiveTotalFare}</span>
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
