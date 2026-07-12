import bcrypt from "bcryptjs";
import { StatusCodes } from "http-status-codes";
import User from "./user.model.js";
import ApiError from "../../shared/utils/ApiError.js";
import {
  generateAccessToken,
  generateRefreshToken,
} from "../../shared/utils/Token.js";

import crypto from 'crypto';
import { sendVerificationEmail } from "../../shared/utils/email.service.js";

// Service to create a new user (Public Registration / Workspace Init)
export const createUserService = async ({ name, email, password }) => {
  // Check if workspace is already initialized (only first user can be created publicly)
  const userCount = await User.countDocuments();
  if (userCount > 0) {
    throw new ApiError(StatusCodes.FORBIDDEN, "Workspace already initialized. Registration is disabled. Please contact your administrator.");
  }

  // Check if user exists
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(StatusCodes.CONFLICT, "User already exists");

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate Verification Token
  const verificationToken = crypto.randomBytes(32).toString('hex');

  // Create user (first user gets 'admin' role automatically)
  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role: 'admin',
    verificationToken,
  });

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
    role: user.role,
  });

  const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);

  user.refreshToken = hashedRefreshToken;
  await user.save();

  // Send Email in background
  sendVerificationEmail(user.email, verificationToken).catch(console.error);

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.verificationToken;
  delete userObj.__v;
  delete userObj.createdAt;
  delete userObj.updatedAt;

  return { user: userObj, accessToken, refreshToken };
};

// Service to verify email
export const verifyEmailService = async (token) => {
  const user = await User.findOne({ verificationToken: token });
  if (!user) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired verification token");
  }

  user.isEmailVerified = true;
  user.verificationToken = undefined;
  await user.save();

  return { message: "Email verified successfully" };
};

// Service for Admin to create an employee
export const createEmployeeService = async ({ name, email, password, role, departmentId }) => {
  const existing = await User.findOne({ email });
  if (existing) throw new ApiError(StatusCodes.CONFLICT, "User already exists");

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    role,
    departmentId,
    isEmailVerified: true, // employees created by admin are implicitly verified
  });

  const userObj = user.toObject();
  delete userObj.password;
  delete userObj.__v;

  return { user: userObj };
};

// Service to login user
export const loginUserService = async ({ email, password }) => {
  // Find user by email
  const user = await User.findOne({ email });
  if (!user)
    throw new ApiError(StatusCodes.NOT_FOUND, "Invalid Email or password");

  // Check password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch)
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid email or Password"); // notice the capitals, can be used for testing else keep it consistent

  // Generate JWT token
  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  const refreshToken = generateRefreshToken({
    id: user._id,
    role: user.role,
  });

  const salt = await bcrypt.genSalt(10);
  const hashedRefreshToken = await bcrypt.hash(refreshToken, salt);
  user.refreshToken = hashedRefreshToken;
  await user.save();

  const userObj = user.toObject(); // Convert Mongoose document to plain object
  delete userObj.password; // Remove password field
  delete userObj.__v;
  delete userObj.createdAt;
  delete userObj.updatedAt;

  return { user: userObj, accessToken, refreshToken };
};

// Service to get user by ID
export const getUserService = async (userId) => {
  return await User.findById(userId)
    .select("-password -__v -createdAt -updatedAt")
    .lean();
};

// Service to refresh access token
export const refreshTokenService = async (userId, refreshToken) => {
  const user = await User.findById(userId).select("+refreshToken");

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }

  const isValidRefreshToken = await bcrypt.compare(refreshToken, user.refreshToken);

  if (!isValidRefreshToken) {
    throw new ApiError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
  }

  const accessToken = generateAccessToken({
    id: user._id,
    role: user.role,
  });

  return { accessToken };
};

// Service to logout user
export const logoutService = async (userId) => {
  const user = await User.findByIdAndUpdate(
    userId,
    { $unset: { refreshToken: "" } },
    { new: true },
  );

  if (!user) {
    throw new ApiError(StatusCodes.NOT_FOUND, "User not found");
  }
};

// Service to get users by role (for dropdown population)
export const getUsersByRoleService = async (role) => {
  return await User.find({ role, status: 'active' })
    .select("-password -refreshToken -__v")
    .populate("departmentId", "name");
};

// Service to get users by department
export const getUsersByDepartmentService = async (departmentId) => {
  return await User.find({ departmentId, status: 'active' })
    .select("-password -refreshToken -__v")
    .populate("departmentId", "name");
};
