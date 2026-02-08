import { Request, Response } from "express";
import * as eventService from "../services/event.service";
import { createEventSchema } from "../schemas/event.schema";
import { EventStatus } from "../../generated/prisma";
import { uploadBuffer } from "../lib/cloudinary";

export const createEvent = async (req: Request, res: Response) => {
  try {
    const bodyData = { ...req.body };

    // Handle FormData conversions (FormData sends everything as strings)
    // We attempt conversion if fields are present, regardless of file upload
    if (bodyData.price !== undefined) bodyData.price = Number(bodyData.price);

    if (bodyData.capacity !== undefined && bodyData.capacity !== "") {
      bodyData.capacity = Number(bodyData.capacity);
    } else if (bodyData.capacity === "") {
      // If empty string came from FormData, delete it so it can be optional/undefined
      delete bodyData.capacity;
    }

    if (bodyData.isPublic !== undefined) {
      if (typeof bodyData.isPublic === "string") {
        bodyData.isPublic = bodyData.isPublic === "true";
      }
    }

    if (typeof bodyData.ticketTypes === "string") {
      try {
        bodyData.ticketTypes = JSON.parse(bodyData.ticketTypes);
      } catch (e) {
        console.warn("Failed to parse ticketTypes", e);
      }
    }

    // Validate request body
    const validatedData = createEventSchema.parse(bodyData);

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
      imageUrl:
        "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    };

    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, {
        folder: "eventfull/events",
        resource_type: "image",
      });
      eventData.imageUrl = uploadResult.secure_url;
    }

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
    const { search, location } = req.query;
    const filters = {
      search: typeof search === "string" ? search : undefined,
      location: typeof location === "string" ? location : undefined,
    };
    const events = await eventService.getEvents(filters);
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

    let event;
    const isUuid =
      /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/.test(
        id,
      );

    if (isUuid) {
      event = await eventService.getEventById(id);
    } else {
      // Try to find by slug if it doesn't look like a UUID
      try {
        event = await eventService.getEventBySlug(id);
      } catch (error) {
        // If slug lookup fails, and it wasn't a UUID, it really wasn't found.
        // But what if it WAS a UUID but regex failed? Unlikely.
        // Or what if the ID is just a string in some future non-UUID db?
        // For now, this logic is sound for Postgres UUIDs.
        throw new Error("Event not found");
      }
    }

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

export const updateEvent = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const eventId = Array.isArray(idParam) ? idParam[0] : idParam;
    const userId = (req as any).userId;
    const bodyData = { ...req.body };

    if (!eventId) {
      res.status(400).json({ success: false, error: "Missing event ID" });
      return;
    }

    // Handle FormData conversions
    if (
      req.file ||
      req.headers["content-type"]?.includes("multipart/form-data")
    ) {
      if (bodyData.price) bodyData.price = Number(bodyData.price);
      if (bodyData.capacity) bodyData.capacity = Number(bodyData.capacity);
    }

    // Normalize boolean fields (applies to both JSON and multipart)
    if (typeof bodyData.isPublic === "string") {
      bodyData.isPublic = bodyData.isPublic === "true";
    }

    const updateData = bodyData;

    if (updateData.status !== undefined) {
      if (!Object.values(EventStatus).includes(updateData.status)) {
        res.status(400).json({
          success: false,
          error: `Invalid status. Allowed values: ${Object.values(EventStatus).join(", ")}`,
        });
        return;
      }
    }

    // Remove fields that shouldn't be updated directly via this endpoint if necessary
    // e.g. creatorId should not be changeable
    delete updateData.creatorId;
    delete updateData.id;

    if (updateData.date) {
      updateData.date = new Date(updateData.date);
    }

    if (req.file) {
      const uploadResult = await uploadBuffer(req.file.buffer, {
        folder: "eventfull/events",
        resource_type: "image",
      });
      updateData.imageUrl = uploadResult.secure_url;
    }

    const event = await eventService.updateEventDetails(
      eventId,
      userId,
      updateData,
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

export const deleteEvent = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const eventId = Array.isArray(idParam) ? idParam[0] : idParam;
    const userId = (req as any).userId;

    if (!eventId) {
      res.status(400).json({ success: false, error: "Missing event ID" });
      return;
    }

    await eventService.deleteEvent(eventId, userId);
    res
      .status(200)
      .json({ success: true, message: "Event deleted successfully" });
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
