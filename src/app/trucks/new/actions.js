"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createTruck(formData) {
  try {
    const numberPlate = formData.get("numberPlate")?.trim();

    const vehicleType = formData.get("vehicleType");
    const companyId = formData.get("companyId");
    const companyName = formData.get("companyName")?.trim();
    const registrationDate = formData.get("registrationDate");

    if (!numberPlate) {
      return {
        error: "Truck number plate is required",
      };
    }
    if (!companyId && !companyName) {
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

    let finalCompanyId = companyId;

    if (!finalCompanyId) {
      let company = await prisma.company.findFirst({
        where: {
          name: {
            equals: companyName,
            mode: "insensitive",
          },
        },
      });

      if (!company) {
        return {
          error: "Company does not exist. Please create it first.",
        };
      }

      finalCompanyId = company.id;
    }

    await prisma.truck.create({
      data: {
        numberPlate,
        companyId: finalCompanyId,
        vehicleType,
        registrationDate: registrationDate ? new Date(registrationDate) : null,
      },
    });

    revalidatePath("/trucks");
    revalidatePath("/trips/new");

    return {
      success: true,
    };
  } catch (error) {
    return {
      error: "Failed to create truck",
    };
  }
}
