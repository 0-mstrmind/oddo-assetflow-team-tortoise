import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { getDashboardMetrics } from "./dashboard.controller.js";

const router = express.Router();

// Enforce authentication for all dashboard routes
router.use(protect);

// Retrieve aggregated metrics for the dashboard
router.get("/metrics", getDashboardMetrics);

export default router;
