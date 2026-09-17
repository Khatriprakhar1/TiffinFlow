# AI_LOGS.md

## Instructions

This file is a placeholder for the complete AI conversation log.

**Before final submission**, paste the full AI conversation transcript here. This should include all prompts sent to the AI and all responses received.

> **Do NOT fabricate AI conversation logs.** Only paste the actual conversation.




CHATGPT:

Yes. Since this is a 2.5-hour Builder Round, don't over-engineer it. For MERN, I would build a clean Tiffin Billing & Subscription Management System with the mandatory features first, then polish the UI.

1. Recommended MERN file structure
tiffin-billing-system/
│
├── README.md
├── REASONING.md
├── AI_LOGS.md
├── .gitignore
├── package.json
│
├── client/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   │
│   └── src/
│       ├── main.jsx
│       ├── App.jsx
│       ├── index.css
│       │
│       ├── api/
│       │   ├── axios.js
│       │   ├── authApi.js
│       │   ├── customerApi.js
│       │   └── subscriptionApi.js
│       │
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Sidebar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── CustomerCard.jsx
│       │   ├── CustomerTable.jsx
│       │   ├── CustomerForm.jsx
│       │   ├── SubscriptionForm.jsx
│       │   ├── PauseResumeModal.jsx
│       │   ├── BillCard.jsx
│       │   ├── Pagination.jsx
│       │   ├── SortDropdown.jsx
│       │   └── Loading.jsx
│       │
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── Dashboard.jsx
│       │   ├── Customers.jsx
│       │   ├── AddCustomer.jsx
│       │   ├── CustomerDetails.jsx
│       │   └── NotFound.jsx
│       │
│       ├── context/
│       │   └── AuthContext.jsx
│       │
│       └── utils/
│           ├── formatCurrency.js
│           └── formatDate.js
│
└── server/
    ├── package.json
    ├── .env
    ├── server.js
    │
    └── src/
        ├── config/
        │   └── db.js
        │
        ├── models/
        │   ├── User.js
        │   ├── Customer.js
        │   └── Subscription.js
        │
        ├── controllers/
        │   ├── authController.js
        │   ├── customerController.js
        │   └── subscriptionController.js
        │
        ├── routes/
        │   ├── authRoutes.js
        │   ├── customerRoutes.js
        │   └── subscriptionRoutes.js
        │
        ├── middleware/
        │   ├── authMiddleware.js
        │   └── errorMiddleware.js
        │
        ├── services/
        │   └── billingService.js
        │
        └── utils/
            └── generateToken.js
Keep the database simple

You only really need 3 collections:

User
{
  name,
  email,
  password,
  createdAt
}
Customer
{
  name,
  phone,
  address,
  planPrice,
  planStartDate,
  status: "active" | "paused",
  createdAt
}
Subscription
{
  customerId,
  startDate,
  endDate,
  monthlyPrice,
  pausePeriods: [
    {
      startDate,
      endDate
    }
  ]
}

You can calculate the bill from the subscription and pause periods instead of creating unnecessary daily records.

2. Core functionality

Your application should have this flow:

Landing Page
     ↓
Register / Login
     ↓
Dashboard
     ↓
Customers
     ├── Add Customer
     ├── Search by Phone/Name
     ├── Sort
     ├── Pagination
     └── Customer Details
              ↓
        Subscription
          ├── Subscribe
          ├── Pause
          ├── Resume
          └── Generate Bill

Dashboard can show:

-----------------------------------------
 Tiffin Billing Dashboard

 Active Customers       42
 Paused Customers        8
 Monthly Revenue    ₹52,400
 Pending Bills           5
-----------------------------------------

 Recent Customers
-----------------------------------------
 Name       Phone       Status      Bill
 Rahul      98xxxxxx    Active      ₹1,200
 Aman       97xxxxxx    Paused        ₹850
 ...
-----------------------------------------
3. REST APIs

