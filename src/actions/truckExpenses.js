"use server";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function deleteTruckExpense(formData) {
  "use server";

  const id = formData.get("id");

  const expense = await prisma.truckExpense.findUnique({
    where: { id },
  });

  if (expense?.documentPath) {
    await supabase.storage.from("expense-bills").remove([expense.documentPath]);
  }

  await prisma.truckExpense.delete({
    where: { id },
  });

  revalidatePath("/dashboard/truck-expenses");
  revalidatePath("/dashboard/truck-summary");
}
