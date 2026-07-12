import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as auditCycleService from "./auditCycle.service.js";

export const createCycle = CatchAsync(async (req, res) => {
    const cycle = await auditCycleService.createAuditCycle(req.body);
    sendResponse(res, StatusCodes.CREATED, "Audit cycle created successfully", { cycle });
});

export const closeCycle = CatchAsync(async (req, res) => {
    const { id } = req.params;
    const cycle = await auditCycleService.closeAuditCycle(id);
    sendResponse(res, StatusCodes.OK, "Audit cycle closed and asset statuses updated", { cycle });
});

export const getCycles = CatchAsync(async (req, res) => {
    const cycles = await auditCycleService.getAuditCycles(req.query);
    sendResponse(res, StatusCodes.OK, "Audit cycles retrieved", { cycles });
});
