"use server";

import { prisma } from "@/lib/prisma";

export async function createTrip(formData) {
  const truckId = formData.get("truckId");
  const source = formData.get("source");
  const destination = formData.get("destination");

  const estimatedQty = Number(formData.get("estimatedQty")) || null;

  const ratePerUnit = Number(formData.get("ratePerUnit")) || null;

  const grossAmount = Number(formData.get("grossAmount")) || null;

  const calculatedRevenue = (estimatedQty || 0) * (ratePerUnit || 0);

  if (
    grossAmount &&
    calculatedRevenue > 0 &&
    Math.abs(grossAmount - calculatedRevenue) > 1
  ) {
    console.warn(
      `Gross Amount (${grossAmount}) differs from Qty × Rate (${calculatedRevenue})`,
    );
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
        error: "Truck already has an active trip",
      };
    }

    await prisma.trip.create({
      data: {
        truckId,
        source,
        destination,
        estimatedQty,
        ratePerUnit,
        grossAmount,
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
