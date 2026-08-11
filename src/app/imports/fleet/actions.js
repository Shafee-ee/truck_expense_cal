"use server";

import { prisma } from "@/lib/prisma";
import { processFleetImport } from "@/lib/imports/fleet/processFleetImport";

const complianceCategories = {
  fitness: "FITNESS",
  roadTax: "ROAD_TAX",
  insurance: "INSURANCE",
  permit: "PERMIT",
  nationalPermit: "NATIONAL_PERMIT",
};

async function saveCompliance(truckId, compliance) {
  const importDate = new Date();

  for (const [key, category] of Object.entries(complianceCategories)) {
    const expiryDate = compliance?.[key];

    console.log("COMPLIANCE DATE:", {
      truckId,
      category,
      key,
      value: expiryDate,
      type: typeof expiryDate,
      isDate: expiryDate instanceof Date,
    });

    if (!expiryDate) {
      continue;
    }

    const existing = await prisma.truckExpense.findFirst({
      where: {
        truckId,
        category,
      },
      orderBy: {
        expenseDate: "desc",
      },
    });

    const data = {
      amount: 0,
      vendor: "Imported from Fleet Register",
      note: "Compliance date imported from Vehicle Details",
      expenseDate: importDate,
      expiryDate,
      month: importDate.getMonth() + 1,
      year: importDate.getFullYear(),
    };

    if (existing) {
      await prisma.truckExpense.update({
        where: {
          id: existing.id,
        },
        data: {
          expiryDate,
        },
      });
    } else {
      await prisma.truckExpense.create({
        data: {
          truckId,
          category,
          ...data,
        },
      });
    }
  }
}

export async function importFleetRows(previousState, formData) {
  const file = formData.get("file");

  if (!file || file.size === 0) {
    throw new Error("Please select a file.");
  }

  const comparison = await processFleetImport(file);

  let created = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const item of comparison) {
    switch (item.action) {
      case "CREATE": {
        const truck = await prisma.truck.create({
          data: {
            numberPlate: item.row.numberPlate,
            vehicleType: item.row.vehicleType,
            registrationDate: item.row.registrationDate,
          },
        });

        await saveCompliance(truck.id, item.row.compliance);

        created++;
        break;
      }

      case "UPDATE": {
        const truck = await prisma.truck.update({
          where: {
            numberPlate: item.row.numberPlate,
          },
          data: {
            vehicleType: item.row.vehicleType,
            registrationDate: item.row.registrationDate,
          },
        });

        await saveCompliance(truck.id, item.row.compliance);

        updated++;
        break;
      }

      case "UNCHANGED": {
        const truck = await prisma.truck.findUnique({
          where: {
            numberPlate: item.row.numberPlate,
          },
        });

        if (truck) {
          await saveCompliance(truck.id, item.row.compliance);
        }

        skipped++;
        break;
      }
    }
  }

  return {
    success: true,
    total: created + updated + skipped + errors,
    created,
    updated,
    skipped,
    errors,
  };
}
