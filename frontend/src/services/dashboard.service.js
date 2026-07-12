import { api } from "../api/axios.js";

// Fetch dashboard KPIs and recent activities from backend API
export const getDashboardData = async () => {
  const { data } = await api.get("/dashboard/metrics");
  return data.data; // contains { metrics: {...}, recentActivities: [...] }
};
