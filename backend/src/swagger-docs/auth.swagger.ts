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
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: SignUpUserSchema,
          },
        },
      },
      responses: {
        201: {
          description: "User registered successfully",
          content: {
            "application/json": {
              schema: SignUpUserResponse,
            },
          },
        },
        400: {
          description: "Validation error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/auth/login": {
    post: {
      tags: ["Auth"],
      summary: "Login a user",
      requestBody: {
        required: true,
        content: {
          "application/json": {
            schema: LoginSchema,
          },
        },
      },
      responses: {
        200: {
          description: "Login successful",
          content: {
            "application/json": {
              schema: LoginResponse,
            },
          },
        },
        400: {
          description: "Validation or credential error",
          content: { "application/json": { schema: ErrorResponse } },
        },
      },
    },
  },

  "/api/v1/auth/check-auth": {
    get: {
      tags: ["Auth"],
      summary: "Check current authenticated user",
      responses: {
        200: {
          description: "User is authenticated",
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  success: { type: "boolean", example: true },
                  user: { type: "object" },
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
      responses: {
        200: {
          description: "Logout successful",
          content: {
            "application/json": {
              schema: LogoutResponse,
            },
          },
        },
      },
    },
  },
};
