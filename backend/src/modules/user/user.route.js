import express from "express";
import {
  protect,
  refreshTokenMiddleware,
} from "../../core/middleware/auth.middleware.js";
import {
  getUser,
  registerUser,
  loginUser,
  logoutUser,
  refreshToken,
  getUsersByRole,
  getUsersByDepartment,
  verifyEmail,
  resendVerification,
  createEmployee,
} from "./user.controller.js";
import { validateBody } from "../../core/middleware/validateRequest.middleware.js";
import { createUserInput, loginInput } from "./user.validation.js";
import { authRateLimiter } from "../../core/middleware/rateLimiter.js";

const router = express.Router();

// Login & register routes
router.post(
  "/register",
  authRateLimiter,
  validateBody(createUserInput),
  registerUser,
);
router.post("/login", authRateLimiter, validateBody(loginInput), loginUser);

// Protected route to get user details
router.get("/me", protect, getUser);

router.post("/logout", refreshTokenMiddleware, logoutUser);
router.post("/refresh", refreshTokenMiddleware, refreshToken);

// User lookup routes (protected, for UI dropdowns)
router.get("/role/:role", protect, getUsersByRole);
router.get("/department/:deptId", protect, getUsersByDepartment);

// Verify Email Route (public, accessed via email link)
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", authRateLimiter, resendVerification);

// Admin route to create an employee
import { restrictTo } from "../../core/middleware/auth.middleware.js";
router.post(
  "/admin/users",
  protect,
  restrictTo("admin", "manager"),
  authRateLimiter,
  createEmployee
);

export default router;
