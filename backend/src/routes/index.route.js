import express from "express";
import { StatusCodes } from "http-status-codes";
import { healthRateLimiter } from "../core/middleware/rateLimiter.js";

import authRoute from "../modules/user/user.route.js";
import adminRoute from "../modules/admin/admin.route.js";
import sendResponse from "../shared/utils/ApiResponse.js";

/* <NEATNODE_IMPORTS> */
// Reserved for NeatNode file generation. Do not remove or modify.
import assetAllocationRoute from "../modules/assetAllocation/assetAllocation.route.js";
import transferRequestRoute from "../modules/transferRequest/transferRequest.route.js";
import resourceBookingRoute from "../modules/resourceBooking/resourceBooking.route.js";
import maintenanceRequestRoute from "../modules/maintenanceRequest/maintenanceRequest.route.js";

// instance
const router = express.Router();

// Routes
// health check route with rate limiting
router.get("/health", healthRateLimiter, (req, res) => {
    sendResponse(res, StatusCodes.OK, "ALL IS WELL😂...");
});

router.use("/auth", authRoute);
router.use("/admin", adminRoute);

/* <NEATNODE_ROUTES> */
// Reserved for NeatNode file generation. Do not remove or modify.
router.use("/allocations", assetAllocationRoute);
router.use("/transfers", transferRequestRoute);
router.use("/bookings", resourceBookingRoute);
router.use("/maintenance", maintenanceRequestRoute);

export default router;
