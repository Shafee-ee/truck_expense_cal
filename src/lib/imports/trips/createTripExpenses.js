import { prisma } from "@/lib/prisma";

export async function createTripExpenses({ tripId, expenseDate, row }) {
  const expenses = [];

  const mappings = [
    {
      amount: row.expenseDiesel,
      category: "FUEL",
    },
    {
      amount: row.toll,
      category: "TOLL",
    },
    {
      amount: row.loading,
      category: "LOADING",
    },
    {
      amount: row.rto,
      category: "OTHER",
    },
    {
      amount: row.police,
      category: "POLICE",
    },
    {
      amount: row.driver,
      category: "DRIVER_PAYMENT",
    },
    {
      amount: row.other,
      category: "OTHER",
    },
  ];

  for (const { amount, category } of mappings) {
    const value = Number(amount || 0);

    if (value <= 0) continue;

    expenses.push({
      tripId,
      category,
      amount: value,
      expenseDate,
      note: row.notes || "Imported from Master File",
    });
  }

  if (expenses.length === 0) {
    return [];
  }

  await prisma.expense.createMany({
    data: expenses,
  });

  return expenses;
}
