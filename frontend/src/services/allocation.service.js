import { api } from "../api/axios.js";

export const getAllocationHistory = async (assetId) => {
  const { data } = await api.get(`/allocations/asset/${assetId}/history`);
  return data.history || [];
};

export const allocateAsset = async (body) => {
  const { data } = await api.post("/allocations", body);
  return data.allocation;
};

export const submitTransferRequest = async (body) => {
  const { data } = await api.post("/transfers", body);
  return data.transfer;
};
