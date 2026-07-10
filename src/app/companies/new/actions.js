"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createCompany(formData) {
  try {
    const name = formData.get("name")?.trim();

    const isInternal = formData.get("isInternal") === "true";

    if (!name) {
      return {
        error: "Company name is required",
      };
    }

    const existing = await prisma.company.findFirst({
      where: {
        name: {
          equals: name,
          mode: "insensitive",
        },
      },
    });

    if (existing) {
      return {
        error: "Company already exists",
      };
    }

    await prisma.company.create({
      data: {
        name,
        isInternal,
      },
    });

    revalidatePath("/companies");
    revalidatePath("/trucks/new");
    revalidatePath("/trips/new");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to create company",
    };
  }
}
