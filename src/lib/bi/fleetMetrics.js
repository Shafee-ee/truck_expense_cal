export function calculateFleetMetrics(trucks) {
  const truckCount = trucks.length;

  const totalRevenue = trucks.reduce((sum, truck) => sum + truck.revenue, 0);

  const totalExpenses = trucks.reduce((sum, truck) => sum + truck.expenses, 0);

  const totalProfit = trucks.reduce((sum, truck) => sum + truck.profit, 0);

  const totalMaintenance = trucks.reduce(
    (sum, truck) => sum + truck.maintenanceCost,
    0
  );

  const netProfit = trucks.reduce((sum, truck) => sum + truck.netProfit, 0);

  const totalTrips = trucks.reduce((sum, truck) => sum + truck.tripCount, 0);

  const averageProfitPerTruck = truckCount > 0 ? netProfit / truckCount : 0;

  const mostProfitableTruck =
    trucks.length === 0
      ? null
      : trucks.reduce((best, truck) =>
          truck.netProfit > best.netProfit ? truck : best
        );

  const leastProfitableTruck =
    trucks.length === 0
      ? null
      : trucks.reduce((worst, truck) =>
          truck.netProfit < worst.netProfit ? truck : worst
        );

  return {
    truckCount,

    totalRevenue,

    totalExpenses,

    operationalProfit: totalProfit,

    totalMaintenance,

    netProfit,

    totalTrips,

    mostProfitableTruck,

    leastProfitableTruck,

    averageProfitPerTruck,
  };
}
