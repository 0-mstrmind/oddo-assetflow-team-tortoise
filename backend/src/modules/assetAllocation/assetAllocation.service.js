import AssetAllocation from "./assetAllocation.model.js";
import Asset from "../asset/asset.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const allocateAssetService = async (assetId, employeeId, allocatedBy, expectedReturnDate) => {
    // Check if asset exists
    const asset = await Asset.findById(assetId);
    if (!asset) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Asset not found");
    }

    // Conflict rule: You can't allocate an asset that's already taken
    if (asset.status !== 'available') {
        // Find who currently holds it to show in the error message
        const currentAllocation = await AssetAllocation.findOne({ 
            assetId, 
            status: { $in: ['active', 'overdue'] } 
        }).populate('employeeId', 'name email');
        
        let holderInfo = "another user";
        if (currentAllocation && currentAllocation.employeeId) {
            holderInfo = currentAllocation.employeeId.name || currentAllocation.employeeId.email;
        }
        
        throw new ApiError(
            StatusCodes.CONFLICT, 
            `Asset is currently held by ${holderInfo}. Please submit a Transfer Request instead.`
        );
    }

    // Allocate asset
    const allocation = new AssetAllocation({
        assetId,
        employeeId,
        allocatedBy,
        expectedReturnDate
    });

    await allocation.save();

    // Update asset status
    asset.status = 'allocated';
    await asset.save();

    return allocation;
};

export const returnAssetService = async (allocationId, returnCondition, returnedBy) => {
    const allocation = await AssetAllocation.findById(allocationId);
    if (!allocation) {
        throw new ApiError(StatusCodes.NOT_FOUND, "Allocation record not found");
    }

    if (allocation.status !== 'active' && allocation.status !== 'overdue') {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Asset is already returned");
    }

    // Mark as returned and capture condition check-in notes
    allocation.status = 'returned';
    allocation.returnedAt = new Date();
    allocation.returnCondition = returnCondition;
    await allocation.save();

    // Update asset status back to available
    const asset = await Asset.findById(allocation.assetId);
    if (asset) {
        asset.status = 'available';
        if (returnCondition) {
            asset.condition = returnCondition; // Update the condition notes on the asset itself
        }
        await asset.save();
    }

    return allocation;
};

export const getOverdueAllocationsService = async () => {
    // Overdue allocations are past Expected Return Date and still active
    const overdueAllocations = await AssetAllocation.find({
        status: { $in: ['active', 'overdue'] },
        expectedReturnDate: { $lt: new Date() }
    }).populate('assetId').populate('employeeId', 'name email');
    
    // Auto-flag them as overdue in the database if they are currently just 'active'
    const activeAndOverdue = overdueAllocations.filter(a => a.status === 'active');
    for (const alloc of activeAndOverdue) {
        alloc.status = 'overdue';
        await alloc.save();
    }

    return overdueAllocations;
};

export const getAllAllocationsService = async (query = {}) => {
    return await AssetAllocation.find(query)
        .populate('assetId')
        .populate('employeeId', 'name email')
        .populate('allocatedBy', 'name email');
};

export const getUserAllocationsService = async (userId) => {
    return await AssetAllocation.find({ employeeId: userId })
        .populate('assetId');
};

export const getAssetAllocationHistoryService = async (assetId) => {
    return await AssetAllocation.find({ assetId })
        .sort({ createdAt: -1 })
        .populate('employeeId', 'name email')
        .populate('allocatedBy', 'name email');
};

/**
 * Admin-initiated direct transfer: revoke from current holder, allocate to new employee.
 * Works for both allocated and any other active state.
 */
export const directTransferService = async (assetId, toEmployeeId, transferredBy, expectedReturnDate) => {
    const asset = await Asset.findById(assetId);
    if (!asset) throw new ApiError(StatusCodes.NOT_FOUND, 'Asset not found');

    // Close any active allocation
    const activeAllocation = await AssetAllocation.findOne({
        assetId,
        status: { $in: ['active', 'overdue'] },
    });

    if (activeAllocation) {
        activeAllocation.status = 'returned';
        activeAllocation.returnedAt = new Date();
        activeAllocation.returnCondition = 'transferred';
        await activeAllocation.save();
    }

    // Create new allocation for target employee
    const newAllocation = new AssetAllocation({
        assetId,
        employeeId: toEmployeeId,
        allocatedBy: transferredBy,
        expectedReturnDate: expectedReturnDate || undefined,
    });
    await newAllocation.save();

    // Keep asset status as allocated
    asset.status = 'allocated';
    await asset.save();

    return await AssetAllocation.findById(newAllocation._id)
        .populate('assetId', 'name assetTag')
        .populate('employeeId', 'name email')
        .populate('allocatedBy', 'name email');
};

