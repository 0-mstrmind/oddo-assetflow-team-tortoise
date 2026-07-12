import { StatusCodes } from "http-status-codes";
import CatchAsync from "../../shared/utils/CatchAsync.js";
import sendResponse from "../../shared/utils/ApiResponse.js";
import {
  createUserService,
  getUserService,
  loginUserService,
  logoutService,
  refreshTokenService,
  getUsersByRoleService,
  getUsersByDepartmentService,
} from "./user.service.js";
import ApiError from "../../shared/utils/ApiError.js";
import { setCookie } from "../../shared/utils/Token.js";

// Controller to create a new user
export const registerUser = CatchAsync(async (req, res) => {
  const { name, email, password } = req.body;

  const { user, accessToken, refreshToken } = await createUserService({
    name,
    email,
    password,
  });

  setCookie(res, "accessToken", accessToken);
  setCookie(res, "refreshToken", refreshToken);

  sendResponse(res, StatusCodes.CREATED, "User created successfully", {
    user,
    accessToken,
    refreshToken,
  });
});

// Controller to login user
export const loginUser = CatchAsync(async (req, res) => {
  const { email, password } = req.body;

  const { user, accessToken, refreshToken } = await loginUserService({
    email,
    password,
  });

  setCookie(res, "accessToken", accessToken);
  setCookie(res, "refreshToken", refreshToken);

  sendResponse(res, StatusCodes.OK, "Login successful", {
    user,
    accessToken,
    refreshToken,
  });
});

// Controller to get user by logged in User ID
export const getUser = CatchAsync(async (req, res, next) => {
  const userId = req.user.id;

  const user = await getUserService(userId);
  if (!user) return next(new ApiError(StatusCodes.NOT_FOUND, "User not found"));

  sendResponse(res, StatusCodes.OK, "User retrieved successfully", { user });
});

// Controller to refresh access token
export const refreshToken = CatchAsync(async (req, res) => {
  const refreshToken = req.refreshToken;
  const userId = req.user.id;

  const { accessToken } = await refreshTokenService(userId, refreshToken);

  // Set cookie
  setCookie(res, "accessToken", accessToken);

  sendResponse(res, StatusCodes.OK, "Access token refreshed successfully", {
    accessToken,
  });
});

// Controller to logout user
export const logoutUser = CatchAsync(async (req, res) => {
  const userId = req.user.id;

  await logoutService(userId);

  // Clear both cookies
  res.clearCookie("accessToken");
  res.clearCookie("refreshToken");

  sendResponse(res, StatusCodes.OK, "Logout successful");
});

// Controller to get users by role (for UI dropdowns)
export const getUsersByRole = CatchAsync(async (req, res) => {
  const { role } = req.params;
  const users = await getUsersByRoleService(role);
  sendResponse(res, StatusCodes.OK, "Users retrieved", { users });
});

// Controller to get users by department
export const getUsersByDepartment = CatchAsync(async (req, res) => {
  const { deptId } = req.params;
  const users = await getUsersByDepartmentService(deptId);
  sendResponse(res, StatusCodes.OK, "Users retrieved", { users });
});
