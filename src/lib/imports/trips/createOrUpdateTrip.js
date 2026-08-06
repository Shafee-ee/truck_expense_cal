import { prisma } from "@/lib/prisma";
import { calculateRevenue, calculateExpenses } from "@/lib/finance";
import { createTripExpenses } from "./createTripExpenses";

function buildTripData(row, truckId, transporterCompanyId) {
  const data = {
    truck: {
      connect: {
        id: truckId,
      },
    },

    gcNumber: row.gcNumber,
    billNumber: row.billNumber,

    source: row.source || "Unknown",
    destination: row.destination,

    startDate: row.startDate,
    endDate: row.endDate,

    freightWeight: row.freightWeight,
    estimatedQty: row.freightWeight,
    ratePerUnit: row.ratePerUnit,
    grossAmount: row.grossAmount,

    status: "CLOSED",

    loadType: row.billedDetails === "GJ" ? "COMPANY" : "EXTERNAL",

    revenueMode: row.freightWeight && row.ratePerUnit ? "VARIABLE" : "FIXED",

    customerDiesel: row.diesel,
    customerAdvance: row.advance,
    tds: row.tds,
    charges: row.charges,
    damageAmount: row.damageAmount,

    gcBalance:
      row.grossAmount -
      row.diesel -
      row.advance -
      row.tds -
      row.charges -
      row.damageAmount,

    mamool: 0,
  };

  if (transporterCompanyId) {
    data.transporterCompany = {
      connect: {
        id: transporterCompanyId,
      },
    };
  }

  return data;
}

export async function createOrUpdateTrip(item, transporterCompany) {
  const isUpdate = item.action === "UPDATE";

  const tripData = buildTripData(
    item.row,
    item.truck.id,
    transporterCompany?.id
  );

  if (isUpdate && !transporterCompany && item.trip.transporterCompanyId) {
    tripData.transporterCompany = {
      disconnect: true,
    };
  }

  let trip;

  if (isUpdate) {
    const updateData = {
      gcNumber: tripData.gcNumber,
      billNumber: tripData.billNumber,
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
    };

    if (tripData.source !== null && tripData.source !== undefined) {
      updateData.source = tripData.source;
    }

    trip = await prisma.trip.update({
      where: {
        id: item.trip.id,
      },
      data: updateData,
    });

    await prisma.expense.deleteMany({
      where: {
        tripId: trip.id,
      },
    });
  } else {
    trip = await prisma.trip.create({
      data: tripData,
    });
  }

  const expenses = await createTripExpenses({
    tripId: trip.id,
    expenseDate: trip.startDate ?? new Date(),
    row: item.row,
  });

  const finalRevenue =
    trip.revenueMode === "FIXED"
      ? trip.grossAmount || 0
      : (trip.estimatedQty || 0) * (trip.ratePerUnit || 0);

  const finalExpenses = calculateExpenses(expenses);

  await prisma.trip.update({
    where: {
      id: trip.id,
    },
    data: {
      finalRevenue,
      finalExpenses,
      finalBalance: finalRevenue - finalExpenses,
      closedAt: trip.endDate ?? new Date(),
      closedBy: "Import",
    },
  });
}
