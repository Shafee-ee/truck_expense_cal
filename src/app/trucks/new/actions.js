"use server";

import { prisma } from "@/lib/prisma";

export async function createTruck(formData) {
  try {
    const numberPlate = formData.get("numberPlate")?.trim();

    const vehicleType = formData.get("vehicleType");
    const registrationDate = formData.get("registrationDate");
    const fitnessExpiry = formData.get("fitnessExpiry");
    const roadTaxExpiry = formData.get("roadTaxExpiry");
    const insuranceExpiry = formData.get("insuranceExpiry");
    const permitExpiry = formData.get("permitExpiry");
    const nationalPermitExpiry = formData.get("nationalPermitExpiry");

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

        vehicleType,
        registrationDate: registrationDate ? new Date(registrationDate) : null,

        fitnessExpiry: fitnessExpiry ? new Date(fitnessExpiry) : null,

        roadTaxExpiry: roadTaxExpiry ? new Date(roadTaxExpiry) : null,

        insuranceExpiry: insuranceExpiry ? new Date(insuranceExpiry) : null,

        permitExpiry: permitExpiry ? new Date(permitExpiry) : null,

        nationalPermitExpiry: nationalPermitExpiry
          ? new Date(nationalPermitExpiry)
          : null,
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
