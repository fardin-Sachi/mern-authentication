import jwt from 'jsonwebtoken';
import { JWT_SECRET, NODE_ENV, REFRESH_TOKEN_SECRET } from '../config/env.config.js';
import { redisClient } from '../lib/redis.js';
import { generateCsrfToken, revokeCsrfToken } from './generateCsrfToken.js';
import crypto from 'crypto';

export const generateToken = async (id, res) => {
    const sessionId = crypto.randomBytes(16).toString("hex");

    const accessToken = jwt.sign(
        {
            id, 
            sessionId,
        },
        JWT_SECRET,
        {expiresIn: "15m"}
    );

    const refreshToken = jwt.sign(
        {
            id, 
            sessionId,
        },
        REFRESH_TOKEN_SECRET,
        {expiresIn: "7d"}
    );

    const refreshTokenKey = `refresh_token:${id}`;
    const activeSessionKey = `active_session:${id}`;
    const sessionDataKey = `session:${sessionId}`;

    const existingSession = await redisClient.get(activeSessionKey);
    if(existingSession){
        await redisClient.del(`session:${existingSession}`);
        await redisClient.del(refreshToken);
    }

    const sessionData = {
        userId: id,
        sessionId,
        createdAt: new Date().toISOString(),
        lastActivity: new Date().toISOString()
    }

    await redisClient.setEx(
        refreshTokenKey, 
        7*24*60*60, 
        refreshToken
    );
    await redisClient.setEx(
        sessionDataKey, 
        7*24*60*60, 
        JSON.stringify(sessionData)
    );

    await redisClient.setEx(activeSessionKey, 7*24*60*60, sessionId);

    res.cookie("accessToken", accessToken,{
        httpOnly: true,
        secure: NODE_ENV==="production",
        sameSite: NODE_ENV==="production"? "none" : "lax",
        maxAge: 15 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        secure: NODE_ENV==="production",
        sameSite: NODE_ENV==="production"? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    const csrfToken = await generateCsrfToken(id, res);

    return { 
        accessToken, 
        refreshToken, 
        csrfToken, 
        sessionId 
    };
}

export const verifyRefreshToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        
        const storedRefreshToken = await redisClient.get(`refresh_token:${decoded.id}`);
        if(storedRefreshToken !== refreshToken) {
            return null;
        }

        const activeSessionId = await redisClient.get(`active_session:${decoded.id}`);
        if(activeSessionId !== decoded.sessionId) {
            return null;
        }

        const sessionData = await redisClient.get(`session:${decoded.sessionId}`);
        if(!sessionData) {
            return null;
        }

        const parsedSessionData = JSON.parse(sessionData);
        parsedSessionData.lastActivity = new Date().toISOString();

        await redisClient.setEx(
            `session:${decoded.sessionId}`, 
            7 * 24 * 60 * 60 * 1000, 
            JSON.stringify(parsedSessionData)
        );

        return decoded;
    } catch (error) {
        console.error(error);
        return null;
    }
}

export const generateAccessToken = (id, sessionId, res) => {
    const accessToken = jwt.sign(
        {id, sessionId},
        JWT_SECRET,
        {expiresIn: "15m"}
    )

    res.cookie("accessToken", accessToken,{
        httpOnly: true,
        secure: NODE_ENV==="production",
        sameSite: NODE_ENV==="production"? "none" : "lax",
        maxAge: 15 * 60 * 1000
    });
}

export const revokeRefreshToken = async (userId) => {
    const activeSessionId = await redisClient.get(`active_session:${userId}`);

    await redisClient.del(`refresh_token:${userId}`);
    await redisClient.del(`active_session:${userId}`);

    if(activeSessionId) {
        await redisClient.del(`session:${activeSessionId}`);
    }

    await revokeCsrfToken(userId);
}

export const isSessionActive = async (userId, sessionId) => {
    const activeSessionId = await redisClient.get(`active_session:${userId}`);

    return activeSessionId === sessionId;
}