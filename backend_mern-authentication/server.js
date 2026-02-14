import express from 'express';
import {PORT} from './src/config/env.config.js';
import connectDb from './src/lib/db.js';
import routes from './src/routes/index.js';
import logger from './src/middlewares/logger.middleware.js';
import errorHandler from './src/middlewares/errorHandler.middleware.js';
import connectRedis from './src/lib/redis.js';

await connectDb();
await connectRedis();

const app = express();

app.use(express.json());

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