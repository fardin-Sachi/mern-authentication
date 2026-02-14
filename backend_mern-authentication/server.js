import express from 'express';
import {PORT} from './src/config/env.config.js';
import connectDb from './src/lib/db.js';
import routes from './src/routes/index.js';
import logger from './src/middlewares/logger.middleware.js';
import errorHandler from './src/middlewares/errorHandler.middleware.js';

await connectDb();
const app = express();

app.use(express.json());

//// Middlewares

// Logger
app.use(logger);

// Routes
app.use("/", (req,res)=> {
    res.send("Hey there");
})
app.use("/api/v1", routes);
app.use(errorHandler);


//// Server listening
app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});