import { readExcel } from "@/lib/imports/excel";
import { mapTripRows } from "@/lib/imports/trips";
import { compareTripRows } from "@/lib/imports/trips/comparison";
import { createOrUpdateTrip } from "./createOrUpdateTrip";
import { prisma } from "@/lib/prisma";

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

  console.log(
    comparison.filter(
      (item) =>
        item.action === "UPDATE" &&
        item.trip &&
        (!item.trip.startDate || !item.trip.endDate)
    )
  );

  const summary = {
    created: 0,
    updated: 0,
    unchanged: 0,
    errors: 0,
  };

  for (const item of comparison) {
    const transporterCompany = item.row.transporter
      ? await prisma.company.findFirst({
          where: {
            name: item.row.transporter,
          },
        })
      : null;
    switch (item.action) {
      case "CREATE": {
        console.log("START", item.row.gcNumber);

        await createOrUpdateTrip(item, transporterCompany);

        console.log("END", item.row.gcNumber);
        summary.created++;
        break;
      }

      case "UPDATE": {
        console.log("START", item.row.gcNumber);

        await createOrUpdateTrip(item, transporterCompany);

        console.log("END", item.row.gcNumber);
        summary.updated++;
        break;
      }

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
