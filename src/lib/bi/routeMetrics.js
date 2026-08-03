function getRouteKey(trip) {
  return `${trip.source} → ${trip.destination}`;
}

export function calculateRouteMetrics(trips) {
  const routes = {};

  trips.forEach((trip) => {
    const key = getRouteKey(trip);

    if (!routes[key]) {
      routes[key] = {
        route: key,
        tripCount: 0,
        revenue: 0,
        expenses: 0,
        profit: 0,
      };
    }

    routes[key].tripCount += 1;
    routes[key].revenue += trip.finalRevenue ?? 0;
    routes[key].expenses += trip.finalExpenses ?? 0;
    routes[key].profit += trip.finalBalance ?? 0;
  });

  return Object.values(routes)
    .map((route) => ({
      ...route,

      averageProfitPerTrip:
        route.tripCount > 0 ? route.profit / route.tripCount : 0,
    }))
    .sort((a, b) => b.profit - a.profit);
}