Put these in your README.

Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Customers
GET    /api/customers
GET    /api/customers/:id
POST   /api/customers
PUT    /api/customers/:id
DELETE /api/customers/:id
GET    /api/customers/search?phone=9876543210
Subscription
POST /api/subscriptions/:customerId
GET  /api/subscriptions/:customerId
POST /api/subscriptions/:customerId/pause
POST /api/subscriptions/:customerId/resume
GET  /api/subscriptions/:customerId/bill

For pagination/sorting:

GET /api/customers?page=1&limit=10&sortBy=name&order=asc

Search can also be:

GET /api/customers?search=9876543210
4. Important billing logic

This is the heart of the problem.

Suppose:

Monthly plan = ₹3000
Weekdays in month = 22

Customer paused:
5th → 7th

If those are 3 weekdays:

Served days = 22 - 3
            = 19

Daily rate:

₹3000 / 22 = ₹136.36

Bill:

19 × ₹136.36
= ₹2590.84

Your billing service should handle:

weekdays only
pause periods
resume
current month
months with different numbers of weekdays
pause dates outside subscription period
multiple pause/resume periods

Do not hardcode 30 days.

Calculate the number of weekdays in the billing month.

5. Prompt for Antigravity

You can give Antigravity one strong prompt instead of manually explaining everything.

Copy this:

You are a senior MERN full-stack engineer helping me build a timed coding assessment project.

I need to build a working full-stack product called:

"TiffinFlow - Tiffin Subscription & Billing Management System"

CONTEXT:

This is a 2.5-hour Builder Round assessment.

The problem:

A home-style tiffin/lunch delivery service has customers who subscribe to a monthly plan and receive lunch every weekday. Customers may pause their subscription for a few days because of travel, festivals, etc. They should NOT be charged for paused days.

At the end of the month, the owner needs each customer's bill based on the number of weekdays they were actually served.

Customers should be searchable by phone number, and the owner should be able to see active versus paused customers.

The application must be a complete working MERN full-stack application.

TECH STACK:

Frontend:
- React
- Vite
- React Router
- Axios
- Tailwind CSS

Backend:
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt

Use JavaScript rather than TypeScript to keep development fast.

IMPORTANT:
Do NOT over-engineer the application.
Prioritize correctness, clean architecture, working APIs, and a usable UI.
The application must be easy to run in GitHub Codespaces.

==================================================
MANDATORY REQUIREMENTS
==================================================

The final application MUST include:

1. MongoDB database with sensible schema
2. REST APIs
3. Usable React UI
4. User registration
5. User login
6. Authentication using JWT
7. Customer management
8. Subscription management
9. Pause subscription
10. Resume subscription
11. Correct pro-rated monthly billing
12. Search customers
13. Pagination
14. Sorting
15. One-page landing page
16. README.md
17. REASONING.md
18. AI_LOGS.md

==================================================
CORE BUSINESS LOGIC
==================================================

A customer subscribes to a monthly tiffin plan.

Example:

Monthly price = ₹3000

The customer should be charged only for weekdays during which food was actually delivered.

Saturday and Sunday must NOT count as delivery days.

If a customer pauses from 10th September to 13th September, the system must exclude weekdays in that pause period from billable days.

Billing formula:

billableDays = totalWeekdaysInBillingPeriod - pausedWeekdays

dailyRate = monthlyPlanPrice / totalWeekdaysInBillingPeriod

finalBill = dailyRate * billableDays

Do NOT assume every month has 30 days.

The billing logic must correctly calculate weekdays for the selected month.

The system should support multiple pause periods.

Pause/resume operations should create/update pause periods rather than destroying historical information.

Avoid double-counting overlapping pause periods.

The billing service should be implemented separately from controllers.

Create:

server/src/services/billingService.js

with clean functions for:

- getWeekdaysInMonth()
- getWeekdaysBetweenDates()
- calculateBill()

==================================================
DATABASE DESIGN
==================================================

Use these collections:

User:

