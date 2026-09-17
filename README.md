# TiffinFlow — Tiffin Subscription & Billing Management System

A full-stack MERN application for home-style tiffin/lunch delivery services to manage customer subscriptions, handle pause/resume workflows, and generate accurate pro-rated monthly bills.

---

## Features

### Core
- **User Authentication** — Register/Login with JWT-based auth and bcrypt password hashing
- **Customer Management** — Full CRUD for tiffin customers with unique phone numbers
- **Subscription Management** — Create subscriptions, pause and resume with date tracking
- **Pro-rated Billing** — Accurate weekday-based billing excluding weekends and paused days
- **Search** — Search customers by name or phone number
- **Pagination** — Server-side pagination for customer lists
- **Sorting** — Sort by name, plan price, status, or date added
- **Dashboard** — Overview with total, active, paused, inactive customers and estimated revenue
- **Tiffin Plans** — Create and manage reusable tiffin plans (name, price, meal types)
- **Landing Page** — Professional one-page overview with features and roadmap

### Level 1 — T1: Daily Notification Clock
- **POST /api/clock** — Trigger morning delivery notifications for all eligible customers
- **GET /api/outbox** — View notification outbox, filterable by date
- Eligibility: active status + weekday + not paused on that date
- Idempotent: re-running for the same day replaces (not duplicates) notifications
- Supports custom `date` parameter for testing

### Level 2 — T6: Subscription Transfer
- **POST /api/subscriptions/transfer** — Transfer a subscription from one customer to another mid-cycle
- **GET /api/transfers** — View transfer history with populated customer/plan data
- **GET /api/subscriptions/:customerId/split-bill** — Calculate pro-rated split bill for a transferred subscription
- The plan and cycle carry over; billing splits by who was served
- Closes open pause periods on source before transfer
- Prevents transfer to a customer who already has an active subscription

### Level 3 — T4: Messy Data Import
- **POST /api/import/customers** — Bulk import a JSON array of messy customer data
- Auto-normalizes phone numbers (strips +91, leading 0, spaces, dashes)
- Auto-normalizes names (trims, collapses whitespace)
- Parses flexible date formats: `YYYY-MM-DD`, `DD/MM/YYYY`, `DD-MM-YYYY`, `DD Mon YYYY`
- Deduplicates within batch and against existing DB records
- Returns categorized report: `{ imported, deduped, rejected, summary }`

---

## Tech Stack

| Layer      | Technology                                |
|------------|-------------------------------------------|
| Frontend   | React, Vite, React Router, Tailwind CSS v4 |
| Backend    | Node.js, Express.js                       |
| Database   | MongoDB, Mongoose                         |
| Auth       | JWT (jsonwebtoken), bcryptjs              |
| HTTP       | Axios                                     |
| Testing    | Jest                                      |

---

## Architecture

```
tiffin/
├── client/                 # React frontend (Vite)
│   └── src/
│       ├── api/            # Axios API client (customer, subscription, plan, clock, transfer, import)
│       ├── components/     # Reusable UI (Navbar, Sidebar, CustomerForm, ProtectedRoute)
│       ├── context/        # React Context (AuthContext)
│       ├── pages/          # Route pages
│       │   ├── Dashboard.jsx
│       │   ├── Customers.jsx / AddCustomer.jsx / EditCustomer.jsx / CustomerDetails.jsx
│       │   ├── Plans.jsx / AddPlan.jsx / EditPlan.jsx
│       │   ├── Clock.jsx       # T1: Notification trigger & outbox viewer
│       │   ├── Transfers.jsx   # T6: Transfer form, split bill preview, history
│       │   ├── Import.jsx      # T4: Paste JSON, view import report
│       │   └── Menu.jsx / Landing.jsx / Login.jsx / Register.jsx / NotFound.jsx
│       └── utils/          # Utility functions
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route handlers
│   │   │   ├── authController.js
│   │   │   ├── customerController.js
│   │   │   ├── subscriptionController.js
│   │   │   ├── planController.js
│   │   │   ├── clockController.js       # T1
│   │   │   ├── transferController.js    # T6
│   │   │   └── importController.js      # T4
│   │   ├── middleware/     # Auth & error middleware
│   │   ├── models/         # Mongoose schemas (User, Customer, Subscription, Plan, Notification, TransferLog)
│   │   ├── routes/         # Express routes
│   │   └── services/       # Business logic
│   │       ├── billingService.js        # Core billing + split billing
│   │       ├── notificationService.js   # T1 delivery notification logic
│   │       └── importService.js         # T4 normalization pipeline
│   └── tests/              # Jest unit tests (62 tests, 4 suites)
│       ├── billingService.test.js       # 16 tests
│       ├── notificationService.test.js  # 8 tests
│       ├── transferService.test.js      # 7 tests
│       └── importService.test.js        # 28 tests
├── README.md
├── REASONING.md
└── AI_LOGS.md
```

