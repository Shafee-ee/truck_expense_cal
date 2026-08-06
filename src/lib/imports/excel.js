import * as XLSX from "xlsx";

export function readExcel(buffer) {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: true,
  });

  if (workbook.SheetNames.length === 0) {
    throw new Error("Excel file contains no worksheets.");
  }

  return workbook;
}
