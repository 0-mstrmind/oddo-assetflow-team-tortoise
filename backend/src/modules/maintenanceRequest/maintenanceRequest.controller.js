import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as maintenanceService from "./maintenanceRequest.service.js";

export const raiseMaintenance = CatchAsync(async (req, res) => {
    const { assetId, priority, issue } = req.body;
    const requestedBy = req.user.id;
    
    const request = await maintenanceService.raiseMaintenanceService(assetId, requestedBy, priority, issue);
    sendResponse(res, StatusCodes.CREATED, "Maintenance request raised successfully", { request });
});

export const updateMaintenanceStatus = CatchAsync(async (req, res) => {
    const { id } = req.params;
    const { status, technicianId } = req.body;
    const updatedBy = req.user.id;
    
    const request = await maintenanceService.updateMaintenanceStatusService(id, status, updatedBy, technicianId);
    sendResponse(res, StatusCodes.OK, `Maintenance request updated to ${status}`, { request });
});

export const getMyRequests = CatchAsync(async (req, res) => {
    const requests = await maintenanceService.getAllMaintenanceRequestsService({ requestedBy: req.user.id });
    sendResponse(res, StatusCodes.OK, "Maintenance requests retrieved", { requests });
});

export const getAllRequests = CatchAsync(async (req, res) => {
    const requests = await maintenanceService.getAllMaintenanceRequestsService(req.query);
    sendResponse(res, StatusCodes.OK, "All maintenance requests retrieved", { requests });
});
