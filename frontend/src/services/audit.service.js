import { api } from "../api/axios.js";

export const getAuditCycles = async () => {
  const { data } = await api.get("/audit-cycles");
  return data.cycles || [];
};

export const getAuditChecklist = async (cycleId) => {
  const { data } = await api.get(`/audit-cycles/${cycleId}/checklist`);
  return data.checklist; // contains { checklist, totalAssets, auditedCount, pendingCount }
};

export const verifyAuditAsset = async (body) => {
  const { data } = await api.post("/audit-results", body);
  return data.result;
};

export const closeAuditCycle = async (cycleId) => {
  const { data } = await api.patch(`/audit-cycles/${cycleId}/close`);
  return data.cycle;
};
