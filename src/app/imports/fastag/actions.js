"use server";

import { revalidatePath } from "next/cache";
import { parseFastagFile } from "@/lib/imports/fastag/parser";
import { mapFastagRows } from "@/lib/imports/fastag/mapper";
import { previewFastagRows } from "@/lib/imports/fastag/preview";
import { importFastagRows } from "@/lib/imports/fastag/importer";

export async function previewFastagImport(_, formData) {
  const file = formData.get("file");
  const truckNumberPlate = formData.get("truckNumberPlate");

  if (!file || file.size === 0) {
    return {
      success: false,
      error: "Please select a FASTag statement.",
    };
  }

  if (!truckNumberPlate) {
    return {
      success: false,
      error: "Truck number is required.",
    };
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer());

    const rows = await parseFastagFile(buffer);

    const mappedRows = mapFastagRows(rows);
    const preview = await previewFastagRows(mappedRows, truckNumberPlate);

    return {
      success: true,
      preview,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to preview FASTag statement.",
    };
  }
}

export async function importFastagImport(_, formData) {
  const tripId = formData.get("tripId");
  const rows = formData.get("rows");

  if (!tripId) {
    return {
      success: false,
      error: "Trip ID is required.",
    };
  }

  if (!rows) {
    return {
      success: false,
      error: "No rows selected for import.",
    };
  }

  try {
    const result = await importFastagRows(tripId, JSON.parse(rows));

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
      message: `Imported ${result.created} toll expenses.`,
      ...result,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to import FASTag statement.",
    };
  }
}
