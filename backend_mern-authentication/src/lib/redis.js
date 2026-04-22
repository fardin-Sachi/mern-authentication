import {createClient} from 'redis';
import { REDIS_URL } from '../config/env.config.js';

const redisClient = createClient({
  url: REDIS_URL
})

const connectRedis = async() => {
    try {
        if(!REDIS_URL){
            throw new Error("REDIS_URL not found!");
        }

        redisClient.on("error", (err) => {
            console.error("Redis Client Error:", err);
        });

        await redisClient.connect()
        
        console.log("Connected to Redis!");
        
    } catch (error) {
        console.log(`Failed to connect to Redis. Error: ${error}`);
        process.exit(1);
    }
}

export {redisClient, connectRedis};