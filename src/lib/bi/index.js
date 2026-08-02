export function calculateTruckMetrics(truck) {
  const trips = truck.trips ?? [];

  const completedTrips = trips.filter((trip) => trip.status === "CLOSED");

  const activeTrips = trips.filter((trip) => trip.status === "ACTIVE");

  const revenue = completedTrips.reduce(
    (sum, trip) => sum + (trip.finalRevenue ?? 0),
    0
  );

  const expenses = completedTrips.reduce(
    (sum, trip) => sum + (trip.finalExpenses ?? 0),
    0
  );

  const profit = completedTrips.reduce(
    (sum, trip) => sum + (trip.finalBalance ?? 0),
    0
  );

  const fixedCost = 0;

  const netProfit = profit - fixedCost;

  return {
    summary: {
      tripsCompleted: completedTrips.length,
      tripsActive: activeTrips.length,

      revenue,
      expenses,
      profit,

      fixedCost,
      netProfit,
    },

    efficiency: {
      revenuePerTrip:
        completedTrips.length > 0 ? revenue / completedTrips.length : 0,

      expensePerTrip:
        completedTrips.length > 0 ? expenses / completedTrips.length : 0,

      profitPerTrip:
        completedTrips.length > 0 ? profit / completedTrips.length : 0,
    },

    utilization: {
      activeTrips: activeTrips.length,
      utilizationRate: null,
    },

    maintenance: {
      maintenanceCost: 0,
    },
  };
}
