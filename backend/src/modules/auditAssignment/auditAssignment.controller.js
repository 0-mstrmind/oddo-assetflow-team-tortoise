import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as auditAssignmentService from "./auditAssignment.service.js";

export const assign = CatchAsync(async (req, res) => {
    const { auditCycleId, auditorId } = req.body;
    const assignment = await auditAssignmentService.assignAuditor(auditCycleId, auditorId);
    sendResponse(res, StatusCodes.CREATED, "Auditor assigned successfully", { assignment });
});

export const getCycleAssignments = CatchAsync(async (req, res) => {
    const { cycleId } = req.params;
    const assignments = await auditAssignmentService.getAssignmentsForCycle(cycleId);
    sendResponse(res, StatusCodes.OK, "Assignments retrieved", { assignments });
});

export const getMyAssignments = CatchAsync(async (req, res) => {
    const assignments = await auditAssignmentService.getMyAssignments(req.user.id);
    sendResponse(res, StatusCodes.OK, "Your assignments retrieved", { assignments });
});
