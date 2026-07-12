import { api } from "../api/axios.js";

// Fetch dashboard KPIs and recent activities from backend API
export const getDashboardData = async () => {
  const { data } = await api.get("/dashboard/metrics");
  // sendResponse spreads directly: { success, message, metrics, recentActivities }
  return data;
};
