import TryCatch from "../middlewares/TryCatch.js";
import sanitize from "mongo-sanitize";
import {registerSchema} from "../lib/zod.js";
import { redisClient } from "../lib/redis.js";
import User from "../models/user.model.js";
import bcrypt from 'bcrypt';
import crypto from 'crypto'
import sendMail from "../helpers/sendMailer.js";
import { getVerifyEmailHtml } from "../config/verifyHtml.js";

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