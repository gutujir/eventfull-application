import { Request, Response } from "express";
import * as ticketService from "../services/ticket.service";
import {
  purchaseTicketSchema,
  validateTicketSchema,
} from "../schemas/ticket.schema";

export const purchaseTicket = async (req: Request, res: Response) => {
  try {
    const { eventId, ticketTypeId } = purchaseTicketSchema.parse(req.body);
    const userId = (req as any).user?.userId;

    const ticket = await ticketService.purchaseTicket(
      userId,
      eventId,
      ticketTypeId,
    );
    res.status(201).json({ success: true, ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const validateTicket = async (req: Request, res: Response) => {
  try {
    const { qrCode, eventId } = validateTicketSchema.parse(req.body);
    const creatorId = (req as any).userId;

    const ticket = await ticketService.validateTicket(
      qrCode,
      eventId,
      creatorId,
    );
    res
      .status(200)
      .json({ success: true, message: "Ticket valid and scanned", ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};

export const getMyTickets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;

    if (!userId) {
      res.status(401).json({ success: false, error: "Unauthorized" });
      return;
    }

    const tickets = await ticketService.getTicketsByUser(userId);
    res.status(200).json({ success: true, tickets });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
};

export const getTicketById = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      res.status(400).json({ success: false, error: "Ticket ID required" });
      return;
    }

    const userId = (req as any).userId;
    const role = (req as any).user?.role;
    const ticket = await ticketService.getTicketById(id, {
      userId,
      role,
    });
    res.status(200).json({ success: true, ticket });
  } catch (error: any) {
    if (error.message?.toLowerCase().includes("unauthorized")) {
      res.status(403).json({ success: false, error: error.message });
      return;
    }
    res.status(404).json({ success: false, error: error.message });
  }
};
