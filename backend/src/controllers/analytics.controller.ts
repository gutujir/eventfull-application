import { Request, Response } from "express";
import * as analyticsService from "../services/analytics.service";
import * as eventService from "../services/event.service";

export const getCreatorDashboard = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.userId;
    const stats = await analyticsService.getCreatorStats(userId);
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEventAnalytics = async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const id = Array.isArray(eventId) ? eventId[0] : eventId;
    const userId = (req as any).user?.userId;

    // Verify ownership
    const event = await eventService.getEventById(id);
    if (!event) {
      res.status(404).json({ success: false, error: "Event not found" });
      return;
    }
    if (event.creatorId !== userId) {
      res.status(403).json({ success: false, error: "Unauthorized" });
      return;
    }

    const stats = await analyticsService.getEventStats(id);
    res.json({ success: true, stats });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};
