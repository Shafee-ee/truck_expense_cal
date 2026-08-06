import { prisma } from "@/lib/prisma";

function sameNumber(a, b) {
  return Math.abs((a ?? 0) - (b ?? 0)) < 0.01;
}

function sameDate(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    new Date(a).toISOString().slice(0, 10) ===
    new Date(b).toISOString().slice(0, 10)
  );
}

export async function compareTripRows(rows) {
  const comparison = [];

  for (const [index, row] of rows.entries()) {
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

    if (row.gcNumber) {
      trip = await prisma.trip.findFirst({
        where: {
          gcNumber: row.gcNumber,
        },
      });
    }

    if (!trip) {
      comparison.push({
        rowNumber: index + 1,
        action: "CREATE",
        changes: [],
        truck,
        trip,
        row,
      });

      continue;
    }

    const differences = {
      truckId: trip.truckId !== truck.id,
      gcNumber: trip.gcNumber !== row.gcNumber,
      billNumber: trip.billNumber !== row.billNumber,
      source: (trip.source ?? "") !== (row.source ?? ""),
      destination: (trip.destination ?? "") !== (row.destination ?? ""),
      startDate: !sameDate(trip.startDate, row.startDate),
      endDate: !sameDate(trip.endDate, row.endDate),
      grossAmount:
        Math.abs((trip.grossAmount ?? 0) - (row.grossAmount ?? 0)) > 0.01,
    };

    const changed = Object.values(differences).some(Boolean);

    comparison.push({
      rowNumber: index + 1,
      action: changed ? "UPDATE" : "UNCHANGED",
      changes: [],
      truck,
      trip,
      row,
    });
  }

  return comparison;
}
