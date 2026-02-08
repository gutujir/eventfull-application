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
import { uploadBuffer } from "../lib/cloudinary";

export const signup = async (req: Request, res: Response) => {
  try {
    // Normalize possible camelCase keys from clients (firstName/lastName) to snake_case
    const body: any = { ...req.body };
    // common camelCase -> snake_case mappings for new profile fields
    const mappings: Record<string, string> = {
      firstName: "first_name",
      lastName: "last_name",
      dateOfBirth: "date_of_birth",
      jobTitle: "job_title",
      avatarUrl: "avatar_url",
      socialProfiles: "social_profiles",
      profileCompleted: "profile_completed",
      isVerified: "is_verified",
    };
    Object.entries(mappings).forEach(([camel, snake]) => {
      if (body[camel] !== undefined && body[snake] === undefined) {
        body[snake] = body[camel];
      }
    });

    const validatedData = signupSchema.parse(body);

    // Map certain snake_case validated fields to Prisma field names
    const signupData: any = { ...validatedData };
    if (signupData.date_of_birth !== undefined) {
      signupData.dateOfBirth = signupData.date_of_birth;
      delete signupData.date_of_birth;
    }
    if (signupData.job_title !== undefined) {
      signupData.jobTitle = signupData.job_title;
      delete signupData.job_title;
    }
    if (signupData.avatar_url !== undefined) {
      signupData.avatarUrl = signupData.avatar_url;
      delete signupData.avatar_url;
    }
    if (signupData.social_profiles !== undefined) {
      signupData.socialProfiles = signupData.social_profiles;
      delete signupData.social_profiles;
    }
    if (signupData.profile_completed !== undefined) {
      signupData.profileCompleted = signupData.profile_completed;
      delete signupData.profile_completed;
    }
    if (signupData.is_verified !== undefined) {
      signupData.isVerified = signupData.is_verified;
      delete signupData.is_verified;
    }

    const user = await authService.registerUser(signupData);

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

    // Normalize common camelCase keys from clients to snake_case for profile updates
    const body: any = { ...req.body };
    // Drop empty strings/nulls to avoid overwriting columns with blanks
    Object.keys(body).forEach((key) => {
      const value = body[key];
      if (value === "" || value === null) {
        delete body[key];
      }
    });
    const mappings: Record<string, string> = {
      firstName: "first_name",
      lastName: "last_name",
      dateOfBirth: "date_of_birth",
      jobTitle: "job_title",
      avatarUrl: "avatar_url",
      socialProfiles: "social_profiles",
      profileCompleted: "profile_completed",
      isVerified: "is_verified",
    };
    Object.entries(mappings).forEach(([camel, snake]) => {
      if (body[camel] !== undefined && body[snake] === undefined) {
        body[snake] = body[camel];
      }
    });

    const validatedData = updateProfileSchema.parse(body);

    // Map snake_case validated fields to Prisma field names for update
    const updateData: any = { ...validatedData };
    if (updateData.date_of_birth !== undefined) {
      updateData.dateOfBirth = updateData.date_of_birth;
      delete updateData.date_of_birth;
    }
    if (updateData.job_title !== undefined) {
      updateData.jobTitle = updateData.job_title;
      delete updateData.job_title;
    }
    if (updateData.avatar_url !== undefined) {
      updateData.avatarUrl = updateData.avatar_url;
      delete updateData.avatar_url;
    }
    if (updateData.social_profiles !== undefined) {
      updateData.socialProfiles = updateData.social_profiles;
      delete updateData.social_profiles;
    }
    if (updateData.profile_completed !== undefined) {
      updateData.profileCompleted = updateData.profile_completed;
      delete updateData.profile_completed;
    }
    if (updateData.is_verified !== undefined) {
      updateData.isVerified = updateData.is_verified;
      delete updateData.is_verified;
    }

    // Cast date string into Date for Prisma if present
    if (updateData.dateOfBirth) {
      updateData.dateOfBirth = new Date(updateData.dateOfBirth as any);
    }

    const updatedUser = await authService.updateUserProfile(userId, updateData);

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

export const uploadAvatar = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });
    }

    if (!req.file.buffer) {
      return res
        .status(400)
        .json({ success: false, message: "No file buffer found" });
    }

    const uploadResult = await uploadBuffer(req.file.buffer, {
      folder: "eventfull/avatars",
      resource_type: "image",
    });
    const avatarUrl = uploadResult.secure_url;

    // Update user's avatarUrl (Prisma field)
    const updatedUser = await authService.updateUserProfile(userId, {
      avatarUrl: avatarUrl,
    } as any);

    return res.status(200).json({
      success: true,
      message: "Avatar uploaded",
      user: { ...updatedUser, password: undefined },
    });
  } catch (error: any) {
    const message = error?.message || error?.error?.message || "Upload failed";
    return res.status(500).json({ success: false, message });
  }
};
