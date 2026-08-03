# HH Trucks BI Validation

## Goal

Every number shown on the dashboard must be traceable back to the operator's Excel files.

---

# Financial Summary

## Operational Profit

Source:
Trip Register

Database:
Trip.finalBalance

Formula:
SUM(finalBalance)

Status:
⬜ Not Verified

Notes:

---

## Fixed Cost

Source:
Vehicle Maintenance

Database:
TruckExpense.amount

Formula:
SUM(amount)

Status:
⬜ Not Verified

Notes:

---

## Net Profit

Formula:

Operational Profit - Fixed Cost

Status:
⬜ Not Verified

Notes:

---

# Truck Performance

## Truck Revenue

Status:
⬜ Not Verified

---

## Truck Expenses

Status:
⬜ Not Verified

---

## Truck Net Profit

Status:
⬜ Not Verified

---

## Best Truck

Status:
⬜ Not Verified

---

## Worst Truck

Status:
⬜ Not Verified

---

# Route Performance

## Route Profit

Status:
⬜ Not Verified

---

## Best Route

Status:
⬜ Not Verified

---

## Worst Route

Status:
⬜ Not Verified

---

# Cash Position

## Outstanding Receivables

Status:
⬜ Not Verified

---

## Cash Deployed

Status:
⬜ Not Verified

---

# Collections

## Company Receivables

Status:
⬜ Not Verified

---

###

# Import Validation

## Vehicle Details

Status:
✅ Verified

---

## Trip Register

Trips Imported: 199

Trips Missing Truck: 0

Trips Missing Route: 0

Status:
✅ Verified

##

## Vehicle Maintenance

Maintenance Records: 521

Orphan Records: 0

Status:
✅ Verified
