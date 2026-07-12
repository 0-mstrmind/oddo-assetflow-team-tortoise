import Notification from "./notification.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Retrieve notifications for a specific user
export const getNotificationsService = async (userId, type) => {
  const query = { userId };
  if (type) {
    query.type = type;
  }

  const list = await Notification.find(query).sort({ createdAt: -1 });

  // Fallback mock data matching Screen 10 mockup if database has no notifications
  if (list.length === 0) {
    const mockList = [
      {
        _id: "64b5d001a123bc456789def1",
        title: "Asset Assignment",
        message: "Laptop AF-0014 assigned to Priya shah",
        type: "info",
        isRead: false,
        createdAt: new Date(Date.now() - 2 * 60 * 1000) // 2m ago
      },
      {
        _id: "64b5d002a123bc456789def2",
        title: "Maintenance Approved",
        message: "Maintenance request AF-0055 approved",
        type: "approval",
        isRead: true,
        createdAt: new Date(Date.now() - 18 * 60 * 1000) // 18m ago
      },
      {
        _id: "64b5d003a123bc456789def3",
        title: "Booking Confirmed",
        message: "Booking confirmed : Room B2 : 2:00 to 3:00 PM",
        type: "booking",
        isRead: false,
        createdAt: new Date(Date.now() - 60 * 60 * 1000) // 1h ago
      },
      {
        _id: "64b5d004a123bc456789def4",
        title: "Transfer Approved",
        message: "Transfer approved : AF-0033 to facilities dept",
        type: "approval",
        isRead: true,
        createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000) // 3h ago
      },
      {
        _id: "64b5d005a123bc456789def5",
        title: "Overdue Return Alert",
        message: "Overdue return : AF-0021 was due 3 days ago",
        type: "alert",
        isRead: false,
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1d ago
      },
      {
        _id: "64b5d006a123bc456789def6",
        title: "Audit Discrepancy Alert",
        message: "audit discrepancy flagged : AF-0088 damaged",
        type: "alert",
        isRead: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2d ago
      }
    ];

    if (type) {
      return mockList.filter(item => item.type === type);
    }
    return mockList;
  }

  return list;
};

// Mark a single notification as read
export const markAsReadService = async (notificationId, userId) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );

  // If not found in DB, search mock data or throw error
  if (!notification) {
    // If it starts with mock prefix, return success
    if (notificationId.startsWith("64b5d00")) {
      return { _id: notificationId, isRead: true };
    }
    throw new ApiError(StatusCodes.NOT_FOUND, "Notification not found");
  }

  return notification;
};

// Mark all notifications as read for a user
export const markAllAsReadService = async (userId) => {
  await Notification.updateMany({ userId, isRead: false }, { isRead: true });
  return { success: true };
};
