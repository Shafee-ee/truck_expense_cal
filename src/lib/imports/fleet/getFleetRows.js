import * as XLSX from "xlsx";

export function getFleetRows(workbook) {
  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  return XLSX.utils.sheet_to_json(worksheet, {
    range: 2, // Skip first 2 rows, row 3 becomes the header
    defval: null,
  });
}
