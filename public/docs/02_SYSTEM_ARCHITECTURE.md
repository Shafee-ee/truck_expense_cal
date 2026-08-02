# HH Trucks - System Architecture

## Purpose

This document describes the overall architecture of HH Trucks and how the major modules interact.

Unlike the Data Bible, this document focuses on the software architecture rather than the business itself.

---

# High Level Architecture

```
                    HH Trucks
                         │
 ┌──────────────┬─────────┴─────────┬──────────────┐
 │              │                   │              │
Operations   Fleet             Accounts      Imports
 │              │                   │              │
 │              │                   │              │
Trips        Trucks            Payments      Excel Files
 │              │                   │
 │              │                   │
Expenses   Truck Expenses     Outstanding
```

---

# Core Modules

## Companies

Stores every business that HH Trucks interacts with.

Responsibilities

- Customer management
- Transporter management
- Truck ownership

Used By

- Trips
- Trucks
- Accounts

---

## Trucks

Stores vehicle information.

Responsibilities

- Fleet management
- Vehicle registration
- Vehicle ownership

Related Modules

- Trips
- Truck Expenses

---

## Trips

The central module of HH Trucks.

Responsibilities

- Transport operations
- Revenue
- Settlement
- Profitability

Related Modules

- Companies
- Trucks
- Expenses
- Customer Payments
- Transporter Payments

---

## Expenses

Stores operational expenses.

Examples

- Fuel
- Toll
- Police
- Loading
- Driver Payment

Belongs To

Trip

---

## Truck Expenses

Stores maintenance and compliance costs.

Examples

- Insurance
- Permit
- Fitness
- Tyres
- Repairs

Belongs To

Truck

---

## Customer Payments

Stores money received from customers.

Belongs To

Trip

---

## Transporter Payments

Stores payments made to transporters.

Belongs To

Trip

---

## Import Sessions

Stores metadata about historical imports.

Purpose

- Audit
- Traceability

---

# Entity Relationships

```
Company
   │
   ├──────────────┐
   │              │
   ▼              ▼
Truck          Trip(Customer)
   │              │
   │              ▼
   │         Trip(Transporter)
   │              │
   ▼              ▼
Truck Expense   Expense
                  │
        ┌─────────┴─────────┐
        ▼                   ▼
Customer Payment   Transporter Payment
```

---

# Module Dependencies

Trips depend on

- Truck
- Company

Expenses depend on

- Trip

Truck Expenses depend on

- Truck

Customer Payments depend on

- Trip

Transporter Payments depend on

- Trip

Accounts depend on

- Trips
- Payments

Dashboard depends on

- Every business module

---

# Data Ownership

| Entity              | Owns                     |
| ------------------- | ------------------------ |
| Company             | Business information     |
| Truck               | Vehicle information      |
| Trip                | Transport operation      |
| Expense             | Operational cost         |
| Truck Expense       | Maintenance history      |
| Customer Payment    | Customer transactions    |
| Transporter Payment | Transporter transactions |
| Import Session      | Import metadata          |

---

# Business Flow

```
Company
      │
      ▼
Truck
      │
      ▼
Trip
      │
      ├──────────────┐
      │              │
      ▼              ▼
Expenses      Payments
      │              │
      └──────┬───────┘
             ▼
        Settlement
             │
             ▼
         Accounts
             │
             ▼
         Dashboard
```

---

# Design Principles

- Trips are the central business entity.
- Every business fact has a single owner.
- Reports never own data.
- Financial values are derived from business records.
- Historical records are preserved.
- Business entities are connected through references rather than duplicated data.
- Operational expenses belong to Trips.
- Maintenance expenses belong to Trucks.

---

# Future Expansion

The architecture allows future modules to be added without changing the existing business model.

Examples include:

- Drivers
- Fuel Cards
- Warehouses
- GPS Tracking
- Documents
- Notifications
- Business Intelligence

Business Intelligence Architecture (Planned)

All BI calculations will live under:

src/lib/bi/

Initial modules:

- truckMetrics.js
- financeMetrics.js
- customerMetrics.js
- routeMetrics.js
- dashboardMetrics.js

Rule:
No business calculations should be performed inside React components. Components consume metrics produced by the BI layer.
