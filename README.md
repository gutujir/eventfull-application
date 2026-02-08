# Eventfull Application

**🌐 Live Demo:** [https://eventfull-application.onrender.com](https://eventfull-application.onrender.com)

Eventfull is a complete event management platform that enables users to discover, create, share, and attend events seamlessly. It features a robust backend for managing data and transactions, and a modern frontend interface for an engaging user experience.

## 📂 Repository Structure

This repository is organized into two main directories:

- **[backend/](./backend/README.md)**: The server-side API handled with Node.js, Express, and PostgreSQL. Handles authentication, payments, event management, and background jobs.
- **[frontend/](./frontend/README.md)**: The client-side application built with React, Vite, and Tailwind CSS. Provides dashboards for users and creators, ticket purchasing, and event discovery.

## 🚀 Key Features

- **User & Creator Dashboards:** Distinct interfaces for event attendees and organizers.
- **Secure Payments:** Integrated with Paystack for safe ticket purchases.
- **Payment Verification Flow:** Automatic verification and ticket issuance after payment.
- **Real-time Notifications:** Email reminders for upcoming events.
- **QR Code Ticketing:** Generate and scan tickets for entry.
- **Ticket Verification Modes:** Camera scan, manual/USB input, and QR image upload.
- **Analytics:** Insights into sales and attendance for creators.
- **RBAC:** Role-Based Access Control (Admin, Creator, User).
- **Event Visibility Controls:** Creators can publish and toggle public visibility.
- **My Reminders:** Eventees can view their custom reminders.

## 🛠️ Tech Stack Overview

| Component    | Technologies                                                                  |
| ------------ | ----------------------------------------------------------------------------- |
| **Backend**  | Node.js, Express, TypeScript, PostgreSQL, Prisma, Redis, BullMQ               |
| **Frontend** | React, Vite, TypeScript, Tailwind CSS, Redux Toolkit                          |
| **Services** | Paystack (Payments), Mailtrap/Nodemailer (Emails), Cloudinary/Local (Uploads) |

## 📸 Application Preview

### 🏠 General Pages

**Landing Page:**
![Landing Page](./frontend/src/assets/landing-page1.png)
![Landing Page](./frontend/src/assets/landing-page2.png)
![Landing Page](./frontend/src/assets/landing-page3.png)

**Authentication:**
| Login | Signup |
|-------|--------|
| ![Login](./frontend/src/assets/login-page.png) | ![Signup](./frontend/src/assets/signup-page.png) |

---

### 🎨 User Role: CREATOR (Organizer)

**Creator Dashboard:**
_Analytics overview of sales and revenue._
![Creator Dashboard](./frontend/src/assets/dashboard.png)

**Event Management:**
| Create Event | My Events List |
|--------------|----------------|
| ![Create Event](./frontend/src/assets/create-event-page.png) | ![My Events](./frontend/src/assets/my-events-page.png) |

**Payments:**
![Payments](./frontend/src/assets/payment-page.png)

**Event Attendees:**
![Event Attendees](./frontend/src/assets/event-attendees-page.png)

**Ticket Verification:**
_Scan and verify attendee tickets._
![Verify Tickets - Camera](./frontend/src/assets/camera-scan-verify-ticket.png)
![Verify Tickets - Manual](./frontend/src/assets/manual-verify-ticket.png)
![Verify Tickets - Upload QR](./frontend/src/assets/upload-qr-verify-ticket.png)

---

### 👤 User Role: EVENTEE (Attendee)

**Event Booking:**
![Event Booking](./frontend/src/assets/event-booking-page.png)

**Purchase Tickets:**
![Purchase Tickets](./frontend/src/assets/purchase-tickets-page.png)

**Payment Form:**
![Paystack Payment Form](./frontend/src/assets/Paystack-payment-form.png)

**My Tickets:**
_View purchased tickets and order history._
![My Tickets](./frontend/src/assets/my-tickets-page.png)

**My Reminders:**
![My Reminders](./frontend/src/assets/My-reminders-page.png)

**Profile:**
![Profile](./frontend/src/assets/profile-page.png)

## 🏁 Getting Started

To get the application running locally, follow this comprehensive guide to set up both the backend and frontend.

### 📋 Prerequisites

Ensure you have the following installed on your machine:

- **Node.js** (v18+)
- **PostgreSQL** (Running locally or via cloud)
- **Redis** (Required for background jobs & caching)

### 1. 🔙 Setup Backend

1.  **Navigate to the backend directory:**

    ```bash
    cd backend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in `backend/` and add your configuration (see [backend/README.md](./backend/README.md) for full list):

    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:pass@localhost:5432/eventfull_db"
    JWT_SECRET="super_secret"
    REDIS_URL="redis://127.0.0.1:6379"
    # ...add other required vars
    ```

4.  **Run Database Migrations:**

    ```bash
    npx prisma migrate dev --name init
    ```

5.  **Start the Server:**
    ```bash
    npm run dev
    ```
    > The backend API will run at `http://localhost:3000`

### 2. 🖥️ Setup Frontend

1.  **Open a new terminal and navigate to the frontend directory:**

    ```bash
    cd frontend
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env` file in `frontend/`:

    ```env
    VITE_API_URL=http://localhost:3000/api/v1
    VITE_PAYSTACK_PUBLIC_KEY=pk_test_xxxxxx
    ```

4.  **Start the Development Server:**
    ```bash
    npm run dev
    ```
    > The frontend will launch at `http://localhost:5173`

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1.  Fork the repository.
2.  Create a feature branch (`git checkout -b feature/NewFeature`).
3.  Commit your changes.
4.  Push to the branch.
5.  Open a Pull Request.

## 📄 License

This project is licensed under the ISC License.
