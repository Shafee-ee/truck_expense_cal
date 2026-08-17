import { readExcel } from "@/lib/imports/excel";
import { mapTripRows } from "@/lib/imports/trips";
import { compareTripRows } from "@/lib/imports/trips/comparison";
import { createOrUpdateTrip } from "./createOrUpdateTrip";
import { prisma } from "@/lib/prisma";
import { getTripRows } from "@/lib/imports/trips/getTripRows";
export async function processTripImport(file) {
  const buffer = Buffer.from(await file.arrayBuffer());

  const workbook = readExcel(buffer, {
    cellDates: false,
  });

  const rows = getTripRows(workbook);
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

  const summary = {
    created: 0,
    updated: 0,
    unchanged: 0,
    errors: 0,
  };

  for (const item of comparison) {
    let clientCompany = null;

    if (item.row.customer) {
      clientCompany = await prisma.company.findFirst({
        where: {
          name: item.row.customer,
        },
      });

      if (!clientCompany) {
        clientCompany = await prisma.company.create({
          data: {
            name: item.row.customer,
          },
        });
      }
    }
    switch (item.action) {
      case "CREATE": {
        await createOrUpdateTrip(item, clientCompany);

        summary.created++;
        break;
      }

      case "UPDATE": {
        await createOrUpdateTrip(item, clientCompany);
        summary.updated++;
        break;
      }

      case "UNCHANGED":
        summary.unchanged++;
        break;

      case "ERROR":
        console.log(item);
        summary.errors++;
        break;
    }
  }

  return summary;
}
