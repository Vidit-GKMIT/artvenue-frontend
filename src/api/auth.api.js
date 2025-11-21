import api from "./axiosInstance";

export const loginUser = async (form) => {
  const response = await api.post(`/auth/login`, form);
  return response;
};

export const registerArtist = async (form) => {
  const response = await api.post(`/auth/register-artist`, form);
  return response;
}

export const registerOwner = async (form) => {
  const response = await api.post(`/auth/register-owner`, form);
  return response;
}

export const verifyOtp = async (email,otp) => {
  const response = await api.post(`/auth/verify-otp`, { email, otp });
  return response;
 }

export const logoutUser = (token) => {
  return api.post(
    `/auth/logout`,
    null,
    token
      ? {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      : undefined
  );
};