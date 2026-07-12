import AuditAssignment from "./auditAssignment.model.js";
import AuditCycle from "../auditCycle/auditCycle.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const assignAuditor = async (auditCycleId, auditorId) => {
    const cycle = await AuditCycle.findById(auditCycleId);
    if (!cycle) throw new ApiError(StatusCodes.NOT_FOUND, "Audit cycle not found");
    
    // Check if already assigned
    const existing = await AuditAssignment.findOne({ auditCycleId, auditorId });
    if (existing) throw new ApiError(StatusCodes.BAD_REQUEST, "Auditor is already assigned to this cycle");

    const assignment = new AuditAssignment({ auditCycleId, auditorId });
    return await assignment.save();
};

export const getAssignmentsForCycle = async (auditCycleId) => {
    return await AuditAssignment.find({ auditCycleId }).populate('auditorId', 'name email');
};

export const getMyAssignments = async (auditorId) => {
    return await AuditAssignment.find({ auditorId }).populate('auditCycleId');
};
