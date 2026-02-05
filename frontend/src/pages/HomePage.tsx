import { Link } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaTicketAlt,
  FaUsers,
  FaShieldAlt,
  FaQuoteLeft,
} from "react-icons/fa";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getEvents, reset } from "../features/events/eventSlice";
import EventList from "../components/events/EventList";

const HomePage = () => {
  const dispatch = useAppDispatch();
  const { events, isLoading, isError, message } = useAppSelector(
    (state) => state.events,
  );
  const { user } = useAppSelector((state) => state.auth);

  useEffect(() => {
    dispatch(getEvents());

    return () => {
      dispatch(reset());
    };
  }, [dispatch]);

  const handleRetry = () => {
    dispatch(getEvents());
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="relative bg-indigo-900 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 mix-blend-multiply" />
          {/* Abstract blobs */}
          <div className="absolute top-0 left-0 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob" />
          <div className="absolute top-0 right-0 translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="text-center">
            <h1 className="text-4xl tracking-tight font-extrabold text-white sm:text-5xl md:text-6xl">
              <span className="block">Experience Life,</span>
              <span className="block text-indigo-200">Full of Events</span>
            </h1>
            <p className="mt-4 max-w-md mx-auto text-base text-indigo-100 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
              Join the community, find events that match your passions, or host
              your own. The world is waiting for your next adventure.
            </p>
            <div className="mt-10 max-w-sm mx-auto sm:max-w-none sm:flex sm:justify-center gap-4">
              {(!user || user.role === "EVENTEE") && (
                <Link
                  to="/events"
                  className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  Explore Events
                </Link>
              )}
              {user && user.role === "CREATOR" && (
                <>
                  <Link
                    to="/events/create"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-indigo-500 bg-opacity-30 hover:bg-opacity-40 backdrop-blur-sm border-indigo-300/30 md:py-4 md:text-lg transition-all duration-300"
                  >
                    Create Event
                  </Link>
                  <Link
                    to="/my-events"
                    className="flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-xl text-indigo-700 bg-white hover:bg-indigo-50 md:py-4 md:text-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                  >
                    My Events
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Search Bar - Floating Glassmorphism */}
        <div className="max-w-3xl mx-auto px-4 -mb-8 relative z-10 w-full transform translate-y-1/2">
          <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-xl p-3 border border-white/50 flex flex-col md:flex-row gap-2">
            <div className="flex-grow flex items-center bg-white rounded-xl px-4 py-3 shadow-inner">
              <FaSearch className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Search events, concerts, workshops..."
                className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400"
              />
            </div>
            <div className="flex-grow md:max-w-[200px] flex items-center bg-white rounded-xl px-4 py-3 shadow-inner">
              <FaMapMarkerAlt className="text-gray-400 mr-3" />
              <input
                type="text"
                placeholder="Location"
                className="bg-transparent border-none outline-none w-full text-gray-700 placeholder-gray-400"
              />
            </div>
            <button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold font-medium shadow-lg hover:bg-indigo-700 transition-colors">
              Search
            </button>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">
              Why EventFull?
            </h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to manage events
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 mx-auto">
              From ticketing to check-in, we've got you covered.
            </p>
          </div>

          <div className="mt-20">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-6">
                  <FaTicketAlt size={32} />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Easy Ticketing
                </h3>
                <p className="mt-4 text-base text-gray-500">
                  Create and sell different ticket types in minutes. Manage
                  capacity and sales effortlessly.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-6">
                  <FaShieldAlt size={32} />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Secure Payments
                </h3>
                <p className="mt-4 text-base text-gray-500">
                  Accept payments securely. We handle the processing so you can
                  focus on your event.
                </p>
              </div>

              <div className="text-center">
                <div className="flex items-center justify-center h-16 w-16 rounded-full bg-indigo-100 text-indigo-600 mx-auto mb-6">
                  <FaUsers size={32} />
                </div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                  Community Focused
                </h3>
                <p className="mt-4 text-base text-gray-500">
                  Build a community around your events. Connect with attendees
                  and grow your audience.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Trending Events Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 bg-gray-50">
        <div className="flex justify-between items-end mb-8">
          <div>
            <span className="text-indigo-600 font-semibold tracking-wide uppercase text-sm">
              Discover
            </span>
            <h2 className="mt-1 text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Trending Events
            </h2>
          </div>
          <Link
            to="/events"
            className="text-indigo-600 hover:text-indigo-700 font-medium flex items-center"
          >
            View all <span className="ml-2">→</span>
          </Link>
        </div>

        <EventList
          events={events ? events.slice(0, 3) : []} // Limit to 3 items for landing page
          isLoading={isLoading}
          isError={isError}
          message={message}
          onRetry={handleRetry}
        />
      </div>

      {/* Testimonials Section */}
      <div className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">
              Trusted by event creators
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-gray-50 p-8 rounded-2xl relative">
              <FaQuoteLeft className="text-indigo-200 text-4xl mb-4" />
              <p className="text-gray-600 mb-6 italic">
                "EventFull transformed how we organize our tech meetups. The
                ticketing system is flawless!"
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                  JS
                </div>
                <div className="ml-4">
                  <div className="text-sm font-bold text-gray-900">
                    John Smith
                  </div>
                  <div className="text-sm text-gray-500">
                    Tech Conference Organizer
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl relative">
              <FaQuoteLeft className="text-indigo-200 text-4xl mb-4" />
              <p className="text-gray-600 mb-6 italic">
                "As a musician, I needed a simple way to sell tickets to my
                gigs. This platform is exactly what I was looking for."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                  SJ
                </div>
                <div className="ml-4">
                  <div className="text-sm font-bold text-gray-900">
                    Sarah Jones
                  </div>
                  <div className="text-sm text-gray-500">Indie Artist</div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl relative">
              <FaQuoteLeft className="text-indigo-200 text-4xl mb-4" />
              <p className="text-gray-600 mb-6 italic">
                "The analytics help us understand our audience better. Highly
                recommended for any event planner."
              </p>
              <div className="flex items-center">
                <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold">
                  MD
                </div>
                <div className="ml-4">
                  <div className="text-sm font-bold text-gray-900">
                    Mike Davis
                  </div>
                  <div className="text-sm text-gray-500">Corporate Events</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-900/50 mix-blend-multiply" />
        <div className="absolute -left-20 -top-20 w-96 h-96 bg-purple-500/30 rounded-full filter blur-3xl opacity-30" />
        <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-indigo-500/30 rounded-full filter blur-3xl opacity-30" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Ready to create your next event?
          </h2>
          <p className="mt-4 text-xl text-indigo-200 max-w-2xl mx-auto">
            Join thousands of event creators and attendees today. Sign up for
            free and start your journey.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link
              to="/register"
              className="px-8 py-3 bg-white text-indigo-900 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg"
            >
              Get Started for Free
            </Link>
            <Link
              to="/about"
              className="px-8 py-3 bg-transparent border border-white/30 text-white rounded-xl font-bold hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
