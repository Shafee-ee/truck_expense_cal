"use server";

import { processTripImport } from "@/lib/imports/trips/processTripImport";

export async function importTripRows(previousState, formData) {
  const file = formData.get("file");

  if (!file || file.size === 0) {
    throw new Error("Please select a file.");
  }

  const summary = await processTripImport(file);

  return {
    success: true,
    total:
      summary.created + summary.updated + summary.unchanged + summary.errors,
    created: summary.created,
    updated: summary.updated,
    skipped: summary.unchanged,
    errors: summary.errors,
  };
}
