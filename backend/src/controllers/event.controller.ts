import { Request, Response } from "express";
import * as eventService from "../services/event.service";
import { createEventSchema } from "../schemas/event.schema";
import { EventStatus } from "../../generated/prisma";

export const createEvent = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createEventSchema.parse(req.body);

    // Extract userId from req (set by verifyToken middleware)
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const eventData: any = {
      ...validatedData,
      slug:
        validatedData.title.toLowerCase().replace(/ /g, "-") + "-" + Date.now(), // Simple slug generation
      creator: { connect: { id: userId } },
    };

    if (validatedData.ticketTypes) {
      eventData.ticketTypes = {
        create: validatedData.ticketTypes,
      };
    }

    const event = await eventService.createEvent(eventData);
    res.status(201).json({ success: true, event });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.getEvents();
    res.status(200).json({ success: true, events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;
    if (!id) {
      res.status(400).json({ success: false, error: "Missing id parameter" });
      return;
    }
    const event = await eventService.getEventById(id);
    res.status(200).json({ success: true, event });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const getEventBySlug = async (req: Request, res: Response) => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    if (!slug) {
      res.status(400).json({ success: false, error: "Missing slug parameter" });
      return;
    }
    const event = await eventService.getEventBySlug(slug);
    res.status(200).json({ success: true, event });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

export const getMyEvents = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const events = await eventService.getEventsByCreator(userId);
    res.status(200).json({ success: true, events });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getEventAttendees = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const idParam = req.params.id;
    const eventId = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (!eventId) {
      res.status(400).json({ success: false, error: "Missing event ID" });
      return;
    }

    const attendees = await eventService.getEventAttendees(eventId, userId);
    res.status(200).json({ success: true, attendees });
  } catch (error: any) {
    res.status(403).json({ success: false, error: error.message });
  }
};

export const updateEventStatus = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const idParam = req.params.id;
    const eventId = Array.isArray(idParam) ? idParam[0] : idParam;
    const { status } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    if (!eventId) {
      res.status(400).json({ success: false, error: "Missing event ID" });
      return;
    }

    // Check if status is valid enum value
    if (!Object.values(EventStatus).includes(status)) {
      res.status(400).json({
        success: false,
        error: `Invalid status. Allowed values: ${Object.values(EventStatus).join(", ")}`,
      });
      return;
    }

    const event = await eventService.updateEventStatus(
      eventId,
      userId,
      status as EventStatus,
    );
    res.status(200).json({ success: true, event });
  } catch (error: any) {
    if (error.message.includes("Unauthorized")) {
      res.status(403).json({ success: false, error: error.message });
    } else if (error.message.includes("not found")) {
      res.status(404).json({ success: false, error: error.message });
    } else {
      res.status(500).json({ success: false, error: error.message });
    }
  }
};
