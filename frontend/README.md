# Eventfull Frontend

The interactive client-side application for Eventfull, built with React, TypeScript, and Vite. It provides a seamless, responsive user experience for both Event Creators and Attendees.

## 🏗 Architecture

The frontend is structured around **Feature-Sliced Design principles**:

- **Features**: Redux slices (`src/features`) manage global state (Auth, Cart, Events).
- **Pages**: Route-level components (`src/pages`) that compose features and UI components.
- **Services**: API integration layer (`src/services`) using Axios.
- **Components**: Reusable, dumb UI components (`src/components`).

State management is handled effectively using **Redux Toolkit**, with persistent state for critical data like user sessions and shopping carts.

## 🛠 Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite
- **Language**: TypeScript
- **State Management**: Redux Toolkit (RTK)
- **Styling**: Tailwind CSS v4
- **Routing**: React Router DOM v7
- **Forms**: React Hook Form
- **Validation**: Zod
- **HTTP Client**: Axios
- **QR Scanning**: HTML5-QRCode & React-QR-Scanner
- **Visualization**: Chart.js
- **Notifications**: React Toastify
- **Payments**: React Paystack
- **Testing**: Vitest, React Testing Library

## 📂 Project Structure

```text
frontend/
├── public/                 # Static assets (favicons, manifest)
├── src/
│   ├── app/                # Redux store configuration (store.ts)
│   ├── assets/             # Images, logos, and global static files
│   ├── components/         # Reusable UI components (Buttons, Inputs, Modals)
│   ├── config/             # Environment constants
│   ├── features/           # Redux slices (authSlice, eventSlice, etc.)
│   ├── hooks/              # Custom React hooks (useAuth, etc.)
│   ├── pages/              # Application pages (CreateEvent, Dashboard, Login)
│   ├── services/           # API service definitions (authService, eventService)
│   ├── utils/              # Helper functions (formatters, vals)
│   ├── App.tsx             # Root component with routing logic
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global Tailwind directives
└── tests/                  # Vitest test configurations
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Backend server running on `http://localhost:3000` (for full functionality)

### Installation

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file in the `frontend` directory:

    ```env
    VITE_API_BASE_URL="http://localhost:3000/api/v1"
    VITE_PAYSTACK_PUBLIC_KEY="pk_test_..."
    ```

3.  **Run Development Server**
    ```bash
    npm run dev
    ```
    The application will launch at `http://localhost:5173`.

## 📜 Scripts

| Script            | Description                           |
| :---------------- | :------------------------------------ |
| `npm run dev`     | Starts the development server         |
| `npm run build`   | Builds the app for production         |
| `npm run preview` | Previews the production build locally |
| `npm run lint`    | Runs ESLint checks                    |
| `npm test`        | Runs tests using Vitest               |

## 🧪 Testing

We use **Vitest** (compatible with Jest API) and **React Testing Library**.

```bash
# Run all tests
npm test

# Run unit tests
npm run test:unit

# Run component integration tests
npm run test:integration
```

## ✨ Key Pages

- **Landing Page**: Hero section, features, testimonials.
- **Dashboard**: Creator analytics and event management.
- **Create Event**: Multi-step form for event creation (Online/In-person, Free/Paid).
- **Verify Ticket**: Camera-based and upload-based QR verification tools.
- **My Tickets**: Attendee wallet for purchased tickets.
