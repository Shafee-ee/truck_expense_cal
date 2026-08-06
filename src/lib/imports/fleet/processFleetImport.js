import { readExcel } from "@/lib/imports/excel";
import { getFleetRows } from "@/lib/imports/fleet/getFleetRows";
import { mapFleetRows } from "@/lib/imports/fleet";
import { compareFleetRows } from "@/lib/imports/fleet/comparison";

export async function processFleetImport(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = readExcel(buffer);

  const rows = getFleetRows(workbook);

  const mappedRows = mapFleetRows(rows);

  return await compareFleetRows(mappedRows);
}
