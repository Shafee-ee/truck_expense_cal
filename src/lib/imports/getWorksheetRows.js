import * as XLSX from "xlsx";

function isTripSheet(worksheet) {
  for (let row = 0; row < 10; row++) {
    const rows = XLSX.utils.sheet_to_json(worksheet, {
      range: row,
      header: 1,
      blankrows: false,
    });

    if (rows.length === 0) {
      continue;
    }

    const headers = rows[0].map((h) =>
      String(h ?? "")
        .trim()
        .toUpperCase()
    );

    const hasGC = headers.includes("GC NO.") || headers.includes("GC NO");

    const hasVehicle =
      headers.includes("VEHICLE NO.") || headers.includes("VEHICLE NO");

    const hasDestination = headers.includes("DESTINATION");

    if (hasGC && hasVehicle && hasDestination) {
      return row + 1;
    }
  }

  return null;
}

export function getWorksheetRows(workbook, headerRow = 1) {
  const rows = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    const detectedHeaderRow = isTripSheet(worksheet);

    if (!detectedHeaderRow) {
      continue;
    }

    rows.push(
      ...XLSX.utils.sheet_to_json(worksheet, {
        range: detectedHeaderRow - 1,
        defval: null,
      })
    );
  }

  return rows;
}
