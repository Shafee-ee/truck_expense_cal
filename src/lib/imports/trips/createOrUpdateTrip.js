import { prisma } from "@/lib/prisma";
import { calculateExpenses } from "@/lib/finance";
import { createTripExpenses } from "./createTripExpenses";

function buildTripData(row, truckId, clientCompanyId) {
  const customerDiesel = row.customerDiesel ?? 0;
  const customerAdvance = row.customerAdvance ?? 0;
  const tds = row.tds ?? 0;
  const charges = row.charges ?? 0;
  const damageAmount = row.damageAmount ?? 0;

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

    customerDiesel,
    customerAdvance,
    tds,
    charges,
    damageAmount,

    gcBalance: row.gcBalance,

    mamool: 0,
  };
  if (clientCompanyId) {
    data.clientCompany = {
      connect: {
        id: clientCompanyId,
      },
    };
  }
  return data;
}

export async function createOrUpdateTrip(item, clientCompany) {
  const isUpdate = item.action === "UPDATE";

  const tripData = buildTripData(item.row, item.truck.id, clientCompany?.id);

  let trip;

  if (isUpdate) {
    const updateData = {
      gcNumber: tripData.gcNumber,
      billNumber: tripData.billNumber,
      source: tripData.source,
      destination: tripData.destination,
      startDate: tripData.startDate,
      endDate: tripData.endDate,
      freightWeight: tripData.freightWeight,
      estimatedQty: tripData.estimatedQty,
      ratePerUnit: tripData.ratePerUnit,
      grossAmount:
        tripData.grossAmount != null
          ? tripData.grossAmount
          : item.trip.grossAmount,
      revenueMode: tripData.revenueMode,
      customerDiesel: tripData.customerDiesel,
      customerAdvance: tripData.customerAdvance,
      tds: tripData.tds,
      charges: tripData.charges,
      damageAmount: tripData.damageAmount,
      clientCompany: clientCompany
        ? {
            connect: {
              id: clientCompany.id,
            },
          }
        : {
            disconnect: true,
          },
      gcBalance: tripData.gcBalance,
    };

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

  const finalExpenses = calculateExpenses(expenses);

  const finalRevenue =
    trip.revenueMode === "FIXED"
      ? trip.grossAmount || 0
      : (trip.estimatedQty || 0) * (trip.ratePerUnit || 0);

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
