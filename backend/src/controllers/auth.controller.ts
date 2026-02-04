import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";
import * as authDal from "../dal/auth.dal";
import {
  signupSchema,
  loginSchema,
  updateProfileSchema,
} from "../schemas/auth.schema";
import jwt from "jsonwebtoken";

export const signup = async (req: Request, res: Response) => {
  try {
    // Normalize possible camelCase keys from clients (firstName/lastName) to snake_case
    const body: any = { ...req.body };
    if (body.firstName && !body.first_name) body.first_name = body.firstName;
    if (body.lastName && !body.last_name) body.last_name = body.lastName;

    const validatedData = signupSchema.parse(body);

    const user = await authService.registerUser(validatedData);

    const tokens = generateTokenAndSetCookie(user.id, res);

    res.status(201).json({
      success: true,
      message: "User created successfully",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ success: false, message: error.issues[0].message });
    } else if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(400).json({ success: false, message: "Unknown error" });
    }
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await authService.loginUser(email, password);

    const tokens = generateTokenAndSetCookie(user.id, res);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      user: {
        ...user,
        password: undefined,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ success: false, message: error.issues[0].message });
    } else if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(400).json({ success: false, message: "Unknown error" });
    }
  }
};

export const refreshToken = async (req: Request, res: Response) => {
  try {
    const refresh = (req as any).cookies?.refreshToken as string | undefined;
    if (!refresh)
      return res
        .status(401)
        .json({ success: false, message: "No refresh token" });

    let payload: any;
    try {
      payload = jwt.verify(
        refresh,
        (process.env.REFRESH_TOKEN_SECRET as string) ||
          (process.env.JWT_SECRET as string),
      ) as any;
    } catch (err) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid refresh token" });
    }

    const userId = payload.userId as string;
    const user = await authDal.findUserById(userId);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    // Issue new tokens (rotating refresh token)
    const tokens = generateTokenAndSetCookie(user.id, res);

    res.status(200).json({
      success: true,
      message: "Tokens refreshed",
      token: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message || "Failed to refresh",
    });
  }
};

export const checkAuth = async (req: Request, res: Response) => {
  try {
    // `verifyToken` middleware attaches `userId` to the request
    const userId = (req as any).userId as string | undefined;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const user = await authDal.findUserById(userId);

    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    res
      .status(200)
      .json({ success: true, user: { ...user, password: undefined } });
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res.status(400).json({ success: false, message: "Unknown error" });
    }
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");
    res.clearCookie("refreshToken");
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to logout" });
  }
};

export const updateProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId; // Provided by verifyToken middleware

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    // Normalize possible camelCase keys from clients (firstName/lastName) to snake_case
    const body: any = { ...req.body };
    if (body.firstName && !body.first_name) body.first_name = body.firstName;
    if (body.lastName && !body.last_name) body.last_name = body.lastName;

    const validatedData = updateProfileSchema.parse(body);

    const updatedUser = await authService.updateUserProfile(
      userId,
      validatedData,
    );

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        ...updatedUser,
        password: undefined,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      res
        .status(400)
        .json({ success: false, message: (error as any).errors[0].message });
    } else if (error instanceof Error) {
      res.status(400).json({ success: false, message: error.message });
    } else {
      res
        .status(500)
        .json({ success: false, message: "Internal server error" });
    }
  }
};
