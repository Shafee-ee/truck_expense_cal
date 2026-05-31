import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import {
  calculateExpenses,
  calculateOutstanding,
  calculateEarningsPerDay,
  calculateTripDays,
  calculateTruckMetrics,
  calculatePayments,
  calculateRevenue,
} from "@/lib/finance";
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
      payments: true,
      expenses: true,
    },
  });

  // Loss-making / inefficient trips
  const rawLossTrips = await prisma.trip.findMany({
    where: {
      status: "CLOSED",
      closedAt: {
        gte: startOfMonth,
        lt: startOfNextMonth,
      },
    },
    include: {
      expenses: true,
      payments: true,
      truck: true,
    },
  });

  const lossTrips = rawLossTrips
    .map((trip) => {
      const earningsPerDay = calculateEarningsPerDay(trip);

      return {
        id: trip.id,
        source: trip.source,
        destination: trip.destination,
        finalBalance: trip.finalBalance || 0,
        earningsPerDay,
        tripDays: calculateTripDays(trip),
      };
    })
    .filter((trip) => trip.finalBalance < 0 || trip.earningsPerDay < 2000)
    .sort((a, b) => a.earningsPerDay - b.earningsPerDay)
    .slice(0, 5);

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
      truck: true,
    },
  });

  const companyReceivablesMap = {};

  const outstandingTrips = receivableTrips
    .map((trip) => {
      const outstanding = calculateOutstanding(trip);

      const referenceDate =
        trip.closedAt || trip.dischargeDate || trip.createdAt;

      const ageDays = Math.floor(
        (Date.now() - new Date(referenceDate)) / (1000 * 60 * 60 * 24),
      );

      let risk = "NORMAL";

      if (outstanding > 100000 && ageDays > 45) {
        risk = "CRITICAL";
      } else if (outstanding > 50000 || ageDays > 30) {
        risk = "RISK";
      } else if (outstanding > 25000 && ageDays > 15) {
        risk = "WATCH";
      }

      return {
        id: trip.id,
        source: trip.source,
        destination: trip.destination,
        truckNumber: trip.truck?.numberPlate || "-",
        outstanding,
        ageDays,
        risk,
        status: trip.status,
      };
    })
    .filter((trip) => trip.outstanding > 0)
    .sort((a, b) => b.ageDays - a.ageDays)
    .slice(0, 10);

  receivableTrips.forEach((trip) => {
    const company = trip.clientName?.trim() || "Unknown";

    const receivable = trip.gcBalance || 0;

    const received = calculatePayments(trip.payments || []);

    const outstanding = calculateOutstanding(trip);

    if (!companyReceivablesMap[company]) {
      companyReceivablesMap[company] = {
        company,
        receivable: 0,
        received: 0,
        outstanding: 0,
        tripCount: 0,
      };
    }

    companyReceivablesMap[company].receivable += receivable;

    companyReceivablesMap[company].received += received;

    companyReceivablesMap[company].outstanding += outstanding;

    companyReceivablesMap[company].tripCount += 1;
  });

  const companyReceivables = Object.values(companyReceivablesMap)
    .filter((company) => company.outstanding > 0)
    .sort((a, b) => b.outstanding - a.outstanding)
    .slice(0, 10);
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
      truckProfitMap[truckNumber] = {
        tripProfit: 0,
        tripCount: 0,
        totalDays: 0,
      };
    }

    truckProfitMap[truckNumber].tripProfit += trip.finalBalance || 0;

    truckProfitMap[truckNumber].tripCount += 1;

    truckProfitMap[truckNumber].totalDays += calculateTripDays(trip);
  });

  //truck profitability
  //truck profitability
  const truckProfitability = Object.entries(truckProfitMap)
    .map(([truckNumber]) => {
      const maintenanceCost = maintenanceMap[truckNumber] || 0;

      const truckTrips = closedTripsWithTruck.filter(
        (trip) => trip.truck.numberPlate === truckNumber,
      );

      return calculateTruckMetrics({
        truckNumber,
        trips: truckTrips,
        maintenanceCost,
      });
    })
    .sort((a, b) => b.netProfit - a.netProfit);

  // Outstanding amount from active trips
  const outstandingAmount = receivableTrips.reduce((sum, trip) => {
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
    companyReceivables,

    statusStrip: {
      activeTrips,
      cashDeployed,
      outstandingAmount,
    },
    lossTrips,
    topActiveTrips,
  });
}
