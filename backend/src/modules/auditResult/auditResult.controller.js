import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as auditResultService from "./auditResult.service.js";

export const markResult = CatchAsync(async (req, res) => {
    const { auditCycleId, assetId, status, remarks, condition } = req.body;
    const result = await auditResultService.markAssetResult(auditCycleId, assetId, status, remarks, condition);
    sendResponse(res, StatusCodes.OK, "Asset audit result marked", { result });
});

export const getDiscrepancies = CatchAsync(async (req, res) => {
    const { cycleId } = req.params;
    const discrepancies = await auditResultService.getDiscrepancyReport(cycleId);
    sendResponse(res, StatusCodes.OK, "Discrepancy report generated", { discrepancies });
});

export const getAllResults = CatchAsync(async (req, res) => {
    const { cycleId } = req.params;
    const results = await auditResultService.getCycleResults(cycleId);
    sendResponse(res, StatusCodes.OK, "All audit results retrieved", { results });
});
