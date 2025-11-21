import api from "./axiosInstance";

export const getArtists = (authHeader) => {
  return api.get(`/artists`, {
    headers: authHeader,
  });
};
