import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as transferService from "./transferRequest.service.js";
import { createNotificationService } from "../notification/notification.service.js";
import User from "../user/user.model.js";

export const requestTransfer = CatchAsync(async (req, res) => {
    const { assetId, reason, toEmployeeId } = req.body;
    const requestedBy = req.user.userid;
    // If toEmployeeId not provided, the requester is requesting the asset for themselves
    const targetEmployeeId = toEmployeeId || requestedBy;
    
    const transfer = await transferService.requestTransferService(assetId, targetEmployeeId, requestedBy, reason);

    // Notify all admins via role room + save a DB notification per admin
    try {
        const assetName = transfer.assetId?.name || 'an asset';
        const requesterName = req.user.name || 'An employee';
        const admins = await User.find({ role: 'admin' }, '_id').lean();

        await Promise.all(admins.map(admin =>
            createNotificationService({
                userId: admin._id,
                title: 'New Asset Request',
                message: `${requesterName} has requested ${assetName}. Please review and approve or reject.`,
                type: 'approval',
                room: 'role:admin',
            })
        ));
    } catch (err) {
        console.error('Failed to notify admins:', err.message);
    }

    sendResponse(res, StatusCodes.CREATED, "Asset request submitted successfully", { transfer });
});

export const updateTransferStatus = CatchAsync(async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const approvedBy = req.user.userid;
    
    const transfer = await transferService.approveOrRejectTransferService(id, status, approvedBy);

    // Notify the employee who raised the request
    try {
        const requesterId = transfer.requestedBy?._id || transfer.requestedBy;
        const assetName = transfer.assetId?.name || 'your requested asset';
        const isApproved = status === 'approved';

        if (requesterId) {
            await createNotificationService({
                userId: requesterId,
                title: isApproved ? 'Asset Request Approved ✅' : 'Asset Request Rejected ❌',
                message: isApproved
                    ? `Great news! Your request for ${assetName} has been approved and will be allocated to you.`
                    : `Your request for ${assetName} was rejected. Please contact your admin for more details.`,
                type: 'approval',
            });
        }
    } catch (err) {
        console.error('Failed to notify requester:', err.message);
    }

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

// Returns only pending transfer/asset requests (for admin review)
export const getPendingTransfers = CatchAsync(async (req, res) => {
    const transfers = await transferService.getAllTransfersService({ status: 'pending' });
    sendResponse(res, StatusCodes.OK, "Pending requests retrieved", { transfers });
});

