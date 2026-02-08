import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaBell, FaCalendarAlt, FaMapMarkerAlt } from "react-icons/fa";
import api from "../services/api";

const MyRemindersPage = () => {
  const [reminders, setReminders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true);
        const res = await api.get("/reminders");
        setReminders(res.data?.reminders || []);
      } catch (err: any) {
        setError(err?.response?.data?.error || "Failed to load reminders");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, []);

  return (
    <div className="bg-gray-50 min-h-screen pt-8 pb-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 flex items-center">
              <FaBell className="mr-3 text-indigo-600" /> My Reminders
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Manage your upcoming event reminders.
            </p>
          </div>
          <Link
            to="/events"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            Browse Events
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
        ) : reminders.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-100 p-8 text-center text-gray-500">
            No reminders scheduled yet.
          </div>
        ) : (
          <div className="space-y-4">
            {reminders.map((reminder) => (
              <div
                key={reminder.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4"
              >
                <div>
                  <p className="text-sm text-gray-500">Event</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {reminder.event?.title || "Event"}
                  </p>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-600">
                    <span className="flex items-center">
                      <FaCalendarAlt className="mr-2 text-indigo-500" />
                      {reminder.event?.date
                        ? new Date(reminder.event.date).toLocaleString()
                        : "Date TBD"}
                    </span>
                    <span className="flex items-center">
                      <FaMapMarkerAlt className="mr-2 text-indigo-500" />
                      {reminder.event?.location || "Location TBD"}
                    </span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <p className="text-xs uppercase tracking-wide text-gray-400">
                    Scheduled
                  </p>
                  <p className="font-semibold text-gray-900">
                    {new Date(reminder.scheduledAt).toLocaleString()}
                  </p>
                  <span
                    className={`inline-flex mt-2 px-2 py-1 rounded-full text-xs font-medium ${
                      reminder.isSent
                        ? "bg-green-100 text-green-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {reminder.isSent ? "Sent" : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyRemindersPage;
