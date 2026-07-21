import { readExcel } from "@/lib/imports/excel";
import { mapTripRows } from "@/lib/imports/trips";
import { compareTripRows } from "@/lib/imports/trips/comparison";

export async function processTripImport(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const rows = readExcel(buffer);

  const mappedRows = mapTripRows(rows);

  const filteredRows = mappedRows.filter(
    (row) =>
      row.gcNumber ||
      row.billNumber ||
      row.vehicleNumber ||
      row.source ||
      row.destination
  );

  const comparison = await compareTripRows(filteredRows);

  console.log(comparison);

  const summary = {
    created: 0,
    updated: 0,
    unchanged: 0,
    errors: 0,
  };

  for (const item of comparison) {
    switch (item.action) {
      case "CREATE":
        await prisma.trip.create({
          data: {
            truck: {
              connect: {
                id: item.truck.id,
              },
            },
            source: item.row.source,
            destination: item.row.destination,
            gcNumber: item.row.gcNumber,
            billNumber: item.row.billNumber,
            status: "CLOSED",
          },
        });

        summary.created++;
        break;

      case "UPDATE":
        summary.updated++;
        break;

      case "UNCHANGED":
        summary.unchanged++;
        break;

      case "ERROR":
        summary.errors++;
        break;
    }
  }

  return summary;
}
