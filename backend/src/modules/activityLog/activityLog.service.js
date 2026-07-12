import ActivityLog from "./activityLog.model.js";

// Optional centralized helper to create a log (though other controllers currently implement it manually)
export const createActivityLogService = async (data) => {
    return await ActivityLog.create(data);
};

export const getActivityLogsService = async (query = {}) => {
    return await ActivityLog.find(query)
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .limit(100); // Limit to last 100 logs for performance
};
