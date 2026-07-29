# Import Guide

## Purpose

HH Trucks includes an import framework to migrate historical data from the client's Excel workbooks into the application.

The goal is to preserve existing operational history without requiring manual data entry.

---

## Import Pipeline

Excel File
↓
readExcel()
↓
Mapper
↓
Validator
↓
Comparison
↓
Preview
↓
Database Import

---

## Import Order

1. Fleet Register
2. Maintenance Register
3. Trip Register

---

## Fleet Register Import

Purpose

Creates and updates Trucks.

Source workbook

VEHICLE DETAILS.xlsx

Creates

- Truck

Updates

- Registration Date
- Vehicle Type

Notes

- Company is intentionally not imported because the source workbook does not contain ownership information.

---

## Maintenance Import

Purpose

Imports historical truck maintenance.

Creates

- TruckExpense

Supported Categories

- TYRE
- REPAIR
- ELECTRICAL
- INSURANCE
- ROAD_TAX
- FITNESS
- PERMIT
- NATIONAL_PERMIT
- WASHING
- ADD_BLUE
- OTHER

---

## Trip Register Import

Purpose

Imports completed historical trips.

Creates

- Trip
- Expense

Updates

- Existing trips (matched by GC Number)

Imported trips are created as CLOSED because they represent completed historical work.

---

## Import Business Rules

- Never create duplicate trucks.
- Never invent relationships missing from the source workbook.
- Fleet Register is the source of truck master data.
- Maintenance Register is the source of historical maintenance.
- Trip Register is the source of historical operational trips.

---

## Architecture

The Excel parser is generic.

Each importer is responsible for:

- Mapping
- Validation
- Comparison
- Database persistence

Business calculations reuse existing finance utilities instead of duplicating logic.

---

## Future Improvements

- Generic import framework
- Duplicate detection
- Better preview UI
- Rollback support
- Import history
