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

export const startAuditCycle = async (id) => {
    const cycle = await AuditCycle.findById(id);
    if (!cycle) throw new ApiError(StatusCodes.NOT_FOUND, "Audit cycle not found");

    if (cycle.status !== 'planned') {
        throw new ApiError(StatusCodes.BAD_REQUEST, `Cannot start a cycle that is already '${cycle.status}'`);
    }

    cycle.status = 'in-progress';
    return await cycle.save();
};

export const generateAuditChecklist = async (cycleId) => {
    const cycle = await AuditCycle.findById(cycleId);
    if (!cycle) throw new ApiError(StatusCodes.NOT_FOUND, "Audit cycle not found");

    // Fetch all existing audit results for this cycle
    const existingResults = await AuditResult.find({ auditCycleId: cycleId }).lean();
    const resultMap = {};
    for (const r of existingResults) {
        resultMap[r.assetId.toString()] = r;
    }

    // Fetch scope-filtered assets
    const assetQuery = {};
    if (cycle.scope) {
        assetQuery.location = cycle.scope;
    }
    const scopedAssets = await Asset.find(assetQuery).lean();
    const scopedAssetIds = new Set(scopedAssets.map(a => a._id.toString()));

    // Also fetch any extra assets that have audit results but aren't in the scoped list
    const extraAssetIds = existingResults
        .map(r => r.assetId.toString())
        .filter(id => !scopedAssetIds.has(id));

    let extraAssets = [];
    if (extraAssetIds.length > 0) {
        extraAssets = await Asset.find({ _id: { $in: extraAssetIds } }).lean();
    }

    // Combine and left-join with audit results
    const allAssets = [...scopedAssets, ...extraAssets];
    const checklist = allAssets.map(asset => ({
        asset,
        auditResult: resultMap[asset._id.toString()] || null,
        isAudited: !!resultMap[asset._id.toString()],
    }));

    const totalAssets = checklist.length;
    const auditedCount = checklist.filter(c => c.isAudited).length;

    return { checklist, totalAssets, auditedCount, pendingCount: totalAssets - auditedCount };
};

