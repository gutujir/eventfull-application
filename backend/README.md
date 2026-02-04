# Eventfull Backend API

Eventfull is a comprehensive event ticketing platform that allows users to discover events, purchase tickets, and manage their schedules. This repository contains the backend API documentation, setup instructions, and architecture details.

## 🚀 Features

- **Authentication & Authorization:**
  - Secure User & Creator Signup/Login via JWT (Bearer Token & Cookies).
  - Role-Based Access Control (RBAC): `ADMIN`, `CREATOR`, `EVENTEE`.
- **Event Management:**
  - Create, Update (Publish/Draft/Cancel), and View Events.
  - Rich metadata support (Title, Description, Date, Price, Ticket Types).
  - **Caching Layer:** Redis caching for public event feeds for high performance.
- **Ticketing System:**
  - Purchase Tickets with varying types (VIP, Regular, etc.).
  - **QR Code Generation:** Instant QR code generation for ticket validation.
  - Ticket Validation Endpoint for Creators/Gatekeepers.
- **Payments:**
  - Full **Paystack Integration**.
  - Secure Payment Initialization and Verification.
  - Webhooks for async status updates.
  - Financial dashboards for Creators (Earnings) and Users (Purchase History).
- **Notifications & Reminders:**
  - Automated Job Queue (BullMQ + Redis) for scheduling reminders.
  - **Email Integration:** Email notifications via Mailtrap/SMTP (Nodemailer).
  - Auto-scheduled default reminders set by Creators.
- **Analytics:**
  - Creator Dashboard for Sales, Revenue, and Attendee metrics.
- **Shareability:**
  - Public endpoints for sharing events on social media.
- **Documentation:**
  - Auto-generated Swagger/OpenAPI documentation.

## 🛠️ Tech Stack

- **Runtime:** Node.js (TypeScript)
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Caching & Queues:** Redis, BullMQ
- **Authentication:** JSON Web Tokens (JWT)
- **Payments:** Paystack API
- **Emails:** Nodemailer (SMTP)
- **Validation:** Zod
- **Testing:** Jest, Supertest

## 📋 Prerequisites

Ensure you have the following installed locally:

- [Node.js](https://nodejs.org/) (v18+)
- [PostgreSQL](https://www.postgresql.org/)
- [Redis](https://redis.io/)

## ⚙️ Installation & Setup

1.  **Clone the repository:**

    ```bash
    git clone <repository_url>
    cd eventfull-application/backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Configuration:**

    Create a `.env` file in the root directory and configure the following variables:

    ```env
    # Server Configuration
    PORT=3000
    NODE_ENV=development

    # Database
    DATABASE_URL="postgresql://user:password@localhost:5432/eventfull_db?schema=public"

    # Authentication
    JWT_SECRET="your_very_secure_jwt_secret"

    # Redis (For Caching & Queues)
    REDIS_URL="redis://127.0.0.1:6379"

    # Payments (Paystack)
    PAYSTACK_SECRET_KEY="sk_test_xxxxxx"

    # Email Service (Mailtrap/SMTP)
    SMTP_HOST="sandbox.smtp.mailtrap.io"
    SMTP_PORT=2525
    SMTP_USER="your_mailtrap_user"
    SMTP_PASS="your_mailtrap_password"
    SMTP_SECURE=false
    SMTP_FROM="Eventfull <no-reply@eventfull.com>"
    ```

4.  **Database Migration:**

    Run the migrations to set up your PostgreSQL schema:

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start the Server:**
    - **Development Mode:**
      ```bash
      npm run dev
      ```
    - **Production Build:**
      ```bash
      npm run build
      npm start
      ```

## 📚 API Documentation

Once the server is running, you can access the full interactive Swagger documentation at:

```
http://localhost:3000/api-docs
```

## 🧪 Testing

To run the automated test suite (Unit & Integration tests):

```bash
npm test
```

## 🔄 Background Workers

This application uses **BullMQ** to handle background tasks (like sending reminder emails).

- Ensure **Redis** is running.
- The worker is initialized automatically when the server starts in `src/server.ts` via `src/workers/reminder.worker.ts`.

## 📂 Project Structure

```
src/
├── config/         # Environment & Service configurations
├── controllers/    # Request handlers
├── dal/            # Data Access Layer (Prisma queries)
├── jobs/           # Job definitions
├── lib/            # Shared libraries (Prisma, Redis client)
├── middlewares/    # Auth, Validation, Error Handling
├── queues/         # BullMQ queue setup
├── routes/         # API Route definitions
├── schemas/        # Zod validation schemas
├── services/       # Business logic (Payment, Email, Ticket, Event)
├── swagger-docs/   # OpenAPI definitions
├── workers/        # Background job processors
├── tests/          # Jest tests
└── app.ts          # Express App setup
```

## 🤝 Contributing

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/amazing-feature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.
