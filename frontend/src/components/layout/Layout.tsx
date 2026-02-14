import { useState, useEffect, useRef } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAppSelector, useAppDispatch } from "../../app/hooks";
import { logout } from "../../features/auth/authSlice";
import {
  FaCalendarAlt,
  FaUserCircle,
  FaSignOutAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

const Layout = () => {
  const { user } = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement | null>(null);
  const mobileButtonRef = useRef<HTMLButtonElement | null>(null);

  const getProfileImageUrl = (value: string) => {
    if (value.startsWith("http") || value.startsWith("blob:")) return value;
    const baseUrl = (
      import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1"
    ).replace("/api/v1", "");
    return `${baseUrl}${value.startsWith("/") ? "" : "/"}${value}`;
  };

  const profileImage =
    user?.avatarUrl ||
    user?.avatar_url ||
    user?.profilePicture ||
    user?.profile_picture ||
    user?.photoUrl ||
    user?.photo_url ||
    null;
  const profileInitials = `${user?.first_name?.[0] || user?.firstName?.[0] || ""}${user?.last_name?.[0] || ""}`;

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
  };

  const eventeeNav = [
    { to: "/events", label: "Explore Events" },
    { to: "/my-tickets", label: "My Tickets" },
    { to: "/my-reminders", label: "My Reminders" },
  ];

  const creatorNav = [
    { to: "/dashboard", label: "Dashboard" },
    { to: "/my-events", label: "My Events" },
    { to: "/events/create", label: "Create Event" },
    { to: "/payments", label: "Payments" },
  ];

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!isMobileMenuOpen) return;
      const target = e.target as Node;
      if (menuRef.current && menuRef.current.contains(target)) return;
      if (mobileButtonRef.current && mobileButtonRef.current.contains(target))
        return;
      setIsMobileMenuOpen(false);
    };

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsMobileMenuOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isMobileMenuOpen]);

  const desktopNav =
    !user || user.role === "EVENTEE"
      ? user
        ? eventeeNav
        : [{ to: "/events", label: "Explore Events" }]
      : creatorNav;

  const mobileNav =
    !user || user.role === "EVENTEE"
      ? user
        ? eventeeNav
        : [{ to: "/events", label: "Explore Events" }]
      : creatorNav;

  return (
    <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
      <header className="sticky top-0 z-50 border-b border-(--color-border) bg-white/95 backdrop-blur">
        <div className="container-shell flex h-18 items-center justify-between gap-4">
          <Link
            to="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-(--color-brand) text-white shadow-sm">
              <FaCalendarAlt size={16} />
            </span>
            <span className="text-lg sm:text-xl">Eventfull</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            {desktopNav.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="app-link text-sm font-medium"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {user ? (
              <>
                <Link
                  to="/profile"
                  className="inline-flex items-center gap-2 rounded-xl border border-(--color-border) bg-white px-3 py-2 text-sm font-medium text-(--color-text-muted)"
                >
                  {profileImage ? (
                    <img
                      src={getProfileImageUrl(profileImage)}
                      alt="Profile"
                      className="h-6 w-6 rounded-full object-cover border border-slate-200"
                    />
                  ) : profileInitials ? (
                    <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                      {profileInitials}
                    </span>
                  ) : (
                    <FaUserCircle className="text-(--color-brand)" size={16} />
                  )}
                  <span>
                    {user.first_name || user.firstName || user.name || "User"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center gap-2 rounded-xl border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                  title="Logout"
                >
                  <FaSignOutAlt size={14} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="app-link text-sm font-medium">
                  Log in
                </Link>
                <Link to="/register" className="app-button-primary text-sm">
                  Sign up
                </Link>
              </>
            )}
          </div>

          <button
            ref={mobileButtonRef}
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="grid h-10 w-10 place-items-center rounded-xl border border-(--color-border) bg-white text-(--color-text-muted) md:hidden"
            aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {isMobileMenuOpen ? <FaTimes size={18} /> : <FaBars size={18} />}
          </button>
        </div>

        {isMobileMenuOpen && (
          <div className="border-t border-(--color-border) bg-white md:hidden">
            <div
              ref={menuRef}
              className="container-shell flex flex-col gap-1 py-4"
            >
              {mobileNav.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-muted) hover:bg-slate-50 hover:text-(--color-brand)"
                >
                  {item.label}
                </Link>
              ))}

              <div className="mt-2 border-t border-(--color-border) pt-3">
                {user ? (
                  <>
                    <Link
                      to="/profile"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="mb-2 inline-flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-(--color-text-muted) hover:bg-slate-50"
                    >
                      {profileImage ? (
                        <img
                          src={getProfileImageUrl(profileImage)}
                          alt="Profile"
                          className="h-6 w-6 rounded-full object-cover border border-slate-200"
                        />
                      ) : profileInitials ? (
                        <span className="grid h-6 w-6 place-items-center rounded-full bg-blue-100 text-xs font-semibold text-blue-700">
                          {profileInitials}
                        </span>
                      ) : (
                        <FaUserCircle
                          className="text-(--color-brand)"
                          size={16}
                        />
                      )}
                      <span>
                        {user.first_name ||
                          user.firstName ||
                          user.name ||
                          "User"}
                      </span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="inline-flex w-full items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                    >
                      <FaSignOutAlt size={14} />
                      Logout
                    </button>
                  </>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      to="/login"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="app-button-secondary text-center text-sm"
                    >
                      Log in
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="app-button-primary text-center text-sm"
                    >
                      Sign up
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      <main className="container-shell min-h-[calc(100vh-17rem)] py-8">
        <Outlet />
      </main>

      <footer className="border-t border-(--color-border) bg-white">
        <div className="container-shell py-10">
          <div className="grid gap-8 md:grid-cols-4">
            <div className="md:col-span-2">
              <div className="mb-3 flex items-center gap-2 font-semibold">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-(--color-brand) text-white">
                  <FaCalendarAlt size={14} />
                </span>
                Eventfull
              </div>
              <p className="max-w-lg text-sm leading-6 text-(--color-text-muted)">
                Professional event discovery and management for attendees and
                creators. Build better experiences and track outcomes in one
                platform.
              </p>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold">Platform</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link to="/events" className="app-link">
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="app-link">
                    About
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="mb-3 text-sm font-semibold">Company</h4>
              <ul className="space-y-2 text-sm text-(--color-text-muted)">
                <li>Support</li>
                <li>Privacy</li>
                <li>Terms</li>
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-start justify-between gap-3 border-t border-(--color-border) pt-5 text-sm text-(--color-text-muted) sm:flex-row sm:items-center">
            <p>© {new Date().getFullYear()} EventFull</p>
            <div className="flex items-center gap-4">
              <span>Twitter</span>
              <span>Instagram</span>
              <span>LinkedIn</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
