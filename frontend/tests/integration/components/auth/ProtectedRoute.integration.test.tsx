import { configureStore } from "@reduxjs/toolkit";
import { Provider } from "react-redux";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import authReducer from "../../../../src/features/auth/authSlice";
import ProtectedRoute from "../../../../src/components/auth/ProtectedRoute";

const renderWithAuthState = ({
  route,
  auth,
  allowedRoles,
}: {
  route: string;
  auth: {
    user: { role: string } | null;
    token: string | null;
    isAuthenticated: boolean;
    isAuthChecking: boolean;
    isLoading: boolean;
    isError: boolean;
    isSuccess: boolean;
    message: string;
  };
  allowedRoles?: string[];
}) => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      events: (state = {}) => state,
      tickets: (state = {}) => state,
      analytics: (state = {}) => state,
    },
    preloadedState: {
      auth,
      events: {},
      tickets: {},
      analytics: {},
    },
  });

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[route]}>
        <Routes>
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/" element={<div>Home Page</div>} />
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/protected" element={<div>Protected Content</div>} />
          </Route>
        </Routes>
      </MemoryRouter>
    </Provider>,
  );
};

describe("ProtectedRoute integration", () => {
  it("redirects unauthenticated users to login", () => {
    renderWithAuthState({
      route: "/protected",
      auth: {
        user: null,
        token: null,
        isAuthenticated: false,
        isAuthChecking: false,
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: "",
      },
    });

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("allows authenticated users with valid role", () => {
    renderWithAuthState({
      route: "/protected",
      allowedRoles: ["CREATOR"],
      auth: {
        user: { role: "CREATOR" },
        token: "token",
        isAuthenticated: true,
        isAuthChecking: false,
        isLoading: false,
        isError: false,
        isSuccess: false,
        message: "",
      },
    });

    expect(screen.getByText("Protected Content")).toBeInTheDocument();
  });
});
