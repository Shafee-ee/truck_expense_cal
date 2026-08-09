import * as XLSX from "xlsx";

function normalize(value) {
  return String(value ?? "")
    .trim()
    .toUpperCase();
}

function getCategoryFromLabel(label) {
  const text = normalize(label);

  if (text.includes("TYRE")) return "TYRE";
  if (text.includes("WASH")) return "WASHING";
  if (text.includes("ADD BLUE")) return "ADD_BLUE";
  if (text.includes("ELECTRICAL")) return "ELECTRICAL";
  if (text.includes("REPAIR")) return "REPAIR";
  if (text.includes("ROAD TAX")) return "ROAD_TAX";
  if (text.includes("INSURANCE")) return "INSURANCE";
  if (text.includes("PERMIT")) return "PERMIT";

  return null;
}

function isTruckNumber(value) {
  return (
    typeof value === "string" &&
    /^[A-Z]{2}\d{2}[A-Z]{1,2}\d{4}$/.test(value.trim())
  );
}

function isTotal(value) {
  return normalize(value) === "TOTAL";
}

function getPeriod(rawRows) {
  return rawRows[0]?.find(
    (cell) => typeof cell === "string" && cell.includes(" TO ")
  );
}

function parseDate(period) {
  const startDate = period.split(" TO ")[0];
  const [day, month, year] = startDate.split("/").map(Number);

  return {
    expenseDate: new Date(year, month - 1, day),
    month,
    year,
  };
}

function parseApril(rows, truckStartIndex, truckNumbers, dateInfo) {
  const records = [];

  let currentCategory = "OTHER";

  for (const row of rows.slice(3)) {
    const section = row[0];
    const vendor = row[1];

    if (isTotal(vendor)) {
      break;
    }

    if (!vendor) {
      continue;
    }

    const explicitCategory = getCategoryFromLabel(vendor);

    if (explicitCategory) {
      currentCategory = explicitCategory;
    } else if (section) {
      const sectionCategory = getCategoryFromLabel(section);

      if (sectionCategory) {
        currentCategory = sectionCategory;
      }
    }

    for (let i = 0; i < truckNumbers.length; i++) {
      const truckNumber = truckNumbers[i];

      if (!truckNumber) {
        continue;
      }

      const amount = row[truckStartIndex + i];

      if (amount === null || amount === undefined || amount === "") {
        continue;
      }

      const numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        continue;
      }

      records.push({
        truckNumber: truckNumber.trim(),
        category: currentCategory,
        vendor: String(vendor).trim(),
        amount: numericAmount,
        ...dateInfo,
      });
    }
  }

  return records;
}

function parseStandardSheet(rows, truckStartIndex, truckNumbers, dateInfo) {
  const records = [];

  let currentCategory = "OTHER";

  for (const row of rows.slice(3)) {
    const vendor = row[0];

    if (isTotal(vendor)) {
      break;
    }

    if (!vendor) {
      continue;
    }

    const label = String(vendor).trim();
    const explicitCategory = getCategoryFromLabel(label);

    if (explicitCategory) {
      currentCategory = explicitCategory;
    }

    if (normalize(label) === "SALARY") {
      currentCategory = "OTHER";
    }

    if (normalize(label).includes("TOLL PAID IN CASH")) {
      currentCategory = "OTHER";
    }

    if (normalize(label).includes("OTHER EXPENSES")) {
      currentCategory = "OTHER";
    }

    for (let i = 0; i < truckNumbers.length; i++) {
      const truckNumber = truckNumbers[i];

      if (!truckNumber) {
        continue;
      }

      const amount = row[truckStartIndex + i];

      if (amount === null || amount === undefined || amount === "") {
        continue;
      }

      const numericAmount = Number(amount);

      if (!Number.isFinite(numericAmount) || numericAmount <= 0) {
        continue;
      }

      records.push({
        truckNumber: truckNumber.trim(),
        category: currentCategory,
        vendor: label,
        amount: numericAmount,
        ...dateInfo,
      });
    }
  }

  return records;
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

    const period = getPeriod(rawRows);

    if (!period) {
      continue;
    }

    const dateInfo = parseDate(period);

    const headerRow = rawRows[0];

    const truckStartIndex = headerRow.findIndex(isTruckNumber);

    if (truckStartIndex === -1) {
      console.warn(`No truck columns found in ${sheetName}`);
      continue;
    }

    const truckNumbers = headerRow
      .slice(truckStartIndex)
      .map((value) => (typeof value === "string" ? value.trim() : null));

    let sheetRecords;

    if (sheetName === "APRIL") {
      sheetRecords = parseApril(
        rawRows,
        truckStartIndex,
        truckNumbers,
        dateInfo
      );
    } else {
      sheetRecords = parseStandardSheet(
        rawRows,
        truckStartIndex,
        truckNumbers,
        dateInfo
      );
    }

    records.push(...sheetRecords);

    console.log(`${sheetName}: ${sheetRecords.length} records`);
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

  console.log("Maintenance records:", records.length);
  console.log("First records:", records.slice(0, 10));

  return records;
}
