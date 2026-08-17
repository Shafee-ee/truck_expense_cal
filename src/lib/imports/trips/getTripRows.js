import * as XLSX from "xlsx";

function isTripSheet(worksheet) {
  for (let row = 0; row < 10; row++) {
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      range: row,
      header: 1,
      blankrows: false,
    });

    if (rows.length === 0) continue;

    const headers = rows[0].map((h) =>
      String(h ?? "")
        .trim()
        .toUpperCase()
    );

    const hasGC = headers.includes("GC NO.") || headers.includes("GC NO");

    const hasVehicle =
      headers.includes("VEHICLE NO.") || headers.includes("VEHICLE NO");

    const hasDestination = headers.includes("DESTINATION");

    const hasQty = headers.includes("QTY");

    const hasCustomer = headers.includes("CUSTOMER / CLIENT");

    if (hasGC && hasVehicle && hasDestination && hasQty && hasCustomer) {
      return row;
    }
  }

  return null;
}

export function getTripRows(workbook) {
  const rows = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    const headerRow = isTripSheet(worksheet);

    if (headerRow === null) continue;

    rows.push(
      ...XLSX.utils.sheet_to_json(worksheet, {
        range: headerRow,
        defval: null,
      })
    );
  }

  if (rows.length === 0) {
    throw new Error(
      "No trip worksheet found. Expected columns: GC No., Vehicle No., Destination, Qty, Customer / Client."
    );
  }

  return rows;
}
