import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as auditReportService from "./auditReport.service.js";

export const listReports = CatchAsync(async (req, res) => {
    const reports = await auditReportService.getAuditReports();
    sendResponse(res, StatusCodes.OK, "Audit reports retrieved", { reports });
});
