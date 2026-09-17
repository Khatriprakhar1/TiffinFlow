# REASONING.md — TiffinFlow

This document explains the reasoning, assumptions, and design decisions behind the TiffinFlow application.

---

## 1. Understanding of the Problem

A home-style tiffin delivery service delivers lunch to subscribed customers every weekday (Monday-Friday). Customers may pause their subscription for travel, festivals, or other reasons. At month-end, the owner needs an accurate bill for each customer that:

- Only charges for weekdays food was actually delivered
- Excludes weekends (Saturday/Sunday) entirely
- Excludes paused weekdays from billing
- Supports multiple pause periods per month
- Handles the varying number of weekdays across months

---

## 2. Assumptions

- Food is delivered only on weekdays (Mon-Fri), never on weekends.
- A "paused" day means no delivery and no charge — the pause period is inclusive of both start and end dates.
- Each customer has exactly one subscription.
- The subscription auto-creates when a customer is added (simplifies the flow).
- A pause with `endDate: null` means the subscription is currently paused.
- Billing is always calculated for a full calendar month (1st to last day).
- The owner is the only user type needed — no multi-role auth.
- Phone numbers are 10-digit Indian mobile numbers.
- Currency is Indian Rupees (₹).

---

## 3. Why MERN Was Selected

MERN (MongoDB, Express.js, React, Node.js) is specified by the assessment requirements. Beyond that:

- **MongoDB** — Schema-flexible, perfect for embedded pause periods arrays. No joins needed for billing calculations.
- **Express.js** — Lightweight, minimal boilerplate for REST APIs.
- **React** — Component-based UI with excellent state management (Context API + hooks).
- **Node.js** — Same language (JavaScript) front-to-back, fast development.

---

## 4. Database Design Decisions

### Three Collections

- **User** — Authentication only. Separate from Customer since the owner and customers are different entities.
- **Customer** — Business data: name, phone, address, plan price, status. Phone is indexed and unique.
- **Subscription** — Linked to Customer via `customerId`. Contains `pausePeriods` as an embedded array.

### Why embed pausePeriods?

Pause periods are always queried alongside subscriptions. Embedding avoids joins, simplifies billing calculations, and keeps the data model clean. The number of pause periods per customer is bounded (realistically < 50/year), so array growth is manageable.

### Indexes

- `Customer.phone` — For fast phone-based search
- `Customer.name` — Text index for name search
- `Customer.status` — For filtering active/paused
- `Subscription.customerId` — For fast lookups

---

## 5. API Design

RESTful resource-based design:

- `/api/auth/*` — Public auth endpoints (register, login, me)
- `/api/customers/*` — CRUD with search/pagination/sort via query params
- `/api/subscriptions/:customerId/*` — Subscription operations keyed by customer

All business routes require JWT authentication via `Authorization: Bearer <token>`.

Design choices:
- Stats endpoint (`/api/customers/stats`) is separate for dashboard efficiency
- Bill is a GET (read-only calculation), not stored in the database
- Pause/resume are POST operations that modify subscription state

---

## 6. Billing Calculation Approach

The billing service (`billingService.js`) is the most critical piece of business logic:

### Core Algorithm

1. Count total weekdays in the billing month using actual calendar dates
2. Collect all paused dates into a `Set<string>` (ISO date keys) to de-duplicate overlapping periods
3. Clamp each pause period to the billing month boundaries
4. Count weekday paused dates from the set
5. Calculate: `billableDays = totalWeekdays - pausedWeekdays`
6. Calculate: `finalBill = (monthlyPrice / totalWeekdays) * billableDays`

### Why a Set?

Using `Set<string>` for paused dates solves the overlap problem elegantly. If two pause periods overlap, the overlapping dates are only counted once. No complex interval merging needed.

### Why not pre-compute?

Bills are calculated on-demand, not stored. This ensures:
- Retroactive edits to pause periods are reflected immediately
- No data consistency issues between stored bills and actual pause data
- Simpler architecture

---

## 7. Pause/Resume Design

- **Pause** creates a new entry in `pausePeriods` with `endDate: null`
- **Resume** finds the open pause period and sets `endDate`
- Customer `status` is updated alongside for easy filtering
- Validation prevents pausing an already-paused customer (and vice versa)
- Historical pause periods are preserved — never deleted or overwritten

