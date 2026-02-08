# Eventfull Frontend

**🚀 Deployed Application:** [https://eventfull-application.onrender.com](https://eventfull-application.onrender.com)

Eventfull is a modern event ticketing platform client built with React, Vite, and tailwindCSS. It provides an intuitive interface for users to discover events, purchase tickets, and for creators to manage their events and view analytics.

## 🚀 Features

- **User Interface:**
  - Modern, responsive design using **Tailwind CSS**.
  - Interactive components and smooth transitions.
- **Event Discovery:**
  - Browse public events with filtering and search capabilities.
  - Detailed event pages with ticket selection.
- **Authentication:**
  - Secure Login/Signup forms with validation (**React Hook Form + Zod**).
  - Role-based dashboard access (Admin/Creator/User).
- **Ticketing & Payments:**
  - Seamless ticket purchasing flow.
  - Integration with **Paystack** for secure payments.
  - Automatic payment verification and ticket issuance.
  - QR Code scanning for ticket verification.
  - Camera scan, manual/USB, and QR image upload verification modes.
- **Dashboards:**
  - **User Dashboard:** View purchased tickets, transaction history.
  - **Creator Dashboard:** Real-time analytics charts (**Chart.js**) for sales and revenue.
  - **Creator Payments:** View payments for hosted events.
- **State Management:**
  - Centralized state using **Redux Toolkit** for User Auth, Events, and more.
  - Silent token refresh to improve session stability.

## 🛠️ Tech Stack

- **Framework:** [React 18](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Language:** TypeScript
- **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
- **State Management:** [Redux Toolkit](https://redux-toolkit.js.org/)
- **Routing:** [React Router v7](https://reactrouter.com/)
- **Forms & Validation:** React Hook Form + Zod
- **Networking:** Axios
- **Payments:** React Paystack
- **Charts:** Chart.js + React-chartjs-2
- **Notifications:** React Toastify
- **Icons:** React Icons

## 📋 Prerequisites

Ensure you have the following installed locally:

- [Node.js](https://nodejs.org/) (v18+)
- npm or yarn

## ⚙️ Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd eventfull-application/frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**
    Create a `.env` file in the root of the `frontend/` directory:

    ```env
    VITE_API_URL=http://localhost:3000/api/v1
    VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxx
    ```

4.  **Run Development Server:**

    ```bash
    npm run dev
    ```

    The application will be available at `http://localhost:5173`.

5.  **Build for Production:**
    ```bash
    npm run build
    ```

## 📂 Project Structure

```
src/
├── app/            # Redux store setup
├── assets/         # Images and static assets
├── components/     # Reusable UI components
├── config/         # App-wide configuration (env vars, constants)
├── features/       # Feature-based architecture (slices)
├── hooks/          # Custom React hooks
├── pages/          # Application routes/pages
├── services/       # API call definitions (Axios services)
├── store/          # Redux slices
├── types/          # TypeScript interfaces/types
└── utils/          # Helper functions
```
