import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as transferService from "./transferRequest.service.js";

export const requestTransfer = CatchAsync(async (req, res) => {
    const { assetId, reason, toEmployeeId } = req.body;
    const requestedBy = req.user.userid;
    // If toEmployeeId not provided, the requester is requesting the asset for themselves
    const targetEmployeeId = toEmployeeId || requestedBy;
    
    const transfer = await transferService.requestTransferService(assetId, targetEmployeeId, requestedBy, reason);
    sendResponse(res, StatusCodes.CREATED, "Asset request submitted successfully", { transfer });
});

export const updateTransferStatus = CatchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const approvedBy = req.user.userid;
    
    const transfer = await transferService.approveOrRejectTransferService(id, status, approvedBy);
    sendResponse(res, StatusCodes.OK, `Transfer ${status}`, { transfer });
});

export const getMyTransfers = CatchAsync(async (req, res) => {
    const userId = req.user.userid;
    const transfers = await transferService.getAllTransfersService({ 
        $or: [{ fromEmployeeId: userId }, { toEmployeeId: userId }] 
    });
    sendResponse(res, StatusCodes.OK, "Transfers retrieved", { transfers });
});

// Returns only requests made BY the current user (for employee dashboard)
export const getMyRequests = CatchAsync(async (req, res) => {
    const userId = req.user.userid;
    const transfers = await transferService.getAllTransfersService({ requestedBy: userId });
    sendResponse(res, StatusCodes.OK, "My requests retrieved", { transfers });
});

export const getAllTransfers = CatchAsync(async (req, res) => {
    const transfers = await transferService.getAllTransfersService();
    sendResponse(res, StatusCodes.OK, "All transfers retrieved", { transfers });
});
