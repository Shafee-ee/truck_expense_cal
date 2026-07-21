import { prisma } from "@/lib/prisma";

export async function compareTripRows(rows) {
  const comparison = [];

  for (const [index, row] of rows.entries()) {
    console.log("Row:", index + 1, row);

    if (!row.vehicleNumber) {
      throw new Error(`Vehicle number is missing in row ${index + 1}`);
    }

    const truck = await prisma.truck.findUnique({
      where: {
        numberPlate: row.vehicleNumber,
      },
    });

    if (!truck) {
      comparison.push({
        rowNumber: index + 1,
        action: "ERROR",
        error: `Truck '${row.vehicleNumber}' not found`,
        row,
      });

      continue;
    }

    let trip = null;

    if (row.gcNumber || row.billNumber) {
      trip = await prisma.trip.findFirst({
        where: {
          OR: [
            ...(row.gcNumber ? [{ gcNumber: row.gcNumber }] : []),
            ...(row.billNumber ? [{ billNumber: row.billNumber }] : []),
          ],
        },
      });
    }

    comparison.push({
      rowNumber: index + 1,
      action: !trip ? "CREATE" : "UPDATE",
      changes: [],
      truck,
      row,
    });
  }

  return comparison;
}
