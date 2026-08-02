function getCompletedTrips(trips) {
  return trips.filter((trip) => trip.status === "CLOSED");
}

function getRevenue(trips) {
  return trips.reduce((sum, trip) => sum + (trip.finalRevenue ?? 0), 0);
}

function getExpenses(trips) {
  return trips.reduce((sum, trip) => sum + (trip.finalExpenses ?? 0), 0);
}

function getProfit(trips) {
  return trips.reduce((sum, trip) => sum + (trip.finalBalance ?? 0), 0);
}

function getTotalDays(trips) {
  return trips.reduce((sum, trip) => sum + (trip.tripDays ?? 0), 0);
}

function getAverageProfitPerTrip(trips) {
  if (trips.length === 0) return 0;

  const profit = getProfit(trips);

  return profit / trips.length;
}

export function calculateTruckMetrics(truck) {
  const completedTrips = getCompletedTrips(truck.trips ?? []);

  const revenue = getRevenue(completedTrips);

  const expenses = getExpenses(completedTrips);

  const profit = getProfit(completedTrips);

  const averageProfitPerTrip = getAverageProfitPerTrip(completedTrips);

  const totalDays = getTotalDays(completedTrips);

  const maintenanceCost = truck.maintenanceCost ?? 0;

  const netProfit = profit - maintenanceCost;

  return {
    truckNumber: truck.truckNumber,

    revenue,
    expenses,
    profit,

    maintenanceCost,
    netProfit,

    tripCount: completedTrips.length,

    totalDays,

    averageProfitPerTrip,

    earningsPerDay: totalDays > 0 ? netProfit / totalDays : 0,
  };
}
