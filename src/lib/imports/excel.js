import * as XLSX from "xlsx";

export function readExcel(buffer, options = {}) {
  const { headerRow = 1 } = options;

  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true,
  });

  const firstSheetName = workbook.SheetNames[0];

  if (!firstSheetName) {
    throw new Error("Excel file contains no worksheets.");
  }

  const worksheet = workbook.Sheets[firstSheetName];

  return XLSX.utils.sheet_to_json(worksheet, {
    range: headerRow - 1,
    defval: null,
  });
}
