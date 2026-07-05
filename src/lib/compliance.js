export const COMPLIANCE_RULES = {
  TAX: 365,
  PERMIT: 365,
  INSURANCE: 365,
};

export function getComplianceAlerts(expenses) {
  const alerts = [];

  for (const expense of expenses) {
    const renewalDays = COMPLIANCE_RULES[expense.category];

    if (!renewalDays) continue;

    const daysSincePayment = Math.floor(
      (Date.now() - new Date(expense.expenseDate).getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (daysSincePayment >= renewalDays) {
      alerts.push({
        truck: expense.truck.numberPlate,
        category: expense.category,
        status: "OVERDUE",
        days: daysSincePayment - renewalDays,
      });

      continue;
    }

    if (daysSincePayment >= renewalDays - 30) {
      alerts.push({
        truck: expense.truck.numberPlate,
        category: expense.category,
        status: "WARNING",
        days: renewalDays - daysSincePayment,
      });
    }
  }

  return alerts;
}
