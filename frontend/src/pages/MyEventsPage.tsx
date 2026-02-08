import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getMyEvents, deleteEvent, reset } from "../features/events/eventSlice";
import {
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaEdit,
  FaTrash,
  FaPlus,
  FaQrcode,
  FaUsers,
} from "react-icons/fa";
import Swal from "sweetalert2";

const MyEventsPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { events, isLoading, isError, message } = useAppSelector(
    (state) => state.events,
  );

  useEffect(() => {
    dispatch(getMyEvents());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleDelete = (id: string) => {
    Swal.fire({
      title: "Are you sure?",
      text: "You won't be able to revert this! This will permanently delete the event and all associated tickets.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        const actionResult = await dispatch(deleteEvent(id));
        if (deleteEvent.fulfilled.match(actionResult)) {
          Swal.fire({
            title: "Deleted!",
            text: "Your event has been deleted.",
            icon: "success",
            timer: 2000,
            showConfirmButton: false,
          });
        } else if (deleteEvent.rejected.match(actionResult)) {
          Swal.fire({
            title: "Cannot Delete!",
            text: actionResult.payload as string,
            icon: "error",
          });
        }
      }
    });
  };

  const handleEdit = (id: string) => {
    navigate(`/events/edit/${id}`);
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              My Events
            </h1>
            <p className="mt-2 text-lg text-gray-500">
              Manage the events you have created.
            </p>
          </div>
          <Link
            to="/events/create"
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <FaPlus className="mr-2" />
            Create Event
          </Link>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl shadow-lg h-96 animate-pulse"
              ></div>
            ))}
          </div>
        ) : isError ? (
          <div className="text-center py-12">
            <p className="text-red-500 mb-4">{message}</p>
            <button
              onClick={() => dispatch(getMyEvents())}
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Retry
            </button>
          </div>
        ) : events && events.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-100 flex flex-col"
              >
                <div className="h-48 bg-gray-200 relative">
                  <span
                    className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full ${
                      event.status === "PUBLISHED"
                        ? "bg-green-100 text-green-800"
                        : event.status === "DRAFT"
                          ? "bg-gray-100 text-gray-800"
                          : event.status === "CANCELLED"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                    }`}
                  >
                    {event.status}
                  </span>
                  <img
                    src={
                      event.imageUrl ||
                      `https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80`
                    }
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-grow">
                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <FaCalendarAlt className="mr-2 text-indigo-400" />
                    <span>
                      {new Date(event.date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-500 mb-4">
                    <FaMapMarkerAlt className="mr-2 text-indigo-400" />
                    <span className="line-clamp-1">{event.location}</span>
                  </div>
                </div>
                <div className="p-4 bg-gray-50 border-t border-gray-100 flex justify-between">
                  <button
                    onClick={() => handleEdit(event.id)}
                    className="flex items-center text-indigo-600 hover:text-indigo-800 font-medium"
                  >
                    <FaEdit className="mr-2" /> Edit
                  </button>
                  <button
                    onClick={() => navigate(`/my-events/${event.id}/attendees`)}
                    className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
                    title="View Attendees"
                  >
                    <FaUsers className="mr-2" /> Attendees
                  </button>
                  <button
                    onClick={() =>
                      navigate(`/verify-ticket?eventId=${event.id}`)
                    }
                    className="flex items-center text-green-600 hover:text-green-800 font-medium"
                    title="Verify Tickets"
                  >
                    <FaQrcode className="mr-2" /> Verify
                  </button>
                  <button
                    onClick={() => {
                      if ((event as any)._count?.tickets > 0) return;
                      handleDelete(event.id);
                    }}
                    disabled={(event as any)._count?.tickets > 0}
                    className={`flex items-center font-medium ${
                      (event as any)._count?.tickets > 0
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-red-600 hover:text-red-800"
                    }`}
                    title={
                      (event as any)._count?.tickets > 0
                        ? "Cannot delete event with active bookings"
                        : "Delete Event"
                    }
                  >
                    <FaTrash className="mr-2" /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-medium text-gray-900">
              No events found
            </h3>
            <p className="mt-1 text-gray-500">
              You haven't created any events yet.
            </p>
            <div className="mt-6">
              <Link
                to="/events/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaPlus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                Create New Event
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyEventsPage;
