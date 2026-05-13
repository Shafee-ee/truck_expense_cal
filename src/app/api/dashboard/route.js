import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  calculateRevenue,
  calculateExpenses,
  calculatePayments,
  calculateOutstanding,
} from "@/lib/finance";

export async function GET() {
  const now = new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;

  const maintenance = await prisma.truckMaintenance.findMany({
    where: {
      month: currentMonth,
    },
  });

  const fixedCost = maintenance.reduce((sum, m) => sum + m.totalCost, 0);

  const maintenanceMap = {};

  maintenance.forEach((m) => {
    maintenanceMap[m.truckNumber] = m.totalCost;
  });

  const closedTrips = await prisma.trip.findMany({
    where: {
      status: "CLOSED",
      closedAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    select: {
      finalBalance: true,
    },
  });

  const closedTripsWithTruck = await prisma.trip.findMany({
    where: {
      status: "CLOSED",
      closedAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    include: {
      truck: true,
    },
  });

  // Loss-making trips (this month)
  const lossTrips = await prisma.trip.findMany({
    where: {
      status: "CLOSED",
      closedAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
      finalBalance: {
        lt: 0,
      },
    },
    select: {
      id: true,
      source: true,
      destination: true,
      finalBalance: true,
    },
  });

  // ACTIVE trips
  const activeTripsData = await prisma.trip.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      expenses: true,
      payments: true,
    },
  });

  // count
  const activeTrips = activeTripsData.length;

  // Top active trips by expense
  const topActiveTrips = activeTripsData
    .map((trip) => {
      const totalExpense = (trip.expenses ?? []).reduce(
        (sum, e) => sum + e.amount,
        0,
      );
      return {
        id: trip.id,
        source: trip.source,
        destination: trip.destination,
        totalExpense,
      };
    })
    .sort((a, b) => b.totalExpense - a.totalExpense)
    .slice(0, 3);

  //truck profit map
  const truckProfitMap = {};

  closedTripsWithTruck.forEach((trip) => {
    const truckNumber = trip.truck.numberPlate;

    if (!truckProfitMap[truckNumber]) {
      truckProfitMap[truckNumber] = 0;
    }

    truckProfitMap[truckNumber] += trip.finalBalance || 0;
  });

  //truck profitability
  const truckProfitability = Object.entries(truckProfitMap).map(
    ([truckNumber, tripProfit]) => {
      const maintenanceCost = maintenanceMap[truckNumber] || 0;

      return {
        truckNumber,
        tripProfit,
        maintenanceCost,
        netProfit: tripProfit - maintenanceCost,
      };
    },
  );

  // Outstanding amount from active trips
  const outstandingAmount = activeTripsData.reduce((sum, trip) => {
    const revenue =
      trip.grossAmount ||
      calculateRevenue({
        actualQty: trip.estimatedQty,
        ratePerUnit: trip.ratePerUnit,
      });

    const outstanding = calculateOutstanding(revenue, trip.payments);

    return sum + (outstanding > 0 ? outstanding : 0);
  }, 0);

  // cash deployed = sum of all expenses in active trips
  const cashDeployed = activeTripsData.reduce((sum, trip) => {
    return sum + calculateExpenses(trip.expenses);
  }, 0);

  const operationalProfit = closedTrips.reduce(
    (sum, t) => sum + (t.finalBalance || 0),
    0,
  );

  const trueNetProfit = operationalProfit - fixedCost;

  return NextResponse.json({
    operationalProfit,
    fixedCost,
    trueNetProfit,
    truckProfitability,

    statusStrip: {
      activeTrips,
      cashDeployed,
      outstandingAmount,
    },
    lossTrips,
    topActiveTrips,
  });
}
