import AuditReport from "./auditReport.model.js";

/**
 * Save an audit report snapshot when a cycle is closed.
 */
export const saveAuditReport = async ({ auditCycleId, cycleName, scope, results }) => {
    const stats = {
        total: results.length,
        verified: results.filter(r => r.status === 'verified').length,
        missing: results.filter(r => r.status === 'missing').length,
        damaged: results.filter(r => r.status === 'damaged').length,
        misplaced: results.filter(r => r.status === 'misplaced').length,
        pending: results.filter(r => !r.status || r.status === 'pending').length,
    };

    const discrepancies = results
        .filter(r => ['missing', 'damaged', 'misplaced'].includes(r.status))
        .map(r => ({
            assetId: r.assetId,
            assetTag: r.assetTag,
            assetName: r.assetName,
            location: r.location,
            status: r.status,
            condition: r.condition,
            remarks: r.remarks,
        }));

    // Upsert so re-closing doesn't throw
    return await AuditReport.findOneAndUpdate(
        { auditCycleId },
        { auditCycleId, cycleName, scope, stats, discrepancies, closedAt: new Date() },
        { upsert: true, new: true }
    );
};

/**
 * Retrieve all stored audit reports, newest first.
 */
export const getAuditReports = async () => {
    return await AuditReport.find().sort({ closedAt: -1 }).lean();
};
