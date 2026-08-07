import * as XLSX from "xlsx";

function getCategory(label) {
  const text = label.toUpperCase();

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

export function parseMaintenanceWorkbook(workbook) {
  const records = [];

  for (const sheetName of workbook.SheetNames) {
    const worksheet = workbook.Sheets[sheetName];

    const rawRows = XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: null,
      blankrows: false,
    });

    const period = rawRows[0]?.find(
      (cell) => typeof cell === "string" && cell.includes(" TO ")
    );

    if (!period) {
      continue;
    }

    const startDate = period.split(" TO ")[0];

    const [day, month, year] = startDate.split("/").map(Number);

    const expenseDate = new Date(year, month - 1, day);

    const truckNumbers = rawRows[0].slice(2);
    const expenseRows = rawRows.slice(3);

    console.log("==========");
    console.log(sheetName);
    console.log({
      expenseDate,
      month,
      year,
      truckNumbers,
      rows: expenseRows.length,
    });
  }

  return records;
}
