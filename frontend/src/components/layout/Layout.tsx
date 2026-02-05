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

  const handleLogout = () => {
    dispatch(logout());
    setIsMobileMenuOpen(false);
  };

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

  return (
    <div className="min-h-screen flex flex-col font-sans text-gray-900 bg-gray-50">
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-lg shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 group">
              <div className="bg-indigo-600 text-white p-2 rounded-lg transform group-hover:rotate-12 transition-transform duration-300">
                <FaCalendarAlt size={20} />
              </div>
              <span className="text-2xl font-extrabold tracking-tight text-gray-900 group-hover:text-indigo-600 transition-colors">
                EventFull
              </span>
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              ref={mobileButtonRef}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 focus:outline-none p-2"
            >
              {isMobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {(!user || user.role === "EVENTEE") && (
              <Link
                to="/events"
                className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
              >
                Explore Events
              </Link>
            )}

            {user && (
              <>
                {user.role === "EVENTEE" && (
                  <Link
                    to="/my-tickets"
                    className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                  >
                    My Tickets
                  </Link>
                )}
                {user.role === "CREATOR" && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/my-events"
                      className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                    >
                      My Events
                    </Link>
                    <Link
                      to="/events/create"
                      className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                    >
                      Create Event
                    </Link>
                  </>
                )}
              </>
            )}

            {user ? (
              <div className="flex items-center space-x-4">
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 bg-gray-100/80 px-4 py-2 rounded-full border border-gray-200 hover:bg-gray-200 transition-colors"
                >
                  <FaUserCircle className="text-indigo-600" size={18} />
                  <span className="font-semibold text-sm">
                    {user.first_name || user.firstName || user.name || "User"}
                  </span>
                </Link>

                {/* Desktop: show labeled logout button; Mobile keeps dropdown version */}
                <button
                  onClick={handleLogout}
                  className="hidden md:flex items-center space-x-2 text-gray-700 hover:text-red-600 transition-colors px-3 py-2 rounded-md bg-red-50 hover:bg-red-100"
                  title="Logout"
                >
                  <FaSignOutAlt size={16} className="text-red-600" />
                  <span className="font-medium text-sm">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  to="/login"
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors"
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold text-sm shadow-md hover:bg-indigo-700 hover:shadow-lg transition-all transform hover:-translate-y-0.5"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div
            ref={menuRef}
            className="md:hidden absolute top-20 right-0 w-64 bg-white border border-gray-200 shadow-xl rounded-lg py-4 px-4 flex flex-col space-y-4 m-2 animate-in fade-in slide-in-from-top-5 duration-200"
          >
            {(!user || user.role === "EVENTEE") && (
              <Link
                to="/events"
                className="text-gray-600 font-medium hover:text-indigo-600 transition-colors py-2"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Explore Events
              </Link>
            )}

            {user && (
              <>
                {user.role === "EVENTEE" && (
                  <Link
                    to="/my-tickets"
                    className="text-gray-600 font-medium hover:text-indigo-600 transition-colors py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    My Tickets
                  </Link>
                )}
                {user.role === "CREATOR" && (
                  <>
                    <Link
                      to="/dashboard"
                      className="text-gray-600 font-medium hover:text-indigo-600 transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/my-events"
                      className="text-gray-600 font-medium hover:text-indigo-600 transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      My Events
                    </Link>
                    <Link
                      to="/events/create"
                      className="text-gray-600 font-medium hover:text-indigo-600 transition-colors py-2"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Create Event
                    </Link>
                  </>
                )}
              </>
            )}

            {user ? (
              <>
                <Link
                  to="/profile"
                  className="flex items-center space-x-2 text-gray-700 py-2 border-t border-gray-100 mt-2 pt-4"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <FaUserCircle className="text-indigo-600" size={18} />
                  <span className="font-semibold text-sm">
                    {user.first_name || user.firstName || user.name || "User"}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-2 text-gray-600 hover:text-red-500 py-2"
                >
                  <FaSignOutAlt size={18} />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2 border-t border-gray-100 mt-2">
                <Link
                  to="/login"
                  className="text-gray-600 font-medium hover:text-indigo-600 transition-colors py-2"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  to="/register"
                  className="bg-indigo-600 text-white px-6 py-2.5 rounded-full font-bold text-center text-sm shadow-md hover:bg-indigo-700"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        )}
      </header>

      <main className="flex-grow w-full pt-20">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-gray-200 pb-12 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center space-x-2 mb-6">
                <div className="bg-indigo-600 text-white p-1.5 rounded-md">
                  <FaCalendarAlt size={16} />
                </div>
                <span className="text-lg font-bold text-gray-900">
                  EventFull
                </span>
              </div>
              <p className="text-gray-500 text-sm leading-relaxed">
                The modern platform for discovering and organizing events that
                matter. Join our community today.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Platform</h4>
              <ul className="space-y-4">
                <li>
                  <Link
                    to="/events"
                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                  >
                    Browse Events
                  </Link>
                </li>
                <li>
                  <Link
                    to="/about"
                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                  >
                    About Us
                  </Link>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                  >
                    Features
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Resources</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                  >
                    Help Center
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                  >
                    Guidelines
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                  >
                    Contact
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-gray-900 mb-6">Legal</h4>
              <ul className="space-y-4">
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="#"
                    className="text-gray-500 hover:text-indigo-600 text-sm font-medium"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="mt-16 border-t border-gray-100 pt-8 flex flex-col md:flex-row justify-center md:justify-between items-center text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} EventFull Inc.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <span className="hover:text-indigo-500 cursor-pointer">
                Twitter
              </span>
              <span className="hover:text-indigo-500 cursor-pointer">
                Instagram
              </span>
              <span className="hover:text-indigo-500 cursor-pointer">
                LinkedIn
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
