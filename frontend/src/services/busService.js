import api from './api';

export const getAvailableBuses = async () => {
  const res = await api.get('/buses');

  console.log("BUS DATA:", res.data);

  // Handle both array and wrapped response formats
  const buses = Array.isArray(res.data) ? res.data : res.data?.data || [];
  return buses;
};

export const getBusById = async (id) => {
  const res = await api.get(`/buses/${id}`);
  return res.data;
};
export const searchBuses = async ({ from, to, travelDate }) => {
  const res = await api.get('/buses', {
    params: {
      from,
      to,
      travelDate,
    },
  });

  // Handle both array and wrapped response formats
  const buses = Array.isArray(res.data) ? res.data : res.data?.data || [];
  
  return buses.filter(
    (bus) =>
      bus.from?.toLowerCase().trim() === from?.toLowerCase().trim() &&
      bus.to?.toLowerCase().trim() === to?.toLowerCase().trim()
  );
};

export const getBusesByType = async (type) => {
  const res = await api.get('/buses', { params: { type } });
  // Handle both array and wrapped response formats
  const buses = Array.isArray(res.data) ? res.data : res.data?.data || [];
  return buses;
};