{
  name,
  email,
  password,
  createdAt
}

Customer:

{
  name,
  phone,
  address,
  planPrice,
  planStartDate,
  status,
  createdAt,
  updatedAt
}

status must be:

"active" | "paused"

Subscription:

{
  customerId,
  monthlyPrice,
  startDate,
  pausePeriods: [
    {
      startDate,
      endDate
    }
  ],
  createdAt,
  updatedAt
}

Use Mongoose references appropriately.

Add useful indexes, especially on Customer.phone and searchable fields.

Phone number should be unique.

==================================================
REST API
==================================================

Authentication:

POST /api/auth/register
POST /api/auth/login
GET /api/auth/me

Customers:

GET /api/customers
GET /api/customers/:id
POST /api/customers
PUT /api/customers/:id
DELETE /api/customers/:id

Search:

GET /api/customers?search=9876543210

Pagination:

GET /api/customers?page=1&limit=10

Sorting:

GET /api/customers?page=1&limit=10&sortBy=name&order=asc

Subscription:

POST /api/subscriptions/:customerId
GET /api/subscriptions/:customerId

Pause:

POST /api/subscriptions/:customerId/pause

Resume:

POST /api/subscriptions/:customerId/resume

Bill:

GET /api/subscriptions/:customerId/bill?month=2026-09

Protect all business APIs using JWT authentication.

Return proper HTTP status codes and useful JSON error messages.

==================================================
BACKEND STRUCTURE
==================================================

Use:

server/
  src/
    config/
    models/
    controllers/
    routes/
    middleware/
    services/
    utils/

Use:

models/
  User.js
  Customer.js
  Subscription.js

controllers/
  authController.js
  customerController.js
  subscriptionController.js

routes/
  authRoutes.js
  customerRoutes.js
  subscriptionRoutes.js

middleware/
  authMiddleware.js
  errorMiddleware.js

services/
  billingService.js

config/
  db.js

==================================================
FRONTEND STRUCTURE
==================================================

Use:

client/
  src/
    api/
    components/
    pages/
    context/
    utils/

Pages:

Landing.jsx
Login.jsx
Register.jsx
Dashboard.jsx
Customers.jsx
AddCustomer.jsx
CustomerDetails.jsx
NotFound.jsx

Components:

Navbar.jsx
Sidebar.jsx
ProtectedRoute.jsx
CustomerTable.jsx
CustomerForm.jsx
SubscriptionForm.jsx
PauseResumeModal.jsx
BillCard.jsx
Pagination.jsx
SortDropdown.jsx
Loading.jsx

==================================================
LANDING PAGE
==================================================

Create a professional one-page landing page.

It must explain:

- What TiffinFlow is
- What problem it solves
- Target audience
- Key features
- How it helps tiffin owners
- Three features that could be built next

Include a clear Login/Register CTA.

Suggested future features:

1. WhatsApp/SMS customer notifications
2. Online payment and invoice generation
3. Delivery partner management and route optimization

Do NOT make these future features functional. Clearly label them as "Coming Next" or "Future Features".

==================================================
DASHBOARD
==================================================

Create a clean dashboard showing:

- Total customers
- Active customers
- Paused customers
- Estimated/current monthly revenue
- Recent customers

Use cards and a clean responsive layout.

==================================================
CUSTOMER MANAGEMENT
==================================================

Customers page should have:

- Customer table
- Name
- Phone
- Address
- Plan price
- Status
- Actions

Actions:

- View
- Edit
- Delete
- Pause/Resume
- View Bill

Add:

- Search input
- Status filter
- Sorting
- Pagination

Search should work by phone number and name.

==================================================
CUSTOMER DETAILS
==================================================

Customer details page should show:

- Customer information
- Current subscription
- Active/Paused status
- Pause history
- Monthly plan price
- Current month's bill

Buttons:

- Pause
- Resume
- Generate/View Bill

Show billing breakdown:

