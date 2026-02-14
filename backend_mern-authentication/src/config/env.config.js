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
    MONGO_URI: process.env.MONGO_URI
});

export const {
    PORT,
    MONGO_URI,
    JWT_SECRET
} = env;