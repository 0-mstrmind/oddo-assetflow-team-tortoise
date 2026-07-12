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

// Export report as CSV download
export const exportReport = CatchAsync(async (req, res) => {
  const { type = "utilization" } = req.query;
  let reportData = [];
  const filename = `${type}_report.csv`;

  switch (type) {
    case "utilization":
      reportData = await getUtilizationReportService();
      break;
    case "maintenance":
      reportData = await getMaintenanceFrequencyService();
      break;
    case "most-used":
      reportData = await getMostUsedAssetsService();
      break;
    case "idle":
      reportData = await getIdleAssetsService();
      break;
    case "maintenance-due":
      reportData = await getMaintenanceDueService();
      break;
    default:
      reportData = await getUtilizationReportService();
  }

  if (reportData.length === 0) {
    reportData = [{ message: "No data available for this report" }];
  }

  // Format reports that contain mongoose sub-documents/objects for CSV conversion
  const formattedData = reportData.map(item => {
    const obj = {};
    Object.keys(item).forEach(key => {
      if (typeof item[key] === "object" && item[key] !== null) {
        obj[key] = item[key].name || item[key]._id || JSON.stringify(item[key]);
      } else {
        obj[key] = item[key];
      }
    });
    return obj;
  });

  const headers = Object.keys(formattedData[0]);
  const csvRows = [headers.join(",")];

  for (const row of formattedData) {
    const values = headers.map(header => {
      let val = row[header];
      if (val === null || val === undefined) val = "";
      const escaped = ('' + val).replace(/"/g, '""');
      return `"${escaped}"`;
    });
    csvRows.push(values.join(","));
  }

  const csvContent = csvRows.join("\r\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename=${filename}`);
  res.status(StatusCodes.OK).send(csvContent);
});
