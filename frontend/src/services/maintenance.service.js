import { api } from "../api/axios.js";

export const getMaintenanceRequests = async () => {
  const { data } = await api.get("/maintenance");
  return data.requests || [];
};

export const addMaintenanceRequest = async (body) => {
  const { data } = await api.post("/maintenance", body);
  return data.request;
};

export const updateMaintenanceStatus = async (id, status, technicianId = null) => {
  const { data } = await api.patch(`/maintenance/${id}/status`, { status, ...(technicianId && { technicianId }) });
  return data.request;
};
