import { prisma } from "@/lib/prisma";
import {
  calculateExpenses,
  calculateOutstanding,
  calculateTripDays,
  calculatePayments,
} from "@/lib/finance";

import { calculateTruckMetrics } from "@/lib/bi/truckMetrics";
import { calculateTripMetrics } from "@/lib/bi/tripMetrics";
import { getDashboardRawData } from "@/lib/bi/repositories/dashboardRepository";
import { calculateFleetMetrics } from "@/lib/bi/fleetMetrics";

export async function getDashboardData(monthParam) {
  const { now, startOfMonth, startOfNextMonth, maintenance } =
    await getDashboardRawData(monthParam);

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
      customerPayments: true,
      expenses: true,
    },
  });

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
      customerPayments: true,
      truck: true,
    },
  });

  const lossTrips = rawLossTrips
    .map((trip) =>
      calculateTripMetrics({
        ...trip,
        tripDays: calculateTripDays(trip),
      })
    )
    .filter((trip) => trip.isLossMaking || trip.earningsPerDay < 2000)
    .sort((a, b) => a.earningsPerDay - b.earningsPerDay)
    .slice(0, 5);

  const activeTripsData = await prisma.trip.findMany({
    where: {
      status: "ACTIVE",
    },
    include: {
      expenses: true,
      customerPayments: true,
    },
  });

  const receivableTrips = await prisma.trip.findMany({
    where: {
      status: {
        in: ["ACTIVE", "CLOSED"],
      },
    },
    include: {
      customerPayments: true,
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
        (Date.now() - new Date(referenceDate)) / (1000 * 60 * 60 * 24)
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

    const received = calculatePayments(trip.customerPayments || []);

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

  const activeTrips = activeTripsData.length;

  const topActiveTrips = activeTripsData
    .map((trip) => ({
      id: trip.id,
      source: trip.source,
      destination: trip.destination,
      totalExpense: calculateExpenses(trip.expenses),
    }))
    .sort((a, b) => b.totalExpense - a.totalExpense)
    .slice(0, 3);

  const truckMap = {};

  closedTripsWithTruck.forEach((trip) => {
    const truckNumber = trip.truck.numberPlate;

    if (!truckMap[truckNumber]) {
      truckMap[truckNumber] = {
        truckNumber,
        maintenanceCost: maintenanceMap[truckNumber] ?? 0,
        trips: [],
      };
    }

    truckMap[truckNumber].trips.push({
      ...trip,
      tripDays: calculateTripDays(trip),
    });
  });

  const truckProfitability = Object.values(truckMap)
    .map(calculateTruckMetrics)
    .sort((a, b) => b.netProfit - a.netProfit);

  const fleetMetrics = calculateFleetMetrics(truckProfitability);

  const outstandingAmount = receivableTrips.reduce((sum, trip) => {
    const outstanding = calculateOutstanding(trip);

    return sum + (outstanding > 0 ? outstanding : 0);
  }, 0);

  const cashDeployed = activeTripsData.reduce((sum, trip) => {
    return sum + calculateExpenses(trip.expenses);
  }, 0);

  const operationalProfit = fleetMetrics.operationalProfit;

  const trueNetProfit = fleetMetrics.netProfit;

  return {
    operationalProfit,
    fixedCost,
    trueNetProfit,
    fleetMetrics,
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
  };
}
// version 1 complete
