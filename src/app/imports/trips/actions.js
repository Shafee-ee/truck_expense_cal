"use server";

import { processTripImport } from "@/lib/imports/trips/processTripImport";

export async function importTripRows(previousState, formData) {
  const file = formData.get("file");

  if (!file || file.size === 0) {
    throw new Error("Please select a file.");
  }

  const comparison = await processTripImport(file);

  let created = 0;
  let updated = 0;
  let skipped = 0;

  comparison.forEach((item) => {
    switch (item.action) {
      case "CREATE":
        created++;
        break;

      case "UPDATE":
        updated++;
        break;

      case "UNCHANGED":
        skipped++;
        break;
    }
  });

  return {
    success: true,
    total: created + updated + skipped,
    created,
    updated,
    skipped,
    errors: 0,
    comparison,
  };
}
