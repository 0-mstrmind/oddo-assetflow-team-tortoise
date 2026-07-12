import { api } from "../api/axios.js";

/**
 * Submit an asset request for the logged-in employee.
 * toEmployeeId is omitted — backend auto-assigns the asset to the requester.
 */
export const submitAssetRequest = async ({ assetId, reason }) => {
  const { data } = await api.post("/transfers", { assetId, reason });
  return data.transfer;
};

/**
 * Fetch all requests made BY the current employee.
 */
export const getMyRequests = async () => {
  const { data } = await api.get("/transfers/my-requests");
  return data.transfers || [];
};