Total weekdays
Paused weekdays
Billable weekdays
Monthly plan price
Daily rate
Final bill

Example:

September 2026

Total weekdays: 22
Paused weekdays: 3
Billable weekdays: 19
Monthly plan: ₹3000
Daily rate: ₹136.36
Final bill: ₹2590.84

==================================================
UI/UX
==================================================

Make the UI professional but simple.

Use Tailwind CSS.

Design principles:

- Responsive
- Clean dashboard
- Good spacing
- Clear status badges
- Loading states
- Empty states
- Error messages
- Confirmation before delete
- Modal for pause/resume
- Toast notifications where useful

Do not spend excessive time on animations.

Prioritize usability.

==================================================
AUTHENTICATION
==================================================

Registration:

name
email
password

Hash passwords using bcrypt.

Login should return JWT.

Store authentication state on the frontend.

Use ProtectedRoute for dashboard/customer pages.

Unauthenticated users should be redirected to Login.

==================================================
VALIDATION
==================================================

Backend validation:

- Required customer name
- Valid phone
- Positive plan price
- Valid dates
- Prevent invalid pause periods
- Prevent resuming when already active
- Prevent pausing when already paused

Frontend should also provide basic validation.

==================================================
ERROR HANDLING
==================================================

Create centralized Express error middleware.

Return responses such as:

{
  "success": false,
  "message": "Customer not found"
}

Successful responses should use:

{
  "success": true,
  "data": ...
}

==================================================
README.md
==================================================

Create a complete README.md containing:

1. Project overview
2. Features
3. Tech stack
4. Architecture
5. Database schema
6. Setup instructions
7. Environment variables
8. How to run frontend
9. How to run backend
10. API endpoint list
11. Example API requests
12. Billing logic
13. Authentication
14. Pagination and sorting
15. Search
16. Debugging/common issues

Make the README useful for an evaluator.

==================================================
REASONING.md
==================================================

Create REASONING.md.

Document:

1. Understanding of the problem
2. Assumptions
3. Why MERN was selected
4. Database design decisions
5. API design
6. Billing calculation approach
7. Pause/resume design
8. Authentication design
9. Search implementation
10. Pagination implementation
11. Sorting implementation
12. Testing strategy
13. Bugs/issues encountered
14. How issues were fixed
15. Trade-offs
16. Future improvements

IMPORTANT:
Do not invent testing results.
Only document tests that are actually run.

==================================================
AI_LOGS.md
==================================================

Create an empty AI_LOGS.md initially with a short placeholder indicating that the complete AI conversation should be pasted there before final submission.

DO NOT fabricate AI conversation logs.

==================================================
TESTING
==================================================

After implementation:

1. Start MongoDB
2. Start backend
3. Start frontend
4. Test registration
5. Test login
6. Test customer creation
7. Test customer search
8. Test pagination
9. Test sorting
10. Test subscription creation
11. Test pause
12. Test resume
13. Test billing
14. Test multiple pause periods
15. Test weekends are excluded
16. Test invalid inputs
17. Test protected routes

If possible, create a few backend tests for billingService.js because billing correctness is the most important business requirement.

==================================================
IMPORTANT DEVELOPMENT RULES
==================================================

1. Build the MVP first.
2. Keep the code readable.
3. Do not add unnecessary libraries.
4. Do not create unnecessary database collections.
5. Do not over-engineer.
6. Use environment variables for secrets.
7. Never hardcode MongoDB credentials or JWT secrets.
8. Never commit .env.
9. Add .env.example.
10. Make the application runnable in GitHub Codespaces.
11. Fix errors rather than hiding them.
12. Verify APIs actually work.
13. Verify the UI actually communicates with the backend.
14. Do not claim something is implemented unless it is actually implemented.

==================================================
EXECUTION STRATEGY
==================================================

Work in this order:

PHASE 1:
Create MERN project structure and install dependencies.

PHASE 2:
Implement MongoDB connection and models.

