import mongoose from 'mongoose';
import {MONGO_URI} from '../config/env.config.js';

const connectDb = async() => {
    try{
        if(!MONGO_URI) {
            throw new Error("MONGO_URI is not defined in environment variables");
        }
        await mongoose.connect(MONGO_URI, {
            dbName: "mern-authentication"
        });
        console.log("MongoDB Connected");
    } catch (error) {
        console.log(`Failed to connect. Error: ${error}`);
        process.exit(1);
    }
}

export default connectDb;