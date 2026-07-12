import ActivityLog from "./activityLog.model.js";
import { getIO } from "../../core/socket/socket.config.js";

// Centralized helper to create a log and broadcast it
export const createActivityLogService = async (data) => {
    const log = await ActivityLog.create(data);
    
    // Populate the newly created log before broadcasting
    const populatedLog = await ActivityLog.findById(log._id)
        .populate("userId", "name email role");
        
    try {
        const io = getIO();
        io.emit("NEW_ACTIVITY", populatedLog);
    } catch (error) {
        console.error("Socket emit failed:", error.message);
    }
    
    return populatedLog;
};

export const getActivityLogsService = async (query = {}) => {
    return await ActivityLog.find(query)
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .limit(100); // Limit to last 100 logs for performance
};