PHASE 3:
Implement authentication.

PHASE 4:
Implement customer CRUD.

PHASE 5:
Implement subscriptions.

PHASE 6:
Implement billing service and pause/resume logic.

PHASE 7:
Implement REST API testing.

PHASE 8:
Build React authentication.

PHASE 9:
Build dashboard.

PHASE 10:
Build customer management/search/pagination/sorting.

PHASE 11:
Build customer details and billing UI.

PHASE 12:
Build landing page.

PHASE 13:
Create README.md and REASONING.md.

PHASE 14:
Run and test the complete application.

At every phase, prioritize working functionality over visual polish.

If you encounter an error, diagnose the root cause, fix it, and continue.

At the end, provide me with:

- final project structure
- commands to run the application
- environment variables required
- list of implemented APIs
- testing summary
- remaining issues, if any

Start building the project now.
6. One important thing for your assessment

Because AI is explicitly allowed, don't just let Antigravity generate everything and submit blindly.

Your REASONING.md is specifically asking for your approach and testing/fixes. So while building, keep track of things like:

Problem:
Billing was initially calculating calendar days.

Issue:
Weekends were being charged.

Fix:
Created getWeekdaysInMonth() and calculateBill() in billingService.js.

Test:
September 2026 has X weekdays...

And AI_LOGS.md must contain the actual complete AI conversation as-is. Don't ask the AI to fabricate that file.

2.5-hour priority order

If time starts running out, use this order:

Priority	Feature
🔴 Must	MongoDB + schema
🔴 Must	Register/Login
🔴 Must	Customer CRUD
🔴 Must	Subscribe
🔴 Must	Pause/Resume
🔴 Must	Correct billing
🔴 Must	Search
🔴 Must	Pagination
🔴 Must	Sorting
🔴 Must	REST endpoints
🔴 Must	README
🔴 Must	REASONING
🟡 Next	Dashboard
🟡 Next	Landing page polish
🟢 Last	Animations, advanced styling

The billing logic is the feature I'd spend the most care testing, because that's the actual business problem rather than just CRUD.

firstly give me the backend what thing i need to build exactly, what are the requirements, i will first make the backend then database then ui

Yes — build it backend-first. For this round, don't start

hey?

Yep 😄 Let's do it properly.

For the 2.5-hour Builder Round, your backend should be focused on one thing:

A tiffin owner can register/login, manage customers, subscribe them to a monthly plan, pause/resume their service, and calculate the correct monthly bill based on actual weekdays served.

Don't build unnecessary things like payments, delivery tracking, notifications, admin roles, etc.

1. Backend requirements

Your backend needs these 6 modules:

Backend
│
├── 1. Authentication
├── 2. Customers
├── 3. Subscriptions
├── 4. Pause / Resume
├── 5. Billing
└── 6. Search + Pagination + Sorting
2. Authentication

The owner needs to create an account and login.

APIs
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
Register

Input:

{
  "name": "Rahul Sharma",
  "email": "rahul@gmail.com",
  "password": "password123"
}

Store the password hashed using bcrypt.

Login
{
  "email": "rahul@gmail.com",
  "password": "password123"
}

Response should contain JWT:

{
  "success": true,
  "token": "jwt_token_here",
  "user": {
    "id": "...",
    "name": "Rahul Sharma",
    "email": "rahul@gmail.com"
  }
}

Then protected APIs require:

Authorization: Bearer <token>
3. Customer Management

This is your main CRUD module.

Each customer should have:

name
phone
address
planPrice
planStartDate
status

Status:

active
paused
APIs
POST   /api/customers
GET    /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
Create customer
{
  "name": "Aman Verma",
  "phone": "9876543210",
  "address": "Mansarovar, Jaipur",
  "planPrice": 3000,
  "planStartDate": "2026-09-01"
}

Initially:

status = active
4. Subscription

When a customer subscribes, you need to record their subscription.

I recommend keeping a separate Subscription collection.

Example:

