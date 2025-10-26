import express, { Request, Response, NextFunction, ErrorRequestHandler } from "express";
import cors from "cors";
import path from "path";
import dotenv from "dotenv";
import { ApiError } from "./utility/ApiError";
import ApiResponse from "./utility/ApiResponse";
import lawRouter from "./routes/law.router";

dotenv.config();

const app = express();

app.use(cors({
  origin: "*",
  credentials: true
}));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// Routes
app.use('/api/v1/laws', lawRouter);

app.get("/api/v1/active", (req: Request, res: Response) => {
    res.status(200).json(
      new ApiResponse(200, "Platform active")
  );
});

// Centralized error handler
const errorHandler: ErrorRequestHandler = (err: any, req: Request, res: Response, next: NextFunction): void => {
  if (err instanceof ApiError) {
    res.status(err.statusCode).json({
      success: false,
      message: err.message,
      errors: err.errors
    });
    return;
  }
  // Firebase errors
  if (err.code && err.code.startsWith('auth/')) {
    res.status(401).json({
      success: false,
      message: err.message || 'Firebase Auth Error',
    });
    return;
  }
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message
  });
};

app.use(errorHandler);

export { app };
