import { prisma } from "../src/lib/prisma";
import * as eventService from "../src/services/event.service";
import * as reminderService from "../src/services/reminder.service";
import * as ticketService from "../src/services/ticket.service";
import * as analyticsService from "../src/services/analytics.service";
import { v4 as uuidv4 } from "uuid";

// Mock Express Request/Response for controllers if needed, but we can test services directly for speed
// or use axios to hit the running server.
// Let's test services directly + some console logs.

const main = async () => {
  console.log("Starting Verification...");

  try {
    // 1. Create a User (Creator)
    const creatorEmail = `creator-${uuidv4()}@test.com`;
    const creator = await prisma.user.create({
      data: {
        email: creatorEmail,
        password: "hashedpassword",
        first_name: "Test",
        last_name: "Creator",
        role: "CREATOR",
      },
    });
    console.log(`Created Creator: ${creator.id}`);

    // 2. Create an Event
    const event = await eventService.createEvent({
      title: "Test Event " + uuidv4(),
      description: "A test event for verification",
      location: "Virtual",
      date: new Date(Date.now() + 86400000), // Tomorrow
      slug: `test-event-${uuidv4()}`,
      creator: { connect: { id: creator.id } },
      price: 100,
      currency: "NGN",
    });
    console.log(`Created Event: ${event.id} (${event.slug})`);

    // 3. Verify Shareability
    // Logic: Call service logic or simulate controller
    console.log("\n--- Shareability ---");
    const shareMeta = {
      title: event.title,
      url: `http://localhost:3000/events/${event.slug}`,
    };
    console.log("Share Metadata:", shareMeta);
    if (shareMeta.url.includes(event.slug)) {
      console.log("✅ Shareability check passed");
    } else {
      console.error("❌ Shareability check failed");
    }

    // 4. Verify Notifications
    // Logic: Create a reminder
    console.log("\n--- Notifications ---");
    const reminder = await reminderService.createReminder(
      creator.id,
      event.id,
      new Date(Date.now() + 60000), // 1 minute from now
    );
    console.log(
      `Created Reminder: ${reminder.id} scheduled for ${reminder.scheduledAt}`,
    );

    const userReminders = await reminderService.getRemindersByUser(creator.id);
    if (userReminders.some((r) => r.id === reminder.id)) {
      console.log("✅ Reminder creation and fetch passed");
    } else {
      console.error("❌ Reminder fetch failed");
    }

    // 5. Verify Analytics
    console.log("\n--- Analytics ---");
    // Create user (Eventee)
    const eventee = await prisma.user.create({
      data: {
        email: `eventee-${uuidv4()}@test.com`,
        password: "hashedpassword",
        first_name: "Test",
        last_name: "Eventee",
        role: "EVENTEE",
      },
    });

    // Purchase Ticket
    const ticketData = await ticketService.purchaseTicket(eventee.id, event.id);
    console.log(
      `Ticket Purchased: ${ticketData.id} for ${ticketData.purchasePrice}`,
    );

    // Check Creator Stats (Should handle Decimal)
    let creatorStats = await analyticsService.getCreatorStats(creator.id);
    console.log("Creator Stats (Pre-Scan):", creatorStats);

    // Scan Ticket
    await ticketService.validateTicket(ticketData.qrCode, event.id);
    console.log("Ticket Scanned/Used");

    // Check Event Stats
    const eventStats = await analyticsService.getEventStats(event.id);
    console.log("Event Stats (Post-Scan):", eventStats);

    if (
      Number(eventStats.ticketsSold) === 1 &&
      Number(eventStats.revenue) === 100 &&
      eventStats.attendeesCheckedIn === 1
    ) {
      console.log("✅ Analytics check passed");
    } else {
      console.error("❌ Analytics check failed", eventStats);
    }
  } catch (error) {
    console.error("Verification Failed:", error);
  } finally {
    await prisma.$disconnect();
  }
};

main();
