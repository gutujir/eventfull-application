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
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import SectionHeader from "../components/ui/SectionHeader";

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

  const testimonials = [
    {
      quote:
        "EventFull transformed how we organize meetups. Ticketing and reminders are reliable.",
      initials: "JS",
      name: "John Smith",
      role: "Tech Conference Organizer",
      tone: "bg-blue-600",
    },
    {
      quote:
        "I needed an easy flow for selling tickets. The setup is fast and the dashboard is clear.",
      initials: "SJ",
      name: "Sarah Jones",
      role: "Indie Artist",
      tone: "bg-pink-500",
    },
    {
      quote:
        "Attendance and sales analytics give us clarity when planning our next corporate sessions.",
      initials: "MD",
      name: "Mike Davis",
      role: "Corporate Events",
      tone: "bg-purple-600",
    },
    {
      quote:
        "Our volunteer team now coordinates registrations and reminders in one place without spreadsheet chaos.",
      initials: "AN",
      name: "Amina Nuhu",
      role: "Community Program Lead",
      tone: "bg-indigo-600",
    },
  ];

  return (
    <div className="min-h-screen bg-(--color-bg)">
      <section className="rounded-lg border border-(--color-border) bg-linear-to-br from-(--color-brand) to-[#274ecf] p-8 text-white shadow-(--shadow-elevated) sm:p-12">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-5xl">
            Discover and manage events with confidence
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm text-blue-100 sm:text-lg">
            Join a modern platform where attendees discover great experiences
            and creators run successful events from one clean dashboard.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            {(!user || user.role === "EVENTEE") && (
              <Link to="/events">
                <Button size="lg" variant="secondary">
                  Explore Events
                </Button>
              </Link>
            )}
            {user && user.role === "CREATOR" && (
              <>
                <Link to="/events/create">
                  <Button size="lg" variant="secondary">
                    Create Event
                  </Button>
                </Link>
                <Link to="/my-events">
                  <Button
                    size="lg"
                    variant="ghost"
                    className="border border-white/30 text-white hover:bg-white/10 hover:text-white"
                  >
                    My Events
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section className="-mt-4 px-2 sm:px-6">
        <Card className="mx-auto max-w-4xl p-3 sm:p-4" elevated>
          <div className="flex flex-col gap-2 md:flex-row">
            <div className="flex flex-1 items-center rounded-lg border border-(--color-border) bg-white px-3">
              <FaSearch className="mr-3 text-slate-400" />
              <Input
                type="text"
                placeholder="Search events, concerts, workshops..."
                className="border-0 bg-transparent px-0"
              />
            </div>
            <div className="flex md:w-56 items-center rounded-lg border border-(--color-border) bg-white px-3">
              <FaMapMarkerAlt className="mr-3 text-slate-400" />
              <Input
                type="text"
                placeholder="Location"
                className="border-0 bg-transparent px-0"
              />
            </div>
            <Button type="button" className="md:min-w-28">
              Search
            </Button>
          </div>
        </Card>
      </section>

      <section className="py-16">
        <SectionHeader
          align="center"
          eyebrow="Why EventFull"
          title="Everything you need to run better events"
          subtitle="From secure ticketing to attendee insights, your event workflow stays simple and professional."
        />

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            {
              title: "Easy Ticketing",
              description:
                "Create and sell ticket types in minutes with clear pricing and capacity controls.",
              icon: <FaTicketAlt size={22} />,
            },
            {
              title: "Secure Payments",
              description:
                "Accept payments confidently with protected checkout and verification flows.",
              icon: <FaShieldAlt size={22} />,
            },
            {
              title: "Community Focus",
              description:
                "Build relationships with attendees and keep them engaged beyond one event.",
              icon: <FaUsers size={22} />,
            },
          ].map((feature) => (
            <Card key={feature.title} className="p-6">
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-(--color-brand)">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold">{feature.title}</h3>
              <p className="mt-2 text-sm text-(--color-text-muted)">
                {feature.description}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="pb-16">
        <div className="mb-8 flex items-end justify-between">
          <SectionHeader
            eyebrow="Discover"
            title="Trending Events"
            subtitle="Popular events this week curated for attendees."
          />
          <Link
            to="/events"
            className="hidden text-sm font-medium text-(--color-brand) hover:text-(--color-brand-hover) sm:inline-flex"
          >
            View all →
          </Link>
        </div>

        <EventList
          events={events ? events.slice(0, 3) : []}
          isLoading={isLoading}
          isError={isError}
          message={message}
          onRetry={handleRetry}
          currentUser={user}
        />
      </section>

      <section className="py-16">
        <SectionHeader
          align="center"
          title="Trusted by event creators"
          subtitle="Teams across different industries use EventFull to deliver consistent attendee experiences."
        />

        <div className="relative mt-10 overflow-hidden">
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-linear-to-r from-(--color-bg) to-transparent sm:w-16" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-linear-to-l from-(--color-bg) to-transparent sm:w-16" />

          <div className="marquee">
            <div
              className="marquee-track"
              role="list"
              aria-label="Testimonials"
            >
              {[0, 1].map((group) => (
                <div
                  key={group}
                  className="marquee-group"
                  aria-hidden={group === 1}
                >
                  {testimonials.map((item) => (
                    <Card
                      key={`${group}-${item.name}`}
                      className="w-80 shrink-0 p-6"
                    >
                      <FaQuoteLeft className="mb-4 text-2xl text-blue-200" />
                      <p className="mb-5 text-sm italic text-(--color-text-muted)">
                        “{item.quote}”
                      </p>
                      <div className="flex items-center gap-3">
                        <div
                          className={`grid h-10 w-10 place-items-center rounded-full text-sm font-semibold text-white ${item.tone}`}
                        >
                          {item.initials}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-(--color-text)">
                            {item.name}
                          </p>
                          <p className="text-xs text-(--color-text-muted)">
                            {item.role}
                          </p>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="rounded-lg bg-(--color-text) px-6 py-12 text-center text-white shadow-(--shadow-elevated) sm:px-12">
        <h2 className="text-2xl font-semibold sm:text-3xl">
          Ready to create your next event?
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-slate-300 sm:text-base">
          Start free, launch quickly, and manage every event touchpoint with one
          streamlined platform.
        </p>
        <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
          <Link to="/register">
            <Button size="lg" variant="secondary">
              Get Started for Free
            </Button>
          </Link>
          <Link to="/about">
            <Button
              size="lg"
              variant="ghost"
              className="border border-white/25 text-white hover:bg-white/10 hover:text-white"
            >
              Learn More
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
