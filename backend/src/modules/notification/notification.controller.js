import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import {
  getNotificationsService,
  markAsReadService,
  markAllAsReadService
} from "./notification.service.js";

// Fetch current user notifications
export const getUserNotifications = CatchAsync(async (req, res) => {
  const notifications = await getNotificationsService(req.user.userid, req.query.type);
  sendResponse(res, StatusCodes.OK, "Notifications retrieved successfully", { notifications });
});

// Mark single notification as read
export const markNotificationAsRead = CatchAsync(async (req, res) => {
  const notification = await markAsReadService(req.params.id, req.user.userid);
  sendResponse(res, StatusCodes.OK, "Notification marked as read successfully", { notification });
});

// Mark all notifications as read
export const markAllNotificationsAsRead = CatchAsync(async (req, res) => {
  await markAllAsReadService(req.user.userid);
  sendResponse(res, StatusCodes.OK, "All notifications marked as read successfully");
});
