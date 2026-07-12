"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateCompany(formData) {
  try {
    const id = formData.get("id");

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
        NOT: {
          id,
        },
      },
    });

    if (existing) {
      return {
        error: "Company already exists",
      };
    }

    await prisma.company.update({
      where: {
        id,
      },
      data: {
        name,
        isInternal,
      },
    });

    revalidatePath("/dashboard/companies");
    revalidatePath(`/dashboard/companies/${id}`);
    revalidatePath("/trucks/new");
    revalidatePath("/trips/new");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to update company",
    };
  }
}
