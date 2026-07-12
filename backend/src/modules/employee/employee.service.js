import User from "../user/user.model.js";
import Department from "../department/department.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Retrieve all employees
export const getAllEmployeesService = async () => {
  return await User.find({}, "-password")
    .populate("departmentId", "name");
};

// Retrieve a single employee by ID
export const getEmployeeByIdService = async (id) => {
  const employee = await User.findById(id, "-password")
    .populate("departmentId", "name");
  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Employee not found");
  }
  return employee;
};

// Update employee assignments (role, department, status)
export const updateEmployeeService = async (employeeId, data) => {
  const employee = await User.findById(employeeId);
  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Employee not found");
  }

  if (data.departmentId) {
    const deptExists = await Department.findById(data.departmentId);
    if (!deptExists) {
      throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
    }
  }

  return await User.findByIdAndUpdate(employeeId, data, { new: true, runValidators: true }).select("-password");
};

// Delete employee from database
export const deleteEmployeeService = async (id) => {
  const employee = await User.findByIdAndDelete(id);
  if (!employee) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Employee not found");
  }
  return employee;
};
