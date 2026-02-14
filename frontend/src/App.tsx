import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/layout/Layout";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useEffect } from "react";
import { useAppDispatch } from "./app/hooks";
import { checkAuth, logout } from "./features/auth/authSlice";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const RegisterPage = lazy(() => import("./pages/RegisterPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const EventDetailsPage = lazy(() => import("./pages/EventDetailsPage"));
const CreateEventPage = lazy(() => import("./pages/CreateEventPage"));
const EditEventPage = lazy(() => import("./pages/EditEventPage"));
const MyEventsPage = lazy(() => import("./pages/MyEventsPage"));
const EventAttendeesPage = lazy(() => import("./pages/EventAttendeesPage"));
const AnalyticsDashboard = lazy(() => import("./pages/AnalyticsDashboard"));
const MyTicketsPage = lazy(() => import("./pages/MyTicketsPage"));
const VerifyTicketPage = lazy(() => import("./pages/VerifyTicketPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const PaymentVerifyPage = lazy(() => import("./pages/PaymentVerifyPage"));
const PaymentsPage = lazy(() => import("./pages/PaymentsPage"));
const MyRemindersPage = lazy(() => import("./pages/MyRemindersPage"));

const routeFallback = (
  <div className="flex min-h-[50vh] items-center justify-center">
    <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-(--color-brand)" />
  </div>
);

function App() {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  useEffect(() => {
    const onSessionExpired = (event: Event) => {
      const customEvent = event as CustomEvent<{ shouldNotify?: boolean }>;
      if (customEvent.detail?.shouldNotify === false) {
        return;
      }
      toast.info("Your session expired. Please sign in again.");
      dispatch(logout());
    };

    window.addEventListener("auth:session-expired", onSessionExpired);
    return () => {
      window.removeEventListener("auth:session-expired", onSessionExpired);
    };
  }, [dispatch]);

  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} />
      <Suspense fallback={routeFallback}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="events" element={<EventsPage />} />
            <Route path="events/:id" element={<EventDetailsPage />} />

            {/* Protected Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="profile" element={<ProfilePage />} />
              <Route path="payments/verify" element={<PaymentVerifyPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["EVENTEE"]} />}>
              <Route path="my-tickets" element={<MyTicketsPage />} />
              <Route path="my-reminders" element={<MyRemindersPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={["CREATOR"]} />}>
              <Route path="dashboard" element={<AnalyticsDashboard />} />
              <Route path="my-events" element={<MyEventsPage />} />
              <Route
                path="my-events/:id/attendees"
                element={<EventAttendeesPage />}
              />
              <Route path="payments" element={<PaymentsPage />} />
              <Route path="verify-ticket" element={<VerifyTicketPage />} />
              <Route path="events/create" element={<CreateEventPage />} />
              <Route path="events/edit/:id" element={<EditEventPage />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
