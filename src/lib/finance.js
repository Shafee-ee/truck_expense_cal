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

export function calculateBalance(trip) {
  const revenue = calculateRevenue(trip);

  return revenue - calculateExpenses(trip.expenses);
}

export function calculateTripDays(trip) {
  if (!trip.startDate || !trip.endDate) {
    return 0;
  }

  const start = new Date(trip.startDate);
  const end = new Date(trip.endDate);

  const diffMs = end.getTime() - start.getTime();

  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  return days || 1;
}

export function calculateEarningsPerDay(trip) {
  const balance = calculateBalance(trip);

  const days = calculateTripDays(trip);

  if (days <= 0) {
    return balance;
  }

  return balance / days;
}
