import { readExcel } from "../excel";

export async function parseFastagFile(buffer) {
  return readExcel(buffer, {
    headerRow: 21,
  });
}
