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
  const routeBusId = booking.busId || null;

  const [busData, setBusData] = useState(routeBus);
  const [loadingDetails, setLoadingDetails] = useState(!routeBus && Boolean(routeBusId));
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
      if (!routeBusId) {
        setBusData(null);
        setLoadingDetails(false);
        return;
      }
      setLoadingDetails(true);
      try {
        let data = await getBusById(routeBusId);
        // Normalize wrapped API response same as SeatSelection does
        if (data && data.data) data = data.data;
        if (Array.isArray(data)) data = data[0] || null;
        if (!mounted) return;
        setBusData(data || null);
      } catch (err) {
        console.error('Failed to load bus details for payment page', err);
        if (!mounted) return;
        setError('Unable to load booking details. Please return and try again.');
      } finally {
        if (mounted) setLoadingDetails(false);
      }
    };

    loadDetails();
    return () => {
      mounted = false;
    };
  }, [routeBusId, routeBus]);

  const [paymentMethod, setPaymentMethod] = useState('upi');
  const [passengerName, setPassengerName] = useState(booking.passengerName || '');
  const [email, setEmail] = useState(booking.email || '');
  const [phone, setPhone] = useState(booking.phone || '');

  const effectiveBus = busData || routeBus;
  const effectiveBusId = routeBusId || effectiveBus?._id || effectiveBus?.id || '';
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

  // Redirect if required booking data is missing
  if (!routeBusId && !routeBus) {
    return (
      <div className="payment-container">
        <div className="payment-card empty-state-card">
          <h2>No booking selected</h2>
          <p>Please select a bus and seats before proceeding to payment.</p>
          <button className="primary-btn" onClick={() => navigate('/search-bus')}>
            Search Buses
          </button>
        </div>
      </div>
    );
  }

  if (!effectiveTravelDate) {
    return (
      <div className="payment-container">
        <div className="payment-card empty-state-card">
          <h2>Travel date is missing</h2>
          <p>Please select a travel date and seats before proceeding.</p>
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
          <p>Loading booking details...</p>
        </div>
      </div>
    );
  }

  const handlePayNow = async () => {
    if (!effectiveSelectedSeats || effectiveSelectedSeats.length === 0) {
      setError('Please select a travel date and seat before proceeding.');
      return;
    }

    if (!effectiveTravelDate) {
      setError('Please select a travel date and seat before proceeding.');
      return;
    }

    if (!effectiveBusId) {
      setError('Please select a travel date and seat before proceeding.');
      return;
    }

    if (!passengerName.trim()) {
      setError('Please enter your full name to continue.');
      return;
    }

    if (!email.trim()) {
      setError('Please enter your email address to continue.');
      return;
    }

    if (!phone.trim()) {
      setError('Please enter your phone number to continue.');
      return;
    }

    setError('');
    setIsProcessing(true);

    try {
      const payload = {
        busId: effectiveBusId,
        seats: effectiveSelectedSeats,
        travelDate: effectiveTravelDate,
        passenger: {
          name: passengerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        },
        amount: amountPayable,
        farePerSeat: effectiveFarePerSeat,
        paymentMethod,
        paymentMode: paymentMethod, // backend expects paymentMode
      };

      const res = await api.post('/bookings', payload);

      const bookingResponse = res?.data || {};
      const existingBookings =
        JSON.parse(localStorage.getItem("bookings")) || [];

      existingBookings.push({
        ...bookingResponse,
        busId: effectiveBusId,
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

      navigate('/booking-confirmation', {
        state: {
          ...bookingResponse,
          passengerName: passengerName.trim(),
          email: email.trim(),
          phone: phone.trim(),
          paymentMethod: paymentMethod.toUpperCase().replace('-', ' '),
          totalFare: amountPayable,
          busName: effectiveBus?.busName,
          busType: effectiveBus?.busType,
          from: effectiveBus?.from,
          to: effectiveBus?.to,
          journeyDate: effectiveTravelDate,
          departureTime: effectiveBus?.departureTime,
          arrivalTime: effectiveBus?.arrivalTime,
          selectedSeats: effectiveSelectedSeats,
          farePerSeat: effectiveFarePerSeat,
        },
      });
    } catch (err) {
      console.error('Payment/booking error:', err);
      const backendMsg = err?.response?.data?.message || '';
      
      if (backendMsg.toLowerCase().includes('bus') && backendMsg.toLowerCase().includes('required')) {
        setError('Please select a travel date and seat before proceeding.');
      } else if (backendMsg.toLowerCase().includes('seat') && backendMsg.toLowerCase().includes('required')) {
        setError('Please select a travel date and seat before proceeding.');
      } else if (backendMsg.toLowerCase().includes('travel date') && backendMsg.toLowerCase().includes('required')) {
        setError('Please select a travel date and seat before proceeding.');
      } else if (backendMsg.toLowerCase().includes('already booked') || backendMsg.toLowerCase().includes('already taken')) {
        setError('Some selected seats are already booked. Please go back and choose different seats.');
      } else if (backendMsg.toLowerCase().includes('payment')) {
        setError('Payment could not be processed. Please check your payment method and try again.');
      } else if (backendMsg.toLowerCase().includes('network') || backendMsg.toLowerCase().includes('timeout')) {
        setError('Unable to connect. Please check your internet and try again.');
      } else {
        setError(backendMsg || 'Booking could not be completed. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

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