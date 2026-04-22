import express from 'express';
import {CLIENT_URL, PORT} from './config/env.config.js';
import connectDb from './lib/db.js';
import routes from './routes/index.route.js';
import logger from './middlewares/logger.middleware.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import {connectRedis} from './lib/redis.js';
import cookieParser from 'cookie-parser';
import cors from 'cors'


await connectDb();
await connectRedis();

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: ["http://localhost:5173", CLIENT_URL],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    // allowedHeaders: ["Content-Type", "Authorization"]
}));

//// Middlewares

// Logger
app.use(logger);

// Routes
app.use("/api/v1", routes);
app.use("/health", (req,res)=> {
    res.send("Hey there");
})
app.use(errorHandler);


//// Server listening
app.listen(PORT || 8000, () => {
    console.log(`Server started on port ${PORT}`);
});