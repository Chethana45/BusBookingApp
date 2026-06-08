import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import BusCard from '../components/BusCard';

const SearchBus = () => {
  const location = useLocation();
  const [searchParams, setSearchParams] = useState({
    from: '',
    to: '',
    travelDate: '',
  });
  const [buses, setBuses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Dummy bus data
  const dummyBuses = [
    {
      id: 1,
      busName: 'RedBus Express',
      departureTime: '08:00 AM',
      arrivalTime: '02:30 PM',
      duration: '6h 30m',
      availableSeats: 12,
      fare: 450,
      busType: 'AC Semi-Sleeper',
      rating: 4.5,
    },
    {
      id: 2,
      busName: 'MakeMyTrip Comfort',
      departureTime: '10:30 AM',
      arrivalTime: '04:45 PM',
      duration: '6h 15m',
      availableSeats: 8,
      fare: 520,
      busType: 'AC Sleeper',
      rating: 4.3,
    },
    {
      id: 3,
      busName: 'GoIbibo Premium',
      departureTime: '02:00 PM',
      arrivalTime: '08:30 PM',
      duration: '6h 30m',
      availableSeats: 15,
      fare: 380,
      busType: 'AC Non-Sleeper',
      rating: 4.1,
    },
    {
      id: 4,
      busName: 'TravelXpress Deluxe',
      departureTime: '04:15 PM',
      arrivalTime: '10:45 PM',
      duration: '6h 30m',
      availableSeats: 5,
      fare: 650,
      busType: 'Premium AC Sleeper',
      rating: 4.7,
    },
    {
      id: 5,
      busName: 'QuickBus Economy',
      departureTime: '06:00 AM',
      arrivalTime: '12:15 PM',
      duration: '6h 15m',
      availableSeats: 20,
      fare: 320,
      busType: 'Non-AC',
      rating: 3.9,
    },
    {
      id: 6,
      busName: 'SilverLines Elite',
      departureTime: '11:45 AM',
      arrivalTime: '06:00 PM',
      duration: '6h 15m',
      availableSeats: 10,
      fare: 580,
      busType: 'AC Semi-Sleeper',
      rating: 4.4,
    },
  ];

  useEffect(() => {
    if (location.state) {
      setSearchParams(location.state);
    } else {
      setSearchParams({ from: '', to: '', travelDate: '' });
    }

    setLoading(true);
    setError('');

    const timer = setTimeout(() => {
      try {
        setBuses(dummyBuses);
      } catch (err) {
        setError('Unable to load bus results. Please refresh the page or try again later.');
      } finally {
        setLoading(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [location]);

  const hasSearchInput = searchParams.from || searchParams.to || searchParams.travelDate;

  return (
    <div className="search-results-container">
      <div className="search-results-header">
        <h1>Available Buses</h1>
        {hasSearchInput && (
          <p>
            {searchParams.from} → {searchParams.to} on {searchParams.travelDate}
          </p>
        )}
      </div>

      {loading ? (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading buses...</p>
        </div>
      ) : error ? (
        <div className="error-message">
          {error}
        </div>
      ) : buses.length > 0 ? (
        <div className="bus-results-grid">
          {buses.map((bus) => (
            <BusCard key={bus.id} bus={bus} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <p>
            {hasSearchInput
              ? 'No buses found for your search. Please try different dates or routes.'
              : 'Start by searching for your route to see available buses.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default SearchBus;
