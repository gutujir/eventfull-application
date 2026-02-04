import { Router } from "express";
import * as shareController from "../controllers/share.controller";

const router = Router();

// Public routes - no authentication required for sharing
router.get("/events/:slug/metadata", shareController.getEventShareMetadata);
router.get("/events/:id/link", shareController.getShareableLink);

export default router;