---

## Database Schema

### User
| Field     | Type   | Notes               |
|-----------|--------|---------------------|
| name      | String | Required            |
| email     | String | Unique, validated   |
| password  | String | Hashed with bcrypt  |
| createdAt | Date   | Auto (timestamps)   |

### Customer
| Field         | Type     | Notes                              |
|---------------|----------|------------------------------------|
| name          | String   | Required                           |
| phone         | String   | Unique, 10-digit, indexed          |
| address       | String   | Required                           |
| planId        | ObjectId | Ref to Plan (optional)             |
| planPrice     | Number   | Default 0, min 0                   |
| planStartDate | Date     | Optional                           |
| status        | String   | "active", "paused", or "inactive"  |

### Subscription
| Field        | Type     | Notes                                   |
|--------------|----------|-----------------------------------------|
| customerId   | ObjectId | Ref to Customer, unique                 |
| monthlyPrice | Number   | Positive, required                      |
| startDate    | Date     | Required                                |
| pausePeriods | Array    | [{startDate, endDate}], endDate=null if ongoing |

### Plan
| Field     | Type    | Notes                          |
|-----------|---------|--------------------------------|
| name      | String  | Required, unique               |
| price     | Number  | Required, positive             |
| mealTypes | Array   | e.g. ["lunch", "dinner"]       |
| isActive  | Boolean | Default true                   |

### Notification (T1)
| Field        | Type     | Notes                                |
|--------------|----------|--------------------------------------|
| customerId   | ObjectId | Ref to Customer                      |
| customerName | String   | Denormalized for fast reads          |
| phone        | String   | Denormalized                         |
| message      | String   | Delivery notification text           |
| date         | String   | YYYY-MM-DD, compound unique w/ customerId |
| type         | String   | "delivery_due"                       |

### TransferLog (T6)
| Field          | Type     | Notes                    |
|----------------|----------|--------------------------|
| subscriptionId | ObjectId | Ref to Subscription      |
| fromCustomerId | ObjectId | Ref to Customer          |
| toCustomerId   | ObjectId | Ref to Customer          |
| transferDate   | Date     | When the transfer occurs |
| planId         | ObjectId | Ref to Plan (snapshot)   |
| monthlyPrice   | Number   | Price at transfer time   |
| notes          | String   | Optional                 |

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm

### 1. Clone the repository

```bash
git clone <repo-url>
cd tiffin
```

### 2. Backend setup

```bash
cd server
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm install
```

### 3. Frontend setup

```bash
cd client
npm install
```

---

## Environment Variables

### Server (`server/.env`)

| Variable    | Description                    | Example                              |
|-------------|--------------------------------|--------------------------------------|
| PORT        | Server port                    | 5000                                 |
| MONGODB_URI | MongoDB connection string      | mongodb://localhost:27017/tiffinflow  |
| JWT_SECRET  | Secret key for JWT signing     | your_secret_key_here                 |
| JWT_EXPIRE  | JWT token expiration           | 7d                                   |

### Client

The Vite dev server proxies `/api` requests to the backend (`http://localhost:5000`), so no separate API URL configuration is needed during development.

