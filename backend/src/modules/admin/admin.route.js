import express from "express";
import { protect, restrictTo } from "../../core/middleware/auth.middleware.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import {
  getDashboardAnalytics,
  createDepartment,
  getDepartments,
  getDepartmentById,
  updateDepartment,
  deleteDepartment,
  createAssetCategory,
  getAssetCategories,
  getAssetCategoryById,
  updateAssetCategory,
  deleteAssetCategory,
  createAuditCycle,
  getAuditCycles,
  getAuditCycleById,
  updateAuditCycle,
  deleteAuditCycle,
  getEmployees,
  updateEmployeeAssignment
} from "./admin.controller.js";
import {
  createDepartmentInput,
  updateDepartmentInput,
  createAssetCategoryInput,
  updateAssetCategoryInput,
  createAuditCycleInput,
  updateAuditCycleInput,
  updateEmployeeAssignmentInput
} from "./admin.validation.js";

const router = express.Router();

// Enforce authentication and RBAC globally for all admin endpoints
router.use(protect);
router.use(restrictTo("admin"));

// Analytics/Dashboard
router.get("/analytics", getDashboardAnalytics);

// Departments
router.post("/departments", validateBody(createDepartmentInput), createDepartment);
router.get("/departments", getDepartments);
router.get("/departments/:id", getDepartmentById);
router.patch("/departments/:id", validateBody(updateDepartmentInput), updateDepartment);
router.delete("/departments/:id", deleteDepartment);

// Asset Categories
router.post("/categories", validateBody(createAssetCategoryInput), createAssetCategory);
router.get("/categories", getAssetCategories);
router.get("/categories/:id", getAssetCategoryById);
router.patch("/categories/:id", validateBody(updateAssetCategoryInput), updateAssetCategory);
router.delete("/categories/:id", deleteAssetCategory);

// Audit Cycles
router.post("/audit-cycles", validateBody(createAuditCycleInput), createAuditCycle);
router.get("/audit-cycles", getAuditCycles);
router.get("/audit-cycles/:id", getAuditCycleById);
router.patch("/audit-cycles/:id", validateBody(updateAuditCycleInput), updateAuditCycle);
router.delete("/audit-cycles/:id", deleteAuditCycle);

// Employee/Role Setup
router.get("/employees", getEmployees);
router.patch("/employees/:id/assignment", validateBody(updateEmployeeAssignmentInput), updateEmployeeAssignment);

export default router;
