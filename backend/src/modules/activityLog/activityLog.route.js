import express from "express";
import { protect } from "../../core/middleware/auth.middleware.js";
import * as controller from "./activityLog.controller.js";

const router = express.Router();

router.use(protect);

router.get("/", controller.getActivityLogs);

export default router;
