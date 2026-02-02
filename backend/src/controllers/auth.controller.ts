import { Request, Response } from "express";
import { z } from "zod";
import * as authService from "../services/auth.service";
import { generateTokenAndSetCookie } from "../utils/generateTokenAndSetCookie";
import * as authDal from "../dal/auth.dal";
import { signupSchema, loginSchema } from "../schemas/auth.schema";

export const signup = async (req: Request, res: Response) => {
  try {
    const validatedData = signupSchema.parse(req.body);

    const user = await authService.registerUser(validatedData);

    generateTokenAndSetCookie(user.id, res);

    res.status(201).json({
      success: true,
      message: "User created successfully",
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

    generateTokenAndSetCookie(user.id, res);

    res.status(200).json({
      success: true,
      message: "Logged in successfully",
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
    res.status(200).json({ success: true, message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to logout" });
  }
};
