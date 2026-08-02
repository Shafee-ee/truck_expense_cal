# HH Trucks - Architecture Decisions

This document records important architectural and business decisions made during the development of HH Trucks.

---

# ADR-001

## Trips are the central business entity

Decision

The Trip is the core entity around which the system is built.

Reason

Everything in the business revolves around transporting a load.

Impact

- Expenses belong to Trips.
- Payments belong to Trips.
- Settlements belong to Trips.
- Accounts are derived from Trips.

Status

Accepted

---

# ADR-002

## Customers and Transporters are both Companies

Decision

Customers and Transporters are stored in the same Company table.

Reason

Many businesses play multiple roles.

Impact

- No duplicate records.
- Easier reporting.
- Simpler maintenance.

Status

Accepted

---

# ADR-003

## Truck ownership uses Companies

Decision

A Truck owner is always a Company.

Reason

Internal and external trucks are handled uniformly.

Status

Accepted

---

# ADR-004

## Operational expenses and maintenance expenses are separate

Decision

Trip expenses and Truck expenses are different entities.

Reason

Operational costs belong to a single trip.

Maintenance costs belong to the vehicle regardless of trips.

Status

Accepted

---

# ADR-005

## Payments are never stored as balances

Decision

Outstanding amounts are always calculated.

Reason

Derived values cannot become inconsistent.

Status

Accepted

---

# ADR-006

## Reports never own data

Decision

Reports only aggregate existing business data.

Reason

Avoid duplicate sources of truth.

Status

Accepted

---

# ADR-007

## Historical records are preserved

Decision

Trips, expenses and payments are not physically deleted after they become business records.

Reason

Maintain audit history and financial integrity.

Status

Accepted

---

# ADR-008

## Imports are traceable

Decision

Every historical import is recorded using an Import Session.

Reason

Allows auditing, troubleshooting and future re-imports.

Status

Accepted

---

# ADR-009

## Business rules are implemented in code, not stored as data

Decision

Business logic is enforced by the application.

Reason

Keeps the database focused on business data while maintaining consistent behavior.

Status

Accepted

---

# ADR-010

## Financial values are derived

Decision

Profit, outstanding balances and totals are calculated from existing records.

Reason

Prevents duplicated financial data.

Status

Accepted

## Odometer Tracking

Decision:
Store odometer readings both on the Truck and on each Trip.

Reasoning:

- Truck.currentOdometer represents the latest known vehicle state.
- Trip.startOdometer and Trip.endOdometer preserve historical readings.
- Historical trips remain compatible because odometer fields are optional.
- Trip Distance is retained as a business/planning metric.
- Odometer readings become the authoritative source for operational distance and future BI calculations.
