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
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import SectionHeader from "../components/ui/SectionHeader";
import { isEventEnded } from "../utils/eventStatus";

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
  const [shareUrl, setShareUrl] = useState("");

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

  useEffect(() => {
    const loadShareUrl = async () => {
      if (!event?.id) return;
      try {
        const response = await api.get(`/share/events/${event.id}/link`);
        setShareUrl(response.data?.shareUrl || window.location.href);
      } catch {
        setShareUrl(window.location.href);
      }
    };

    loadShareUrl();
  }, [event?.id]);

  const handleShare = () => {
    const currentUrl = shareUrl || window.location.href;
    if (navigator.share) {
      navigator
        .share({
          title: event?.title,
          text: event?.description,
          url: currentUrl,
        })
        .catch(() => {
          toast.info("Sharing was cancelled.");
        });
    } else {
      navigator.clipboard.writeText(currentUrl);
      alert("Link copied to clipboard!");
    }
  };

  const openShareWindow = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const handleCopyLink = async () => {
    const currentUrl = shareUrl || window.location.href;
    await navigator.clipboard.writeText(currentUrl);
    toast.success("Link copied.");
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
      <div className="min-h-screen pt-20 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-(--color-brand)"></div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen pt-20 flex flex-col justify-center items-center">
        <div className="text-red-500 text-xl font-bold mb-4">
          Error: {message}
        </div>
        <Link to="/">
          <Button>Back to Events</Button>
        </Link>
      </div>
    );
  }

  if (!event) {
    return null;
  }

  const eventEnded = isEventEnded(event);
  const isCreatorUser = user?.role === "CREATOR";
  const creatorAvatar =
    event.creator?.avatarUrl ||
    (event.creator as any)?.avatar_url ||
    (event.creator as any)?.profilePicture ||
    (event.creator as any)?.profile_picture ||
    (event.creator as any)?.photoUrl ||
    (event.creator as any)?.photo_url ||
    null;
  const bookingDisabledReason = eventEnded
    ? "This event has ended. Ticket booking is closed."
    : isCreatorUser
      ? "Creators cannot purchase tickets."
      : "";
  const isBookingDisabled = Boolean(bookingDisabledReason);

  return (
    <div className="min-h-screen pb-20">
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
          <Link to="/" className="inline-block">
            <Button
              variant="ghost"
              className="text-white bg-black/35 hover:bg-black/50 rounded-full backdrop-blur-sm border border-white/20"
              leftIcon={<FaArrowLeft />}
            >
              Back to Events
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-1 sm:px-2 -mt-32 relative z-10">
        <Card className="overflow-hidden" elevated>
          <div className="md:flex">
            {/* Main Content */}
            <div className="p-8 md:w-2/3 border-r border-slate-100">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <SectionHeader title={event.title} />
                  {event.creator && (
                    <div className="flex items-center text-(--color-text-muted) text-sm">
                      <FaUser className="mr-2 text-(--color-brand)" />
                      Organized by{" "}
                      <span className="font-semibold text-(--color-text) ml-1">
                        {event.creator.first_name} {event.creator.last_name}
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleShare}
                  className="p-3 rounded-full bg-slate-100 hover:bg-blue-50 text-(--color-text-muted) hover:text-(--color-brand) transition"
                  title="Share Event"
                >
                  <FaShare />
                </button>
              </div>

              <div className="mb-8 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() =>
                    openShareWindow(
                      `https://wa.me/?text=${encodeURIComponent(`${event.title} - ${shareUrl || window.location.href}`)}`,
                    )
                  }
                  className="px-3 py-2 text-xs rounded-lg bg-green-50 text-green-700 border border-green-100"
                >
                  WhatsApp
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openShareWindow(
                      `https://twitter.com/intent/tweet?text=${encodeURIComponent(event.title)}&url=${encodeURIComponent(shareUrl || window.location.href)}`,
                    )
                  }
                  className="px-3 py-2 text-xs rounded-lg bg-sky-50 text-sky-700 border border-sky-100"
                >
                  X/Twitter
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openShareWindow(
                      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl || window.location.href)}`,
                    )
                  }
                  className="px-3 py-2 text-xs rounded-lg bg-blue-50 text-blue-700 border border-blue-100"
                >
                  Facebook
                </button>
                <button
                  type="button"
                  onClick={() =>
                    openShareWindow(
                      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl || window.location.href)}`,
                    )
                  }
                  className="px-3 py-2 text-xs rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100"
                >
                  LinkedIn
                </button>
                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="px-3 py-2 text-xs rounded-lg bg-slate-100 text-slate-700 border border-slate-200"
                >
                  Copy Link
                </button>
              </div>

              <div className="flex flex-wrap gap-4 mb-8 text-sm">
                <div className="flex items-center bg-blue-50 text-blue-700 px-4 py-2 rounded-lg">
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
                    {eventEnded ? (
                      <span className="mt-1 inline-flex items-center rounded-md border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
                        Ended
                      </span>
                    ) : (
                      <Countdown targetDate={event.date} className="mt-1" />
                    )}
                  </div>
                </div>
                <div className="flex items-center bg-rose-50 text-rose-700 px-4 py-2 rounded-lg">
                  <FaMapMarkerAlt className="mr-2" />
                  <span className="font-medium">{event.location}</span>
                </div>
              </div>

              <div className="prose max-w-none text-(--color-text-muted)">
                <h3 className="text-xl font-semibold text-(--color-text) mb-4">
                  About this Event
                </h3>
                <p className="whitespace-pre-line leading-relaxed">
                  {event.description}
                </p>
              </div>
            </div>

            {/* Sidebar / Ticket Selection */}
            <div className="p-8 md:w-1/3 bg-slate-50">
              <div className="sticky top-8">
                <h3 className="text-xl font-semibold text-(--color-text) mb-6 flex items-center">
                  <FaTicketAlt className="mr-2 text-(--color-brand)" />
                  Tickets
                </h3>

                <div className="space-y-4 mb-8">
                  {event.ticketTypes && event.ticketTypes.length > 0 ? (
                    event.ticketTypes.map((ticket) => (
                      <div
                        key={ticket.id}
                        className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm hover:border-blue-300 transition"
                      >
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-(--color-text)">
                            {ticket.name}
                          </span>
                          <span className="text-(--color-brand) font-semibold">
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
                        <span className="font-semibold text-(--color-text)">
                          General Admission
                        </span>
                        <span className="text-(--color-brand) font-semibold">
                          {event.price > 0
                            ? `${event.currency} ${event.price}`
                            : "Free"}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <Card className="p-6 border-gray-200">
                  <p className="text-sm text-(--color-text-muted) mb-4 text-center">
                    {isBookingDisabled
                      ? bookingDisabledReason
                      : "Sales end soon. Secure your spot!"}
                  </p>
                  <Button
                    onClick={() => {
                      if (isBookingDisabled) {
                        toast.info(bookingDisabledReason);
                        return;
                      }
                      setIsPurchaseModalOpen(true);
                    }}
                    fullWidth
                    size="lg"
                    disabled={isBookingDisabled}
                  >
                    {eventEnded ? "Event Ended" : "Register Now"}
                  </Button>
                </Card>

                {user?.role === "EVENTEE" && !eventEnded && (
                  <Card className="p-6 border-gray-200 mt-6">
                    <h4 className="text-lg font-semibold text-(--color-text) mb-3">
                      Set a Reminder
                    </h4>
                    <div className="space-y-3">
                      <select
                        value={reminderMode}
                        onChange={(e) => setReminderMode(e.target.value)}
                        aria-label="Reminder timing"
                        title="Reminder timing"
                        className="w-full rounded-lg border border-gray-200 bg-slate-50 px-3 py-2 text-sm"
                      >
                        <option value="1h">1 hour before</option>
                        <option value="1d">1 day before</option>
                        <option value="1w">1 week before</option>
                        <option value="custom">Custom date/time</option>
                      </select>

                      {reminderMode === "custom" && (
                        <Input
                          type="datetime-local"
                          value={customReminder}
                          onChange={(e) => setCustomReminder(e.target.value)}
                          aria-label="Custom reminder date and time"
                          title="Custom reminder date and time"
                          className="bg-slate-50"
                        />
                      )}

                      <Button
                        type="button"
                        onClick={handleSetReminder}
                        fullWidth
                      >
                        Schedule Reminder
                      </Button>
                    </div>
                  </Card>
                )}

                {event.creator && (
                  <Card className="p-6 border-gray-200 mt-6">
                    <h4 className="text-lg font-semibold text-(--color-text) mb-4">
                      About the Organizer
                    </h4>
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-14 w-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center overflow-hidden">
                        {creatorAvatar ? (
                          <img
                            src={getImageUrl(creatorAvatar)}
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
                      <p className="text-sm text-(--color-text-muted) mb-4">
                        {event.creator.bio}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-(--color-text-muted)">
                      {event.creator.company && (
                        <div className="flex items-center gap-2">
                          <FaBuilding className="text-(--color-brand)" />
                          <span>{event.creator.company}</span>
                        </div>
                      )}
                      {event.creator.phone && (
                        <div className="flex items-center gap-2">
                          <FaPhone className="text-(--color-brand)" />
                          <span>{event.creator.phone}</span>
                        </div>
                      )}
                      {event.creator.website && (
                        <div className="flex items-center gap-2">
                          <FaGlobe className="text-(--color-brand)" />
                          <a
                            href={event.creator.website}
                            target="_blank"
                            rel="noreferrer"
                            className="text-(--color-brand) hover:text-(--color-brand-hover)"
                          >
                            {event.creator.website.replace(/^https?:\/\//, "")}
                          </a>
                        </div>
                      )}
                    </div>
                  </Card>
                )}
              </div>
            </div>
          </div>
        </Card>
      </div>
      {event && (
        <PurchaseTicketModal
          isOpen={isPurchaseModalOpen}
          onClose={() => setIsPurchaseModalOpen(false)}
          event={event}
          isBookingDisabled={isBookingDisabled}
          bookingDisabledReason={bookingDisabledReason}
        />
      )}
    </div>
  );
};

export default EventDetailsPage;
