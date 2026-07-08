"use server";

import { prisma } from "@/lib/prisma";

export async function createTrip(formData) {
  const truckId = formData.get("truckId");
  const source = formData.get("source");
  const destination = formData.get("destination");

  const revenueMode = formData.get("revenueMode");
  const loadType = formData.get("loadType");

  const mamool =
    loadType === "COMPANY"
      ? 0
      : Math.min(Number(formData.get("mamool")) || 0, 3000);

  const estimatedQty = Number(formData.get("estimatedQty")) || null;
  const ratePerUnit = Number(formData.get("ratePerUnit")) || null;
  const grossAmount = Number(formData.get("grossAmount")) || null;

  // These will eventually move to Settlement
  const customerDiesel = Number(formData.get("customerDiesel")) || 0;
  const customerAdvance = Number(formData.get("customerAdvance")) || 0;
  const tds = Number(formData.get("tds")) || 0;
  const charges = Number(formData.get("charges")) || 0;
  const damageAmount = Number(formData.get("damageAmount")) || 0;
  const damageNotes = formData.get("damageNotes") || null;
  const billNumber = formData.get("billNumber") || null;

  // Basic validation
  if (!truckId) {
    return { error: "Truck is required." };
  }

  if (!source?.trim()) {
    return { error: "Source is required." };
  }

  if (!destination?.trim()) {
    return { error: "Destination is required." };
  }

  if (revenueMode === "VARIABLE") {
    if (!estimatedQty || estimatedQty <= 0) {
      return { error: "Quantity must be greater than zero." };
    }

    if (!ratePerUnit || ratePerUnit <= 0) {
      return { error: "Rate must be greater than zero." };
    }
  }

  if (revenueMode === "FIXED") {
    if (!grossAmount || grossAmount <= 0) {
      return { error: "Freight amount must be greater than zero." };
    }
  }

  try {
    const existingActiveTrip = await prisma.trip.findFirst({
      where: {
        truckId,
        status: "ACTIVE",
      },
    });

    if (existingActiveTrip) {
      return {
        error: "Truck already has an active trip.",
      };
    }

    await prisma.trip.create({
      data: {
        truckId,
        source,
        destination,

        loadType,
        revenueMode,

        estimatedQty,
        ratePerUnit,
        grossAmount,

        customerDiesel,
        customerAdvance,
        tds,
        charges,
        damageAmount,
        damageNotes,
        billNumber,

        gcBalance:
          (grossAmount || 0) -
          customerDiesel -
          customerAdvance -
          tds -
          charges -
          damageAmount,

        mamool,

        status: "PLANNED",
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to create trip",
    };
  }
}