To override, set `VITE_API_URL` in a `.env` file inside `/client`.

---

## How to Run

### Start Backend

```bash
cd server
npm run dev
```

The API runs on http://localhost:5000.

### Start Frontend

```bash
cd client
npm run dev
```

The UI runs on http://localhost:5173.

### Run Tests

```bash
cd server
npm test
```

Runs 62 tests across 4 test suites (billing, notifications, transfers, imports).

---

## API Endpoints

### Authentication

| Method | Endpoint          | Description        | Auth |
|--------|-------------------|--------------------|------|
| POST   | /api/auth/register | Register user      | No   |
| POST   | /api/auth/login    | Login user         | No   |
| GET    | /api/auth/me       | Get current user   | Yes  |

### Customers

| Method | Endpoint            | Description               | Auth |
|--------|---------------------|---------------------------|------|
| GET    | /api/customers       | List (search/page/sort)   | Yes  |
| GET    | /api/customers/:id   | Get one customer          | Yes  |
| POST   | /api/customers       | Create customer           | Yes  |
| PUT    | /api/customers/:id   | Update customer           | Yes  |
| DELETE | /api/customers/:id   | Delete customer           | Yes  |
| GET    | /api/customers/stats | Dashboard stats           | Yes  |

### Subscriptions

| Method | Endpoint                              | Description           | Auth |
|--------|---------------------------------------|-----------------------|------|
| POST   | /api/subscriptions/:customerId        | Create subscription   | Yes  |
| GET    | /api/subscriptions/:customerId        | Get subscription      | Yes  |
| POST   | /api/subscriptions/:customerId/pause  | Pause subscription    | Yes  |
| POST   | /api/subscriptions/:customerId/resume | Resume subscription   | Yes  |
| GET    | /api/subscriptions/:customerId/bill   | Get bill              | Yes  |

### Plans

| Method | Endpoint          | Description       | Auth |
|--------|-------------------|--------------------|------|
| GET    | /api/plans         | List plans         | Yes  |
| GET    | /api/plans/:id     | Get one plan       | Yes  |
| POST   | /api/plans         | Create plan        | Yes  |
| PUT    | /api/plans/:id     | Update plan        | Yes  |
| DELETE | /api/plans/:id     | Delete plan        | Yes  |

### Clock & Notifications (T1)

| Method | Endpoint      | Description                              | Auth |
|--------|---------------|------------------------------------------|------|
| POST   | /api/clock    | Generate delivery notifications for today | Yes  |
| GET    | /api/outbox   | View outbox (optional ?date=YYYY-MM-DD)  | Yes  |

### Transfers (T6)

| Method | Endpoint                                    | Description              | Auth |
|--------|---------------------------------------------|--------------------------|------|
| POST   | /api/subscriptions/transfer                 | Transfer subscription    | Yes  |
| GET    | /api/transfers                              | List transfer history    | Yes  |
| GET    | /api/subscriptions/:customerId/split-bill   | Calculate split bill     | Yes  |

### Import (T4)

| Method | Endpoint               | Description                         | Auth |
|--------|------------------------|-------------------------------------|------|
| POST   | /api/import/customers  | Bulk import with normalization      | Yes  |

---

## Example API Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Owner","email":"owner@test.com","password":"123456"}'
```

### Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Rahul Sharma","phone":"9876543210","address":"123 Main St","planPrice":3000,"planStartDate":"2026-09-01"}'
```

### Create Customer (No Plan — for Transfer Target)
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Jane Doe","phone":"9123456789","address":"456 Other St","planId":"none"}'
```

### Trigger Clock (T1)
```bash
curl -X POST http://localhost:5000/api/clock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"date":"2026-09-17"}'
```

### View Outbox (T1)
```bash
curl "http://localhost:5000/api/outbox?date=2026-09-17" \
  -H "Authorization: Bearer <token>"
