import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { FaArrowLeft, FaUser, FaTicketAlt } from "react-icons/fa";
import api from "../services/api";

const EventAttendeesPage = () => {
  const { id } = useParams<{ id: string }>();
  const [attendees, setAttendees] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.get(`/events/${id}/attendees`);
        setAttendees(res.data?.attendees || []);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load attendees");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) load();
  }, [id]);

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Event Attendees</h1>
          <Link
            to="/my-events"
            className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
          >
            <FaArrowLeft className="mr-1" /> Back to My Events
          </Link>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : attendees.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            No attendees yet.
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50 text-gray-600">
                <tr>
                  <th className="px-4 py-3 text-left">Attendee</th>
                  <th className="px-4 py-3 text-left">Ticket Type</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Purchased</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {attendees.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 text-gray-900">
                      <div className="flex items-center gap-2">
                        <FaUser className="text-indigo-500" />
                        {t.user
                          ? `${t.user.first_name} ${t.user.last_name} (${t.user.email})`
                          : "-"}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      <div className="flex items-center gap-2">
                        <FaTicketAlt className="text-indigo-500" />
                        {t.ticketType?.name || "General"}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          t.status === "USED"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {t.purchasedAt
                        ? new Date(t.purchasedAt).toLocaleDateString()
                        : "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default EventAttendeesPage;
