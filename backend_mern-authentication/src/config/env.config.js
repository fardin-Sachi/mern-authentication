import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const environment = process.env.NODE_ENV || "development";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const envPath = path.resolve(
    __dirname,
    "../../",
    `.env.${environment}`
);

dotenv.config({ path: envPath });

const env = Object.freeze({
    NODE_ENV: environment,
    PORT: process.env.PORT || 8080,
    MONGO_URI: process.env.MONGO_URI,
    REDIS_URL: process.env.REDIS_URL,
    CLIENT_URL: process.env.CLIENT_URL,
    JWT_SECRET: process.env.JWT_SECRET,
    SMTP_USER: process.env.SMTP_USER,
    SMTP_PASSWORD: process.env.SMTP_PASSWORD
});

export const {
    NODE_ENV,
    PORT,
    MONGO_URI,
    REDIS_URL,
    JWT_SECRET,
    CLIENT_URL,
    SMTP_USER,
    SMTP_PASSWORD
} = env;