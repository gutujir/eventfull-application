import { Request, Response, NextFunction } from "express";
import { Role } from "../../generated/prisma";
import * as authDal from "../dal/auth.dal";

interface AuthRequest extends Request {
  userId?: string;
}

/**
 * Middleware to check if the authenticated user has one of the required roles
 * Should be used after verifyToken middleware
 */
export const checkRole = (allowedRoles: Role[]) => {
  return async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;

      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized - no user ID found",
        });
      }

      const user = await authDal.findUserById(userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          message: `Forbidden - requires one of the following roles: ${allowedRoles.join(", ")}`,
        });
      }

      next();
    } catch (error) {
      console.error("Error in checkRole middleware:", error);
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};

/**
 * Convenience middleware to require CREATOR role
 */
export const requireCreator = checkRole(["CREATOR", "ADMIN"]);

/**
 * Convenience middleware to require EVENTEE role
 */
export const requireEventee = checkRole(["EVENTEE", "ADMIN"]);

/**
 * Convenience middleware to require ADMIN role
 */
export const requireAdmin = checkRole(["ADMIN"]);