This approach:
- Maintains a complete audit trail
- Supports multiple pause periods per subscription
- Makes billing calculations straightforward

---

## 8. Authentication Design

- **bcrypt** with 10 salt rounds for password hashing
- **JWT** for stateless authentication with 7-day expiry
- Token generated via a Mongoose instance method on the User model
- Frontend stores token in localStorage
- Axios interceptor auto-attaches token to every request
- 401 responses trigger auto-redirect to login
- `protect` middleware gates all business routes

Trade-off: localStorage is simpler but less secure than httpOnly cookies. Acceptable for this assessment scope.

---

## 9. Search Implementation

- Uses MongoDB regex: `{ $regex: searchTerm, $options: 'i' }`
- Searches both `name` and `phone` fields with `$or`
- Combined with status filter, pagination, and sorting
- Frontend debounces input by 400ms to reduce API calls

---

## 10. Pagination Implementation

- Server-side pagination using Mongoose `skip()` and `limit()`
- Returns total count, current page, limit, and total pages
- Frontend renders page numbers with prev/next navigation
- Default: 10 items per page

---

## 11. Sorting Implementation

- Whitelist of allowed sort fields: `name`, `phone`, `planPrice`, `status`, `createdAt`
- Direction: `asc` (1) or `desc` (-1)
- Defaults to `createdAt desc` (newest first)
- Invalid sort fields fall back to `createdAt`

---

## 12. Testing Strategy

### Unit Tests (billingService.test.js)

The billing service has comprehensive Jest unit tests covering:
- `isWeekday()` — weekday/weekend detection
- `getWeekdaysInMonth()` — correct weekday count for various months including leap years
- `getWeekdaysBetweenDates()` — inclusive date range weekday counting
- `calculateBill()`:
  - Full month, no pauses
  - Single pause period
  - Weekend-only pause (no weekday deduction)
  - Multiple pause periods
  - Overlapping pause periods (no double-counting)
  - Open pause (no endDate)
  - Pause outside billing month

### Manual Testing

Manual testing should cover:
1. User registration and login flow
2. Customer CRUD operations
3. Search by name and phone
4. Pagination navigation
5. Sort by different fields
6. Pause and resume operations
7. Bill generation for different months
8. Protected route redirection
9. Error handling (duplicate phone, invalid data, etc.)

---

## 13. Bugs/Issues Encountered

*This section documents actual issues encountered during development:*

- The initial Vite scaffold used TypeScript with a vanilla template. Had to convert to React + JSX setup.
- React and ReactDOM were only available as transitive dependencies. Added them as direct dependencies.
- `tsconfig.json` from the scaffold needed to be left in place but `build` script was changed to skip `tsc`.

---

## 14. How Issues Were Fixed

- Replaced `main.ts` (vanilla Vite template) with `main.jsx` (React entry with routing)
- Created `App.jsx` with all route definitions
- Created `vite.config.js` with React plugin, Tailwind CSS plugin, and API proxy
- Updated `index.html` to reference `main.jsx`
- Updated `package.json` to add React as direct dependency and remove TypeScript build step

---

## 15. Trade-offs

| Decision | Trade-off |
|----------|-----------|
| localStorage for JWT | Simpler but less secure than httpOnly cookies |
| On-demand billing | Slightly slower but always accurate; no stale data |
| Embedded pausePeriods | Fast reads but array could grow; acceptable for this scale |
| No WebSocket | No real-time updates; acceptable for single-user owner app |
| No input sanitization beyond Mongoose | Sufficient for assessment; add express-mongo-sanitize for production |
| Single user role | No multi-tenancy; one owner manages all customers |
| No rate limiting | Should add for production deployment |

---

## 16. Future Improvements

1. **WhatsApp/SMS Notifications** — Send billing reminders and pause confirmations
2. **Online Payment & Invoicing** — PDF invoice generation, UPI/card payments
3. **Delivery Route Optimization** — Manage delivery partners, optimize routes
4. **Multi-tenant Support** — Multiple owners with separate customer bases
5. **Bulk Operations** — Pause/resume multiple customers at once
6. **Export** — CSV/PDF export of customer data and bills
7. **Mobile App** — React Native app for on-the-go management
8. **Automated Billing** — Monthly cron job to auto-generate and send bills
9. **Customer Portal** — Self-service pause/resume for customers
10. **Analytics** — Revenue trends, pause patterns, customer retention metrics
