import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import {
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} from "./employee.controller.js";
import { updateEmployeeInput } from "./employee.validation.js";

const router = express.Router();

// Apply authentication protection globally for all employee routes
router.use(protect);

// Retrieve all employees
router.get("/", getEmployees);

// Retrieve single employee by ID
router.get("/:id", getEmployeeById);

// Update employee setup (restricted to admin)
router.patch("/:id", restrictTo("admin"), validateBody(updateEmployeeInput), updateEmployee);

// Delete employee (restricted to admin)
router.delete("/:id", restrictTo("admin"), deleteEmployee);

export default router;
