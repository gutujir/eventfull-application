import { Link } from "react-router-dom";
import { FaCalendarAlt, FaMapMarkerAlt, FaTicketAlt } from "react-icons/fa";
import Countdown from "../common/Countdown";
import type { Event } from "../../features/events/eventSlice";

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
          <div
            key={i}
            className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 animate-pulse"
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
          </div>
        ))
      ) : isError ? (
        <div className="col-span-full text-center py-12">
          <p className="text-red-500 mb-4">{message}</p>
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Retry
          </button>
        </div>
      ) : events && events.length > 0 ? (
        events.map((event: Event) => (
          <Link
            to={`/events/${event.slug || event.id}`}
            key={event.id}
            className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100 group block"
          >
            <div className="h-48 bg-gray-200 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10" />
              <img
                src={getImageUrl(event.imageUrl)}
                alt={event.title}
                className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
            <div className="p-6">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center text-sm text-gray-500">
                  <FaCalendarAlt className="mr-2 text-indigo-400" />
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
                    <Countdown targetDate={event.date} className="mt-1" />
                  </div>
                </div>
                {event.creator && (
                  <span className="text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-md">
                    By {event.creator.first_name} {event.creator.last_name}
                  </span>
                )}
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-1">
                {event.title}
              </h3>

              <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                {event.description}
              </p>

              <div className="flex items-center text-sm text-gray-500 mb-4">
                <FaMapMarkerAlt className="mr-2 text-indigo-400" />
                <span className="line-clamp-1">{event.location}</span>
              </div>

              {/* Ticket Types Tags */}
              {event.ticketTypes && event.ticketTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {event.ticketTypes.slice(0, 2).map((ticket: any) => (
                    <span
                      key={ticket.id}
                      className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200"
                    >
                      {ticket.name}: {ticket.currency} {ticket.price}
                    </span>
                  ))}
                  {event.ticketTypes.length > 2 && (
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded border border-gray-200">
                      +{event.ticketTypes.length - 2} more
                    </span>
                  )}
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center text-gray-900 font-bold">
                  <FaTicketAlt className="mr-2 text-indigo-500" />
                  {event.price > 0
                    ? `${event.currency} ${event.price}`
                    : "Free"}
                </div>
                <button className="text-indigo-600 font-medium hover:text-indigo-800 text-sm">
                  Book Now
                </button>
              </div>
            </div>
          </Link>
        ))
      ) : (
        <div className="col-span-full text-center py-12 text-gray-500">
          No events found.
        </div>
      )}
    </div>
  );
};

export default EventList;
