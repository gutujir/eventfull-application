# Eventfull Backend API

The robust server-side application powering the Eventfull platform. Built with Node.js, Express, and TypeScript, it follows a strict layered architecture to ensure scalability, maintainability, and type safety.

## 🏗 Architecture

The backend implements a **Layered Architecture** pattern to separate concerns:

1.  **Presentation Layer (Routes & Controllers)**: Handles HTTP requests, validation, and serialization.
2.  **Service Layer**: Contains business logic, independent of the database or HTTP framework.
3.  **Data Access Layer (DAL)**: Exclusively interacts with the database via Prisma ORM.

Additionally, it uses **Event-Driven Architecture** for background tasks (email reminders) using Redis and BullMQ.

## 🛠 Tech Stack

- **Core**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL 16+
- **ORM**: Prisma
- **Caching & Queuing**: Redis, BullMQ
- **Authentication**: JWT (JSON Web Tokens), BCrypt
- **Validation**: Zod
- **Payments**: Paystack SDK
- **Asset Storage**: Cloudinary
- **Documentation**: Swagger UI (OpenAPI 3.0)
- **Testing**: Jest, Supertest

## 📂 Project Structure

```text
backend/
├── prisma/                 # Database schema (schema.prisma) and migrations
├── src/
│   ├── app.ts              # Express application configuration
│   ├── server.ts           # Server entry point (starts listening)
│   ├── config/             # Environment configurations
│   ├── controllers/        # HTTP Request Handlers (Req/Res logic)
│   ├── dal/                # Data Access Layer (Database queries)
│   ├── services/           # Business Logic Layer
│   ├── routes/             # API Route definitions
│   ├── middlewares/        # Express middlewares (Auth, rate-limiting)
│   ├── schemas/            # Zod validation schemas
│   ├── lib/                # Third-party service wrappers (Redis, Cloudinary)
│   ├── jobs/               # Cron job definitions using Node-Cron
│   ├── queues/             # BullMQ queue definitions
│   ├── workers/            # BullMQ worker processors
│   ├── swagger-docs/       # OpenAPI definitions
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Shared utility functions
└── tests/                  # Test suites
    ├── unit/               # Unit tests for services/utils
    └── integration/        # API Integration tests (Supertest)
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- PostgreSQL running locally or in cloud
- Redis server running locally

### Installation

1.  **Install Dependencies**

    ```bash
    npm install
    ```

2.  **Environment Configuration**
    Create a `.env` file in the `backend` directory:

    ```env
    PORT=3000
    DATABASE_URL="postgresql://user:password@localhost:5432/eventfull_db"
    JWT_SECRET="your_jwt_secret"
    REDIS_URL="redis://localhost:6379"
    PAYSTACK_SECRET_KEY="sk_test_..."
    CLOUDINARY_CLOUD_NAME="..."
    CLOUDINARY_API_KEY="..."
    CLOUDINARY_API_SECRET="..."
    CLIENT_URL="http://localhost:5173"
    ```

3.  **Database Setup**

    ```bash
    # Run migrations to set up schema
    npx prisma migrate dev --name init
    ```

4.  **Run Development Server**
    ```bash
    npm run dev
    ```

## 📜 Scripts

| Script                     | Description                                     |
| :------------------------- | :---------------------------------------------- |
| `npm run dev`              | Starts the server in watch mode using `tsx`     |
| `npm run build`            | Compiles TypeScript to JavaScript (dist folder) |
| `npm start`                | Runs the compiled code from `dist/server.js`    |
| `npm run lint`             | Runs ESLint for code quality checks             |
| `npm run test:unit`        | Runs unit tests using Jest                      |
| `npm run test:integration` | Runs integration tests                          |

## 📚 API Documentation

When the server is running, visit the interactive Swagger documentation at:
**`http://localhost:3000/api-docs`**

## 🧪 Testing

We use **Jest** for testing framework and **Supertest** for HTTP assertions.

- **Unit Tests**: Test individual services and utility functions in isolation.
- **Integration Tests**: Test the full request lifecycle from Route -> Controller -> Service -> Database.

```bash
# Run all tests
npm test

# Run only integration tests
npm run test:integration
```
