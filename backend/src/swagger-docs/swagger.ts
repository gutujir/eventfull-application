import { authSwagger } from "./auth.swagger";

import swaggerUi from "swagger-ui-express";
import { Application } from "express";

// Swagger definition and options
const swaggerSpec = {
  openapi: "3.0.0",
  info: {
    title: "Eventfull System Backend",
    version: "1.0.0",
    description: "API documentation for Eventfull System Backend",
  },
  paths: {
    ...authSwagger,
  },
  // ...other swagger objects
  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
      },
    },
  },
  security: [{ bearerAuth: [] }],
};

// Function to setup Swagger UI
export function setupSwagger(app: Application) {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
