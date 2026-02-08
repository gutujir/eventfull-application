import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getEvents, reset } from "../features/events/eventSlice";
import EventList from "../components/events/EventList";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";

const EventsPage = () => {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [locationTerm, setLocationTerm] = useState("");

  const { events, isLoading, isError, message } = useAppSelector(
    (state) => state.events,
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      dispatch(getEvents({ search: searchTerm, location: locationTerm }));
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, locationTerm, dispatch]);

  useEffect(() => {
    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(getEvents({ search: searchTerm, location: locationTerm }));
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-gray-900 sm:text-5xl">
            Explore All Events
          </h1>
          <p className="mt-4 text-xl text-gray-500 max-w-2xl mx-auto">
            Find the perfect event for you.
          </p>
        </div>

        {/* Search Bar - Simplified for Listing Page */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-white rounded-xl shadow-lg p-3 flex flex-col md:flex-row gap-2 border border-gray-200">
            <div className="flex-grow flex items-center bg-gray-50 rounded-lg px-4 py-3">
              <FaSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search events..."
                className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex-grow md:max-w-[250px] flex items-center bg-gray-50 rounded-lg px-4 py-3">
              <FaMapMarkerAlt className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Location"
                className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400"
                value={locationTerm}
                onChange={(e) => setLocationTerm(e.target.value)}
              />
            </div>
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-lg font-bold shadow-md hover:bg-indigo-700 transition-colors">
              Search
            </button>
          </div>
        </div>

        <EventList
          events={events}
          isLoading={isLoading}
          isError={isError}
          message={message}
          onRetry={handleRetry}
          currentUser={user}
        />
      </div>
    </div>
  );
};

export default EventsPage;
