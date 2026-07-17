import { readExcel } from "@/lib/imports/excel";
import { mapFleetRows } from "@/lib/imports/fleet";
import { compareFleetRows } from "@/lib/imports/fleet/comparison";

export async function processFleetImport(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const rows = readExcel(buffer, {
    headerRow: 3,
  });

  const mappedRows = mapFleetRows(rows);

  return await compareFleetRows(mappedRows);
}
