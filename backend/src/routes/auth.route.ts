import { Router } from "express";
import {
  signup,
  login,
  checkAuth,
  logout,
} from "../controllers/auth.controller";
import { verifyToken } from "../middlewares/verifyToken";

const authRouter = Router();

authRouter.get("/check-auth", verifyToken, checkAuth);
authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/logout", logout);

export default authRouter;
