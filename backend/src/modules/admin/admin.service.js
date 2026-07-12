import Department from "../department/department.model.js";
import AssetCategory from "../assetCategory/assetCategory.model.js";
import Asset from "../asset/asset.model.js";
import AssetAllocation from "../assetAllocation/assetAllocation.model.js";
import TransferRequest from "../transferRequest/transferRequest.model.js";
import Resource from "../resource/resource.model.js";
import ResourceBooking from "../resourceBooking/resourceBooking.model.js";
import AuditCycle from "../auditCycle/auditCycle.model.js";
import User from "../user/user.model.js";
import ActivityLog from "../activityLog/activityLog.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import { StatusCodes } from "http-status-codes";

// Departments Services

export const createDepartmentService = async (data) => {
  const existing = await Department.findOne({ name: data.name });
  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Department name already exists");
  }
  return await Department.create(data);
};

export const getDepartmentsService = async () => {
  return await Department.find()
    .populate("headId", "name email role")
    .populate("parentDepartmentId", "name");
};

export const getDepartmentByIdService = async (id) => {
  const department = await Department.findById(id)
    .populate("headId", "name email role")
    .populate("parentDepartmentId", "name");
  if (!department) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
  }
  return department;
};

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

export const deleteDepartmentService = async (id) => {
  const department = await Department.findByIdAndDelete(id);
  if (!department) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Department not found");
  }
  return department;
};

// Asset Categories Services

export const createAssetCategoryService = async (data) => {
  const existing = await AssetCategory.findOne({ name: data.name });
  if (existing) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Asset category already exists");
  }
  return await AssetCategory.create(data);
};

export const getAssetCategoriesService = async () => {
  return await AssetCategory.find();
};

export const getAssetCategoryByIdService = async (id) => {
  const category = await AssetCategory.findById(id);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset category not found");
  }
  return category;
};

export const updateAssetCategoryService = async (id, data) => {
  if (data.name) {
    const existing = await AssetCategory.findOne({ name: data.name, _id: { $ne: id } });
    if (existing) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Asset category already exists");
    }
  }
  const category = await AssetCategory.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset category not found");
  }
  return category;
};

export const deleteAssetCategoryService = async (id) => {
  const category = await AssetCategory.findByIdAndDelete(id);
  if (!category) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Asset category not found");
  }
  return category;
};

// Audit Cycles Services

export const createAuditCycleService = async (data) => {
  return await AuditCycle.create(data);
};

export const getAuditCyclesService = async () => {
  return await AuditCycle.find();
};

export const getAuditCycleByIdService = async (id) => {
  const cycle = await AuditCycle.findById(id);
  if (!cycle) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Audit cycle not found");
  }
  return cycle;
};

export const updateAuditCycleService = async (id, data) => {
  const cycle = await AuditCycle.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!cycle) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Audit cycle not found");
  }
  return cycle;
};

export const deleteAuditCycleService = async (id) => {
  const cycle = await AuditCycle.findByIdAndDelete(id);
  if (!cycle) {
    throw new ApiError(StatusCodes.NOT_FOUND, "Audit cycle not found");
  }
  return cycle;
};

// Employee Role & Department Assignment Services

export const getEmployeesService = async () => {
  return await User.find({}, "-password")
    .populate("departmentId", "name");
};

export const updateEmployeeAssignmentService = async (employeeId, data) => {
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

// Dashboard & Analytics Service

export const getDashboardAnalyticsService = async () => {
  const now = new Date();

  // Counts for Assets
  const availableAssets = await Asset.countDocuments({ status: "available" });
  const allocatedAssets = await Asset.countDocuments({ status: "allocated" });

  // Counts for Resources
  const availableResources = await Resource.countDocuments({ status: "available" });
  const activeBookings = await ResourceBooking.countDocuments({
    status: "confirmed",
    startTime: { $lte: now },
    endTime: { $gte: now }
  });

  // Transfers
  const pendingTransfers = await TransferRequest.countDocuments({ status: "pending" });

  // Upcoming and Overdue returns
  const upcomingReturns = await AssetAllocation.countDocuments({
    status: "active",
    expectedReturnDate: { $gte: now }
  });

  const overdueReturns = await AssetAllocation.countDocuments({
    status: "active",
    expectedReturnDate: { $lt: now }
  });

  // Recent Activities
  const recentActivities = await ActivityLog.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate("userId", "name email");

  return {
    overview: {
      availableAssets,
      allocatedAssets,
      availableResources,
      activeBookings,
      pendingTransfers,
      upcomingReturns,
      overdueReturns,
    },
    recentActivities
  };
};
