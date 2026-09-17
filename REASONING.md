# REASONING.md — TiffinFlow

This document explains the reasoning, assumptions, and design decisions behind the TiffinFlow application.

---

## 1. Understanding of the Problem

A home-style tiffin delivery service delivers lunch to subscribed customers every weekday (Monday-Friday). Customers may pause their subscription for travel, festivals, or other reasons. At month-end the owner needs each customer's bill: the plan price pro-rated for the days actually delivered.

Core requirements:
- Only charge for weekdays food was actually delivered
- Exclude weekends (Saturday/Sunday) entirely
- Exclude paused weekdays from billing
- Support multiple pause periods per month
- Handle the varying number of weekdays across months
- Customers are looked up by phone
- Owner can see who's active versus paused

### Extended Requirements (Twists)

**Level 1 — T1 (integrate):** Each morning, notify the customers due a delivery today (active, a weekday, not paused) via the Notification Service. Graded via `GET /outbox` after `POST /clock`.

**Level 2 — T6 (lifecycle):** Transfer a subscription to a new customer mid-cycle; the plan and cycle carry over, billing splits by who was served.

**Level 3 — T4 (messy data):** Import a messy customer list (duplicate phones, mixed date formats, blanks) into clean subscriptions with an `{ imported, deduped, rejected }` report.

---

## 2. Assumptions

- Food is delivered only on weekdays (Mon-Fri), never on weekends.
- A "paused" day means no delivery and no charge — the pause period is inclusive of both start and end dates.
- Each customer has at most one active subscription.
- The subscription auto-creates when a customer is added with a plan (simplifies the flow).
- Customers created without a plan are given `inactive` status — useful as transfer targets (T6).
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

### Six Collections

- **User** — Authentication only. Separate from Customer since the owner and customers are different entities.
- **Customer** — Business data: name, phone, address, plan price, status. Phone is indexed and unique.
- **Subscription** — Linked to Customer via `customerId`. Contains `pausePeriods` as an embedded array.
- **Plan** — Reusable tiffin plan templates (name, price, meal types).
- **Notification** (T1) — Delivery notification outbox with compound unique index `(date, customerId)` for idempotency.
- **TransferLog** (T6) — Audit trail for subscription transfers between customers.

### Why embed pausePeriods?

Pause periods are always queried alongside subscriptions. Embedding avoids joins, simplifies billing calculations, and keeps the data model clean. The number of pause periods per customer is bounded (realistically < 50/year), so array growth is manageable.

### Customer Status

Three possible statuses:
- `active` — Has a subscription, currently receiving deliveries
- `paused` — Has a subscription, temporarily paused
- `inactive` — No subscription (e.g., created as a transfer target, or subscription was transferred out)

### Indexes

- `Customer.phone` — Unique constraint provides automatic index for phone-based search
- `Customer.name` — Text index for name search
- `Customer.status` — For filtering active/paused/inactive
- `Subscription.customerId` — Unique constraint provides automatic index
- `Notification.date + customerId` — Compound unique index for idempotent clock operations
- `Notification.date` — For outbox filtering

---

## 5. API Design

RESTful resource-based design:

- `/api/auth/*` — Public auth endpoints (register, login, me)
- `/api/customers/*` — CRUD with search/pagination/sort via query params
- `/api/subscriptions/:customerId/*` — Subscription operations keyed by customer
- `/api/plans/*` — Tiffin plan management
- `/api/clock` and `/api/outbox` — T1 notification endpoints
- `/api/subscriptions/transfer` and `/api/transfers` — T6 transfer endpoints
- `/api/import/customers` — T4 bulk import endpoint

All business routes require JWT authentication via `Authorization: Bearer <token>`.

### Route Ordering

Transfer routes (`/api/subscriptions/transfer`) are registered **before** subscription routes (`/api/subscriptions/:customerId`) in `index.js` to prevent Express from matching the literal word "transfer" as a `:customerId` parameter.

Design choices:
- Stats endpoint (`/api/customers/stats`) is separate for dashboard efficiency
- Bill is a GET (read-only calculation), not stored in the database
- Pause/resume are POST operations that modify subscription state
- Clock is POST because it has side effects (creates notifications)
- Outbox is GET (read-only query)

---

## 6. Billing Calculation Approach

The billing service (`billingService.js`) is the most critical piece of business logic.

### Core Algorithm (`calculateBill`)

1. Count total weekdays in the billing month using actual calendar dates
2. Collect all paused dates into a `Set<string>` (ISO date keys) to de-duplicate overlapping periods
3. Clamp each pause period to the billing month boundaries
4. Count weekday paused dates from the set
5. Calculate: `billableDays = totalWeekdays - pausedWeekdays`
6. Calculate: `finalBill = (monthlyPrice / totalWeekdays) * billableDays`

