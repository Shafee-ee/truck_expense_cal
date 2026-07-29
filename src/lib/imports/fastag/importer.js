import { prisma } from "@/lib/prisma";

export async function importFastagRows(tripId, rows) {
  const importableRows = rows.filter(
    (row) => row.action === "IMPORT" && row.errors.length === 0
  );

  const created = [];

  for (const row of importableRows) {
    const expense = await prisma.expense.create({
      data: {
        tripId,
        category: "TOLL",
        amount: row.amount,
        expenseDate: row.expenseDate,
        note: row.note,

        fastagTransactionId: row.fastagTransactionId,
        fastagTagId: row.fastagTagId,
        fastagPlazaCode: row.fastagPlazaCode,
        fastagPlazaName: row.fastagPlazaName,
        fastagProcessingAt: row.fastagProcessingAt,
      },
    });

    created.push(expense);
  }

  return {
    created: created.length,
  };
}
