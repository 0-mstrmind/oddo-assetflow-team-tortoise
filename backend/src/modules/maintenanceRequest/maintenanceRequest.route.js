import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import * as controller from "./maintenanceRequest.controller.js";
import * as validation from "./maintenanceRequest.validation.js";

const router = express.Router();
router.use(protect);

router.post("/", validateBody(validation.raiseMaintenanceSchema), controller.raiseMaintenance);
router.get("/my-requests", controller.getMyRequests);
router.get("/status/:status", controller.getRequestsByStatus);

router.use(restrictTo("admin", "manager"));
router.get("/", controller.getAllRequests);
router.patch("/:id/status", validateBody(validation.updateMaintenanceStatusSchema), controller.updateMaintenanceStatus);

export default router;
