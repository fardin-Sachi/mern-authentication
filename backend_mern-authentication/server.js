import express from 'express';
import {PORT} from './src/config/env.config.js';
import connectDb from './src/lib/db.js';
import routes from './src/routes/index.js';
import traceRequests from './src/middlewares/traceRequest.middleware.js';
import errorHandler from './src/middlewares/errorHandler.middleware.js';

await connectDb();
const app = express();

app.use(express.json());

//Middlewares
app.use(traceRequests)

// Routes
app.use("/api/v1", routes);
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});