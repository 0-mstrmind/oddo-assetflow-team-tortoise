import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as allocationService from "./assetAllocation.service.js";

export const allocateAsset = CatchAsync(async (req, res) => {
    const { assetId, employeeId, expectedReturnDate } = req.body;
    const allocatedBy = req.user.id; // From the protect middleware
    
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
    const returnedBy = req.user.id;
    
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
    // Only fetch allocations for the currently logged-in user
    const userId = req.user.id;
    const allocations = await allocationService.getUserAllocationsService(userId);
    
    sendResponse(res, StatusCodes.OK, "User allocations retrieved", { allocations });
});
