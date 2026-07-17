"use server";
import { prisma } from "@/lib/prisma";
import { processFleetImport } from "@/lib/imports/fleet/processFleetImport";

export async function previewFleetImport(previousState, formData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select an Excel file.");
  }

  const comparison = await processFleetImport(file);

  return {
    summary: {
      total: comparison.length,
      create: comparison.filter((r) => r.action === "CREATE").length,
      update: comparison.filter((r) => r.action === "UPDATE").length,
      unchanged: comparison.filter((r) => r.action === "UNCHANGED").length,
      errors: comparison.filter((r) => r.action === "ERROR").length,
    },
    rows: comparison,
  };
}

export async function importFleetRows(previousState, formData) {
  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select an Excel file.");
  }

  const comparison = await processFleetImport(file);
  let created = 0;
  let updated = 0;
  let skipped = 0;

  for (const item of comparison) {
    switch (item.action) {
      case "CREATE":
        await prisma.truck.create({
          data: {
            numberPlate: item.row.numberPlate,
            vehicleType: item.row.vehicleType,
            registrationDate: item.row.registrationDate,
          },
        });

        created++;
        break;

      case "UPDATE":
        await prisma.truck.update({
          where: {
            numberPlate: item.row.numberPlate,
          },
          data: {
            vehicleType: item.row.vehicleType,
            registrationDate: item.row.registrationDate,
          },
        });

        updated++;
        break;

      case "UNCHANGED":
        skipped++;
        break;
    }
  }

  return {
    created,
    updated,
    skipped,
  };
}
