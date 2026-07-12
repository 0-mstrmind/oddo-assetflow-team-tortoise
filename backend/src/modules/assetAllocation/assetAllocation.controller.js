import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as allocationService from "./assetAllocation.service.js";

export const allocateAsset = CatchAsync(async (req, res) => {
    const { assetId, employeeId, expectedReturnDate } = req.body;
    const allocatedBy = req.user.userid;
    
    const allocation = await allocationService.allocateAssetService(
        assetId, 
        employeeId, 
        allocatedBy, 
        expectedReturnDate
    );
    
    sendResponse(res, StatusCodes.CREATED, "Asset allocated successfully", { allocation });
});

export const returnAsset = CatchAsync(async (req, res) => {
    const { allocationId } = req.params;
    const { returnCondition } = req.body;
    const returnedBy = req.user.userid;
    
    const allocation = await allocationService.returnAssetService(
        allocationId, 
        returnCondition, 
        returnedBy
    );
    
    sendResponse(res, StatusCodes.OK, "Asset returned successfully", { allocation });
});

export const getOverdueAllocations = CatchAsync(async (req, res) => {
    // Fetches and auto-flags overdue allocations
    const overdue = await allocationService.getOverdueAllocationsService();
    
    sendResponse(res, StatusCodes.OK, "Overdue allocations retrieved", { overdueAllocations: overdue });
});

export const getAllAllocations = CatchAsync(async (req, res) => {
    const allocations = await allocationService.getAllAllocationsService(req.query);
    
    sendResponse(res, StatusCodes.OK, "Allocations retrieved", { allocations });
});

export const getUserAllocations = CatchAsync(async (req, res) => {
    const userId = req.user.userid;
    const allocations = await allocationService.getUserAllocationsService(userId);
    
    sendResponse(res, StatusCodes.OK, "User allocations retrieved", { allocations });
});

export const getAssetHistory = CatchAsync(async (req, res) => {
    const { assetId } = req.params;
    const history = await allocationService.getAssetAllocationHistoryService(assetId);
    
    sendResponse(res, StatusCodes.OK, "Asset allocation history retrieved", { history });
});

// Revoke (return) an active allocation — sets asset back to available
export const revokeAllocation = CatchAsync(async (req, res) => {
    const { allocationId } = req.params;
    const allocation = await allocationService.returnAssetService(allocationId, 'revoked by admin', req.user.userid);
    sendResponse(res, StatusCodes.OK, "Asset revoked and marked available", { allocation });
});

// Admin direct transfer: move an allocated asset to a different employee
export const directTransfer = CatchAsync(async (req, res) => {
    const { assetId, toEmployeeId, expectedReturnDate } = req.body;
    const transferredBy = req.user.userid;
    const allocation = await allocationService.directTransferService(assetId, toEmployeeId, transferredBy, expectedReturnDate);
    sendResponse(res, StatusCodes.CREATED, "Asset transferred successfully", { allocation });
});

