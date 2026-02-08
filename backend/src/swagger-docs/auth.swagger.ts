import { SignUpUserSchema, UpdateProfileSchema } from "./schema/auth.schema";
import {
  SignUpUserResponse,
  LoginResponse,
  LogoutResponse,
  ErrorResponse,
} from "./responses/auth.response";

const LoginSchema = {
  type: "object",
  properties: {
    email: { type: "string", format: "email", example: "user@example.com" },
    password: { type: "string", example: "mypassword123" },
  },
  required: ["email", "password"],
};

export const authSwagger = {
  "/api/v1/auth/signup": {
    post: {
      tags: ["Auth"],
      summary: "Sign up a new user",
      description:
        "Creates a new user account. Returns the created user object (without password).",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: SignUpUserSchema,
            example: {
              email: "newuser@example.com",
              password: "strongPassword!23",
              firstName: "Jane",
              lastName: "Doe",
              role: "EVENTEE",
            },
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: SignUpUserResponse,
              example: {
                success: true,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                user: {
                  id: "cljxyz...",
                  email: "newuser@example.com",
                  first_name: "Jane",
                  last_name: "Doe",
                  role: "EVENTEE",
                },
              },
            },
          },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
        409: {
          description: "Conflict - email already exists",
          content: { "application/json": { schema: ErrorResponse } },
        },
        422: {
          description: "Unprocessable Entity - schema validation failed",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login a user",
      description:
        "Authenticates a user and sets a session cookie. The response includes basic user info and a token when applicable.",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: LoginSchema,
            example: { email: "user@example.com", password: "mypassword123" },
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          headers: {
            "Set-Cookie": {
              description: "Session cookie is set on successful login",
              schema: { type: "string" },
            },
          },
          content: {
            "application/json": {
              schema: LoginResponse,
              example: {
                success: true,
                token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                refreshToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
                user: {
                  id: "u_123",
                  email: "user@example.com",
                  first_name: "Jane",
                  last_name: "Doe",
                  role: "EVENTEE",
                },
              },
            },
          },
        },
        400: {
          description: "Validation or credential error",
          content: { "application/json": { schema: ErrorResponse } },
        },
        401: {
          description: "Invalid credentials",
          content: { "application/json": { schema: ErrorResponse } },
        },
        429: {
          description: "Too many requests - rate limited",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/auth/check-auth": {
    get: {
      tags: ["Auth"],
      summary: "Check current authenticated user",
      description:
        "Returns the current authenticated user when a valid session/token is provided.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "User is authenticated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  user: {
                    type: "object",
                    properties: {
                      id: { type: "string", example: "u_123" },
                      email: {
                        type: "string",
                        format: "email",
                        example: "user@example.com",
                      },
                      first_name: { type: "string", example: "Jane" },
                      last_name: { type: "string", example: "Doe" },
                    },
                  },
                },
              },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/auth/logout": {
    post: {
      tags: ["Auth"],
      summary: "Logout current user",
      description:
        "Clears session cookie / token for the current authenticated user.",
      security: [{ bearerAuth: [] }],
      responses: {
        200: {
          description: "Logout successful",
          headers: {
            "Set-Cookie": {
              description: "Clears the session cookie",
              schema: { type: "string" },
            },
          },
          content: {
            "application/json": {
              schema: LogoutResponse,
              example: { success: true, message: "Logged out" },
            },
          },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/auth/refresh": {
    post: {
      tags: ["Auth"],
      summary: "Refresh access token using refresh token cookie",
      description:
        "Uses the httpOnly `refreshToken` cookie to issue new tokens and rotate refresh token.",
      responses: {
        200: {
          description: "Tokens refreshed",
          headers: {
            "Set-Cookie": {
              description: "New access and refresh cookies set",
              schema: { type: "string" },
            },
          },
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean" },
                  message: { type: "string" },
                  token: { type: "string" },
                  refreshToken: { type: "string" },
                },
              },
              example: {
                success: true,
                message: "Tokens refreshed",
                token: "eyJ...",
                refreshToken: "eyJ...",
              },
            },
          },
        },
        401: {
          description: "Invalid or missing refresh token",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/auth/profile": {
    put: {
      tags: ["Auth"],
      summary: "Update user profile",
      description: "Updates profile fields for the authenticated user.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: UpdateProfileSchema,
            example: {
              firstName: "Hana",
              lastName: "Adam",
              jobTitle: "Event Organizer",
              company: "Hummfly Tech",
              phone: "+251932268829",
              location: "Addis Ababa, Ethiopia",
              timezone: "Africa/Addis_Ababa",
              bio: "Product leader and event creator.",
              socialProfiles: {
                twitter: "@hanaadam",
                linkedin: "linkedin.com/in/hanaadam",
              },
            },
          },
        },
      },
      responses: {
        200: {
          description: "Profile updated",
          content: { "application/json": { schema: SignUpUserResponse } },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
        401: {
          description: "Unauthorized",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
  "/api/v1/auth/avatar": {
    post: {
      tags: ["Auth"],
      summary: "Upload profile avatar",
      description: "Uploads a profile image and updates avatarUrl.",
      security: [{ bearerAuth: [] }],
      requestBody: {
        required: true,
        content: {
          "multipart/form-data": {
            schema: {
              type: "object",
              properties: {
                avatar: { type: "string", format: "binary" },
              },
              required: ["avatar"],
            },
          },
        },
      },
      responses: {
        200: {
          description: "Avatar uploaded",
          content: { "application/json": { schema: SignUpUserResponse } },
        },
        400: {
          description: "Upload error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },
};
