import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const now = new Date();

  const trucks = await prisma.truck.findMany({
    select: { dailyFixedCost: true },
  });

  const daysInMonth = new Date(
    now.getFullYear(),
    now.getMonth() + 1,
    0,
  ).getDate();

  const fixedCost = trucks.reduce(
    (sum, t) => sum + (t.dailyFixedCost || 0) * daysInMonth,
    0,
  );

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

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
    },
  });

  // count
  const activeTrips = activeTripsData.length;

  // Top active trips by expense
  const topActiveTrips = activeTripsData
    .map((trip) => {
      const totalExpense = trip.expenses.reduce((sum, e) => sum + e.amount, 0);

      return {
        id: trip.id,
        source: trip.source,
        destination: trip.destination,
        totalExpense,
      };
    })
    .sort((a, b) => b.totalExpense - a.totalExpense)
    .slice(0, 3);

  // cash deployed = sum of all expenses in active trips
  const cashDeployed = activeTripsData.reduce((sum, trip) => {
    const tripExpense = trip.expenses.reduce((tSum, e) => tSum + e.amount, 0);
    return sum + tripExpense;
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
    statusStrip: {
      activeTrips,
      cashDeployed,
    },
    lossTrips,
    topActiveTrips,
  });
}
