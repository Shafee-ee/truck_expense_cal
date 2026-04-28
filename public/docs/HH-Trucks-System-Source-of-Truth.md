Goal is to make it look like IMOS style platform managment system

# HH Trucks — Data Model (Source of Truth)

## 1. Core Concept

The system is a structured version of existing Excel operations.

Two data sources:

1. Trip Ledger → revenue + trip-level expenses
2. Maintenance Ledger → monthly truck-level costs

All analytics are derived from combining these two.

---

## 2. Trip Data Structure

Each row represents one completed trip.

### Fields

- truckNumber (Vehicle No.)
- loadDate
- dischargeDate
- grossAmount (FINAL revenue from Excel)

### Expense Fields (all part of trip cost)

- diesel
- advance
- toll
- loadUnload
- rtoExpenses
- police
- otherExpenses
- driverBalance (optional)

### Derived Fields

- totalExpenses = sum(all expense fields)
- tripProfit = grossAmount - totalExpenses

---

## 3. Maintenance Data Structure

Maintenance is tracked monthly per truck (from Excel).

### Fields

- truckNumber
- month (YYYY-MM)
- totalCost

### Includes

- driver salary
- insurance
- permits
- repair & servicing
- tyres
- other operational overhead

NOTE:
Maintenance already includes idle cost and fixed ownership cost.
No separate idle cost calculation is required.

---

## 4. Business Logic

### Trip Level

tripProfit = grossAmount - totalExpenses

---

### Truck Level (Monthly)

truckProfit =
sum(tripProfit for that truck in given month)
− maintenanceCost (for that truck and month)

---

## 5. Time Handling

- All analytics are month-based
- Trips are assigned to a month using dischargeDate (close date)

---

## 6. System Rules

- Trips follow lifecycle: PLANNED → ACTIVE → CLOSED
- Only CLOSED trips are used for reporting
- CLOSED trips are immutable

### Close Conditions

- expenses must exist
- outstanding must be 0 (client fully paid)

### Allowed

- loss-making trips (tripProfit < 0)

---

## 7. Data Assumptions (IMPORTANT)

- Gross Amount is final revenue (do not recompute using qty × rate)
- All expense columns in Excel are part of trip cost
- No separate broker cost (already included in expense columns)
- No need to calculate idle days or daily cost
- Maintenance file is the source of truth for truck-level costs

---

## 8. Final Objective

The system must answer:

- Which trips are profitable?
- Which trucks are profitable monthly?
- Which trucks are causing losses?

Primary focus:
Truck-level profitability

///

# HH Trucks — Complete System Understanding (Source of Truth)

## 1. Purpose of the System

This system is a **financial visibility tool for truck operations**.

It is NOT:

- Fleet management
- GPS tracking
- Automation system

It IS:

- A structured replacement for Excel
- A decision-making system

Primary goal:
→ Identify **profit, loss, and inefficiencies per trip and per truck**

---

## 2. Real-World Workflow (How Business Operates)

### Before Trip

- Office assigns truck
- Defines route (source → destination)
- Rough planning (optional estimates)

### During Trip

- Driver sends updates via WhatsApp
- Office logs:
  - fuel
  - toll
  - other costs

### After Trip

- Revenue is known (Gross Amount)
- Expenses are complete
- Payments are collected
- Trip is closed

---

## 3. Data Sources (Critical Understanding)

### A. Trip Ledger (Operational Data)

Each row = one trip

From Excel:

- Vehicle No → truckNumber
- Load Date
- Discharge Date
- Gross Amount → FINAL revenue

Expense columns:

- Diesel
- Advance
- Toll
- Load & Unload
- RTO
- Police
- Other
- Driver Balance

---

### B. Maintenance Ledger (Ownership Cost)

Monthly per truck

Includes:

- salary
- insurance
- permits
- repair
- tyres
- overhead

This is:
→ **total cost of owning that truck for the month**

---

