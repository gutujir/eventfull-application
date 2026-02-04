import jwt from "jsonwebtoken";
import { Response } from "express";

/**
 * Generate access and refresh tokens and set them as httpOnly cookies.
 * - Access token: short-lived (default 1h)
 * - Refresh token: long-lived (default 30d)
 */
export function generateTokenAndSetCookie(userId: string, res: Response) {
  const accessExpiry = process.env.ACCESS_TOKEN_EXPIRES_IN || "1h";
  const refreshExpiry = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET as string, {
    expiresIn: accessExpiry,
  });

  const refreshToken = jwt.sign(
    { userId },
    (process.env.REFRESH_TOKEN_SECRET as string) ||
      (process.env.JWT_SECRET as string),
    { expiresIn: refreshExpiry },
  );

  // Access cookie (short-lived)
  const accessMaxAge = parseCookieMaxAge(accessExpiry);
  res.cookie("token", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: accessMaxAge,
  });

  // Refresh cookie (long-lived)
  const refreshMaxAge = parseCookieMaxAge(refreshExpiry);
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: refreshMaxAge,
  });

  return { accessToken, refreshToken };
}

function parseCookieMaxAge(exp: string) {
  // Simple parser: supports values like '1h', '7d', '30d', '3600s'
  try {
    if (exp.endsWith("d")) {
      const d = Number(exp.slice(0, -1));
      return d * 24 * 60 * 60 * 1000;
    }
    if (exp.endsWith("h")) {
      const h = Number(exp.slice(0, -1));
      return h * 60 * 60 * 1000;
    }
    if (exp.endsWith("m")) {
      const m = Number(exp.slice(0, -1));
      return m * 60 * 1000;
    }
    if (exp.endsWith("s")) {
      const s = Number(exp.slice(0, -1));
      return s * 1000;
    }
    // fallback: treat as ms
    const v = Number(exp);
    return Number.isFinite(v) ? v : 0;
  } catch {
    return 0;
  }
}
