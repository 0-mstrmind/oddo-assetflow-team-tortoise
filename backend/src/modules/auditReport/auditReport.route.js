import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import * as controller from "./auditReport.controller.js";

const router = express.Router();
router.use(protect);

// All authorized audit roles can view stored reports
router.get("/", restrictTo("admin", "manager", "auditor"), controller.listReports);

export default router;
