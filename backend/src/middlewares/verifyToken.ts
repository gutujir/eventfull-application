import jwt, { JwtPayload } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

interface AuthRequest extends Request {
  userId?: string;
}

export const verifyToken = (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  // 1. Check if user is already authenticated by global middleware
  if (req.userId || req.user) {
    return next();
  }

  // 2. Fallback: Check for token in cookies or header (if global middleware was skipped)
  let token = req.cookies?.token;

  // Support Bearer token in this fallback as well
  if (!token && req.headers["authorization"]) {
    const parts = req.headers["authorization"].split(" ");
    if (parts.length === 2 && parts[0] === "Bearer") {
      token = parts[1];
    }
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Unauthorized - no token provided" });
  }

  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = jwt.verify(token, secret) as JwtPayload;

    if (!decoded || typeof decoded !== "object" || !decoded.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized - invalid token",
      });
    }
    req.userId = decoded.userId;
    // Also set req.user for consistency
    (req as any).user = decoded;

    next();
  } catch (error) {
    console.log("Error in verifyToken", error);
    return res.status(401).json({
      success: false,
      message: "Unauthorized - token verification failed",
    });
  }
};
