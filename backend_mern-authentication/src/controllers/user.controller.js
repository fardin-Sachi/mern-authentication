import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import {loginSchema, registerSchema} from "../lib/zod.js";
import { redisClient } from "../lib/redis.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto'
import sendMail from "../helpers/sendMailer.js";
import { getOtpHtml, getVerifyEmailHtml } from "../utils/verifyHtml.js";
import { generateAccessToken, generateToken, revokeRefreshToken, verifyRefreshToken } from "../helpers/generateToken.js";

export const registerUser = TryCatch(async (req, res) => {
    const sanitizedBody = sanitize(req.body);

    const validation = registerSchema.safeParse(sanitizedBody);

    if(!validation.success) {
        const zodError = validation.error;

        let errorMessage = "Validation failed";
        let allErrors = [];

        if(zodError?.issues && Array.isArray(zodError.issues)) {
            allErrors = zodError.issues.map((issue) => ({
                field: issue.path? issue.path.join(".") : "unknown",
                message: issue.message || "Validation error",
                code: issue.code
            }));
            console.log(zodError.issues);

            errorMessage = allErrors[0]?.message || "Validation error";
        }

        return res.status(400).json({
            success: false,
            message: errorMessage,
            error: allErrors,
            data: {}
        });
    }

    const { name, email, password } = validation.data;

    const rateLimitKey = `register-rate-limit:${req.ip}:${email}`;

    if(await redisClient.get(rateLimitKey)){
        return res.status(429).json({
            success: false,
            message: "Too many requests, try again later"
        });
    }

    const existingUser = await User.findOne({email})
    if(existingUser){
        return res.status(400).json({
            success: false,
            message: "User already exists"
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const verifyToken = crypto.randomBytes(32).toString('hex');

    const verifyKey = `verify:${verifyToken}`;

    const dataToStore = JSON.stringify({
        name,
        email,
        password: hashedPassword
    });

    await redisClient.set(verifyKey, dataToStore, {EX: 300});

    const subject = `Verify your email for Account creation`;
    const html = getVerifyEmailHtml({
        email,
        token: verifyToken
    });

    await sendMail({
        email,
        subject,
        html
    });

    await redisClient.set(rateLimitKey, "true", {EX: 60});

    res.json({
        success: true,
        message: "If your email is valid, a verification link has been sent to your email. It will expire in 5 minutes"
    });
})

export const verifyUser = TryCatch(async (req, res) => {
    const {token} = req.params;
    if(!token){
        return res.status(400).json({
            message: "Verification token is required"
        })
    }

    const verifyKey = `verify:${token}`;

    const userDataJson = await redisClient.get(verifyKey);
    if(!userDataJson){
        return res.status(400).json({
            success: false,
            message: "Veritication link is expired"
        })
    }
    await redisClient.del(verifyKey);

    const userData = JSON.parse(userDataJson);

    const existingUser = await User.findOne({email: userData.email})
    if(existingUser){
        return res.status(400).json({
            success: false,
            message: "User already exists"
        });
    }

    const newUser = await User.create({
        name: userData.name,
        email: userData.email,
        password: userData.password
    });

    res.status(201).json({
        success: true,
        message: "Email verified successfully! Your account has been created",
        data: {
            userId: newUser._id,
            name: newUser.name,
            email: newUser.email
        }
    });
})

export const loginUser = TryCatch(async (req, res) => {
    const sanitizedBody = sanitize(req.body);

    const validation = loginSchema.safeParse(sanitizedBody);

    if(!validation.success) {
        const zodError = validation.error;

        let errorMessage = "Validation failed";
        let allErrors = [];

        if(zodError?.issues && Array.isArray(zodError.issues)) {
            allErrors = zodError.issues.map((issue) => ({
                field: issue.path? issue.path.join(".") : "unknown",
                message: issue.message || "Validation error",
                code: issue.code
            }));
            console.log(zodError.issues);

            errorMessage = allErrors[0]?.message || "Validation error";
        }

        return res.status(400).json({
            success: false,
            message: errorMessage,
            error: allErrors,
            data: {}
        });
    }
    const {email, password} = validation.data;

    const rateLimitKey = `login-rate-limit:${req.ip}:${email}`;
    if(await redisClient.get(rateLimitKey)){
        return res.status(429).json({
            success: false,
            message: "Too many requests, try again later"
        });
    }

    const user = await User.findOne({email});
    if(!user){
        return res.status(400).json({
            success: false,
            message: "User not found"
        });
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if(!isPasswordMatch){
        return res.status(400).json({
            success: false,
            message: "Invalid email or password"
        });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const otpKey = `otp:${email}`;
    await redisClient.set(otpKey, JSON.stringify(otp), {EX: 300});

    const subject = `Your OTP for login`;

    const html = getOtpHtml({email, otp});
    
    await sendMail({email, subject, html});

    await redisClient.set(rateLimitKey, "true", {EX: 60});

    res.json({
        success: true,
        message: "OTP has been sent to your email. It will expire in 5 minutes"
    });
})

export const verifyOtp = TryCatch(async (req, res) => {
    const {email, otp} = req.body;

    if(!email || !otp){
        return res.status(400).json({
            success: false,
            message: "Please provide an email and OTP"
        });
    }

    const otpKey = `otp:${email}`;

    const storedOtpString = await redisClient.get(otpKey);
    if(!storedOtpString){
        return res.status(400).json({
            success: false,
            message: "OTP expired"
        });
    }

    const storedOtp = JSON.parse(storedOtpString);
    if(String(storedOtp) !== String(otp)){
        return res.status(400).json({
            success: false,
            message: "Invalid OTP"
        });
    }

    await redisClient.del(otpKey);

    let user = await User.findOne({email});
    if(!user){
        return res.status(400).json({
            success: false,
            message: "User not found!"
        });
    }

    const tokenData = await generateToken(user._id, res);

    res.status(200).json({
            success: true,
            message: `Welcome ${user.name}! You have logged in successfully.`,
            data: {
                userId: user._id,
                name: user.name,
                email: user.email
            }
        });
})

export const myProfile = TryCatch(async (req, res) => {
    const user = req.user;

    res.status(200).json(user);
})

export const refreshToken = async (req, res) => {
    try {
        const refreshToken = req.cookies?.refreshToken;
    if(!refreshToken){
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
        });
    }

    const decoded = await verifyRefreshToken(refreshToken);
    if(!decoded) {
        return res.status(401).json({
            success: false,
            message: "Invalid refresh token"
        });
    }

    generateAccessToken(decoded.id, res);

    res.status(200).json({
        success: true,
        message: "Access token refreshed"
    })
    } catch (error) {
        console.error("Error in refreshing token:", error);
    }
}

export const logoutUser = async (req, res) => {
    try {
        const userId = req.user._id;

    await revokeRefreshToken(userId);

    res.clearCookie("refreshToken");
    res.clearCookie("accessToken");

    await redisClient.del(`user:${userId}`);

    res.status(200).json({
        success: true,
        message: "You have been logged out successfully."
    });
    } catch (error) {
        console.error("Error in logging out user:", error);
    }
    
}