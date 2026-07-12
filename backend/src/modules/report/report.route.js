import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import {
  getUtilizationReport,
  getMaintenanceFrequencyReport,
  getMostUsedAssets,
  getIdleAssets,
  getMaintenanceDueReport
} from "./report.controller.js";

const router = express.Router();

// Enforce authentication and admin authorization globally for all report routes
router.use(protect);
router.use(restrictTo("admin"));

// Department utilization report
router.get("/utilization", getUtilizationReport);

// Maintenance frequency report
router.get("/maintenance", getMaintenanceFrequencyReport);

// Most used assets report
router.get("/most-used", getMostUsedAssets);

// Idle assets report
router.get("/idle", getIdleAssets);

// Maintenance due and retirement report
router.get("/maintenance-due", getMaintenanceDueReport);

export default router;