```

### Transfer Subscription (T6)
```bash
curl -X POST http://localhost:5000/api/subscriptions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"fromCustomerId":"<id1>","toCustomerId":"<id2>","transferDate":"2026-09-15","notes":"Customer moving"}'
```

### Split Bill (T6)
```bash
curl "http://localhost:5000/api/subscriptions/<customerId>/split-bill?month=2026-09" \
  -H "Authorization: Bearer <token>"
```

### Import Messy Data (T4)
```bash
curl -X POST http://localhost:5000/api/import/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"customers":[{"name":"Rahul","phone":"+91 9876 543210","address":"MG Road","planPrice":3000,"planStartDate":"15/09/2026"},{"name":"","phone":"123","address":"","planPrice":-1,"planStartDate":"bad-date"}]}'
```

### Pause / Resume / Get Bill
```bash
# Pause
curl -X POST http://localhost:5000/api/subscriptions/<customerId>/pause \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"startDate":"2026-09-10"}'

# Resume
curl -X POST http://localhost:5000/api/subscriptions/<customerId>/resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"endDate":"2026-09-13"}'

# Bill
curl "http://localhost:5000/api/subscriptions/<customerId>/bill?month=2026-09" \
  -H "Authorization: Bearer <token>"
```

---

## Billing Logic

The billing service calculates pro-rated monthly bills:

```
totalWeekdays = number of Mon-Fri days in the billing month
pausedWeekdays = weekdays within pause periods (clamped to billing month)
billableDays = totalWeekdays - pausedWeekdays
dailyRate = monthlyPlanPrice / totalWeekdays
finalBill = dailyRate × billableDays
```

### Split Billing (T6)

When a subscription is transferred mid-cycle, the month is divided by the transfer date:

```
Customer A (source): active from month start → transfer date - 1
Customer B (target): active from transfer date → month end
Split bill = dailyRate × billableDays within active range
```

The split bills for A + B mathematically sum to the full month's bill (verified by unit tests).

**Key rules:**
- Saturdays and Sundays are never counted as delivery days
- The system calculates actual weekdays per month (not a fixed 30 days)
- Overlapping pause periods are de-duplicated using a Set of date strings
- Open pauses (endDate = null) are treated as ongoing until end of billing month
- Multiple pause periods are supported per subscription

**Example (September 2026):**
- Monthly plan: ₹3,000
- Total weekdays: 22
- Pause: Sept 10-11 (Thu-Fri) = 2 paused weekdays
- Billable days: 20
- Daily rate: ₹136.36
- Final bill: ₹2,727.27

---

## Testing

62 tests across 4 suites, all passing:

| Suite | Tests | Coverage |
|-------|-------|----------|
| `billingService.test.js` | 16 | isWeekday, getWeekdaysInMonth, getWeekdaysBetweenDates, calculateBill (pauses, overlaps, open-ended, edge cases) |
| `notificationService.test.js` | 8 | isPausedOnDate (closed, open-ended, multiple periods, boundary dates) |
| `transferService.test.js` | 7 | calculateSplitBill (full range, halves, A+B=full, pauses in range) |
| `importService.test.js` | 28 | normalizePhone, parseFlexibleDate, normalizeName (all edge cases) |

---

## Debugging / Common Issues

| Issue | Solution |
|-------|----------|
| `ECONNREFUSED` on MongoDB | Ensure MongoDB is running on port 27017 |
| CORS errors | Backend has `cors()` middleware; frontend proxies via Vite |
| 401 Unauthorized | Check that JWT token is included in Authorization header |
| Duplicate phone error | Phone numbers must be unique across all customers |
| Wrong bill amount | Verify the month format is `YYYY-MM`, check pause dates |
| Port already in use | Change `PORT` in `.env` or kill the process |
| Tailwind not working | Ensure `@import "tailwindcss"` in `index.css` |
| "Invalid ID format" on transfer | Ensure transferRoutes load before subscriptionRoutes in index.js |
| "Target customer already has active subscription" | Delete their existing subscription first, or use a customer with status "inactive" |

---

## License

MIT
