import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getEvent, reset } from "../features/events/eventSlice";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaUser,
  FaShare,
  FaArrowLeft,
  FaBuilding,
  FaGlobe,
  FaPhone,
} from "react-icons/fa";
import Countdown from "../components/common/Countdown";
import PurchaseTicketModal from "../components/tickets/PurchaseTicketModal";
import api from "../services/api";
import { toast } from "react-toastify";

const EventDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { event, isLoading, isError, message } = useAppSelector(
    (state) => state.events,
  );
  const { user } = useAppSelector((state) => state.auth);
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [reminderMode, setReminderMode] = useState("1d");
  const [customReminder, setCustomReminder] = useState("");

  const getImageUrl = (path: string | null | undefined) => {
    if (!path) return "";
    if (path.startsWith("http") || path.startsWith("blob:")) return path;
    const baseUrl = (
      import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
    ).replace("/api/v1", "");
    return `${baseUrl}${path.startsWith("/") ? "" : "/"}${path}`;
  };

  useEffect(() => {
    if (id) {
      dispatch(getEvent(id));
    }

    return () => {
      dispatch(reset());
    };
  }, [dispatch, id]);

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: event?.description,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };

  const handleSetReminder = async () => {
    if (!event?.date) return;

    let scheduledAt: Date | null = null;
    const eventDate = new Date(event.date);

    if (reminderMode === "custom") {
      if (!customReminder) {
        toast.error("Select a reminder date/time.");
        return;
      }
      scheduledAt = new Date(customReminder);
    } else {
      const minutesMap: Record<string, number> = {
        "1h": 60,
        "1d": 60 * 24,
        "1w": 60 * 24 * 7,
      };
      const minutes = minutesMap[reminderMode] || 60 * 24;
      scheduledAt = new Date(eventDate.getTime() - minutes * 60000);
    }

    if (!scheduledAt || scheduledAt <= new Date()) {
      toast.error("Reminder time must be in the future.");
      return;
    }

    await api.post("/reminders", {
      eventId: event.id,
      scheduledAt: scheduledAt.toISOString(),
    });

    toast.success("Reminder scheduled successfully.");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex flex-col justify-center items-center">
        <div className="text-red-500 text-xl font-bold mb-4">
          Error: {message}
        </div>
        <Link
          to="/"
          className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
        >
          Back to Events
        </Link>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Hero Image Section */}
      <div className="relative h-96 w-full">
        <img
          src={
            event.imageUrl ||
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80"
          }
          alt={event.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gray-900 bg-opacity-40"></div>
        <div className="absolute top-6 left-6">
          <Link
            to="/"
            className="flex items-center text-white bg-black bg-opacity-30 hover:bg-opacity-50 px-4 py-2 rounded-full transition backdrop-blur-sm"
          >
            <FaArrowLeft className="mr-2" /> Back to Events
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-32 relative z-10">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:flex">
            {/* Main Content */}
            <div className="p-8 md:w-2/3 border-r border-gray-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2">
                    {event.title}
                  </h1>
                  {event.creator && (
                    <div className="flex items-center text-gray-500 text-sm">
                      <FaUser className="mr-2 text-indigo-500" />
                      Organized by{" "}
                      <span className="font-bold text-gray-900 ml-1">
                        {event.creator.first_name} {event.creator.last_name}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-gray-100 hover:bg-indigo-50 text-gray-600 hover:text-indigo-600 transition"
                  title="Share Event"
                >
                  <FaShare />
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                <div className="flex items-center bg-indigo-50 text-indigo-700 px-4 py-2 rounded-lg">
                  <FaCalendarAlt className="mr-2" />
                  <div>
                    <div className="font-medium">
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}{" "}
                      at{" "}
                      {new Date(event.date).toLocaleTimeString(undefined, {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                    <Countdown targetDate={event.date} className="mt-1" />
                  </div>
                </div>
                <div className="flex items-center bg-pink-50 text-pink-700 px-4 py-2 rounded-lg">
                  <FaMapMarkerAlt className="mr-2" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>

              <div className="prose max-w-none text-gray-600">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  About this Event
                </h3>
                <p className="whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Sidebar / Ticket Selection */}
            <div className="p-8 md:w-1/3 bg-gray-50">
              <div className="sticky top-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
                  <FaTicketAlt className="mr-2 text-indigo-600" />
                  Tickets
                </h3>

                <div className="space-y-4 mb-8">
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    event.ticketTypes.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-indigo-300 transition cursor-pointer"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-bold text-gray-900">
                            {ticket.name}
                          </span>
                          <span className="text-indigo-600 font-bold">
                            {ticket.currency} {ticket.price}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          {ticket.name} Access
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-gray-900">
                          General Admission
                        </span>
                        <span className="text-indigo-600 font-bold">
                          {event.price > 0
                            ? `${event.currency} ${event.price}`
                            : "Free"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                  <p className="text-sm text-gray-500 mb-4 text-center">
                    Sales end soon. Secure your spot!
                  </p>
                  <button
                    onClick={() => setIsPurchaseModalOpen(true)}
                    className="w-full py-4 bg-gradient-to-r from-indigo-600 to-indigo-700 text-white font-bold rounded-xl shadow-lg hover:from-indigo-700 hover:to-indigo-800 transform hover:-translate-y-0.5 transition-all"
                  >
                    Register Now
                  </button>
                </div>

                {user?.role === "EVENTEE" && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-3">
                      Set a Reminder
                    </h4>
                    <div className="space-y-3">
                      <select
                        value={reminderMode}
                        onChange={(e) => setReminderMode(e.target.value)}
                        className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                      >
                        <option value="1h">1 hour before</option>
                        <option value="1d">1 day before</option>
                        <option value="1w">1 week before</option>
                        <option value="custom">Custom date/time</option>
                      </select>

                      {reminderMode === "custom" && (
                        <input
                          type="datetime-local"
                          value={customReminder}
                          onChange={(e) => setCustomReminder(e.target.value)}
                          className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 text-sm"
                        />
                      )}

                      <button
                        type="button"
                        onClick={handleSetReminder}
                        className="w-full rounded-lg bg-indigo-600 text-white py-2 text-sm font-semibold hover:bg-indigo-700"
                      >
                        Schedule Reminder
                      </button>
                    </div>
                  </div>
                )}

                {event.creator && (
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
                    <h4 className="text-lg font-semibold text-gray-900 mb-4">
                      About the Organizer
                    </h4>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center overflow-hidden">
                        {event.creator.avatarUrl ? (
                          <img
                            src={getImageUrl(event.creator.avatarUrl)}
                            alt="Organizer"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="font-bold">
                            {event.creator.first_name?.[0] || ""}
                            {event.creator.last_name?.[0] || ""}
                          </span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Organizer</p>
                        <p className="font-semibold text-gray-900">
                          {event.creator.first_name} {event.creator.last_name}
                        </p>
                        {event.creator.jobTitle && (
                          <p className="text-xs text-gray-500">
                            {event.creator.jobTitle}
                          </p>
                        )}
                      </div>
                    </div>

                    {event.creator.bio && (
                      <p className="text-sm text-gray-600 mb-4">
                        {event.creator.bio}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-gray-600">
                      {event.creator.company && (
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-indigo-500" />
                          <span>{event.creator.company}</span>
                        </div>
                      )}
                      {event.creator.phone && (
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-indigo-500" />
                          <span>{event.creator.phone}</span>
                        </div>
                      )}
                      {event.creator.website && (
                        <div className="flex items-center gap-2">
                          <FaGlobe className="text-indigo-500" />
                          <a
                            href={event.creator.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-indigo-600 hover:text-indigo-800"
                          >
                            {event.creator.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {event && (
        <PurchaseTicketModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          event={event}
        />
      )}
    </div>
  );
};

export default EventDetailsPage;
