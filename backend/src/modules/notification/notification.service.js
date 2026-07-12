import Notification from "./notification.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";
import { getIO } from "../../core/socket/socket.config.js";

/**
 * Create a notification in DB and deliver it live via socket to a specific user or role room.
 * @param {Object} opts
 * @param {string} opts.userId      - Target user _id (ObjectId string)
 * @param {string} opts.title       - Short notification title
 * @param {string} opts.message     - Notification body text
 * @param {'info'|'approval'|'alert'|'booking'} opts.type - Notification type
 * @param {string} [opts.room]      - Override socket room (e.g. 'role:admin'). Defaults to 'user:{userId}'
 */
export const createNotificationService = async ({ userId, title, message, type = 'info', room }) => {
  const notification = await Notification.create({ userId, title, message, type });

  try {
    const io = getIO();
    const targetRoom = room || `user:${userId}`;
    io.to(targetRoom).emit("NEW_NOTIFICATION", {
      _id: notification._id,
      userId,
      title,
      message,
      type,
      isRead: false,
      createdAt: notification.createdAt,
    });
  } catch (err) {
    console.error("Socket notification emit failed:", err.message);
  }

  return notification;
};

// Retrieve notifications for a specific user
export const getNotificationsService = async (userId, type) => {
  const query = { userId };
  if (type) {
    query.type = type;
  }

  const list = await Notification.find(query).sort({ createdAt: -1 });
  return list;
};

// Mark a single notification as read
export const markAsReadService = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
  }

  return notification;
};

// Mark all notifications as read for a user
export const markAllAsReadService = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { success: true };
};
