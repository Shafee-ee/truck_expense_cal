import * as XLSX from "xlsx";

function getCategory(label) {
  const text = String(label).trim().toUpperCase();

  if (text.includes("TYRE")) return "TYRE";
  if (text.includes("REPAIR")) return "REPAIR";
  if (text.includes("ELECTRICAL")) return "ELECTRICAL";
  if (text.includes("WASH")) return "WASHING";
  if (text.includes("ADD BLUE")) return "ADD_BLUE";
  if (text.includes("ROAD TAX")) return "ROAD_TAX";
  if (text.includes("NATIONAL PERMIT")) return "NATIONAL_PERMIT";
  if (text.includes("PERMIT")) return "PERMIT";
  if (text.includes("INSURANCE")) return "INSURANCE";

  return "OTHER";
}

function isTotalRow(row) {
  return (
    String(row[0] ?? "")
      .trim()
      .toUpperCase() === "TOTAL" ||
    String(row[1] ?? "")
      .trim()
      .toUpperCase() === "TOTAL"
  );
}

export function parseMaintenanceWorkbook(workbook) {
  const records = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    });

    const headerRow = rawRows[0];

    const period = headerRow?.find(
      (cell) => typeof cell === "string" && cell.includes(" TO ")
    );

    if (!period) continue;

    const startDate = period.split(" TO ")[0];
    const [day, month, year] = startDate.split("/").map(Number);

    const expenseDate = new Date(year, month - 1, day);

    const truckStartIndex = headerRow.findIndex(
      (cell) =>
        typeof cell === "string" &&
        /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(cell.trim())
    );

    if (truckStartIndex === -1) {
      console.warn(`No truck columns found in ${sheetName}`);
      continue;
    }

    const truckNumbers = headerRow
      .slice(truckStartIndex)
      .map((value) => (typeof value === "string" ? value.trim() : null));

    let currentCategory = "OTHER";

    for (const row of rawRows.slice(3)) {
      if (isTotalRow(row)) {
        break;
      }

      const firstCell = String(row[0] ?? "").trim();
      const secondCell = String(row[1] ?? "").trim();

      let vendor;
      let amountStartIndex;

      if (truckStartIndex === 2) {
        // April: column A contains category headings,
        // column B contains vendors.
        if (firstCell) {
          currentCategory = getCategory(firstCell);
        }

        console.log("APRIL ROW:", row.slice(0, 3));
        vendor = secondCell;
        amountStartIndex = 2;
      } else {
        // May onward: column A contains the vendor/category label.
        vendor = firstCell;
        amountStartIndex = truckStartIndex;

        if (vendor) {
          currentCategory = getCategory(vendor);
        }
      }

      if (!vendor) continue;

      for (let i = 0; i < truckNumbers.length; i++) {
        const truckNumber = truckNumbers[i];

        if (!truckNumber) continue;

        const amount = row[amountStartIndex + i];

        if (amount === null || amount === undefined || amount === "") {
          continue;
        }

        const numericAmount = Number(amount);

        if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
          continue;
        }

        records.push({
          truckNumber,
          category: currentCategory,
          vendor,
          amount: numericAmount,
          expenseDate,
          month,
          year,
        });
      }
    }

    console.log(`${sheetName}: parsed ${records.length} total records`);
    console.log(records.slice(-10));
  }
  console.log(
    "By category:",
    records.reduce((acc, record) => {
      acc[record.category] = (acc[record.category] || 0) + 1;
      return acc;
    }, {})
  );

  console.log(
    "By month:",
    records.reduce((acc, record) => {
      const key = `${record.year}-${record.month}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  );
  return records;
}
