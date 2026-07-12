import express from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import { validateQuery, validateParams } from "../../core/middleware/validateRequest.middleware.js";
import {
  getUserNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead
} from "./notification.controller.js";
import {
  getNotificationsQuery,
  notificationIdParam
} from "./notification.validation.js";

const router = express.Router();

// Apply auth protection globally for all notification routes
router.use(protect);

// Retrieve user notifications (All, Alerts, Approvals, Bookings)
router.get("/", validateQuery(getNotificationsQuery), getUserNotifications);

// Mark all notifications as read
router.patch("/read-all", markAllNotificationsAsRead);

// Mark single notification as read
router.patch("/:id/read", validateParams(notificationIdParam), markNotificationAsRead);

export default router;
