import api from './axiosInstance'

export const getEvents = (token) => {
  return api.get("/events", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// POST /events - create a new event
export const createEvent = (payload, authHeader) => {
  return api.post(`/events`, payload, {
    headers: authHeader,
  });
};

export const optInEvent = (eventId, authHeader) => {
  return api.post(`/events/opt-in/${eventId}`, null, {
    headers: authHeader,
  });
};