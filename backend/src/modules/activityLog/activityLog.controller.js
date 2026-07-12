import { StatusCodes } from "http-status-codes";
import sendResponse from "../../shared/utils/ApiResponse.js";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import * as activityLogService from "./activityLog.service.js";

export const getActivityLogs = CatchAsync(async (req, res) => {
    // If user is not admin/manager, we could potentially restrict what they see, 
    // but for now we'll allow filtering via query parameters.
    const query = { ...req.query };
    
    // If standard employee, maybe only show their own logs (optional business logic)
    if (req.user.role === 'employee') {
        query.userId = req.user.id;
    }

    const logs = await activityLogService.getActivityLogsService(query);
    
    sendResponse(res, StatusCodes.OK, "Activity logs retrieved", { logs });
});
