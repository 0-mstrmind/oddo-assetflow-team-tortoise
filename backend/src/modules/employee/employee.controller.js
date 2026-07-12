import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import ActivityLog from "../activityLog/activityLog.model.js";
import {
  getAllEmployeesService,
  getEmployeeByIdService,
  updateEmployeeService,
  deleteEmployeeService
} from "./employee.service.js";

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

// Retrieve all employees
export const getEmployees = CatchAsync(async (req, res) => {
  const employees = await getAllEmployeesService();
  sendResponse(res, StatusCodes.OK, "Employees retrieved successfully", { employees });
});

// Retrieve single employee by ID
export const getEmployeeById = CatchAsync(async (req, res) => {
  const employee = await getEmployeeByIdService(req.params.id);
  sendResponse(res, StatusCodes.OK, "Employee retrieved successfully", { employee });
});

// Update employee assignment (role, department, status)
export const updateEmployee = CatchAsync(async (req, res) => {
  const employee = await updateEmployeeService(req.params.id, req.body);
  await logActivity(
    req.user.userid,
    "ASSIGN_ROLE_DEPT",
    "User",
    employee._id,
    `Employee ${employee.name} setup updated`
  );
  sendResponse(res, StatusCodes.OK, "Employee assignment updated successfully", { employee });
});

// Delete employee
export const deleteEmployee = CatchAsync(async (req, res) => {
  const employee = await deleteEmployeeService(req.params.id);
  await logActivity(
    req.user.userid,
    "DELETE",
    "User",
    req.params.id,
    `Employee ${employee.name} removed`
  );
  sendResponse(res, StatusCodes.OK, "Employee deleted successfully");
});
