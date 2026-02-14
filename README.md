# Eventfull Application

Eventfull is a comprehensive full-stack event management platform designed to streamline the event lifecycle for both creators and attendees. It bridges functionality for discovering events, securing tickets, verifying attendance, and tracking creator analytics.

## 🚀 About the Project

Eventfull solves the friction in event management by providing a unified platform where:

- **Creators** can host events, track sales in real-time, validate tickets via QR code scanning, and view detailed analytics.
- **Attendees** can seamlessly discover events, purchase tickets securely via Paystack, receiving automated reminders, and manage their bookings.

The application is built with a focus on performant, type-safe code using modern TypeScript standards across the full stack.

### Key Features

- **Authentication & Authorization**: Secure JWT-based auth with role-based access control (`Eventee`, `Creator`, `Admin`).
- **Event Lifecycle Management**: Create, update, cancel, and manage events with image uploads.
- **Smart Ticketing System**:
  - Dynamic ticket availability tracking.
  - QR Code generation for every ticket.
  - Double-booking protection.
  - Event-ended protection logic.
- **Payments Integration**: Seamless secure payments using Paystack (split-payment ready).
- **Ticket Verification**:
  - **Camera Scan**: Creators can scan attendee QR codes using their device camera.
  - **Image Upload**: Verify by uploading a received QR code image.
  - **Manual Entry**: Check-in by booking reference ID.
- **Background Services**:
  - Automated email reminders (Cron jobs & Message Queues).
  - Asynchronous analytics processing.
- **Analytics Dashboard**: Visual charts for revenue, ticket sales, and attendance rates.

## 🛠 Tech Stack

### Backend

- **Runtime**: Node.js, Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL, Prisma ORM
- **Caching & Queues**: Redis, BullMQ
- **Payment**: Paystack API
- **Storage**: Cloudinary (Image uploads)
- **Validation**: Zod
- **Docs**: Swagger (OpenAPI)
- **Testing**: Jest, Supertest

### Frontend

- **Framework**: React 18 (Vite)
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form
- **Charts**: Chart.js
- **Scanning**: HTML5-QRCode / React-QR-Scanner
- **Testing**: Vitest, React Testing Library

## 📂 Project Structure

```text
├── backend/                # Express API & Background workers
│   ├── prisma/             # Database schema & migrations
│   ├── src/
│   │   ├── config/         # App configuration & env setup
│   │   ├── controllers/    # Request handlers
│   │   ├── dal/            # Data Access Layer (db queries)
│   │   ├── jobs/           # Scheduled cron jobs
│   │   ├── lib/            # Third-party integrations (Cloudinary, etc.)
│   │   ├── middlewares/    # Auth, Validation, Upload middlewares
│   │   ├── queues/         # BullMQ worker setup
│   │   ├── routes/         # API Route definitions
│   │   ├── schemas/        # Zod validation schemas
│   │   ├── services/       # Complex business logic
│   │   ├── types/          # Global TS types
│   │   ├── utils/          # Helper functions
│   │   ├── workers/        # Queue processors
│   │   ├── app.ts          # Express app setup
│   │   └── server.ts       # Server entry point
│   └── tests/              # Backend Jest tests (unit/integration)
├── frontend/               # React Application
│   ├── public/             # Static assets
│   ├── src/
│   │   ├── app/            # Redux store configuration
│   │   ├── assets/         # Images & static files
│   │   ├── components/     # Shared reusable UI components
│   │   ├── config/         # Frontend app constants
│   │   ├── features/       # Redux slices (Auth, Events, Cart, etc.)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Application routable pages
│   │   ├── services/       # API call definitions
│   │   ├── types/          # Frontend TS interfaces
│   │   ├── utils/          # Formatting & helpers
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # React entry point
│   └── tests/              # Frontend Vitest tests
├── scripts/                # CI/CD verification scripts
└── README.md               # Documentation
```

## 🏁 Getting Started

### Prerequisites

Ensure you have the following installed:

- Node.js (v18+)
- PostgreSQL
- Redis (Required for queues and caching)

### Installation

1.  **Clone the repository**

    ```bash
    git clone <repository-url>
    cd eventfull-application
    ```

2.  **Backend Setup**

    ```bash
    cd backend
    npm install

    # Create .env file based on provided examples in documentation
    # Run database migrations
    npx prisma migrate dev

    # Start development server
    npm run dev
    ```

    _Backend runs on: `http://localhost:3000`_

3.  **Frontend Setup**

    ```bash
    cd ../frontend
    npm install

    # Start Vite server
    npm run dev
    ```

    _Frontend runs on: `http://localhost:5173`_

## 🧪 Testing

The project employs a split testing strategy with Unit tests for isolated logic and Integration tests for full API flows.

### Running Backend Tests

```bash
cd backend
npm run test:unit       # Run unit tests
npm run test:integration # Run integration tests (requires DB)
```

### Running Frontend Tests

```bash
cd frontend
npm run test:unit       # Run component/logic tests
npm run test:integration # Run page/flow tests
```

## 📸 Application Screenshots

### Landing

![Landing Page 1](./frontend/src/assets/landing-page1.png)
![Landing Page 2](./frontend/src/assets/landing-page2.png)
![Landing Page 3](./frontend/src/assets/landing-page3.png)

### Authentication

| Login                                          | Signup                                           |
| ---------------------------------------------- | ------------------------------------------------ |
| ![Login](./frontend/src/assets/login-page.png) | ![Signup](./frontend/src/assets/signup-page.png) |

### Creator Experience

| Dashboard                                                 | Create Event                                                 |
| --------------------------------------------------------- | ------------------------------------------------------------ |
| ![Creator Dashboard](./frontend/src/assets/dashboard.png) | ![Create Event](./frontend/src/assets/create-event-page.png) |

| My Events                                              | Event Attendees                                                    |
| ------------------------------------------------------ | ------------------------------------------------------------------ |
| ![My Events](./frontend/src/assets/my-events-page.png) | ![Event Attendees](./frontend/src/assets/event-attendees-page.png) |

| Payments                                            | Ticket Verification (Camera)                                          |
| --------------------------------------------------- | --------------------------------------------------------------------- |
| ![Payments](./frontend/src/assets/payment-page.png) | ![Camera Verify](./frontend/src/assets/camera-scan-verify-ticket.png) |

| Ticket Verification (Manual)                                     | Ticket Verification (Upload QR)                                        |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------- |
| ![Manual Verify](./frontend/src/assets/manual-verify-ticket.png) | ![Upload QR Verify](./frontend/src/assets/upload-qr-verify-ticket.png) |

### Attendee Experience

| Event Booking                                                  | Purchase Tickets                                                     |
| -------------------------------------------------------------- | -------------------------------------------------------------------- |
| ![Event Booking](./frontend/src/assets/event-booking-page.png) | ![Purchase Tickets](./frontend/src/assets/purchase-tickets-page.png) |

| Payment Form                                                              | My Tickets                                               |
| ------------------------------------------------------------------------- | -------------------------------------------------------- |
| ![Paystack Payment Form](./frontend/src/assets/Paystack-payment-form.png) | ![My Tickets](./frontend/src/assets/my-tickets-page.png) |

| My Reminders                                                 | Profile                                            |
| ------------------------------------------------------------ | -------------------------------------------------- |
| ![My Reminders](./frontend/src/assets/My-reminders-page.png) | ![Profile](./frontend/src/assets/profile-page.png) |

## 📄 License

This project is licensed under the ISC License.
