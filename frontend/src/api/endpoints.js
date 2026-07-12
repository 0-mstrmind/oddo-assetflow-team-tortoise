const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1";

export const AuthEndpoints = {
  LOGIN_API: "/auth/login",
  REGISTER_API: "/auth/register",
  LOGOUT_API: "/auth/logout",
  PROFILE_API: "/auth/me",
  VERIFY_EMAIL_API: "/auth/verify-email",
  CREATE_EMPLOYEE_API: "/auth/admin/users",
};
