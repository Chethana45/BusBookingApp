import api from './api';
import { bookings } from '../data/bookings';

export const getBookings = async (filter = 'all') => {
  // Replace with: return api.get('/bookings', { params: { status: filter } }).then(res => res.data);
  if (filter === 'all') {
    return Promise.resolve([...bookings]);
  }
  return Promise.resolve(bookings.filter((booking) => booking.status === filter));
};

export const getBookingById = async (bookingId) => {
  // Replace with: return api.get(`/bookings/${bookingId}`).then(res => res.data);
  const booking = bookings.find((item) => item.id === bookingId || item.id === parseInt(bookingId, 10));
  if (!booking) {
    return Promise.reject(new Error('Booking not found.'));
  }
  return Promise.resolve(booking);
};

export const createBooking = async (payload) => {
  // Replace with: return api.post('/bookings', payload).then(res => res.data);
  const nextId = bookings.length ? Math.max(...bookings.map((item) => item.id)) + 1 : 1;
  const newBooking = {
    id: nextId,
    bookingDate: new Date().toISOString().split('T')[0],
    status: 'confirmed',
    paymentMode: 'UPI',
    cancellationDate: null,
    ...payload,
  };
  bookings.unshift(newBooking);
  return Promise.resolve(newBooking);
};

export const cancelBooking = async (bookingId) => {
  // Replace with: return api.post(`/bookings/${bookingId}/cancel`).then(res => res.data);
  const booking = bookings.find((item) => item.id === bookingId || item.id === parseInt(bookingId, 10));
  if (!booking) {
    return Promise.reject(new Error('Booking not found.'));
  }
  booking.status = 'cancelled';
  booking.cancellationDate = new Date().toISOString().split('T')[0];
  return Promise.resolve(booking);
};
