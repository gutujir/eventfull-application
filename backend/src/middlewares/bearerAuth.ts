import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

export interface TokenPayload extends JwtPayload {
  userId: string;
  role?: string;
  email?: string;
}

export interface PublicEndpoint {
  path: string; // Exact match or prefix if strict=false? Let's assume strict logic or use regex
  method: string | string[]; // HTTP method(s)
  isRegex?: boolean; // Treat path as regex
}

export interface BearerAuthOptions {
  // Routes that do not require authentication
  excludedRoutes?: string[]; // Simple exact match for paths
  publicRules?: PublicEndpoint[]; // Advanced rules
}

export function createBearerAuthMiddleware(options: BearerAuthOptions = {}) {
  const excludedRoutes = options.excludedRoutes || [];
  const publicRules = options.publicRules || [];

  return function bearerAuth(req: Request, res: Response, next: NextFunction) {
    const reqPath = req.path || req.originalUrl.split("?")[0] || "";
    const reqMethod = req.method.toUpperCase();

    // 1. Check simple excluded paths (exact match)
    if (excludedRoutes.includes(reqPath)) {
      return next();
    }

    // 2. Check value-based public rules
    for (const rule of publicRules) {
      const methods = Array.isArray(rule.method)
        ? rule.method.map((m) => m.toUpperCase())
        : [rule.method.toUpperCase()];

      // If method matches (or rule implies all methods if we supported that, but let's stick to explicit)
      if (methods.includes(reqMethod) || rule.method === "*") {
        if (rule.isRegex) {
          if (new RegExp(rule.path).test(reqPath)) return next();
        } else {
          // treat as prefix matching for flexibility in "modules" like /api/v1/events
          if (reqPath.startsWith(rule.path)) return next();
        }
      }
    }

    // 3. Authorization Check
    let token = "";

    // Priority 1: Authorization Header
    const authHeader = req.headers["authorization"];

    if (authHeader) {
      const parts = authHeader.split(" ");
      if (parts.length !== 2 || parts[0] !== "Bearer") {
        res
          .status(401)
          .json({ success: false, message: "Invalid authorization format" });
        return;
      }
      token = parts[1];
    }
    // Priority 2: Cookie fallback (if header is missing)
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }
    // No token found
    else {
      res.status(401).json({ success: false, message: "No token provided" });
      return;
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      console.error("JWT_SECRET not configured");
      res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
      return;
    }

    try {
      const decoded = jwt.verify(token, secret) as TokenPayload;

      // Basic validation of decoded token structure
      if (!decoded || typeof decoded !== "object") {
        throw new Error("Invalid token payload");
      }

      // Attach to request
      req.user = decoded;
      // Set userId for backward compatibility with controllers expecting req.userId
      req.userId = decoded.userId;

      next();
    } catch (err) {
      res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
      return;
    }
  };
}
