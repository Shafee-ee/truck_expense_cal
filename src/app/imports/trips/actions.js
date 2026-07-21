"use server";

import { processTripImport } from "@/lib/imports/trips/processTripImport";

export async function importTripRows(previousState, formData) {
  const file = formData.get("file");

  if (!file || file.size === 0) {
    throw new Error("Please select a file.");
  }

  const comparison = await processTripImport(file);

  return {
    comparison,
  };
}
