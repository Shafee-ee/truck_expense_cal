"use server";
import { prisma } from "@/lib/prisma";
import * as XLSX from "xlsx";

function getCategory(label) {
  const text = label.toUpperCase();

  if (text.includes("TYRE")) return "TYRE";
  if (text.includes("REPAIR")) return "REPAIR";
  if (text.includes("ELECTRICAL")) return "ELECTRICAL";
  if (text.includes("WASH")) return "WASHING";
  if (text.includes("ADD BLUE")) return "ADD_BLUE";
  if (text.includes("ROAD TAX")) return "ROAD_TAX";
  if (text.includes("NATIONAL PERMIT")) return "NATIONAL_PERMIT";
  if (text.includes("PERMIT")) return "PERMIT";
  if (text.includes("INSURANCE")) return "INSURANCE";

  return "OTHER";
}

export async function importMaintenanceRows(previousState, formData) {
  const file = formData.get("file");

  if (!file || file.size === 0) {
    return { error: "Please select a file." };
  }

  const workbook = XLSX.read(await file.arrayBuffer(), {
    type: "buffer",
    cellDates: true,
  });

  const worksheet = workbook.Sheets[workbook.SheetNames[0]];

  const rawRows = XLSX.utils.sheet_to_json(worksheet, {
    header: 1,
    defval: null,
  });

  const period = rawRows[0].find(
    (cell) => typeof cell === "string" && cell.includes(" TO ")
  );

  if (!period) {
    return {
      error: "Could not find the maintenance period in the first row.",
    };
  }

  const startDate = period.split(" TO ")[0];

  const [day, month, year] = startDate.split("/").map(Number);

  const expenseDate = new Date(year, month - 1, day);

  const truckNumbers = rawRows[0].slice(2);
  const expenseRows = rawRows.slice(3);
  const expenses = [];
  const trucks = await prisma.truck.findMany({
    select: {
      id: true,
      numberPlate: true,
    },
  });

  const truckMap = new Map(
    trucks.map((truck) => [truck.numberPlate, truck.id])
  );

  const existingExpenses = await prisma.truckExpense.findMany({
    where: {
      month,
      year,
    },
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
  let created = 0;
  let skipped = 0;
  let errors = 0;

  for (const row of expenseRows) {
    const label = row[0];

    if (!label) continue;

    for (let i = 0; i < truckNumbers.length; i++) {
      const truckNumber = truckNumbers[i];
      const amount = row[i + 2];

      if (!truckNumber || !amount) continue;

      const truckId = truckMap.get(truckNumber);

      if (!truckId) {
        errors++;
        console.warn(`Truck not found: ${truckNumber}`);
        continue;
      }

      const key = `${truckId}|${month}|${year}|${getCategory(label)}|${label}|${Number(amount)}`;
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }

      existingKeys.add(key);

      created++;

      expenses.push({
        truckId,
        category: getCategory(label),
        vendor: label,
        amount: Number(amount),
        expenseDate,
        month,
        year,
      });
    }
  }

  await prisma.truckExpense.createMany({
    data: expenses,
  });
  return {
    success: true,
    total: created + skipped + errors,
    created,
    updated: 0,
    skipped,
    errors,
  };
}