{
  "customerId": "...",
  "monthlyPrice": 3000,
  "startDate": "2026-09-01",
  "pausePeriods": []
}

API:

POST /api/subscriptions/:customerId
GET  /api/subscriptions/:customerId
5. Pause / Resume

This is one of the most important parts of the assessment.

Suppose:

Customer starts: September 1
Monthly plan: ₹3000

Pause:
September 10 → September 12

The customer shouldn't be charged for those weekdays.

Pause
POST /api/subscriptions/:customerId/pause

Request:

{
  "startDate": "2026-09-10",
  "endDate": "2026-09-12"
}

Store:

{
  "startDate": "2026-09-10",
  "endDate": "2026-09-12"
}

inside:

pausePeriods

And change:

Customer.status = "paused"
Resume
POST /api/subscriptions/:customerId/resume

The backend should close the currently active pause period.

For example:

Pause started: September 10
Resume: September 15

Result:

{
  "startDate": "2026-09-10",
  "endDate": "2026-09-14"
}

You can choose whether the resume date itself is considered served. Document your assumption in REASONING.md and implement it consistently.

For a timed assessment, I'd use:

Pause start and end are inclusive; resume means service resumes on the resume date.

So pause:

10 → 14

Resume:

15
6. Billing — THE CORE

This is where you should spend most of your backend thinking.

API:

GET /api/subscriptions/:customerId/bill?month=2026-09

Response:

{
  "success": true,
  "data": {
    "month": "September 2026",
    "monthlyPlan": 3000,
    "totalWeekdays": 22,
    "pausedWeekdays": 3,
    "billableDays": 19,
    "dailyRate": 136.36,
    "finalBill": 2590.84
  }
}
Billing formula

First calculate weekdays in the billing month.

For example:

September 2026

Monday-Friday = 22 days

Then calculate weekdays falling inside pause periods.

Total weekdays       = 22
Paused weekdays      = 3
-------------------------
Billable weekdays    = 19

Then:

dailyRate = monthlyPrice / totalWeekdays

finalBill = dailyRate × billableDays

Example:

3000 / 22 = 136.36

136.36 × 19 = 2590.84
7. Billing Service

Don't put this calculation directly inside your controller.

Create:

server/src/services/billingService.js

Something conceptually like:

getWeekdaysInMonth()
        ↓
getWeekdaysBetweenDates()
        ↓
calculateBill()

The controller should simply do:

Request
   ↓
Find customer
   ↓
Find subscription
   ↓
Call billingService
   ↓
Return result

This makes your architecture much cleaner.

8. Search

The requirement says:

Customers are looked up by phone.

So phone search is mandatory.

API can be:

GET /api/customers?search=9876543210

You can also allow name search because it's useful.

For example:

GET /api/customers?search=rahul

MongoDB query:

name OR phone
9. Pagination

Mandatory.

Your customer API should support:

GET /api/customers?page=1&limit=10

Response:

{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42,
    "totalPages": 5
  }
}

Backend calculation:

skip = (page - 1) × limit

MongoDB:

.skip(skip)
.limit(limit)
10. Sorting

Also mandatory.

Example:

GET /api/customers?sortBy=name&order=asc

or:

GET /api/customers?sortBy=planPrice&order=desc

Allow a few safe fields:

name
phone
planPrice
createdAt
status

Don't blindly accept arbitrary MongoDB sort fields.

11. Dashboard APIs

You don't strictly need a separate dashboard collection.

Create an endpoint that calculates statistics:

GET /api/dashboard/stats

Response:

{
  "success": true,
  "data": {
    "totalCustomers": 50,
    "activeCustomers": 42,
    "pausedCustomers": 8
  }
}

You can add revenue later if time permits.

12. Final backend API list

