"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
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

export async function startTrip(id, startDate) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const freshTrip = await tx.trip.findUnique({
        where: { id },
        select: {
          status: true,
        },
      });

      if (!freshTrip) {
        return {
          error: "Trip not found",
        };
      }

      if (freshTrip.status !== "PLANNED") {
        return {
          error: "Only PLANNED trips can be started",
        };
      }

      await tx.trip.update({
        where: { id },
        data: {
          status: "ACTIVE",
          startDate: new Date(startDate),
        },
      });

      return {
        success: true,
      };
    });

    if (result?.error) {
      return result;
    }

    revalidatePath(`/trips/${id}`);
    revalidatePath("/trips");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to start trip",
    };
  }
}
//close trip

export async function closeTrip(id, endDate) {
  try {
    const result = await prisma.$transaction(async (tx) => {
      const freshTrip = await tx.trip.findUnique({
        where: { id },
        include: {
          expenses: true,
          payments: true,
        },
      });

      if (!freshTrip) {
        return {
          error: "Trip not found",
        };
      }

      if (freshTrip.status !== "ACTIVE") {
        return {
          error: "Only ACTIVE trips can be closed",
        };
      }

      if (freshTrip.closedAt) {
        return {
          error: "Trip is already closed",
        };
      }

      if (freshTrip.expenses.length === 0) {
        return {
          error: "Cannot close trip without expenses",
        };
      }

      const missingBills = freshTrip.expenses.some((e) => !e.billPath);

      if (missingBills) {
        return {
          error: "Cannot close trip until all expense bills are uploaded",
        };
      }

      const revenue = calculateRevenue(freshTrip);

      if (revenue <= 0) {
        return {
          error: "Cannot close trip without valid revenue",
        };
      }

      const totalExpenses = calculateExpenses(freshTrip.expenses);

      const balance = calculateBalance(freshTrip);

      await tx.trip.update({
        where: { id },
        data: {
          status: "CLOSED",
          endDate: new Date(endDate),
          closedAt: new Date(),
          closedBy: "operator",
          finalRevenue: revenue,
          finalExpenses: totalExpenses,
          finalBalance: balance,
        },
      });

      return {
        success: true,
      };
    });

    if (result?.error) {
      return result;
    }

    revalidatePath(`/trips/${id}`);
    revalidatePath("/trips");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to close trip",
    };
  }
}

export async function updateActualQty(formData) {
  const tripId = formData.get("tripId");

  const actualQty = Number(formData.get("actualQty"));

  try {
    if (!tripId) {
      return {
        error: "Trip ID missing",
      };
    }

    if (!actualQty || actualQty <= 0) {
      return {
        error: "Actual quantity must be greater than 0",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const freshTrip = await tx.trip.findUnique({
        where: { id: tripId },
        select: {
          status: true,
        },
      });

      if (!freshTrip) {
        return {
          error: "Trip not found",
        };
      }

      if (freshTrip.status !== "ACTIVE") {
        return {
          error: "Only ACTIVE trips can be modified",
        };
      }

      await tx.trip.update({
        where: { id: tripId },
        data: {
          actualQty,
        },
      });

      return {
        success: true,
      };
    });

    if (result?.error) {
      return result;
    }

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to update actual quantity",
    };
  }
}

export async function updateMamool(formData) {
  const tripId = formData.get("tripId");

  const mamool = Math.min(Number(formData.get("mamool")) || 0, 3000);

  try {
    if (!tripId) {
      return {
        error: "Trip missing",
      };
    }

    await prisma.trip.update({
      where: {
        id: tripId,
      },
      data: {
        mamool,
      },
    });

    revalidatePath(`/trips/${tripId}`);
    revalidatePath("/dashboard");
    revalidatePath("/trips");

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed updating mamool",
    };
  }
}

