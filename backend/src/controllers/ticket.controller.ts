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

    const ticket = await ticketService.validateTicket(qrCode, eventId);
    res
      .status(200)
      .json({ success: true, message: "Ticket valid and scanned", ticket });
  } catch (error: any) {
    res.status(400).json({ success: false, error: error.message });
  }
};
