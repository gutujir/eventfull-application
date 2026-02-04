import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { verifyToken } from "../middlewares/verifyToken";

const router = Router();

router.get("/dashboard", verifyToken, analyticsController.getCreatorDashboard);
router.get(
  "/event/:eventId",
  verifyToken,
  analyticsController.getEventAnalytics,
);

export default router;
