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

  try {
    const existingActiveTrip = await prisma.trip.findFirst({
      where: {
        truckId,
        status: "ACTIVE",
      },
    });

    if (existingActiveTrip) {
      return {
        error: "Truck already has an active trip",
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
