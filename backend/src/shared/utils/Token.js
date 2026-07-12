import jwt from "jsonwebtoken";
import { config } from "../../core/config/env.config.js";

// Generate Access Token
export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn,
  });
};

// Generate Refresh Token
export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn,
  });
};

// Verify Access Token
export const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.accessSecret);
  } catch (error) {
    return null;
  }
};

export const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, config.jwt.refreshSecret);
  } catch (error) {
    return null;
  }
};

// Set Cookie
export const setCookie = (res, name, value, options = {}) => {
  const isProd = config.nodeEnv === "production";
  const defaultOptions = {
    httpOnly: true,
    secure: isProd, // Must be true if sameSite is 'none'
    sameSite: isProd ? "none" : "lax", // 'none' allows cross-origin cookies in production
  };

  res.cookie(name, value, {
    ...defaultOptions,
    ...options,
  });
};
