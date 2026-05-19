"use server";

import { prisma } from "@/lib/prisma";

export async function createTruck(formData) {
  try {
    const numberPlate = formData.get("numberPlate")?.trim();

    if (!numberPlate) {
      return {
        error: "Truck number plate is required",
      };
    }

    let company = await prisma.company.findFirst({
      where: {
        name: "Logisco",
      },
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: "Logisco",
        },
      });
    }

    const dailyFixedCost = Number(formData.get("dailyFixedCost"));

    if (!dailyFixedCost || dailyFixedCost <= 0) {
      return {
        error: "Daily fixed cost must be greater than 0",
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
        companyId: company.id,
        dailyFixedCost,
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
