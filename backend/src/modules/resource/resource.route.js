import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import * as controller from "./resource.controller.js";
import * as validation from "./resource.validation.js";

const router = express.Router();
router.use(protect);

// All authenticated users can view resources (for booking dropdown)
router.get("/", controller.getAllResources);
router.get("/:id", controller.getResourceById);

// Only admin/manager can manage resources
router.use(restrictTo("admin", "manager"));
router.post("/", validateBody(validation.createResourceSchema), controller.createResource);
router.patch("/:id", validateBody(validation.updateResourceSchema), controller.updateResource);
router.delete("/:id", controller.deleteResource);

export default router;
