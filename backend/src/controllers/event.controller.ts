import { Request, Response } from "express";
import * as eventService from "../services/event.service";
import { createEventSchema } from "../schemas/event.schema";

export const createEvent = async (req: Request, res: Response) => {
  try {
    // Validate request body
    const validatedData = createEventSchema.parse(req.body);

    // Construct the data object compliant with Prisma
    // Note: You need to extract userId from req.user (assuming verifyToken middleware)
    const userId = (req as any).user?.userId;

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
