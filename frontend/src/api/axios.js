import axios from "axios";

export const api = axios.create({
  // Base URL is configured in endpoints.js usually, but we can also set it here
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api/v1",
  withCredentials: true, // Crucial for sending HTTP-only cookies
  headers: {
    "Content-Type": "application/json",
  },
});

import { useAuthStore } from "../store/auth.store.js";

// Add interceptors if needed (e.g., for logging or generic error handling)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // We can handle global 401 Unauthorized errors here
    if (error.response?.status === 401) {
      // Trigger a global logout to clear stale sessions
      useAuthStore.getState().clearUser();
    }
    return Promise.reject(error);
  }
);
