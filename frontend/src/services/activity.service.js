import { api } from "../api/axios.js";

export const getActivityLogs = async (params = {}) => {
  const { data } = await api.get("/activity-logs", { params });
  return data.logs || [];
};
