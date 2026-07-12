const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export const AuthEndpoints = {
  LOGIN_API: `${BASE_URL}/auth/login`,
  REGISTER_API: `${BASE_URL}/auth/register`,
  LOGOUT_API: `${BASE_URL}/auth/logout`,
  PROFILE_API: `${BASE_URL}/auth/me`,
};
