import { Router } from "express";
import {
  signup,
  login,
  checkAuth,
  logout,
  refreshToken,
  updateProfile,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";
import {
  rateLimitLogin,
  rateLimitSignup,
} from "../middlewares/authRateLimiter";

const authRouter = Router();

authRouter.get("/check-auth", verifyToken, checkAuth);
authRouter.put("/profile", verifyToken, updateProfile);
authRouter.post("/signup", rateLimitSignup, signup);
authRouter.post("/login", rateLimitLogin, login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshToken);

export default authRouter;
