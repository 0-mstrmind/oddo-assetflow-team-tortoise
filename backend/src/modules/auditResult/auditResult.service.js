import AuditResult from "./auditResult.model.js";
import AuditCycle from "../auditCycle/auditCycle.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const markAssetResult = async (auditCycleId, assetId, status, remarks) => {
    const cycle = await AuditCycle.findById(auditCycleId);
    if (!cycle || cycle.status === 'completed') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Audit cycle not found or already closed");
    }

    const result = await AuditResult.findOneAndUpdate(
        { auditCycleId, assetId },
        { status, remarks },
        { new: true, upsert: true }
    );
    return result;
};

export const getDiscrepancyReport = async (auditCycleId) => {
    return await AuditResult.find({ 
        auditCycleId, 
        status: { $ne: 'verified' } 
    }).populate('assetId');
};

export const getCycleResults = async (auditCycleId) => {
    return await AuditResult.find({ auditCycleId }).populate('assetId');
};
