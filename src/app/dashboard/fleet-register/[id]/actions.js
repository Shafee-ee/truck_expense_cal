"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateTruck(id, formData) {
  try {
    await prisma.truck.update({
      where: {
        id,
      },
      data: {
        numberPlate: formData.get("numberPlate")?.trim(),

        vehicleType: formData.get("vehicleType"),

        registrationDate: formData.get("registrationDate")
          ? new Date(formData.get("registrationDate"))
          : null,

        fitnessExpiry: formData.get("fitnessExpiry")
          ? new Date(formData.get("fitnessExpiry"))
          : null,

        roadTaxExpiry: formData.get("roadTaxExpiry")
          ? new Date(formData.get("roadTaxExpiry"))
          : null,

        insuranceExpiry: formData.get("insuranceExpiry")
          ? new Date(formData.get("insuranceExpiry"))
          : null,

        permitExpiry: formData.get("permitExpiry")
          ? new Date(formData.get("permitExpiry"))
          : null,

        nationalPermitExpiry: formData.get("nationalPermitExpiry")
          ? new Date(formData.get("nationalPermitExpiry"))
          : null,
      },
    });

    revalidatePath("/dashboard/fleet-register");
    revalidatePath("/dashboard/fleet-register/" + id);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to update truck.",
    };
  }
}
