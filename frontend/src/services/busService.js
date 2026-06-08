import api from './api';
import { buses, getBusById as getBusByIdData, getBusesByRoute } from '../data/buses';

export const getAvailableBuses = async () => {
  // Replace with: return api.get('/buses').then(res => res.data);
  const available = buses.filter((bus) => bus.availableSeats > 0);
  return Promise.resolve(available);
};

export const getBusById = async (id) => {
  // Replace with: return api.get(`/buses/${id}`).then(res => res.data);
  const bus = getBusByIdData(id);
  if (!bus) {
    return Promise.reject(new Error('Bus not found.'));
  }
  return Promise.resolve(bus);
};

export const searchBuses = async ({ from, to }) => {
  // Replace with: return api.get('/buses', { params: { from, to } }).then(res => res.data);
  if (!from || !to) {
    return Promise.resolve([]);
  }
  const results = getBusesByRoute(from, to);
  return Promise.resolve(results);
};

export const getBusesByType = async (type) => {
  // Replace with: return api.get('/buses', { params: { type } }).then(res => res.data);
  const filtered = buses.filter((bus) => bus.busType.toLowerCase() === type.toLowerCase());
  return Promise.resolve(filtered);
};
