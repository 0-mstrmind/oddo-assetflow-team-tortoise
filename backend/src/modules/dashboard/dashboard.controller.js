import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import { getDashboardMetricsService } from "./dashboard.service.js";

// Controller to retrieve dashboard metrics
export const getDashboardMetrics = CatchAsync(async (req, res) => {
  const metrics = await getDashboardMetricsService(req.user);
  sendResponse(res, StatusCodes.OK, "Dashboard metrics retrieved successfully", metrics);
});
