import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import {
  getUtilizationReportService,
  getMaintenanceFrequencyService
} from "./report.service.js";

// Retrieve department asset utilization stats
export const getUtilizationReport = CatchAsync(async (req, res) => {
  const data = await getUtilizationReportService();
  sendResponse(res, StatusCodes.OK, "Department utilization report retrieved successfully", { data });
});

// Retrieve monthly maintenance request frequency stats
export const getMaintenanceFrequencyReport = CatchAsync(async (req, res) => {
  const data = await getMaintenanceFrequencyService();
  sendResponse(res, StatusCodes.OK, "Maintenance frequency report retrieved successfully", { data });
});