//add payment
export async function addPayment(formData) {
  "use server";

  const tripId = formData.get("tripId");

  if (!tripId) {
    return {
      error: "Trip ID missing",
    };
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

//delete payment
export async function deletePayment(formData) {
  "use server";

  const tripId = formData.get("tripId");

  const paymentId = formData.get("paymentId");

  try {
    if (!tripId || !paymentId) {
      return {
        error: "Missing identifiers",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const payment = await tx.payment.findUnique({
        where: {
          id: paymentId,
        },
      });

      if (!payment) {
        return {
          error: "Payment not found",
        };
      }

      if (payment.tripId !== tripId) {
        return {
          error: "Payment does not belong to this trip",
        };
      }

      await tx.payment.delete({
        where: {
          id: paymentId,
        },
      });

      return {
        success: true,
      };
    });

    if (result?.error) {
      return result;
    }

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to delete payment",
    };
  }
}

// Delete expense
export async function deleteExpense(formData) {
  "use server";

  const tripId = formData.get("tripId");

  const expenseId = formData.get("expenseId");

  try {
    if (!tripId || !expenseId) {
      return {
        error: "Missing identifiers",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const freshTrip = await tx.trip.findUnique({
        where: { id: tripId },
        select: {
          status: true,
        },
      });

      if (!freshTrip) {
        return {
          error: "Trip not found",
        };
      }

      if (freshTrip.status !== "ACTIVE") {
        return {
          error: "Only ACTIVE trips can be modified",
        };
      }

      const expense = await tx.expense.findUnique({
        where: { id: expenseId },
      });

      if (!expense) {
        return {
          error: "Expense not found",
        };
      }

      if (expense.tripId !== tripId) {
        return {
          error: "Expense does not belong to this trip",
        };
      }

      await tx.expense.delete({
        where: { id: expenseId },
      });

      return {
        success: true,
      };
    });

    if (result?.error) {
      return result;
    }

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to delete expense",
    };
  }
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

  if (!amount || amount <= 0) {
    return {
      error: "Invalid expense amount",
    };
  }
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
      return {
        error: "Bill upload failed",
      };
    }

    billPath = fileName;
  }
  const result = await prisma.$transaction(async (tx) => {
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
      return {
        error: "Only ACTIVE trips can be modified",
      };
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
  if (result?.error) {
    return result;
  }
  revalidatePath(`/trips/${tripId}`);
}

//replace bill
export async function replaceBill(formData) {
  "use server";

  const tripId = formData.get("tripId");

  const expenseId = formData.get("expenseId");

  const file = formData.get("bill");

  try {
    if (!tripId) {
      return {
        error: "Trip ID missing",
      };
    }

    if (!expenseId) {
      return {
        error: "Expense ID missing",
      };
    }

    if (!file || file.size === 0) {
      return {
        error: "Bill file missing",
      };
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
      console.error(error);

      return {
        error: "Bill upload failed",
      };
    }

    const result = await prisma.$transaction(async (tx) => {
      const freshTrip = await tx.trip.findUnique({
        where: { id: tripId },
        select: {
          status: true,
        },
      });

      if (!freshTrip) {
        return {
          error: "Trip not found",
        };
      }

      if (freshTrip.status !== "ACTIVE") {
        return {
          error: "Only ACTIVE trips can be modified",
        };
      }

      const expense = await tx.expense.findUnique({
        where: {
          id: expenseId,
        },
      });

      if (!expense) {
        return {
          error: "Expense not found",
        };
      }

      if (expense.tripId !== tripId) {
        return {
          error: "Expense does not belong to this trip",
        };
      }

      await tx.expense.update({
        where: {
          id: expenseId,
        },
        data: {
          billPath: fileName,
        },
      });

      return {
        success: true,
      };
    });

    if (result?.error) {
      return result;
    }

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to replace bill",
    };
  }
}
export async function updateExpense(formData) {
  const expenseId = formData.get("expenseId");

  const category = formData.get("category");

  const amount = Number(formData.get("amount"));

  const note = formData.get("note");

  try {
    if (!expenseId) {
      return {
        error: "Expense ID missing",
      };
    }

    if (!amount || amount <= 0) {
      return {
        error: "Amount must be greater than 0",
      };
    }

    const expense = await prisma.expense.findUnique({
      where: {
        id: expenseId,
      },
      include: {
        trip: true,
      },
    });

    if (!expense) {
      return {
        error: "Expense not found",
      };
    }

    const tripId = expense.tripId;

    if (expense.trip.status !== "ACTIVE") {
      return {
        error: "Only ACTIVE trips can be modified",
      };
    }

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

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to update expense",
    };
  }
}

export async function updateSettlement(tripId, formData) {
  try {
    const clientName = formData.get("clientName") || null;

    const billNumber = formData.get("billNumber") || null;

    const grossAmount = Number(formData.get("grossAmount")) || 0;

    const customerDiesel = Number(formData.get("customerDiesel")) || 0;

    const customerAdvance = Number(formData.get("customerAdvance")) || 0;

    const tds = Number(formData.get("tds")) || 0;

    const charges = Number(formData.get("charges")) || 0;

    const damageAmount = Number(formData.get("damageAmount")) || 0;

    const damageNotes = formData.get("damageNotes") || null;

    const gcBalance =
      grossAmount -
      customerDiesel -
      customerAdvance -
      tds -
      charges -
      damageAmount;

    await prisma.trip.update({
      where: {
        id: tripId,
      },

      data: {
        clientName,
        billNumber,

        grossAmount,

        customerDiesel,
        customerAdvance,

        tds,
        charges,

        damageAmount,
        damageNotes,

        gcBalance,
      },
    });

    revalidatePath(`/trips/${tripId}`);

    return {
      success: true,
    };
  } catch (error) {
    console.error(error);

    return {
      error: "Failed to update settlement",
    };
  }
}
