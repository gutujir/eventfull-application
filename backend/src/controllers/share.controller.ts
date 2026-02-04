import { Request, Response } from "express";
import * as eventService from "../services/event.service";

/**
 * Get shareable metadata for an event (Open Graph tags)
 * Public endpoint - no authentication required
 */
export const getEventShareMetadata = async (req: Request, res: Response) => {
  try {
    const slugParam = req.params.slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;

    if (!slug) {
      res.status(400).json({ success: false, error: "Missing slug parameter" });
      return;
    }

    const event = await eventService.getEventBySlug(slug);

    // Generate shareable URL (you'd use your actual frontend domain here)
    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const shareUrl = `${frontendUrl}/events/${event.slug}`;

    // Return Open Graph metadata
    const metadata = {
      title: event.title,
      description: event.description,
      image: event.imageUrl || `${frontendUrl}/default-event-image.png`,
      url: shareUrl,
      type: "website",
      siteName: "Eventful",
      // Additional metadata
      eventDate: event.date,
      location: event.location,
      price: event.price.toString(),
      currency: event.currency,
      // Open Graph tags for social media
      ogTags: {
        "og:title": event.title,
        "og:description": event.description,
        "og:image": event.imageUrl || `${frontendUrl}/default-event-image.png`,
        "og:url": shareUrl,
        "og:type": "website",
        "og:site_name": "Eventful",
      },
      // Twitter Card tags
      twitterTags: {
        "twitter:card": "summary_large_image",
        "twitter:title": event.title,
        "twitter:description": event.description,
        "twitter:image":
          event.imageUrl || `${frontendUrl}/default-event-image.png`,
      },
    };

    res.status(200).json({ success: true, metadata });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};

/**
 * Generate a shareable link for an event
 */
export const getShareableLink = async (req: Request, res: Response) => {
  try {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      res.status(400).json({ success: false, error: "Missing event ID" });
      return;
    }

    const event = await eventService.getEventById(id);

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:3000";
    const shareUrl = `${frontendUrl}/events/${event.slug}`;

    res.status(200).json({
      success: true,
      shareUrl,
      slug: event.slug,
      title: event.title,
    });
  } catch (error: any) {
    res.status(404).json({ success: false, error: error.message });
  }
};
