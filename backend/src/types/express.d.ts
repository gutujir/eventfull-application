import { TokenPayload } from "../middlewares/bearerAuth";

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
      userId?: string; // Legacy support for verifyToken middleware
    }
  }
}

export {};
