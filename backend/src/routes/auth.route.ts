import { Router } from "express";
import {
  signup,
  login,
  checkAuth,
  logout,
  refreshToken,
  updateProfile,
  uploadAvatar,
} from "../controllers/auth.controller";
import { upload } from "../middlewares/upload";
import { verifyToken } from "../middlewares/verifyToken";
import {
  rateLimitLogin,
  rateLimitSignup,
} from "../middlewares/authRateLimiter";

const authRouter = Router();

authRouter.get("/check-auth", verifyToken, checkAuth);
authRouter.put("/profile", verifyToken, updateProfile);
authRouter.post("/avatar", verifyToken, upload.single("avatar"), uploadAvatar);
authRouter.post("/signup", rateLimitSignup, signup);
authRouter.post("/login", rateLimitLogin, login);
authRouter.post("/logout", logout);
authRouter.post("/refresh", refreshToken);

export default authRouter;
