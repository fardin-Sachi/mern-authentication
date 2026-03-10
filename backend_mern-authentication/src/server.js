import express from 'express';
import {PORT} from './config/env.config.js';
import connectDb from './lib/db.js';
import routes from './routes/index.route.js';
import logger from './middlewares/logger.middleware.js';
import errorHandler from './middlewares/errorHandler.middleware.js';
import {connectRedis} from './lib/redis.js';
import cookieParser from 'cookie-parser'


await connectDb();
await connectRedis();

const app = express();

app.use(express.json());
app.use(cookieParser());

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
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});