import { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { getEvents, reset } from "../features/events/eventSlice";
import EventList from "../components/events/EventList";
import { FaSearch, FaMapMarkerAlt } from "react-icons/fa";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import SectionHeader from "../components/ui/SectionHeader";

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
    <div className="min-h-screen pt-3 sm:pt-6">
      <div className="mx-auto max-w-7xl px-1 sm:px-2">
        <div className="mb-10">
          <SectionHeader
            align="center"
            eyebrow="Discover"
            title="Explore All Events"
            subtitle="Find the perfect event for your interests and location."
          />
        </div>

        <div className="max-w-4xl mx-auto mb-12">
          <Card className="p-3 sm:p-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-grow flex items-center rounded-lg border border-[var(--color-border)] bg-white px-3">
                <FaSearch className="text-gray-400 mr-3" />
                <Input
                  type="text"
                  placeholder="Search events..."
                  className="border-0 bg-transparent px-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex-grow md:max-w-[250px] flex items-center rounded-lg border border-[var(--color-border)] bg-white px-3">
                <FaMapMarkerAlt className="text-gray-400 mr-3" />
                <Input
                  type="text"
                  placeholder="Location"
                  className="border-0 bg-transparent px-0"
                  value={locationTerm}
                  onChange={(e) => setLocationTerm(e.target.value)}
                />
              </div>
              <Button
                className="md:min-w-[120px]"
                onClick={handleRetry}
                type="button"
              >
                Search
              </Button>
            </div>
          </Card>
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
