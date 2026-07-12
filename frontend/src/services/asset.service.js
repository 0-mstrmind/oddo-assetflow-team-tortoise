import { api } from "../api/axios.js";

export const getAssets = async (params = {}) => {
  const { data } = await api.get("/assets", { params });
  return data.assets || [];
};

export const registerAsset = async (body) => {
  const { data } = await api.post("/assets", body);
  return data.asset;
};

export const getAssetById = async (id) => {
  const { data } = await api.get(`/assets/${id}`);
  return data.asset;
};

export const updateAsset = async (id, body) => {
  const { data } = await api.patch(`/assets/${id}`, body);
  return data.asset;
};

export const deleteAsset = async (id) => {
  await api.delete(`/assets/${id}`);
};
