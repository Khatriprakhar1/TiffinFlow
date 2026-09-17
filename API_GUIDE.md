# API_GUIDE.md — TiffinFlow API Interaction Guide

A step-by-step walkthrough for interacting with the TiffinFlow API. Follow the sections in order to set up your first customers, subscriptions, and bills.

> **Base URL**: `http://localhost:5000`  
> **Content-Type**: `application/json`  
> **Auth**: All endpoints (except register/login) require `Authorization: Bearer <token>`

---

## 1. Authentication

### Register a new owner account

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Tiffin Owner",
    "email": "owner@tiffinflow.com",
    "password": "secret123"
  }'
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "66e...",
    "name": "Tiffin Owner",
    "email": "owner@tiffinflow.com"
  }
}
```

### Login

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "owner@tiffinflow.com",
    "password": "secret123"
  }'
```

> 💡 **Save the `token`** from the response. You'll use it in every subsequent request.

```bash
# For convenience, export the token:
export TOKEN="eyJhbGciOiJIUzI1NiIs..."
```

### Get current user

```bash
curl http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## 2. Plans (Optional — Create Reusable Tiffin Plans)

### Create a plan

```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Basic Lunch",
    "price": 2500,
    "mealTypes": ["lunch"]
  }'
```

### Create another plan

```bash
curl -X POST http://localhost:5000/api/plans \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Lunch + Dinner Combo",
    "price": 4500,
    "mealTypes": ["lunch", "dinner"]
  }'
```

### List all plans

```bash
curl http://localhost:5000/api/plans \
  -H "Authorization: Bearer $TOKEN"
```

---

## 3. Customer Management

### Create a customer (with a plan)

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "address": "42 MG Road, Jaipur",
    "planPrice": 3000,
    "planStartDate": "2026-09-01"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "66e...",
    "name": "Rahul Sharma",
    "phone": "9876543210",
    "address": "42 MG Road, Jaipur",
    "planPrice": 3000,
    "planStartDate": "2026-09-01T00:00:00.000Z",
    "status": "active"
  }
}
```

> 💡 Save the `_id` — you'll need it for subscription operations.

```bash
export CUSTOMER_ID="66e..."
```

### Create a customer (no plan — for transfer target)

```bash
curl -X POST http://localhost:5000/api/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "name": "Priya Patel",
    "phone": "9123456789",
    "address": "15 Station Road, Jaipur",
    "planId": "none"
  }'
```

This creates a customer with `status: "inactive"` and no subscription — ready to receive a transferred subscription.

### List all customers

```bash
curl "http://localhost:5000/api/customers" \
  -H "Authorization: Bearer $TOKEN"
```

### Search by phone or name

```bash
# Search by phone
curl "http://localhost:5000/api/customers?search=9876" \
  -H "Authorization: Bearer $TOKEN"

# Search by name
curl "http://localhost:5000/api/customers?search=rahul" \
  -H "Authorization: Bearer $TOKEN"
```

### Pagination & sorting

```bash
# Page 1, 10 per page, sorted by name ascending
curl "http://localhost:5000/api/customers?page=1&limit=10&sortBy=name&order=asc" \
  -H "Authorization: Bearer $TOKEN"

# Filter by status
curl "http://localhost:5000/api/customers?status=active" \
  -H "Authorization: Bearer $TOKEN"
```

### Get a single customer

```bash
curl "http://localhost:5000/api/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

### Update a customer

```bash
curl -X PUT "http://localhost:5000/api/customers/$CUSTOMER_ID" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "address": "New Address, 99 Park Ave"
  }'
```

### Delete a customer

```bash
curl -X DELETE "http://localhost:5000/api/customers/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 4. Subscriptions — Pause, Resume & Billing

### Get subscription for a customer

```bash
curl "http://localhost:5000/api/subscriptions/$CUSTOMER_ID" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "66e...",
    "customerId": "66e...",
    "monthlyPrice": 3000,
    "startDate": "2026-09-01T00:00:00.000Z",
    "pausePeriods": []
  }
}
```

### Pause a subscription

```bash
curl -X POST "http://localhost:5000/api/subscriptions/$CUSTOMER_ID/pause" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "startDate": "2026-09-10"
  }'
```

The customer's status changes to `paused`. An open pause period is created with `endDate: null`.

### Resume a subscription

```bash
curl -X POST "http://localhost:5000/api/subscriptions/$CUSTOMER_ID/resume" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "endDate": "2026-09-13"
  }'
```

The customer's status changes back to `active`. The open pause period is closed with the given `endDate`.

### Get the monthly bill

```bash
curl "http://localhost:5000/api/subscriptions/$CUSTOMER_ID/bill?month=2026-09" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "customer": {
      "name": "Rahul Sharma",
      "phone": "9876543210"
    },
    "billing": {
      "year": 2026,
      "month": 9,
      "totalWeekdays": 22,
      "pausedWeekdays": 2,
      "billableDays": 20,
      "monthlyPrice": 3000,
      "dailyRate": 136.36,
      "finalBill": 2727.27
    }
  }
}
```

---

## 5. Daily Notification Clock (T1)

### Trigger morning notifications

```bash
# For today
curl -X POST http://localhost:5000/api/clock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN"

# For a specific date
curl -X POST http://localhost:5000/api/clock \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"date": "2026-09-17"}'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "date": "2026-09-17",
    "isWeekday": true,
    "notified": [
      {
        "customerId": "66e...",
        "name": "Rahul Sharma",
        "phone": "9876543210",
        "message": "Delivery due for Rahul Sharma (9876543210) on 2026-09-17"
      }
    ],
    "skipped": [],
    "summary": {
      "total": 1,
      "notified": 1,
      "skipped": 0
    }
  }
}
```

