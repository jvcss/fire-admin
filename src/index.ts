import express, { Request, Response, NextFunction } from 'express';
// Import your API routes
import projectRouter from '@/routes/projectRoutes';

const app = express();
require('dotenv').config();

const port = process.env.PORT || 3000;

// Configure middleware,
// including body parsing, CORS, and authentication
app.use(express.json()); // For parsing JSON requests
//app.use(cors()); // Handle CORS

// LOAD CACHE WITH REDIS

// LOAD DATABASE POSTGRES

// Register routes
app.use('/projects', projectRouter);

// catch 404 and forward to error handler
app.use(function (req: Request, res: Response, next: NextFunction) {
  next(res.status(404).json({}));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

export default app;
