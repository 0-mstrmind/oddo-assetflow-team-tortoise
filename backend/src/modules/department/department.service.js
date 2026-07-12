import Department from "./department.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Create a new department
export const createDepartmentService = async (data) => {
  const existing = await Department.findOne({ name: data.name });
  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Department name already exists");
  }
  return await Department.create(data);
};

// Retrieve all departments
export const getDepartmentsService = async () => {
  return await Department.find()
    .populate("headId", "name email role")
    .populate("parentDepartmentId", "name");
};

// Retrieve a single department by ID
export const getDepartmentByIdService = async (id) => {
  const department = await Department.findById(id)
    .populate("headId", "name email role")
    .populate("parentDepartmentId", "name");
  if (!department) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
  }
  return department;
};

// Update department details
export const updateDepartmentService = async (id, data) => {
  if (data.name) {
    const existing = await Department.findOne({ name: data.name, _id: { $ne: id } });
    if (existing) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Department name already exists");
    }
  }
  const department = await Department.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!department) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
  }
  return department;
};

// Delete department from database
export const deleteDepartmentService = async (id) => {
  const department = await Department.findByIdAndDelete(id);
  if (!department) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
  }
  return department;
};
