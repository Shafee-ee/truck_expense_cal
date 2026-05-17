import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { calculateExpenses, calculateOutstanding } from "@/lib/finance";

export async function GET(request) {
  const { searchParams } = new URL(request.url);

  const monthParam = searchParams.get("month");

  const now = monthParam ? new Date(`${monthParam}-01`) : new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const currentMonth = `${now.getFullYear()}-${String(
    now.getMonth() + 1,
  ).padStart(2, "0")}`;

  const maintenance = await prisma.truckExpense.findMany({
    where: {
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    },
    include: {
      truck: true,
    },
  });

  const fixedCost = maintenance.reduce((sum, m) => sum + m.amount, 0);

  const maintenanceMap = {};

  maintenance.forEach((m) => {
    const truckNumber = m.truck.numberPlate;

    if (!maintenanceMap[truckNumber]) {
      maintenanceMap[truckNumber] = 0;
    }

    maintenanceMap[truckNumber] += m.amount;
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

  const receivableTrips = await prisma.trip.findMany({
    where: {
      status: {
        in: ["ACTIVE", "CLOSED"],
      },
    },
    include: {
      payments: true,
    },
  });

  const outstandingTrips = receivableTrips
    .map((trip) => {
      const outstanding = calculateOutstanding(trip);

      return {
        id: trip.id,
        source: trip.source,
        destination: trip.destination,
        outstanding,
        status: trip.status,
      };
    })
    .filter((trip) => trip.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 5);

  // count
  const activeTrips = activeTripsData.length;

  // Top active trips by expense
  const topActiveTrips = activeTripsData
    .map((trip) => {
      const totalExpense = calculateExpenses(trip.expenses);
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
    const outstanding = calculateOutstanding(trip);

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
    outstandingTrips,

    statusStrip: {
      activeTrips,
      cashDeployed,
      outstandingAmount,
    },
    lossTrips,
    topActiveTrips,
  });
}
