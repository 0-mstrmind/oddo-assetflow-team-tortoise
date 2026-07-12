import { api } from "../api/axios.js";
import { AuthEndpoints } from "../api/endpoints.js";

export const login = async ({ email, password }) => {
  const { data } = await api.post(AuthEndpoints.LOGIN_API, { email, password });
  return data.user;
};

export const register = async ({ name, email, password, companyName }) => {
  const { data } = await api.post(AuthEndpoints.REGISTER_API, { name, email, password, companyName });
  return data.user;
};

export const logout = async () => {
  await api.post(AuthEndpoints.LOGOUT_API);
};

export const getMe = async () => {
  const { data } = await api.get(AuthEndpoints.PROFILE_API);
  return data.user;
};

export const verifyEmail = async (token) => {
  const { data } = await api.get(`${AuthEndpoints.VERIFY_EMAIL_API}/${token}`);
  return data;
};

export const resendVerification = async (email) => {
  const { data } = await api.post(AuthEndpoints.RESEND_VERIFICATION_API, { email });
  return data;
};

export const createEmployee = async (body) => {
  const { data } = await api.post(AuthEndpoints.CREATE_EMPLOYEE_API, body);
  return data.user;
};
