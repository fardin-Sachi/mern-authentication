import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.config.js";
import { redisClient } from "../lib/redis.js";
import User from "../models/user.model.js";

export const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) {
      return res.status(403).json({
        success: false,
        message: "Please Login - No token provided",
      });
    }

    const decodedToken = jwt.verify(token, JWT_SECRET);
    if (!decodedToken?.id) {
      return res.status(403).json({
        success: false,
        message: "Invalid token",
      });
    }

    const cachedUser = await redisClient.get(`user:${decodedToken.id}`);
    if (cachedUser) {
      req.user = JSON.parse(cachedUser);
      return next();
    }

    const user = await User.findById(decodedToken.id).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    await redisClient.setEx(`user:${user._id}`, 60 * 60, JSON.stringify(user));

    req.user = user;
    next();
  } catch (error) {
    if (
      error.name === "TokenExpiredError" ||
      error.name === "JsonWebTokenError"
    ) {
      return res.status(403).json({
        success: false,
        message: "Invalid token 2",
      });
    }

    console.error("Error in authMiddleware:", error);

    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
