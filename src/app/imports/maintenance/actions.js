"use server";

import { prisma } from "@/lib/prisma";
import { processMaintenanceImport } from "@/lib/imports/maintenance/processMaintenanceImport";

export async function importMaintenanceRows(previousState, formData) {
  const file = formData.get("file");

  if (!file || file.size === 0) {
    return { error: "Please select a file." };
  }

  const records = await processMaintenanceImport(file);

  console.log("Maintenance records:", records.length);
  console.log("First records:", records.slice(0, 10));

  return {
    success: true,
    parsed: records.length,
  };

  const trucks = await prisma.truck.findMany({
    select: {
      id: true,
      numberPlate: true,
    },
  });

  const truckMap = new Map(
    trucks.map((truck) => [truck.numberPlate, truck.id])
  );

  let created = 0;
  let skipped = 0;
  let errors = 0;

  const expenses = [];

  const existingExpenses = await prisma.truckExpense.findMany({
    select: {
      truckId: true,
      month: true,
      year: true,
      category: true,
      vendor: true,
      amount: true,
    },
  });

  const existingKeys = new Set(
    existingExpenses.map(
      (expense) =>
        `${expense.truckId}|${expense.month}|${expense.year}|${expense.category}|${expense.vendor}|${expense.amount}`
    )
  );

  for (const record of records) {
    const truckId = truckMap.get(record.truckNumber);

    if (!truckId) {
      errors++;
      console.warn(`Truck not found: ${record.truckNumber}`);
      continue;
    }

    const key = `${truckId}|${record.month}|${record.year}|${record.category}|${record.vendor}|${record.amount}`;

    if (existingKeys.has(key)) {
      skipped++;
      continue;
    }

    existingKeys.add(key);

    expenses.push({
      truckId,
      category: record.category,
      vendor: record.vendor,
      amount: record.amount,
      expenseDate: record.expenseDate,
      month: record.month,
      year: record.year,
    });

    created++;
  }

  if (expenses.length > 0) {
    await prisma.truckExpense.createMany({
      data: expenses,
    });
  }

  return {
    success: true,
    total: created + skipped + errors,
    created,
    updated: 0,
    skipped,
    errors,
  };
}
