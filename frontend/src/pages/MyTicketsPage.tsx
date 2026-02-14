import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getMyTickets, reset } from "../features/tickets/ticketSlice";
import { Link } from "react-router-dom";
import { FaTicketAlt, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import Card from "../components/ui/Card";
import Button from "../components/ui/Button";
import SectionHeader from "../components/ui/SectionHeader";

const MyTicketsPage = () => {
  const dispatch = useAppDispatch();
  const { tickets, isLoading, isError, message } = useAppSelector(
    (state) => state.tickets,
  );

  useEffect(() => {
    dispatch(getMyTickets());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  return (
    <div className="min-h-screen py-8 px-1 sm:px-2">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <SectionHeader
            eyebrow="Tickets"
            title="My Tickets"
            subtitle="Manage all your booked events in one place."
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : isError ? (
          <Card className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {message}</span>
          </Card>
        ) : tickets && tickets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tickets.map((ticket) => (
              <Card
                key={ticket.id}
                className="overflow-hidden border-slate-100 hover:shadow-xl transition-shadow"
              >
                <div className="bg-(--color-brand) px-6 py-4 flex justify-between items-center text-white">
                  <span className="font-bold text-lg">
                    {ticket.event?.title || "Event Name Unavailable"}
                  </span>
                  <span className="text-xs bg-white/20 px-2 py-1 rounded">
                    {ticket.status}
                  </span>
                </div>

                <div className="p-6">
                  <div className="flex justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center text-(--color-text-muted)">
                        <FaCalendarAlt className="mr-2 text-(--color-brand)" />
                        <span className="text-sm">
                          {ticket.event?.date
                            ? new Date(ticket.event.date).toLocaleDateString()
                            : "Date TBD"}
                        </span>
                      </div>
                      <div className="flex items-center text-(--color-text-muted)">
                        <FaMapMarkerAlt className="mr-2 text-(--color-brand)" />
                        <span className="text-sm">
                          {ticket.event?.location || "Location TBD"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500 mt-2">
                        Ticket Type:{" "}
                        <span className="font-semibold text-gray-800">
                          {ticket.ticketType?.name || "General"}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Amount Paid:{" "}
                        <span className="font-semibold text-emerald-700">
                          {ticket.event?.currency || "NGN"}{" "}
                          {ticket.purchasePrice}
                        </span>
                      </div>
                      <div className="text-sm text-gray-500">
                        Booking Ref:{" "}
                        <span className="font-mono text-xs bg-gray-100 px-1 rounded">
                          {ticket.id.split("-")[0].toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-center justify-center ml-4">
                      {ticket.qrCodeImage ? (
                        <img
                          src={ticket.qrCodeImage}
                          alt="Ticket QR Code"
                          className="w-24 h-24 border-2 border-gray-100 rounded-lg p-1"
                        />
                      ) : (
                        <div className="w-24 h-24 rounded-lg border border-dashed border-gray-300 grid place-items-center text-[10px] text-gray-400">
                          QR unavailable
                        </div>
                      )}
                      <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-wide">
                        Scan to Verify
                      </p>
                    </div>
                  </div>

                  {/* Ticket Code Display */}
                  <div className="mt-3 bg-gray-50 p-2 rounded border border-gray-100 text-center">
                    <p className="text-xs text-gray-500 mb-1">Ticket Code</p>
                    <code className="text-xs font-mono break-all text-indigo-600 block bg-white p-1 rounded border border-gray-200">
                      {ticket.qrCode}
                    </code>
                  </div>
                </div>

                <div className="bg-gray-50 px-6 py-3 border-t border-gray-100 flex justify-between items-center">
                  <Link
                    to={`/events/${ticket.eventId}`}
                    className="text-(--color-brand) hover:text-(--color-brand-hover) text-sm font-medium"
                  >
                    View Event
                  </Link>
                  <span className="text-xs text-gray-400 font-mono">
                    ID: {ticket.id.slice(0, 8)}...
                  </span>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-20">
            <div className="mx-auto h-24 w-24 text-gray-300 mb-4">
              <FaTicketAlt className="w-full h-full" />
            </div>
            <h3 className="text-xl font-medium text-(--color-text) mb-2">
              No tickets found
            </h3>
            <p className="text-(--color-text-muted) mb-6">
              You haven't purchased any tickets yet.
            </p>
            <Link to="/">
              <Button size="lg">Browse Events</Button>
            </Link>
          </Card>
        )}
      </div>
    </div>
  );
};

export default MyTicketsPage;