This is the list I'd actually implement:

Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
Customers
POST   /api/customers
GET    /api/customers
GET    /api/customers/:id
PUT    /api/customers/:id
DELETE /api/customers/:id
Subscription
POST   /api/subscriptions/:customerId
GET    /api/subscriptions/:customerId
Pause / Resume
POST   /api/subscriptions/:customerId/pause
POST   /api/subscriptions/:customerId/resume
Billing
GET    /api/subscriptions/:customerId/bill?month=2026-09
Dashboard
GET    /api/dashboard/stats

That's 13 endpoints. More than enough.

13. Backend folder structure

I'd simplify the earlier structure slightly for the timed round:

server/
│
├── package.json
├── server.js
├── .env
├── .env.example
├── .gitignore
│
└── src/
    │
    ├── config/
    │   └── db.js
    │
    ├── models/
    │   ├── User.js
    │   ├── Customer.js
    │   └── Subscription.js
    │
    ├── controllers/
    │   ├── authController.js
    │   ├── customerController.js
    │   ├── subscriptionController.js
    │   └── dashboardController.js
    │
    ├── routes/
    │   ├── authRoutes.js
    │   ├── customerRoutes.js
    │   ├── subscriptionRoutes.js
    │   └── dashboardRoutes.js
    │
    ├── middleware/
    │   ├── authMiddleware.js
    │   └── errorMiddleware.js
    │
    ├── services/
    │   └── billingService.js
    │
    └── utils/
        └── generateToken.js
14. Request flow

Understand this architecture before coding:

                React UI
                   │
                   ▼
              REST API
                   │
                   ▼
              Route Layer
                   │
                   ▼
            Auth Middleware
                   │
                   ▼
             Controller
              /        \
             /          \
            ▼            ▼
        MongoDB      Billing Service
                         │
                         ▼
                    Bill Calculation
                         │
                         ▼
                      Response

For example:

GET /api/subscriptions/123/bill?month=2026-09
                    │
                    ▼
          subscriptionRoutes.js
                    │
                    ▼
          authMiddleware.js
                    │
                    ▼
      subscriptionController.js
                    │
             ┌──────┴──────┐
             ▼             ▼
        Subscription    Customer
             │
             ▼
      billingService.js
             │
             ▼
     Calculate weekdays
             │
             ▼
     Calculate paused days
             │
             ▼
       Calculate bill
             │
             ▼
          JSON
15. Backend requirements checklist

Before moving to UI, make sure all of these work:

AUTH
[ ] Register
[ ] Login
[ ] JWT
[ ] Protected routes

CUSTOMERS
[ ] Create
[ ] Get all
[ ] Get by ID
[ ] Update
[ ] Delete

SUBSCRIPTION
[ ] Subscribe customer
[ ] Get subscription

PAUSE/RESUME
[ ] Pause
[ ] Resume
[ ] Store pause history
[ ] Prevent invalid pause/resume

BILLING
[ ] Calculate weekdays
[ ] Calculate paused weekdays
[ ] Calculate billable days
[ ] Calculate daily rate
[ ] Calculate final bill
[ ] Support multiple pause periods
[ ] Don't count weekends

SEARCH
[ ] Search by phone
[ ] Search by name

PAGINATION
[ ] page
[ ] limit
[ ] total
[ ] totalPages

SORTING
[ ] name
[ ] price
[ ] status
[ ] createdAt

DASHBOARD
[ ] Total customers
[ ] Active customers
[ ] Paused customers

QUALITY
[ ] Error handling
[ ] Validation
[ ] .env
[ ] README API list
Your development order

Don't build all of this randomly. Do:

Step 1: Express server + MongoDB connection
Step 2: User model + authentication
Step 3: Customer model + CRUD
Step 4: Subscription model + subscribe
Step 5: Pause/resume
Step 6: Billing service
Step 7: Search + pagination + sorting
Step 8: Dashboard stats
Step 9: Test every API in Postman/Thunder Client
Step 10: Then build React UI.

If you want to use Antigravity for this, I would not give it the giant full-stack prompt yet. Give it a backend-only prompt and build/verify the backend first.



