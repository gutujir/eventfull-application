import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";
import Countdown from "../common/Countdown";
import Button from "../ui/Button";
import Card from "../ui/Card";
import type { Event } from "../../features/events/eventSlice";
import { isEventEnded } from "../../utils/eventStatus";

interface EventListProps {
  events: Event[] | null;
  isLoading: boolean;
  isError: boolean;
  message: string;
  onRetry: () => void;
  currentUser?: any;
}

// Helper to get full image URL
const getImageUrl = (path: string | null | undefined) => {
  if (!path)
    return "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
  if (path.startsWith("http")) return path;

  // Assuming backend is at localhost:3000 or derived from VITE_API_URL
  const baseUrl = (
    import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
  ).replace("/api/v1", "");
  return `${baseUrl}${path}`;
};

const EventList = ({
  events,
  isLoading,
  isError,
  message,
  onRetry,
  currentUser,
}: EventListProps) => {
  const missingProfileFields: string[] = [];
  if (currentUser?.role === "EVENTEE") {
    if (!currentUser.phone) missingProfileFields.push("Phone");
    if (!currentUser.location) missingProfileFields.push("Location");
    if (!currentUser.timezone) missingProfileFields.push("Timezone");
    if (!currentUser.bio) missingProfileFields.push("Bio");
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {missingProfileFields.length > 0 && (
        <div className="md:col-span-2 lg:col-span-3 rounded-2xl border border-amber-200 bg-amber-50 p-5 text-amber-900 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <p className="text-sm font-semibold">Complete your profile</p>
              <p className="text-sm text-amber-800">
                Add missing details to speed up ticket checkout.
              </p>
            </div>
            <div className="text-xs font-medium text-amber-900 bg-amber-100 px-3 py-1.5 rounded-full">
              Missing: {missingProfileFields.join(", ")}
            </div>
          </div>
        </div>
      )}
      {isLoading ? (
        // Skeleton Loader
        Array.from({ length: 6 }).map((_, i) => (
          <Card
            key={i}
            className="overflow-hidden border border-slate-100 animate-pulse"
          >
            <div className="h-48 bg-gray-200" />
            <div className="p-6">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4" />
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4" />
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="pt-4 border-t border-gray-100 flex justify-between">
                <div className="h-4 bg-gray-200 rounded w-1/4" />
                <div className="h-4 bg-gray-200 rounded w-1/4" />
              </div>
            </div>
          </Card>
        ))
      ) : isError ? (
        <div className="col-span-full text-center py-12">
          <p className="text-red-500 mb-4">{message}</p>
          <Button onClick={onRetry}>Retry</Button>
        </div>
      ) : events && events.length > 0 ? (
        events.map((event: Event) => {
          const eventEnded = isEventEnded(event);

          return (
            <Link
              to={`/events/${event.slug || event.id}`}
              key={event.id}
              className="group block"
            >
              <Card
                className="overflow-hidden border-slate-100 transition-transform duration-200 group-hover:-translate-y-1"
                elevated
              >
                <div className="h-48 bg-gray-200 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
                  <img
                    src={getImageUrl(event.imageUrl)}
                    alt={event.title}
                    className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center text-sm text-[var(--color-text-muted)]">
                      <FaCalendarAlt className="mr-2 text-[var(--color-brand)]" />
                      <div>
                        <div>
                          {new Date(event.date).toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                        {!eventEnded && (
                          <Countdown targetDate={event.date} className="mt-1" />
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {eventEnded && (
                        <span className="text-xs font-semibold text-amber-800 bg-amber-100 px-2 py-1 rounded-md border border-amber-200">
                          Ended
                        </span>
                      )}
                      {event.creator && (
                        <span className="text-xs font-medium text-[var(--color-brand)] bg-blue-50 px-2 py-1 rounded-md">
                          By {event.creator.first_name}{" "}
                          {event.creator.last_name}
                        </span>
                      )}
                    </div>
                  </div>

                  <h3 className="text-xl font-semibold text-[var(--color-text)] mb-2 group-hover:text-[var(--color-brand)] transition-colors line-clamp-1">
                    {event.title}
                  </h3>

                  <p className="text-[var(--color-text-muted)] text-sm mb-4 line-clamp-2">
                    {event.description}
                  </p>

                  <div className="flex items-center text-sm text-[var(--color-text-muted)] mb-4">
                    <FaMapMarkerAlt className="mr-2 text-[var(--color-brand)]" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>

                  {event.ticketTypes && event.ticketTypes.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {event.ticketTypes.slice(0, 2).map((ticket: any) => (
                        <span
                          key={ticket.id}
                          className="text-xs bg-slate-50 text-[var(--color-text-muted)] px-2 py-1 rounded border border-slate-200"
                        >
                          {ticket.name}: {ticket.currency} {ticket.price}
                        </span>
                      ))}
                      {event.ticketTypes.length > 2 && (
                        <span className="text-xs bg-slate-50 text-[var(--color-text-muted)] px-2 py-1 rounded border border-slate-200">
                          +{event.ticketTypes.length - 2} more
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center text-[var(--color-text)] font-semibold">
                      <FaTicketAlt className="mr-2 text-[var(--color-brand)]" />
                      {event.price > 0
                        ? `${event.currency} ${event.price}`
                        : "Free"}
                    </div>
                    <span className="text-[var(--color-brand)] font-medium text-sm">
                      {eventEnded ? "Booking closed" : "Book now"}
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          );
        })
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          No events found.
        </div>
      )}
    </div>
  );
};

export default EventList;
