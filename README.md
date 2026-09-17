# TiffinFlow — Tiffin Subscription & Billing Management System

A full-stack MERN application for home-style tiffin/lunch delivery services to manage customer subscriptions, handle pause/resume workflows, and generate accurate pro-rated monthly bills.

---

## Features

- **User Authentication** — Register/Login with JWT-based auth and bcrypt password hashing
- **Customer Management** — Full CRUD for tiffin customers with unique phone numbers
- **Subscription Management** — Create subscriptions, pause and resume with date tracking
- **Pro-rated Billing** — Accurate weekday-based billing excluding weekends and paused days
- **Search** — Search customers by name or phone number
- **Pagination** — Server-side pagination for customer lists
- **Sorting** — Sort by name, plan price, status, or date added
- **Dashboard** — Overview with total, active, paused customers and estimated revenue
- **Pause History** — Full audit trail of all pause/resume events
- **Landing Page** — Professional one-page overview with features and roadmap

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
│       ├── api/            # Axios API client
│       ├── components/     # Reusable UI components
│       ├── context/        # React Context (Auth)
│       ├── pages/          # Route pages
│       └── utils/          # Utility functions
├── server/                 # Express backend
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # Route handlers
│   │   ├── middleware/     # Auth & error middleware
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # Express routes
│   │   ├── services/       # Business logic (billing)
│   │   └── utils/          # Utilities
│   └── tests/              # Jest tests
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
| Field         | Type   | Notes                      |
|---------------|--------|----------------------------|
| name          | String | Required                   |
| phone         | String | Unique, 10-digit, indexed  |
| address       | String | Required                   |
| planPrice     | Number | Positive, required         |
| planStartDate | Date   | Required                   |
| status        | String | "active" or "paused"       |

### Subscription
| Field        | Type     | Notes                                   |
|--------------|----------|-----------------------------------------|
| customerId   | ObjectId | Ref to Customer, unique                 |
| monthlyPrice | Number   | Positive, required                      |
| startDate    | Date     | Required                                |
| pausePeriods | Array    | [{startDate, endDate}], endDate=null if ongoing |

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

### GitHub Codespaces

Both `npm run dev` commands work in Codespaces. Make sure MongoDB is available (install via `apt` or use MongoDB Atlas).

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

---

## Example API Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Owner","email":"owner@test.com","password":"123456"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"owner@test.com","password":"123456"}'
```

### Create Customer
```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"name":"Rahul Sharma","phone":"9876543210","address":"123 Main St","planPrice":3000,"planStartDate":"2026-09-01"}'
```

### Search Customers
```bash
curl "http://localhost:5000/api/customers?search=9876" \
  -H "Authorization: Bearer <token>"
```

### Pagination & Sorting
```bash
curl "http://localhost:5000/api/customers?page=1&limit=10&sortBy=name&order=asc" \
  -H "Authorization: Bearer <token>"
```

### Pause Subscription
```bash
curl -X POST http://localhost:5000/api/subscriptions/<customerId>/pause \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"startDate":"2026-09-10"}'
```

### Resume Subscription
```bash
curl -X POST http://localhost:5000/api/subscriptions/<customerId>/resume \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{"endDate":"2026-09-13"}'
```

### Get Bill
```bash
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

## Authentication

- Passwords hashed with bcrypt (10 salt rounds)
- JWT tokens signed with `JWT_SECRET`, default expiry 7 days
- `protect` middleware verifies token on all business routes
- Frontend stores token in localStorage, auto-attaches via Axios interceptor
- 401 responses auto-redirect to login page

---

## Pagination & Sorting

**Pagination query params:**
- `page` — Page number (default: 1)
- `limit` — Items per page (default: 10)

**Sorting query params:**
- `sortBy` — Field to sort: `name`, `phone`, `planPrice`, `status`, `createdAt`
- `order` — `asc` or `desc`

**Response includes:**
```json
{
  "pagination": {
    "total": 25,
    "page": 1,
    "limit": 10,
    "pages": 3
  }
}
```

---

## Search

- Query param: `?search=<term>`
- Searches both `name` and `phone` fields using case-insensitive regex
- Combined with pagination and sorting
- Frontend includes 400ms debounce

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

---

## License

MIT
