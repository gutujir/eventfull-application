import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Layout from "./components/layout/Layout";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import EventDetailsPage from "./pages/EventDetailsPage";
import CreateEventPage from "./pages/CreateEventPage";
import EditEventPage from "./pages/EditEventPage";
import MyEventsPage from "./pages/MyEventsPage";
import EventAttendeesPage from "./pages/EventAttendeesPage";
import AnalyticsDashboard from "./pages/AnalyticsDashboard";
import MyTicketsPage from "./pages/MyTicketsPage";
import VerifyTicketPage from "./pages/VerifyTicketPage";
import EventsPage from "./pages/EventsPage";
import AboutPage from "./pages/AboutPage";
import PaymentVerifyPage from "./pages/PaymentVerifyPage";
import PaymentsPage from "./pages/PaymentsPage";
import MyRemindersPage from "./pages/MyRemindersPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={5000} />
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
    </Router>
  );
}

export default App;
