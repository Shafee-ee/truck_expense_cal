"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  calculateRevenue,
  calculateExpenses,
  calculateOutstanding,
  calculateBalance,
} from "@/lib/finance";

import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

export async function startTrip(id) {
  await prisma.$transaction(async (tx) => {
    const freshTrip = await tx.trip.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!freshTrip) {
      return {
        error: "Trip not found",
      };
    }

    if (freshTrip.status !== "PLANNED") {
      throw new Error("Only PLANNED trips can be started");
    }

    await tx.trip.update({
      where: { id },
      data: {
        status: "ACTIVE",
        startDate: new Date(),
      },
    });
  });

  revalidatePath(`/trips/${id}`);
  revalidatePath("/trips");
}

//close trip

export async function closeTrip(id) {
  await prisma.$transaction(async (tx) => {
    const freshTrip = await tx.trip.findUnique({
      where: { id },
      include: {
        expenses: true,
        payments: true,
      },
    });

    if (!freshTrip) {
      throw new Error("Trip not found");
    }

    if (freshTrip.status !== "ACTIVE") {
      throw new Error("Only ACTIVE trips can be closed");
    }

    if (freshTrip.closedAt) {
      throw new Error("Trip is already closed");
    }

    if (freshTrip.expenses.length === 0) {
      throw new Error("Cannot close trip without expenses");
    }

    const missingBills = freshTrip.expenses.some((e) => !e.billPath);

    if (missingBills) {
      throw new Error("Cannot close trip until all expense bills are uploaded");
    }

    const revenue = calculateRevenue(freshTrip);

    if (revenue <= 0) {
      throw new Error("Cannot close trip without valid revenue");
    }

    const totalExpenses = calculateExpenses(freshTrip.expenses);

    const balance = calculateBalance(freshTrip);

    await tx.trip.update({
      where: { id },
      data: {
        status: "CLOSED",
        endDate: new Date(),
        closedAt: new Date(),
        closedBy: "operator",
        finalRevenue: revenue,
        finalExpenses: totalExpenses,
        finalBalance: balance,
      },
    });
  });

  revalidatePath(`/trips/${id}`);
  revalidatePath("/trips");
}