### View outbox

```bash
# All notifications
curl "http://localhost:5000/api/outbox" \
  -H "Authorization: Bearer $TOKEN"

# Filter by date
curl "http://localhost:5000/api/outbox?date=2026-09-17" \
  -H "Authorization: Bearer $TOKEN"
```

---

## 6. Subscription Transfer (T6)

### Transfer a subscription from one customer to another

```bash
curl -X POST http://localhost:5000/api/subscriptions/transfer \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "fromCustomerId": "<source_customer_id>",
    "toCustomerId": "<target_customer_id>",
    "transferDate": "2026-09-15",
    "notes": "Customer relocating, transferring to family member"
  }'
```

**What happens:**
- Source customer → `inactive`, subscription moved away
- Target customer → `active`, receives the subscription
- A `TransferLog` audit record is created
- Any open pause on source is automatically closed

### View transfer history

```bash
curl "http://localhost:5000/api/transfers" \
  -H "Authorization: Bearer $TOKEN"
```

### Get split bill after transfer

```bash
curl "http://localhost:5000/api/subscriptions/$CUSTOMER_ID/split-bill?month=2026-09" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "billing": {
      "totalWeekdays": 22,
      "activeWeekdays": 10,
      "pausedWeekdays": 0,
      "billableDays": 10,
      "monthlyPrice": 3000,
      "dailyRate": 136.36,
      "finalBill": 1363.64,
      "activeRange": {
        "from": "2026-09-01",
        "to": "2026-09-14"
      }
    }
  }
}
```

---

## 7. Bulk Import Messy Data (T4)

### Import a batch of customers

```bash
curl -X POST http://localhost:5000/api/import/customers \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "customers": [
      {
        "name": "  Amit   Kumar  ",
        "phone": "+91 98765 43210",
        "address": "MG Road, Delhi",
        "planPrice": 3000,
        "planStartDate": "15/09/2026"
      },
      {
        "name": "Sneha Reddy",
        "phone": "91-8765432109",
        "address": "Banjara Hills, Hyderabad",
        "planPrice": 2500,
        "planStartDate": "01-Sep-2026"
      },
      {
        "name": "",
        "phone": "123",
        "address": "",
        "planPrice": -500,
        "planStartDate": "not-a-date"
      },
      {
        "name": "Amit Kumar",
        "phone": "09876543210",
        "address": "Different address",
        "planPrice": 3500,
        "planStartDate": "2026-09-20"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "imported": [
      { "row": 1, "name": "Amit Kumar", "phone": "9876543210", "customerId": "66e..." },
      { "row": 2, "name": "Sneha Reddy", "phone": "8765432109", "customerId": "66e..." }
    ],
    "deduped": [
      { "row": 4, "normalizedPhone": "9876543210", "reason": "Duplicate phone in batch" }
    ],
    "rejected": [
      { "row": 3, "reasons": ["Missing name", "Invalid phone number", "Missing address", "Plan price must be positive", "Invalid date format"] }
    ],
    "summary": {
      "total": 4,
      "importedCount": 2,
      "dedupedCount": 1,
      "rejectedCount": 1
    }
  }
}
```

**What the import normalizes automatically:**
- `"+91 98765 43210"` → `"9876543210"`
- `"  Amit   Kumar  "` → `"Amit Kumar"`
- `"15/09/2026"` and `"01-Sep-2026"` → valid Date objects

---

## 8. Dashboard Stats

```bash
curl "http://localhost:5000/api/customers/stats" \
  -H "Authorization: Bearer $TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "total": 5,
    "active": 3,
    "paused": 1,
    "inactive": 1,
    "estimatedRevenue": 8500,
    "recentCustomers": [...]
  }
}
```

---

## Quick Reference

| Action | Method | Endpoint |
|--------|--------|----------|
| Register | POST | `/api/auth/register` |
| Login | POST | `/api/auth/login` |
| Me | GET | `/api/auth/me` |
| List customers | GET | `/api/customers` |
| Create customer | POST | `/api/customers` |
| Get customer | GET | `/api/customers/:id` |
| Update customer | PUT | `/api/customers/:id` |
| Delete customer | DELETE | `/api/customers/:id` |
| Dashboard stats | GET | `/api/customers/stats` |
| List plans | GET | `/api/plans` |
| Create plan | POST | `/api/plans` |
| Get subscription | GET | `/api/subscriptions/:customerId` |
| Pause | POST | `/api/subscriptions/:customerId/pause` |
| Resume | POST | `/api/subscriptions/:customerId/resume` |
| Get bill | GET | `/api/subscriptions/:customerId/bill?month=YYYY-MM` |
| Trigger clock | POST | `/api/clock` |
| View outbox | GET | `/api/outbox` |
| Transfer | POST | `/api/subscriptions/transfer` |
| Transfer history | GET | `/api/transfers` |
| Split bill | GET | `/api/subscriptions/:customerId/split-bill?month=YYYY-MM` |
| Bulk import | POST | `/api/import/customers` |

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Descriptive error message"
}
```

| Status | Meaning |
|--------|---------|
| 400 | Bad request (validation error, missing fields) |
| 401 | Unauthorized (missing or invalid JWT token) |
| 404 | Not found (customer, subscription, plan) |
| 500 | Internal server error |
