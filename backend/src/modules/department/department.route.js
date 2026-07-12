import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import {
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment
} from "./department.controller.js";
import {
  createDepartmentInput,
  updateDepartmentInput
} from "./department.validation.js";

const router = express.Router();

// Apply authentication protection globally for all department routes
router.use(protect);

// Retrieve all departments
router.get("/", getDepartments);

// Retrieve single department by ID
router.get("/:id", getDepartmentById);

// Create department (restricted to admin)
router.post("/", restrictTo("admin"), validateBody(createDepartmentInput), createDepartment);

// Update department (restricted to admin)
router.patch("/:id", restrictTo("admin"), validateBody(updateDepartmentInput), updateDepartment);

// Delete department (restricted to admin)
router.delete("/:id", restrictTo("admin"), deleteDepartment);

export default router;