export async function updateActualQty(formData) {
  const tripId = formData.get("tripId");
  const actualQty = Number(formData.get("actualQty"));

  if (!tripId) {
    throw new Error("Trip ID missing");
  }

  if (!actualQty || actualQty <= 0) {
    throw new Error("Actual quantity must be greater than 0");
  }

  await prisma.$transaction(async (tx) => {
    const freshTrip = await tx.trip.findUnique({
      where: { id: tripId },
      select: { status: true },
    });

    if (!freshTrip) {
      throw new Error("Trip not found");
    }

    if (freshTrip.status !== "ACTIVE") {
      throw new Error("Only ACTIVE trips can be modified");
    }

    await tx.trip.update({
      where: { id: tripId },
      data: {
        actualQty,
      },
    });
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function addPayment(formData) {
  "use server";

  const tripId = formData.get("tripId");

  if (!tripId) {
    throw new Error("Trip ID missing");
  }

  const paymentAmount = Number(formData.get("amount"));

  if (!paymentAmount || paymentAmount <= 0) {
    return {
      error: "Invalid payment amount",
    };
  }

  const result = await prisma.$transaction(async (tx) => {
    const freshTrip = await tx.trip.findUnique({
      where: { id: tripId },
      include: {
        payments: true,
      },
    });

    if (!freshTrip) {
      return {
        error: "Trip not found",
      };
    }

    if (freshTrip.status !== "ACTIVE" && freshTrip.status !== "CLOSED") {
      return {
        error: "Payments cannot be added to planned trips",
      };
    }

    const outstanding = calculateOutstanding(freshTrip);

    if (paymentAmount > outstanding) {
      return {
        error: `Payment exceeds outstanding balance of ₹${outstanding.toFixed(0)}`,
      };
    }

    const existingPayment = await tx.payment.findFirst({
      where: {
        tripId,
        amount: paymentAmount,
        type: formData.get("type"),
        mode: formData.get("mode"),
      },
    });

    if (existingPayment) {
      return {
        error: "Possible duplicate payment detected",
      };
    }

    await tx.payment.create({
      data: {
        tripId,
        amount: paymentAmount,
        type: formData.get("type"),
        mode: formData.get("mode"),
        paymentDate: new Date(),
        note: formData.get("note") || null,
      },
    });
  });

  if (result?.error) {
    return result;
  }

  revalidatePath(`/trips/${tripId}`);
}

// Delete expense
export async function deleteExpense(formData) {
  "use server";

  const tripId = formData.get("tripId");
  const expenseId = formData.get("expenseId");

  if (!tripId || !expenseId) {
    throw new Error("Missing identifiers");
  }

  await prisma.$transaction(async (tx) => {
    const freshTrip = await tx.trip.findUnique({
      where: { id: tripId },
      select: { status: true },
    });

    if (!freshTrip) {
      return {
        error: "Trip not found",
      };
    }

    if (freshTrip.status !== "ACTIVE") {
      throw new Error("Only ACTIVE trips can be modified");
    }

    const expense = await tx.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    if (expense.tripId !== tripId) {
      throw new Error("Expense does not belong to this trip");
    }

    await tx.expense.delete({
      where: { id: expenseId },
    });
  });

  revalidatePath(`/trips/${tripId}`);
}

// add expense
export async function addExpense(formData) {
  "use server";

  const tripId = formData.get("tripId");
  if (!tripId) {
    return {
      error: "Trip ID missing",
    };
  }

  //assert if trip is editable
  const category = formData.get("category");
  const amount = Number(formData.get("amount"));
  const note = formData.get("note") || null;
  const file = formData.get("bill");

  console.log({
    hasFile: !!file,
    fileType: file?.constructor?.name,
    fileSize: file?.size,
    fileName: file?.name,
  });

  if (!amount || amount <= 0) return;

  let billPath = null;

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop();
    const fileName = `${tripId}/${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("expense-bills")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      throw new Error("Bill upload failed");
    }

    billPath = fileName;
  }
  await prisma.$transaction(async (tx) => {
    const freshTrip = await tx.trip.findUnique({
      where: { id: tripId },
      select: { status: true },
    });

    if (!freshTrip) {
      throw new Error("Trip not found");
    }

    if (freshTrip.status !== "ACTIVE") {
      throw new Error("Only ACTIVE trips can be modified");
    }

    const existingExpense = await tx.expense.findFirst({
      where: {
        tripId,
        category,
        amount,
        note,
      },
    });

    if (existingExpense) {
      throw new Error("Possible duplicate expense detected");
    }

    console.log("billPath:", billPath);

    await tx.expense.create({
      data: {
        tripId,
        category,
        amount,
        expenseDate: new Date(),
        note,
        billPath,
      },
    });
  });

  revalidatePath(`/trips/${tripId}`);
}

//replace bill
export async function replaceBill(formData) {
  "use server";

  const tripId = formData.get("tripId");

  if (!tripId) {
    throw new Error("Trip ID missing");
  }

  const expenseId = formData.get("expenseId");
  const file = formData.get("bill");

  if (!expenseId) {
    throw new Error("Expense ID missing");
  }

  if (!file || file.size === 0) {
    throw new Error("Bill file missing");
  }

  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const fileExt = file.name.split(".").pop();
  const fileName = `${tripId}/${crypto.randomUUID()}.${fileExt}`;

  const { error } = await supabase.storage
    .from("expense-bills")
    .upload(fileName, buffer, {
      contentType: file.type,
    });

  if (error) {
    throw new Error("Bill upload failed");
  }

  await prisma.$transaction(async (tx) => {
    const freshTrip = await tx.trip.findUnique({
      where: { id: tripId },
      select: { status: true },
    });

    if (!freshTrip) {
      throw new Error("Trip not found");
    }

    if (freshTrip.status !== "ACTIVE") {
      throw new Error("Only ACTIVE trips can be modified");
    }

    const expense = await tx.expense.findUnique({
      where: { id: expenseId },
    });

    if (!expense) {
      throw new Error("Expense not found");
    }

    if (expense.tripId !== tripId) {
      throw new Error("Expense does not belong to this trip");
    }

    await tx.expense.update({
      where: { id: expenseId },
      data: {
        billPath: fileName,
      },
    });
  });

  revalidatePath(`/trips/${tripId}`);
}

export async function updateExpense(formData) {
  const expenseId = formData.get("expenseId");

  const category = formData.get("category");
  const amount = Number(formData.get("amount"));
  const note = formData.get("note");

  const expense = await prisma.expense.findUnique({
    where: {
      id: expenseId,
    },
    include: {
      trip: true,
    },
  });

  if (!expense) {
    throw new Error("Expense not found");
  }

  const tripId = expense.tripId;

  await prisma.expense.update({
    where: {
      id: expenseId,
    },
    data: {
      category,
      amount,
      note,
    },
  });

  revalidatePath(`/trips/${tripId}`);
  redirect(`/trips/${tripId}`);
}
