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

    if (row.vehicleNumber !== truckNumberPlate) {
      errors.push("Vehicle does not match this trip.");
    }

    preview.push({
      ...row,
      action: existing ? "SKIP" : "IMPORT",
      errors,
    });
  }

  return preview;
}