### Split Billing Algorithm (`calculateSplitBill`) — T6

When a subscription is transferred mid-cycle:

1. Accept an `activeRange { from, to }` defining the customer's served window
2. Count weekdays within that active range only
3. Calculate paused weekdays within the intersection of pause periods and active range
4. Use the same daily rate (monthlyPrice / totalWeekdaysInMonth) for proportional billing
5. **Guarantee**: Split bill A + Split bill B = Full month bill (verified by unit tests)

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

## 8. T1: Notification Service Design

### Architecture

The notification system uses a **clock-trigger** pattern:

1. `POST /clock` — Triggers notification generation (simulates a morning cron job)
2. Service queries all `active` customers → checks pause status → generates `Notification` documents
3. `GET /outbox` — Reads the notification outbox

### Key Design Decisions

- **Idempotent clock**: Re-running `POST /clock` for the same date deletes existing notifications and regenerates them. This prevents duplicates if the clock is triggered multiple times.
- **Compound unique index** `(date, customerId)` — Extra safety net for idempotency.
- **Weekend detection** — Returns immediately with `isWeekday: false` on Sat/Sun, avoiding unnecessary DB queries.
- **Pause checking** — Reuses the `isPausedOnDate()` function which checks all pause periods including open-ended pauses.
- **Denormalized fields** — `customerName` and `phone` are stored on the notification document for fast reads without populating.

---

## 9. T6: Transfer Service Design

### Architecture

Transfer operations involve:

1. Validate source has a subscription, target doesn't
2. Close any open pause on the source subscription
3. Reassign the subscription's `customerId` to the target
4. Create a `TransferLog` audit record
5. Update customer statuses accordingly

### Split Billing

The split bill calculation uses `activeRange` to isolate each customer's billable window:

- **Source customer**: `monthStart` → `transferDate - 1` (last day they were served)
- **Target customer**: `transferDate` → `monthEnd`

The daily rate remains consistent (monthlyPrice / totalWeekdaysInMonth), ensuring the sum of both split bills equals the full month's bill.

### Why a TransferLog?

Transfers are irreversible mutations. The `TransferLog` provides:
- Complete audit trail with both customer IDs and transfer date
- Price snapshot at the time of transfer
- Ability to reconstruct billing history

---

## 10. T4: Import Service Design

### Pipeline Architecture

The import service uses a multi-stage pipeline:

```
Raw JSON → Normalize → Validate → Dedup (intra-batch) → Dedup (vs DB) → Insert → Report
```

### Normalization

- **Phone**: Strips `+91`, `91`, leading `0`, spaces, dashes, parentheses, dots. Validates 10-digit result.
- **Name**: Trims whitespace, collapses multiple spaces.
- **Date**: Parses multiple formats via regex matching:
  - `YYYY-MM-DD` (ISO)
  - `DD/MM/YYYY` and `DD-MM-YYYY` (Indian standard)
  - `DD Mon YYYY` and `DD-Mon-YYYY` (e.g., "15 Sep 2026")
  - Ambiguous dates (both slots ≤ 12) default to DD/MM interpretation

### Deduplication Strategy

1. **Intra-batch**: First occurrence of a phone number wins; subsequent rows are marked `deduped` with the reason "Duplicate phone in batch"
2. **Against DB**: Checks if normalized phone already exists in the Customer collection

### Validation Rules

A row is rejected if:
- Name is empty/whitespace
- Phone is empty or doesn't normalize to 10 digits
- Address is empty
- Plan price is missing or negative
- Plan start date is invalid/unparseable

### Report Format

```json
{
  "imported": [{ "row": 1, "name": "Rahul", "phone": "9876543210", ... }],
  "deduped":  [{ "row": 2, "normalizedPhone": "9876543210", "reason": "..." }],
  "rejected": [{ "row": 3, "original": {...}, "reasons": ["Missing name", "Invalid phone"] }],
  "summary":  { "total": 3, "importedCount": 1, "dedupedCount": 1, "rejectedCount": 1 }
}
```

---

## 11. Authentication Design

- **bcrypt** with 10 salt rounds for password hashing
- **JWT** for stateless authentication with 7-day expiry
- Token generated via a Mongoose instance method on the User model
- Frontend stores token in localStorage
- Axios interceptor auto-attaches token to every request
- 401 responses trigger auto-redirect to login
- `protect` middleware gates all business routes

Trade-off: localStorage is simpler but less secure than httpOnly cookies. Acceptable for this assessment scope.

---

## 12. Search Implementation

- Uses MongoDB regex: `{ $regex: searchTerm, $options: 'i' }`
- Searches both `name` and `phone` fields with `$or`
- Combined with status filter, pagination, and sorting
- Frontend debounces input by 400ms to reduce API calls

---

## 13. Testing Strategy

### Unit Tests (62 tests, 4 suites)

