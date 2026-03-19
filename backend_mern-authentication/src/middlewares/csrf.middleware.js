import { redisClient } from '../lib/redis.js';
import { generateCsrfToken, revokeCsrfToken } from '../helpers/generateCsrfToken.js';

export const verifyCsrfToken = async (req, res, next) => {
    try {
        if(req.method === "GET") return next();

        const userId = req.user?._id;
        if(!userId) return res.status(401).json({
            success: false,
            message: "User not authenticated"
        });

        const clientToken = 
            req.headers["x-csrf-token"] || 
            req.headers["x-xsrf-token"] || 
            req.headers["csrf-token"];

        if(!clientToken){
            return res.status(403).json({
                success: false,
                message: "CSRF token missing. Please refresh the page",
                code: "CSRF_TOKEN_MISSING"
            });
        }

        const csrfKey = `csrf:${userId}`;
        const storedCsrfToken = await redisClient.get(csrfKey);

        if(!storedCsrfToken)
            return res.status(403).json({
                success: false,
                message: "CSRF token exoired. Please try again.",
                code: "CSRF_TOKEN_EXPIRED"
            });

        if(storedCsrfToken !== clientToken)
            return res.status(403).json({
                success: false,
                message: "Invalid CSRF token. Please refresh the page",
                code: "CSRF_TOKEN_INVALID"
            });

        next();        
        
    } catch (error) {
        console.log("CSRF verification error");

        res.status(500).json({
                success: false,
                message: "CSRF verification failed",
                code: "CSRF_VERIFICATION_ERROR"
            })
    }
}