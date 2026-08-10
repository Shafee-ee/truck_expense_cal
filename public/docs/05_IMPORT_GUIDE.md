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

####

# Current Amendments --- 2026-08-10

The import system has expanded beyond the original
Fleet/Maintenance/Trip migration plan.

## Current Import Areas

1.  Fleet Register
2.  Maintenance Register
3.  Trip Register
4.  FASTag Statement

## Current Import Architecture

The shared Excel reader is responsible for workbook loading.

Importer-specific modules are responsible for:

- Parsing workbook structure
- Mapping source values
- Validation
- Duplicate detection
- Comparison
- Database persistence

The current maintenance and FASTag implementations follow this
separation.

## FASTag Import

Purpose

Imports historical toll transactions from FASTag statements into Trip
Expenses.

Pipeline

Excel workbook ↓ Shared Excel reader ↓ FASTag parser ↓ FASTag mapper ↓
Preview / duplicate detection ↓ FASTag importer ↓ Expense records

FASTag transaction headers are located on Excel row 22 in the current
Kotak FASTag workbook format. Because the XLSX range is zero-based, the
parser uses header row index 21.

The tested flow successfully:

- Parsed a dummy FASTag statement.
- Detected transactions.
- Identified duplicates.
- Created TOLL expenses.
- Refreshed the Trip Expense Summary.

## Maintenance Import

Purpose

Imports historical truck maintenance and compliance expenses into
TruckExpense.

Current supported categories include:

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

The rebuilt importer has been technically tested against the current
workbook format.

Test result:

- 897 records parsed and imported.
- Records were distributed across April through July 2026.

This is a technical verification only. Source-data correctness still
needs to be verified against the original records.

## Import Data Integrity --- Current Priority

Jeevan has reported that records do not match the source records after
upload/import.

The investigation must identify the mismatch before the import system is
considered complete.

Check the pipeline in this order:

1.  Original workbook.
2.  Parsed records.
3.  Mapped records.
4.  Preview/comparison output.
5.  Database records.

Do not assume the problem is in the parser until the mismatch is
localized.

## Import Order

For the current migration workflow:

1.  Fleet Register
2.  Maintenance Register
3.  Trip Register
4.  FASTag Statement

FASTag is operational data attached to trips, so it should be imported
only after the relevant trucks/trips exist.

## Import Business Rules

- Never create duplicate trucks.
- Never invent relationships missing from the source workbook.
- Fleet Register is the source of truck master data.
- Maintenance Register is the source of historical maintenance.
- Trip Register is the source of historical operational trips.
- FASTag Statement is the source of historical toll transactions.
- Successful upload does not prove source-data correctness.
- Imported records must be reconciled against the source when
  discrepancies are reported.

## Future Improvements

- Better source-versus-database comparison
- More explicit mismatch reporting
- Duplicate detection
- Import history
- Rollback support
- Generic import framework

---

# Import Guide

## Purpose

HH Trucks includes an import framework to migrate historical data from
the client's Excel workbooks into the application.

The goal is to preserve existing operational history without requiring
manual data entry.

---

## Import Pipeline

Excel File ↓ readExcel() ↓ Mapper ↓ Validator ↓ Comparison ↓ Preview ↓
Database Import

---

## Import Order

1.  Fleet Register
2.  Maintenance Register
3.  Trip Register

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

- Company is intentionally not imported because the source workbook
  does not contain ownership information.

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

Imported trips are created as CLOSED because they represent completed
historical work.

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

Business calculations reuse existing finance utilities instead of
duplicating logic.

---

## Future Improvements

- Generic import framework
- Duplicate detection
- Better preview UI
- Rollback support
- Import history
