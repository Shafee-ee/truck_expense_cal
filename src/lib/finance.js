export function calculateRevenue(trip) {
  if (trip.revenueMode === "FIXED") {
    return trip.grossAmount || 0;
  }

  return (trip.actualQty || 0) * (trip.ratePerUnit || 0);
}

export function calculateExpenses(expenses = []) {
  return expenses.reduce((sum, e) => sum + e.amount, 0);
}

export function calculatePayments(payments = []) {
  return payments.reduce((sum, p) => sum + p.amount, 0);
}

export function calculateOutstanding(trip) {
  const revenue = calculateRevenue(trip);

  return revenue - calculatePayments(trip.payments);
}

// Legacy compatibility wrapper.
// Prefer calculateTripProfit() for all new code.
export function calculateBalance(trip) {
  return calculateTripProfit(trip);
}

export function calculateTripDays(trip) {
  if (!trip.startDate || !trip.endDate) {
    return 0;
  }

  const start = new Date(trip.startDate);

  start.setHours(0, 0, 0, 0);

  const end = new Date(trip.endDate);

  end.setHours(0, 0, 0, 0);

  const diffMs = end.getTime() - start.getTime();

  const days = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;

  return Math.max(days, 1);
}

export function calculateEarningsPerDay(trip) {
  const tripProfit = calculateTripProfit(trip);

  const days = calculateTripDays(trip);

  if (days <= 0) {
    return tripProfit;
  }

  return tripProfit / days;
}

export function calculateTripProfit(trip) {
  return calculateRevenue(trip) - calculateExpenses(trip.expenses);
}

export function calculateNetTruckProfit({
  tripProfit = 0,
  maintenanceCost = 0,
}) {
  return tripProfit - maintenanceCost;
}

export function calculateCollectionHealth({ outstanding = 0, revenue = 0 }) {
  if (revenue <= 0) {
    return 100;
  }

  const collected = revenue - outstanding;

  return Math.max(0, (collected / revenue) * 100);
}

export function calculateTruckMetrics({
  truckNumber,
  trips = [],
  maintenanceCost = 0,
}) {
  const tripProfit = trips.reduce(
    (sum, trip) => sum + calculateTripProfit(trip),
    0,
  );

  const totalRevenue = trips.reduce(
    (sum, trip) => sum + calculateRevenue(trip),
    0,
  );

  const totalExpenses = trips.reduce(
    (sum, trip) => sum + calculateExpenses(trip.expenses),
    0,
  );

  const outstanding = trips.reduce((sum, trip) => {
    const amount = calculateOutstanding(trip);

    return sum + (amount > 0 ? amount : 0);
  }, 0);

  const totalDays = trips.reduce(
    (sum, trip) => sum + calculateTripDays(trip),
    0,
  );

  const earningsPerDay = totalDays > 0 ? tripProfit / totalDays : tripProfit;

  return {
    truckNumber,
    totalRevenue,
    totalExpenses,
    tripProfit,
    maintenanceCost,
    netProfit: calculateNetTruckProfit({
      tripProfit,
      maintenanceCost,
    }),
    outstanding,
    earningsPerDay,
    tripCount: trips.length,
  };
}
