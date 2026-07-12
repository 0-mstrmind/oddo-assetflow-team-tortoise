import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as transferService from "./transferRequest.service.js";

export const requestTransfer = CatchAsync(async (req, res) => {
    const { assetId, toEmployeeId, reason } = req.body;
    const fromEmployeeId = req.user.id;
    
    const transfer = await transferService.requestTransferService(assetId, fromEmployeeId, toEmployeeId, reason);
    sendResponse(res, StatusCodes.CREATED, "Transfer requested successfully", { transfer });
});

export const updateTransferStatus = CatchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const approvedBy = req.user.id;
    
    const transfer = await transferService.approveOrRejectTransferService(id, status, approvedBy);
    sendResponse(res, StatusCodes.OK, `Transfer ${status}`, { transfer });
});

export const getMyTransfers = CatchAsync(async (req, res) => {
    const userId = req.user.id;
    const transfers = await transferService.getAllTransfersService({ 
        $or: [{ fromEmployeeId: userId }, { toEmployeeId: userId }] 
    });
    sendResponse(res, StatusCodes.OK, "Transfers retrieved", { transfers });
});

export const getAllTransfers = CatchAsync(async (req, res) => {
    const transfers = await transferService.getAllTransfersService();
    sendResponse(res, StatusCodes.OK, "All transfers retrieved", { transfers });
});
