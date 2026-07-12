import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import {
  getUtilizationReportService,
  getMaintenanceFrequencyService,
  getMostUsedAssetsService,
  getIdleAssetsService,
  getMaintenanceDueService
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

// Retrieve most used assets report
export const getMostUsedAssets = CatchAsync(async (req, res) => {
  const data = await getMostUsedAssetsService();
  sendResponse(res, StatusCodes.OK, "Most used assets report retrieved successfully", { data });
});

// Retrieve idle assets report
export const getIdleAssets = CatchAsync(async (req, res) => {
  const data = await getIdleAssetsService();
  sendResponse(res, StatusCodes.OK, "Idle assets report retrieved successfully", { data });
});

// Retrieve assets due for maintenance or nearing retirement
export const getMaintenanceDueReport = CatchAsync(async (req, res) => {
  const data = await getMaintenanceDueService();
  sendResponse(res, StatusCodes.OK, "Maintenance due and retirement report retrieved successfully", { data });
});
