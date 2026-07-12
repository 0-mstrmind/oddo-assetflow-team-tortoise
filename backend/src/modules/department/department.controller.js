import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ActivityLog from "../activityLog/activityLog.model.js";
import {
  createDepartmentService,
  getDepartmentsService,
  getDepartmentByIdService,
  updateDepartmentService,
  deleteDepartmentService
} from "./department.service.js";

// Helper function to log activities
const logActivity = async (userId, action, entity, entityId, description) => {
  try {
    await ActivityLog.create({
      userId,
      action,
      entity,
      entityId,
      description
    });
  } catch (error) {
    console.error("Failed to log activity:", error);
  }
};

// Create a department
export const createDepartment = CatchAsync(async (req, res) => {
  const department = await createDepartmentService(req.body);
  await logActivity(
    req.user.userid,
    "CREATE",
    "Department",
    department._id,
    `Department ${department.name} created`
  );
  sendResponse(res, StatusCodes.CREATED, "Department created successfully", { department });
});

// Retrieve all departments
export const getDepartments = CatchAsync(async (req, res) => {
  const departments = await getDepartmentsService();
  sendResponse(res, StatusCodes.OK, "Departments retrieved successfully", { departments });
});

// Retrieve department by ID
export const getDepartmentById = CatchAsync(async (req, res) => {
  const department = await getDepartmentByIdService(req.params.id);
  sendResponse(res, StatusCodes.OK, "Department retrieved successfully", { department });
});

// Update department details
export const updateDepartment = CatchAsync(async (req, res) => {
  const department = await updateDepartmentService(req.params.id, req.body);
  await logActivity(
    req.user.userid,
    "UPDATE",
    "Department",
    department._id,
    `Department ${department.name} updated`
  );
  sendResponse(res, StatusCodes.OK, "Department updated successfully", { department });
});

// Delete department
export const deleteDepartment = CatchAsync(async (req, res) => {
  const department = await deleteDepartmentService(req.params.id);
  await logActivity(
    req.user.userid,
    "DELETE",
    "Department",
    req.params.id,
    `Department ${department.name} deleted`
  );
  sendResponse(res, StatusCodes.OK, "Department deleted successfully");
});
