import api from './axiosInstance'

export const getVenues = (token) => {
  return api.get(`/venues`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateVenue = (venueId, form, token) => {
  return api.patch(`/venues/${venueId}`, form, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const createVenue = (venueForm, authHeader) => {
  return api.post(
    `/venues`,
    {
      name: venueForm.name,
      category: venueForm.category,
      address: venueForm.address,
    },
    {
      headers: {
      Authorization: `Bearer ${authHeader}`,
    }
    }
  );
};