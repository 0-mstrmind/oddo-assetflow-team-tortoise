import { api } from "../api/axios.js";

/**
 * Fetch allocation history for a specific asset.
 * Maps nested Mongoose population objects to flat keys expected by the UI.
 */
export const getAllocationHistory = async (assetId) => {
  const { data } = await api.get(`/allocations/asset/${assetId}/history`);
  const history = data.history || [];
  
  return history.map(h => ({
    ...h,
    id: h._id || h.id,
    employeeName: h.employeeId?.name || 'Unknown Employee',
    allocatedByName: h.allocatedBy?.name || 'System',
    allocatedAt: h.allocatedAt ? new Date(h.allocatedAt).toLocaleDateString() : 'N/A',
    expectedReturnDate: h.expectedReturnDate ? new Date(h.expectedReturnDate).toLocaleDateString() : '',
  }));
};

/**
 * Allocate an available asset to a user.
 * Supports positional parameters passed by the frontend component.
 */
export const allocateAsset = async (assetId, employeeId, expectedReturnDate) => {
  const payload = typeof assetId === 'object' ? assetId : { assetId, employeeId, expectedReturnDate };
  const { data } = await api.post("/allocations", payload);
  return data.allocation;
};

/**
 * Submit a request to transfer an allocated asset.
 * Supports positional parameters passed by the frontend component.
 */
export const submitTransferRequest = async (assetId, toEmployeeId, reason) => {
  const payload = typeof assetId === 'object' ? assetId : { assetId, toEmployeeId, reason };
  const { data } = await api.post("/transfers", payload);
  return data.transfer;
};

/**
 * Fetch all pending asset requests (admin only).
 */
export const getPendingRequests = async () => {
  const { data } = await api.get("/transfers/pending");
  return data.transfers || [];
};

/**
 * Approve or reject an asset request (admin only).
 * @param {string} transferId
 * @param {'approved'|'rejected'} status
 */
export const updateRequestStatus = async (transferId, status) => {
  const { data } = await api.patch(`/transfers/${transferId}/status`, { status });
  return data.transfer;
};
