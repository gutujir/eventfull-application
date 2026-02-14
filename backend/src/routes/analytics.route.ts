import { Router } from "express";
import * as analyticsController from "../controllers/analytics.controller";
import { verifyToken } from "../middlewares/verifyToken";
import { requireCreator } from "../middlewares/checkRole";

const router = Router();

router.get(
  "/dashboard",
  verifyToken,
  requireCreator,
  analyticsController.getCreatorDashboard,
);
router.get(
  "/event/:eventId",
  verifyToken,
  requireCreator,
  analyticsController.getEventAnalytics,
);

export default router;
