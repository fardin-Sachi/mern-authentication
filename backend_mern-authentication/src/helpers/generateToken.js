import jwt from 'jsonwebtoken';
import { JWT_SECRET, NODE_ENV, REFRESH_TOKEN_SECRET } from '../config/env.config.js';
import { redisClient } from '../lib/redis.js';

export const generateToken = async (id, res) => {
    const accessToken = jwt.sign(
        {id},
        JWT_SECRET,
        {expiresIn: "1m"}
    );

    const refreshToken = jwt.sign(
        {id},
        REFRESH_TOKEN_SECRET,
        {expiresIn: "7d"}
    );

    const refreshTokenKey = `refresh_token:${id}`;
    await redisClient.setEx(refreshTokenKey, 7*24*60*60, refreshToken);

    res.cookie("accessToken", accessToken,{
        httpOnly: true,
        secure: NODE_ENV==="production",
        sameSite: "strict",
        maxAge: 1 * 60 * 1000
    });

    res.cookie("refreshToken", refreshToken,{
        httpOnly: true,
        secure: NODE_ENV==="production",
        sameSite: NODE_ENV === "production" ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return {accessToken, refreshToken};
}

export const verifyRefreshToken = async (refreshToken) => {
    try {
        const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        const storedRefreshToken = await redisClient.get(`refresh_token:${decoded.id}`);
        
        if(storedRefreshToken && storedRefreshToken === refreshToken){
            return decoded;
        }

        return null;
    } catch (error) {
        console.error(error);
    }
}

export const generateAccessToken = (id, res) => {
    const accessToken = jwt.sign(
        {id},
        JWT_SECRET,
        {expiresIn: "1m"}
    )

    res.cookie("accessToken", accessToken,{
        httpOnly: true,
        secure: NODE_ENV==="production",
        sameSite: "strict",
        maxAge: 1 * 60 * 1000
    });
}

export const revokeRefreshToken = async (userId) => {
    await redisClient.del(`refresh_token:${userId}`);
}