import AuditCycle from "./auditCycle.model.js";
import AuditResult from "../auditResult/auditResult.model.js";
import Asset from "../asset/asset.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const createAuditCycle = async (data) => {
    const cycle = new AuditCycle(data);
    return await cycle.save();
};

export const closeAuditCycle = async (id) => {
    const cycle = await AuditCycle.findById(id);
    if (!cycle) throw new ApiError(StatusCodes.NOT_FOUND, "Audit cycle not found");
    
    if (cycle.status === 'completed') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Audit cycle is already closed");
    }

    cycle.status = 'completed';
    await cycle.save();

    // When closing, update affected asset statuses based on discrepancies
    const results = await AuditResult.find({ auditCycleId: id });
    for (const result of results) {
        if (result.status === 'missing') {
            await Asset.findByIdAndUpdate(result.assetId, { status: 'lost' });
        } else if (result.status === 'damaged') {
            await Asset.findByIdAndUpdate(result.assetId, { condition: 'damaged' });
        }
    }

    return cycle;
};

export const getAuditCycles = async (query = {}) => {
    return await AuditCycle.find(query);
};
