"use server";

import { prisma } from "@/lib/prisma";

export async function createTruck(formData) {
  try {
    const numberPlate = formData.get("numberPlate")?.trim();

    const vehicleType = formData.get("vehicleType");
    const companyId = formData.get("companyId");
    const registrationDate = formData.get("registrationDate");

    if (!numberPlate) {
      return {
        error: "Truck number plate is required",
      };
    }
    if (!companyId) {
      return {
        error: "Owner company is required",
      };
    }

    const existingTruck = await prisma.truck.findFirst({
      where: {
        numberPlate,
      },
    });

    if (existingTruck) {
      return {
        error: "Truck with this number plate already exists",
      };
    }

    await prisma.truck.create({
      data: {
        numberPlate,
        companyId,
        vehicleType,
        registrationDate: registrationDate ? new Date(registrationDate) : null,
      },
    });

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to create truck",
    };
  }
}
