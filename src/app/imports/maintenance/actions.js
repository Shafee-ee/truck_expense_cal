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
  let errors = 0;

  const expenses = [];

  for (const record of records) {
    const truckId = truckMap.get(record.truckNumber);

    if (!truckId) {
      errors++;

      console.warn(`Truck not found: ${record.truckNumber}`, record);

      continue;
    }

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
    total: records.length,
    created,
    updated: 0,
    skipped: 0,
    errors,
  };
}
