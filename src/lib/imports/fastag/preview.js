import { prisma } from "@/lib/prisma";

export async function previewFastagRows(rows, truckNumberPlate) {
  const preview = [];

  for (const row of rows) {
    const existing = await prisma.expense.findUnique({
      where: {
        fastagTransactionId: row.fastagTransactionId,
      },
    });

    const errors = [];

    const excelVehicle = row.vehicleNumber?.replace(/\s+/g, "").toUpperCase();

    const tripVehicle = truckNumberPlate?.replace(/\s+/g, "").toUpperCase();

    if (excelVehicle !== tripVehicle) {
      errors.push(
        `Vehicle does not match this trip. Excel: ${row.vehicleNumber}, Trip: ${truckNumberPlate}`
      );
    }

    preview.push({
      ...row,
      action: existing ? "SKIP" : "IMPORT",
      errors,
    });
  }

  return preview;
}
