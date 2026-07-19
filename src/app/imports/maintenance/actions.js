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

  const period = rawRows[0][0];
  const startDate = period.split(" TO ")[0];

  const [day, month, year] = startDate.split("/").map(Number);

  const expenseDate = new Date(year, month - 1, day);

  const truckNumbers = rawRows[0];
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

  for (const row of expenseRows) {
    const label = row[0];

    if (!label) continue;

    for (let i = 1; i < truckNumbers.length; i++) {
      const truckNumber = truckNumbers[i];
      const amount = row[i];

      if (!truckNumber || !amount) continue;

      const truckId = truckMap.get(truckNumber);

      if (!truckId) {
        console.warn(`Truck not found: ${truckNumber}`);
        continue;
      }

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
    imported: expenses.length,
  };
}
