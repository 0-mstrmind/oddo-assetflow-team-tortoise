import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ActivityLog from "../activityLog/activityLog.model.js";
import {
  createDepartmentService,
  getDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService,
  createAssetCategoryService,
  getAssetCategoriesService,
  getAssetCategoryByIdService,
  updateAssetCategoryService,
  deleteAssetCategoryService,
  createAuditCycleService,
  getAuditCyclesService,
  getAuditCycleByIdService,
  updateAuditCycleService,
  deleteAuditCycleService,
  getEmployeesService,
  updateEmployeeAssignmentService,
  getDashboardAnalyticsService
} from "./admin.service.js";

// Helper function to log activities
const logActivity = async (userId, action, entity, entityId) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entity,
      entityId
    });
  } catch (error) {
    // Fail silently to prevent interrupting main request flow
    console.error("Failed to log activity:", error);
  }
};

// Analytics Controller

export const getDashboardAnalytics = CatchAsync(async (req, res) => {
  const analytics = await getDashboardAnalyticsService();
  sendResponse(res, StatusCodes.OK, "Dashboard analytics retrieved successfully", analytics);
});

// Departments Controllers

export const createDepartment = CatchAsync(async (req, res) => {
  const department = await createDepartmentService(req.body);
  await logActivity(req.user.id, "CREATE", "Department", department._id);
  sendResponse(res, StatusCodes.CREATED, "Department created successfully", { department });
});

export const getDepartments = CatchAsync(async (req, res) => {
  const departments = await getDepartmentsService();
  sendResponse(res, StatusCodes.OK, "Departments retrieved successfully", { departments });
});

export const getDepartmentById = CatchAsync(async (req, res) => {
  const department = await getDepartmentByIdService(req.params.id);
  sendResponse(res, StatusCodes.OK, "Department retrieved successfully", { department });
});

export const updateDepartment = CatchAsync(async (req, res) => {
  const department = await updateDepartmentService(req.params.id, req.body);
  await logActivity(req.user.id, "UPDATE", "Department", department._id);
  sendResponse(res, StatusCodes.OK, "Department updated successfully", { department });
});

export const deleteDepartment = CatchAsync(async (req, res) => {
  await deleteDepartmentService(req.params.id);
  await logActivity(req.user.id, "DELETE", "Department", req.params.id);
  sendResponse(res, StatusCodes.OK, "Department deleted successfully");
});

// Asset Categories Controllers

export const createAssetCategory = CatchAsync(async (req, res) => {
  const category = await createAssetCategoryService(req.body);
  await logActivity(req.user.id, "CREATE", "AssetCategory", category._id);
  sendResponse(res, StatusCodes.CREATED, "Asset category created successfully", { category });
});

export const getAssetCategories = CatchAsync(async (req, res) => {
  const categories = await getAssetCategoriesService();
  sendResponse(res, StatusCodes.OK, "Asset categories retrieved successfully", { categories });
});

export const getAssetCategoryById = CatchAsync(async (req, res) => {
  const category = await getAssetCategoryByIdService(req.params.id);
  sendResponse(res, StatusCodes.OK, "Asset category retrieved successfully", { category });
});

export const updateAssetCategory = CatchAsync(async (req, res) => {
  const category = await updateAssetCategoryService(req.params.id, req.body);
  await logActivity(req.user.id, "UPDATE", "AssetCategory", category._id);
  sendResponse(res, StatusCodes.OK, "Asset category updated successfully", { category });
});

export const deleteAssetCategory = CatchAsync(async (req, res) => {
  await deleteAssetCategoryService(req.params.id);
  await logActivity(req.user.id, "DELETE", "AssetCategory", req.params.id);
  sendResponse(res, StatusCodes.OK, "Asset category deleted successfully");
});

// Audit Cycles Controllers

export const createAuditCycle = CatchAsync(async (req, res) => {
  const cycle = await createAuditCycleService(req.body);
  await logActivity(req.user.id, "CREATE", "AuditCycle", cycle._id);
  sendResponse(res, StatusCodes.CREATED, "Audit cycle created successfully", { cycle });
});

export const getAuditCycles = CatchAsync(async (req, res) => {
  const cycles = await getAuditCyclesService();
  sendResponse(res, StatusCodes.OK, "Audit cycles retrieved successfully", { cycles });
});

export const getAuditCycleById = CatchAsync(async (req, res) => {
  const cycle = await getAuditCycleByIdService(req.params.id);
  sendResponse(res, StatusCodes.OK, "Audit cycle retrieved successfully", { cycle });
});

export const updateAuditCycle = CatchAsync(async (req, res) => {
  const cycle = await updateAuditCycleService(req.params.id, req.body);
  await logActivity(req.user.id, "UPDATE", "AuditCycle", cycle._id);
  sendResponse(res, StatusCodes.OK, "Audit cycle updated successfully", { cycle });
});

export const deleteAuditCycle = CatchAsync(async (req, res) => {
  await deleteAuditCycleService(req.params.id);
  await logActivity(req.user.id, "DELETE", "AuditCycle", req.params.id);
  sendResponse(res, StatusCodes.OK, "Audit cycle deleted successfully");
});

// Employee/Role Assignment Controllers

export const getEmployees = CatchAsync(async (req, res) => {
  const employees = await getEmployeesService();
  sendResponse(res, StatusCodes.OK, "Employees retrieved successfully", { employees });
});

export const updateEmployeeAssignment = CatchAsync(async (req, res) => {
  const employee = await updateEmployeeAssignmentService(req.params.id, req.body);
  await logActivity(req.user.id, "ASSIGN_ROLE_DEPT", "User", employee._id);
  sendResponse(res, StatusCodes.OK, "Employee assignment updated successfully", { employee });
});
