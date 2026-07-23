import { prisma } from "@/lib/prisma";

export async function createTripExpenses({ tripId, expenseDate, row }) {
  const expenses = [];
  const mappings = [
    { field: "diesel", category: "FUEL" },
    { field: "toll", category: "TOLL" },
    { field: "loading", category: "LOADING" },
    { field: "police", category: "POLICE" },
    { field: "driver", category: "DRIVER_PAYMENT" },
    { field: "rto", category: "OTHER" },
    { field: "other", category: "OTHER" },
  ];

  for (const { field, category } of mappings) {
    const amount = Number(row[field] || 0);

    if (amount <= 0) continue;

    expenses.push({
      tripId,
      category,
      amount,
      expenseDate,
      note: "Imported from AS Transport",
    });
  }

  if (expenses.length === 0) {
    return [];
  }

  const result = await prisma.expense.createMany({
    data: expenses,
  });

  return expenses;
}
