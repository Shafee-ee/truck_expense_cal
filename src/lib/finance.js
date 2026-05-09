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

export function calculateOutstanding(revenue, payments = []) {
  return revenue - calculatePayments(payments);
}

export function calculateBalance(revenue, expenses = []) {
  return revenue - calculateExpenses(expenses);
}
