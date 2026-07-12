import TransferRequest from "./transferRequest.model.js";
import AssetAllocation from "../assetAllocation/assetAllocation.model.js";
import Asset from "../asset/asset.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const requestTransferService = async (assetId, toEmployeeId, requestedBy, reason) => {
    const asset = await Asset.findById(assetId);
    if (!asset) throw new ApiError(StatusCodes.NOT_FOUND, "Asset not found");

    // Auto-detect the current holder (fromEmployeeId)
    const currentAllocation = await AssetAllocation.findOne({ assetId, status: { $in: ['active', 'overdue'] } });
    
    // If there is an active allocation, fromEmployeeId is the current holder
    // If there isn't, fromEmployeeId is null (representing a request for a new available asset)
    const fromEmployeeId = currentAllocation ? currentAllocation.employeeId : null;

    if (fromEmployeeId && fromEmployeeId.toString() === toEmployeeId.toString()) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "You cannot request an asset that is already allocated to you.");
    }

    const transfer = new TransferRequest({
        assetId,
        fromEmployeeId,
        toEmployeeId,
        requestedBy,
        reason
    });
    return await transfer.save();
};

export const approveOrRejectTransferService = async (transferId, status, approvedBy) => {
    const transfer = await TransferRequest.findById(transferId);
    if (!transfer) throw new ApiError(StatusCodes.NOT_FOUND, "Transfer request not found");
    if (transfer.status !== 'pending') throw new ApiError(StatusCodes.BAD_REQUEST, "Transfer request is already processed");

    transfer.status = status;
    
    if (status === 'approved') {
        transfer.approvedBy = approvedBy;
        
        const currentAllocation = await AssetAllocation.findOne({ assetId: transfer.assetId, employeeId: transfer.fromEmployeeId, status: { $in: ['active', 'overdue'] } });
        if (currentAllocation) {
            currentAllocation.status = 'returned';
            currentAllocation.returnedAt = new Date();
            await currentAllocation.save();
        }
        
        const newAllocation = new AssetAllocation({
            assetId: transfer.assetId,
            employeeId: transfer.toEmployeeId,
            allocatedBy: approvedBy,
        });
        await newAllocation.save();
    }
    
    return await transfer.save();
};

export const getAllTransfersService = async (query = {}) => {
    return await TransferRequest.find(query)
        .populate('assetId')
        .populate('fromEmployeeId', 'name email')
        .populate('toEmployeeId', 'name email')
        .populate('requestedBy', 'name email')
        .populate('approvedBy', 'name email');
};
