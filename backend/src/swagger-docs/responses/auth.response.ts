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
    user: { type: "object" },
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
    user: { type: "object" },
  },
};

export const LogoutResponse = {
  type: "object",
  properties: {
    message: { type: "string", example: "Logout successful" },
  },
};
