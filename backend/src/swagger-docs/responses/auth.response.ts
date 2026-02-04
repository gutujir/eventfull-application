export const HealthResponse = {
  type: "object",
  properties: {
    status: { type: "string", example: "ok" },
  },
};

export const ErrorResponse = {
  type: "object",
  properties: {
    message: { type: "string", example: "Internal server error" },
  },
};

export const SignUpUserResponse = {
  type: "object",
  properties: {
    message: { type: "string", example: "User registered successfully" },
    token: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    refreshToken: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    user: {
      type: "object",
      properties: {
        id: { type: "string", example: "u_123" },
        email: {
          type: "string",
          format: "email",
          example: "newuser@example.com",
        },
        first_name: { type: "string", example: "Jane" },
        last_name: { type: "string", example: "Doe" },
        role: { type: "string", example: "EVENTEE" },
      },
    },
  },
};

export const LoginResponse = {
  type: "object",
  properties: {
    message: { type: "string", example: "Login successful" },
    token: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    refreshToken: {
      type: "string",
      example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    },
    user: {
      type: "object",
      properties: {
        id: { type: "string", example: "u_123" },
        email: { type: "string", format: "email", example: "user@example.com" },
        first_name: { type: "string", example: "Jane" },
        last_name: { type: "string", example: "Doe" },
        role: { type: "string", example: "EVENTEE" },
      },
    },
  },
};

export const LogoutResponse = {
  type: "object",
  properties: {
    message: { type: "string", example: "Logout successful" },
  },
};
