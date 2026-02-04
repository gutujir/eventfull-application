import { SignUpUserSchema } from "./schema/auth.schema";
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
                  firstName: "Jane",
                  lastName: "Doe",
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
                  firstName: "Jane",
                  lastName: "Doe",
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
      security: [{ cookieAuth: [] }],
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
                      firstName: { type: "string", example: "Jane" },
                      lastName: { type: "string", example: "Doe" },
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
      security: [{ cookieAuth: [] }],
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
};
