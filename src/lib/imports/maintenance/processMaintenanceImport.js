import { readExcel } from "@/lib/imports/excel";
import { parseMaintenanceWorkbook } from "./parser";

export async function processMaintenanceImport(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = readExcel(buffer);

  return parseMaintenanceWorkbook(workbook);
}
