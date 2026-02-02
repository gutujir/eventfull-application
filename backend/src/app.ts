import express from "express";
import { errorHandler } from "./middlewares/errorHandler";
import authRouter from "./routes/auth.route";

const app = express();

// parse JSON request bodies
app.use(express.json());

// parse application/x-www-form-urlencoded (HTML form submissions)
app.use(express.urlencoded({ extended: true }));

// Define your routes here
app.use("/api/v1/auth", authRouter);

// Global error handling middleware
app.use(errorHandler);

export default app;
