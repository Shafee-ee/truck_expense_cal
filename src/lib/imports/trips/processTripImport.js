import { readExcel } from "@/lib/imports/excel";
import { mapTripRows } from "@/lib/imports/trips";
import { compareTripRows } from "@/lib/imports/trips/comparison";
import { createTripExpenses } from "./createTripExpenses";
import { prisma } from "@/lib/prisma";

import { calculateRevenue, calculateExpenses } from "@/lib/finance";

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

  const summary = {
    created: 0,
    updated: 0,
    unchanged: 0,
    errors: 0,
  };

  for (const item of comparison) {
    switch (item.action) {
      case "CREATE": {
        const transporterCompany = item.row.transporter
          ? await prisma.company.findFirst({
              where: {
                name: item.row.transporter,
              },
            })
          : null;

        const trip = await prisma.trip.create({
          data: {
            truck: {
              connect: {
                id: item.truck.id,
              },
            },

            transporterCompany: transporterCompany
              ? {
                  connect: {
                    id: transporterCompany.id,
                  },
                }
              : undefined,

            // Identity
            gcNumber: item.row.gcNumber,
            billNumber: item.row.billNumber,

            // Route
            source: item.row.source,
            destination: item.row.destination,

            // Dates
            startDate: item.row.startDate,
            endDate: item.row.endDate,

            // Freight
            freightWeight: item.row.freightWeight,
            estimatedQty: item.row.freightWeight,
            ratePerUnit: item.row.ratePerUnit,
            grossAmount: item.row.grossAmount,

            // Business Rules
            status: "CLOSED",

            loadType: item.row.billedDetails === "GJ" ? "COMPANY" : "EXTERNAL",

            revenueMode:
              item.row.freightWeight && item.row.ratePerUnit
                ? "VARIABLE"
                : "FIXED",

            // Customer side
            customerDiesel: item.row.diesel,
            customerAdvance: item.row.advance,
            tds: item.row.tds,
            charges: item.row.charges,
            damageAmount: item.row.damageAmount,

            gcBalance:
              item.row.grossAmount -
              item.row.diesel -
              item.row.advance -
              item.row.tds -
              item.row.charges -
              item.row.damageAmount,

            // Business defaults
            mamool: 0,
          },
        });

        const expenses = await createTripExpenses({
          tripId: trip.id,
          expenseDate: trip.startDate ?? new Date(),
          row: item.row,
        });

        const finalRevenue = calculateRevenue(trip);
        const finalExpenses = calculateExpenses(expenses);
        const finalBalance = finalRevenue - finalExpenses;

        await prisma.trip.update({
          where: { id: trip.id },
          data: {
            finalRevenue,
            finalExpenses,
            finalBalance,
            closedAt: trip.endDate ?? new Date(),
            closedBy: "Import",
          },
        });

        summary.created++;
        break;
      }

      case "UPDATE": {
        const transporterCompany = item.row.transporter
          ? await prisma.company.findFirst({
              where: {
                name: item.row.transporter,
              },
            })
          : null;

        await prisma.trip.update({
          where: {
            id: item.trip.id,
          },
          data: {
            truck: {
              connect: {
                id: item.truck.id,
              },
            },

            transporterCompany: transporterCompany
              ? {
                  connect: {
                    id: transporterCompany.id,
                  },
                }
              : {
                  disconnect: true,
                },

            // Identity
            gcNumber: item.row.gcNumber,
            billNumber: item.row.billNumber,

            // Route
            source: item.row.source,
            destination: item.row.destination,

            // Dates
            startDate: item.row.startDate,
            endDate: item.row.endDate,

            // Freight
            freightWeight: item.row.freightWeight,
            estimatedQty: item.row.freightWeight,
            ratePerUnit: item.row.ratePerUnit,
            grossAmount: item.row.grossAmount,

            // Business Rules
            status: "CLOSED",

            loadType: item.row.billedDetails === "GJ" ? "COMPANY" : "EXTERNAL",

            revenueMode:
              item.row.freightWeight && item.row.ratePerUnit
                ? "VARIABLE"
                : "FIXED",

            // Customer side
            customerDiesel: item.row.diesel,
            customerAdvance: item.row.advance,
            tds: item.row.tds,
            charges: item.row.charges,
            damageAmount: item.row.damageAmount,

            gcBalance:
              item.row.grossAmount -
              item.row.diesel -
              item.row.advance -
              item.row.tds -
              item.row.charges -
              item.row.damageAmount,

            mamool: 0,
          },
        });

        await prisma.expense.deleteMany({
          where: {
            tripId: item.trip.id,
          },
        });

        const expenses = await createTripExpenses({
          tripId: item.trip.id,
          expenseDate: item.row.startDate ?? new Date(),
          row: item.row,
        });

        const updatedTrip = {
          ...item.trip,
          ...item.row,
        };

        const finalRevenue = calculateRevenue(updatedTrip);
        const finalExpenses = calculateExpenses(expenses);
        const finalBalance = finalRevenue - finalExpenses;

        await prisma.trip.update({
          where: {
            id: item.trip.id,
          },
          data: {
            finalRevenue,
            finalExpenses,
            finalBalance,
            closedAt: item.row.endDate ?? new Date(),
            closedBy: "Import",
          },
        });

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
