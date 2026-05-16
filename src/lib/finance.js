export function calculateRevenue(trip) {
  if (trip.grossAmount && trip.grossAmount > 0) {
    return trip.grossAmount;
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
