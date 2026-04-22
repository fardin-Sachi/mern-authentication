import crypto from 'crypto';
import { redisClient } from '../lib/redis.js';
import { NODE_ENV } from '../config/env.config.js';

export const generateCsrfToken = async(userId, res) => {
    const csrfToken = crypto.randomBytes(32).toString("hex");

    const csrfKey = `csrf:${userId}`;

    await redisClient.setEx(csrfKey, 3600, csrfToken);

    res.cookie("csrfToken", csrfToken, {
        httpOnly: false,
        secure: NODE_ENV==="production",
        sameSite: NODE_ENV==="production"? "none" : 'lax',
        maxAge: 60 * 60 * 1000
    })

    return csrfToken;
}

export const revokeCsrfToken = async (userId) => {
    const csrfKey = `csrf:${userId}`;
    await redisClient.del(csrfKey);
}

export const refreshCsrfToken = async (userId, res) => {
    await revokeCsrfToken(userId);
    return await generateCsrfToken(userId, res);
}