import { api } from "../api/axios.js";
import { AuthEndpoints } from "../api/endpoints.js";

export const login = async ({ email, password }) => {
  const { data } = await api.post(AuthEndpoints.LOGIN_API, { email, password });
  return data.data; // assuming backend returns { data: { user } } or similar
};

export const register = async ({ name, email, password }) => {
  const { data } = await api.post(AuthEndpoints.REGISTER_API, { name, email, password });
  return data.data;
};

export const logout = async () => {
  await api.post(AuthEndpoints.LOGOUT_API);
};

export const getMe = async () => {
  const { data } = await api.get(AuthEndpoints.PROFILE_API);
  return data.data; // should return the user object with roles
};
