import MaintenanceRequest from "./maintenanceRequest.model.js";
import Asset from "../asset/asset.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

export const raiseMaintenanceService = async (assetId, requestedBy, priority, issue) => {
    const asset = await Asset.findById(assetId);
    if (!asset) throw new ApiError(StatusCodes.NOT_FOUND, "Asset not found");

    const request = new MaintenanceRequest({
        assetId,
        requestedBy,
        priority,
        issue,
    });

    return await request.save();
};

export const updateMaintenanceStatusService = async (requestId, status, updatedBy, technicianId) => {
    const request = await MaintenanceRequest.findById(requestId);
    if (!request) throw new ApiError(StatusCodes.NOT_FOUND, "Maintenance request not found");

    const asset = await Asset.findById(request.assetId);

    // Business Logic for Status Changes
    if (status === 'approved') {
        request.approvedBy = updatedBy;
        if (asset) {
            asset.status = 'maintenance'; // Auto-update asset state
            await asset.save();
        }
    } else if (status === 'in-progress') {
        if (!technicianId) throw new ApiError(StatusCodes.BAD_REQUEST, "Technician must be assigned when in-progress");
        request.technicianId = technicianId;
    } else if (status === 'resolved' || status === 'cancelled') {
        if (status === 'resolved') {
            request.resolvedAt = new Date();
        }
        if (asset && asset.status === 'maintenance') {
            asset.status = 'available'; // Revert back to available
            await asset.save();
        }
    }

    request.status = status;
    return await request.save();
};

export const getAllMaintenanceRequestsService = async (query = {}) => {
    return await MaintenanceRequest.find(query)
        .populate('assetId')
        .populate('requestedBy', 'name email')
        .populate('approvedBy', 'name email')
        .populate('technicianId', 'name email');
};