## 4. Core Financial Model (Final — Do Not Change)

### Trip Level

```text
tripProfit = grossAmount - totalTripExpenses
```

Where:

```text
totalTripExpenses =
  diesel +
  advance +
  toll +
  loadUnload +
  rto +
  police +
  other +
  driverBalance
```

---

### Truck Level (Monthly)

```text
truckProfit =
  sum(tripProfit for that truck in that month)
  − maintenanceCost (for that truck in that month)
```

---

## 5. Key Business Truths

- Revenue is NOT calculated → it is GIVEN (Gross Amount)
- Expenses are ALWAYS tied to trips
- Maintenance is separate from trips
- Maintenance already includes:
  - idle cost
  - fixed cost

- Trips are independent but linked by truck timeline
- Profit must be evaluated at **truck level**, not just trip level

---

## 6. Time Logic

- All reporting is **monthly**
- Trip belongs to month based on:
  → dischargeDate (or closedAt)

Cross-month trips:
→ Assigned to closing month

---

## 7. System Lifecycle

```text
PLANNED → ACTIVE → CLOSED
```

### Rules

- ACTIVE = ongoing financial activity
- CLOSED = final numbers (immutable)

---

### Close Conditions

Trip can close only if:

- expenses exist
- outstanding ≤ 0 (fully paid)
- revenue exists (based on actual data)

---

### Allowed

- Loss-making trips
- High expense scenarios

---

## 8. Current System (What Exists Today)

### Backend

- Prisma + Supabase (Postgres)
- Trip, Expense, Payment, Truck models

### Features

- Create trip
- Start trip
- Add expenses
- Upload bills
- Add payments
- Close trip
- Store:
  - finalRevenue
  - finalExpenses
  - finalBalance

### Dashboard

- Operational profit
- Fixed cost (daily model)
- Net profit

---

## 9. Current Problems (Must Be Fixed)

### 1. Revenue Logic is WRONG

Current:

```text
revenue = actualQty × ratePerUnit
```

Correct:

```text
revenue = grossAmount (from Excel)
```

---

### 2. Fixed Cost Model is WRONG

Current:

```text
dailyFixedCost × days
```

Problem:

- Not aligned with real data
- Ignores actual maintenance

Correct:

```text
use maintenance file totals
```

---

### 3. Missing Truck-Level Profit

System currently focuses on:
→ trip profit

But business needs:
→ truck profit

---

### 4. Expense Input Mismatch

Current:

- manual categorized expenses

Reality:

- Excel has structured columns

System should align to:
→ total expense = sum of all cost fields

---

## 10. Correct System Architecture

### Layer 1 — Trip Accounting

- revenue (grossAmount)
- expenses (sum of fields)
- profit (tripProfit)

---

### Layer 2 — Truck Ledger

- aggregate trip profits
- subtract maintenance

---

### Layer 3 — Reporting

- truck-wise profitability
- loss trucks
- monthly insights

---

## 11. What the System Must Answer

1. Which trips made or lost money?
2. Which trucks are profitable monthly?
3. Which trucks are bleeding money?
4. Where are costs highest?
5. How much profit is generated overall?

---

## 12. Design Principles (Do NOT violate)

- Match Excel, don’t reinterpret it
- Keep operator input simple
- Avoid over-engineering
- No unnecessary automation
- No artificial assumptions

---

## 13. What NOT to Build (Phase 1)

- GPS tracking
- Driver app
- AI/automation
- Complex ERP features
- Trip linking logic (beyond truck grouping)

---

## 14. Future Scope (Later)

- category-level maintenance breakdown
- route profitability
- trend analysis
- export/reporting tools

---

## 15. Final Mental Model

This system is:

→ A structured, queryable version of Excel
→ A financial lens over trucking operations
→ A decision system, not just a tracking tool

---

## 16. Critical Rule

If system output ≠ Excel reality
→ System is wrong

Always align with real data.