**billingService.test.js (16 tests)**
- `isWeekday()` — weekday/weekend detection
- `getWeekdaysInMonth()` — correct weekday count for various months including leap years
- `getWeekdaysBetweenDates()` — inclusive date range weekday counting
- `calculateBill()` — full month, single pause, weekend-only pause, multiple pauses, overlapping pauses, open-ended pause, out-of-range pause, requirements example

**notificationService.test.js (8 tests)**
- `isPausedOnDate()` — no pauses, closed period, outside period, open-ended pause, boundary dates, multiple periods

**transferService.test.js (7 tests)**
- `calculateSplitBill()` — full range equals full bill, first half, second half, A+B=full month, pause in range, pause outside range, date string formatting

**importService.test.js (28 tests)**
- `normalizePhone()` — 10-digit pass-through, +91 prefix, 91 prefix, leading 0, spaces, dashes, parentheses, too short, empty, null, undefined
- `parseFlexibleDate()` — ISO, DD/MM/YYYY, DD-MM-YYYY, DD Mon YYYY, Date objects, empty, null, garbage, ambiguous dates
- `normalizeName()` — trim, collapse spaces, empty, whitespace, null

---

## 14. Bugs/Issues Encountered

*This section documents actual issues encountered during development:*

1. The initial Vite scaffold used TypeScript with a vanilla template. Had to convert to React + JSX setup.
2. React and ReactDOM were only available as transitive dependencies. Added them as direct dependencies.
3. `tsconfig.json` from the scaffold needed to be left in place but `build` script was changed to skip `tsc`.
4. **Route collision bug**: `POST /api/subscriptions/transfer` was being caught by the generic `POST /api/subscriptions/:customerId` route, causing Mongoose to try casting "transfer" as an ObjectId → "Invalid ID format" error. Fixed by loading `transferRoutes` before `subscriptionRoutes` in `index.js`.
5. **Duplicate index warnings**: Both `Customer.phone` and `Subscription.customerId` had `unique: true` in the schema definition AND manual `schema.index()` calls, causing Mongoose warnings. Fixed by removing the redundant manual index calls since `unique: true` already creates an index.
6. **Customer creation locked to plans**: Originally all customers required a `planPrice > 0` and `planStartDate`, making it impossible to create "empty" customers for use as transfer targets. Fixed by allowing `inactive` status with no plan.

---

## 15. How Issues Were Fixed

- Replaced `main.ts` (vanilla Vite template) with `main.jsx` (React entry with routing)
- Created `App.jsx` with all route definitions
- Created `vite.config.js` with React plugin, Tailwind CSS plugin, and API proxy
- Updated `index.html` to reference `main.jsx`
- Updated `package.json` to add React as direct dependency and remove TypeScript build step
- Moved `transferRoutes` above `subscriptionRoutes` in Express middleware stack
- Removed redundant `customerSchema.index({ phone: 1 })` and `subscriptionSchema.index({ customerId: 1 })`
- Added `inactive` status to Customer schema, made `planPrice` and `planStartDate` optional

---

## 16. Trade-offs

| Decision | Trade-off |
|----------|-----------|
| localStorage for JWT | Simpler but less secure than httpOnly cookies |
| On-demand billing | Slightly slower but always accurate; no stale data |
| Embedded pausePeriods | Fast reads but array could grow; acceptable for this scale |
| No WebSocket | No real-time updates; acceptable for single-user owner app |
| No input sanitization beyond Mongoose | Sufficient for assessment; add express-mongo-sanitize for production |
| Single user role | No multi-tenancy; one owner manages all customers |
| No rate limiting | Should add for production deployment |
| Clock is manual (POST) not cron | Assessment requires testability via API; real deployment would use node-cron |
| Denormalized fields in Notification | Duplicates customer data but avoids populate() in hot path |
| Transfer is one-way | No "undo" — TransferLog provides audit trail instead |
| Import batch limit (500) | Prevents OOM on large imports; could add streaming for production |

---

## 17. Future Improvements

1. **WhatsApp/SMS Notifications** — Send billing reminders and pause confirmations
2. **Online Payment & Invoicing** — Razorpay integration, PDF invoice generation
3. **Delivery Route Optimization** — Manage delivery partners, optimize routes
4. **Multi-tenant Support** — Multiple owners with separate customer bases
5. **Bulk Operations** — Pause/resume multiple customers at once
6. **Export** — CSV/PDF export of customer data and bills
7. **Mobile App** — React Native app for on-the-go management
8. **Automated Billing** — Monthly cron job to auto-generate and send bills
9. **Customer Portal** — Self-service pause/resume for customers
10. **Analytics** — Revenue trends, pause patterns, customer retention metrics
11. **CSV Import** — Support CSV file upload in addition to JSON
12. **Transfer Reversal** — Allow undoing transfers within a grace period
