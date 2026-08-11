import * as XLSX from "xlsx";

export function readExcel(buffer, options = {}) {
  const workbook = XLSX.read(buffer, {
    type: "buffer",
    cellDates: options.cellDates ?? true,
  });

  if (workbook.SheetNames.length === 0) {
    throw new Error("Excel file contains no worksheets.");
  }

  if (options.headerRow !== undefined) {
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];

    return XLSX.utils.sheet_to_json(worksheet, {
      range: options.headerRow,
      defval: null,
    });
  }

  return workbook;
}
