import express from "express";
import {
    loginUser,
    myProfile,
    registerUser, 
    verifyOtp, 
    verifyUser,
    refreshToken,
    logoutUser,
    refreshCsrfToken
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { verifyCsrfToken } from "../middlewares/csrf.middleware.js";

const router = express.Router();


router.get("/verify-email/:token", verifyUser);

router.post("/login", loginUser);

router.post("/verify-login-otp", verifyOtp);

router.get("/me", authMiddleware, myProfile);

router.post("/refresh-token", refreshToken);

router.post("/refresh-csrf", authMiddleware, refreshCsrfToken)

router.post("/logout", authMiddleware, verifyCsrfToken, logoutUser);

router.post("/", registerUser);

export default router;