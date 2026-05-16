export const runtime = "nodejs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

import {
  calculateRevenue,
  calculateExpenses,
  calculatePayments,
  calculateOutstanding,
  calculateBalance,
} from "@/lib/finance";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function getSignedUrl(path) {
  const { data } = await supabase.storage
    .from("bills")
    .createSignedUrl(path, 60 * 10);

  return data?.signedUrl || null;
}
export default async function TripDetailPage(props) {
  const { id } = await props.params;

  const searchParams = await props.searchParams;

  const editingExpenseId = searchParams.editExpense;
  console.log("ID:", id);

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      truck: true,
      expenses: true,
      payments: true,
    },
  });

  if (!trip) notFound();

  const revenue =
    trip.status === "CLOSED" ? trip.finalRevenue || 0 : calculateRevenue(trip);
  const totalExpenses =
    trip.status === "CLOSED"
      ? trip.finalExpenses || 0
      : calculateExpenses(trip.expenses);
  const expensesBreakdown = (trip.expenses ?? []).reduce((acc, curr) => {
    if (!acc[curr.category]) {
      acc[curr.category] = 0;
    }
    acc[curr.category] += curr.amount;

    return acc;
  }, {});

  const totalPayments = calculatePayments(trip.payments);

  const outstanding = calculateOutstanding(trip);
  const hasRevenue = revenue > 0;
  const hasOutstanding = outstanding > 0;
  const canClose = hasRevenue && !hasOutstanding && trip.expenses.length > 0;

  const balance =
    trip.status === "CLOSED" ? trip.finalBalance || 0 : calculateBalance(trip);

  //startTrip
  async function startTrip() {
    "use server";

    await prisma.$transaction(async (tx) => {
      const freshTrip = await tx.trip.findUnique({
        where: { id },
        select: { status: true },
      });

      if (!freshTrip) {
        throw new Error("Trip not found");
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
  async function closeTrip() {
    "use server";

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
        throw new Error(
          "Cannot close trip until all expense bills are uploaded",
        );
      }

      const revenue = calculateRevenue(freshTrip);

      if (revenue <= 0) {
        throw new Error("Cannot close trip without valid revenue");
      }

      const outstanding = calculateOutstanding(freshTrip);

      if (outstanding > 0) {
        throw new Error(
          `Cannot close trip. ₹${outstanding.toFixed(0)} still outstanding.`,
        );
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

  //update actual quantity
  async function updateActualQty(formData) {
    "use server";

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

  // add expense
  async function addExpense(formData) {
    "use server";

    const tripId = formData.get("tripId");
    if (!tripId) {
      throw new Error("Trip ID missing");
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
        .from("bills")
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
  async function replaceBill(formData) {
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

    const fileExt = file.name.split(".").pop();
    const fileName = `${tripId}/${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("bills")
      .upload(fileName, file, {
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

  //add payment just fixed
  async function addPayment(formData) {
    "use server";

    const tripId = formData.get("tripId");

    if (!tripId) {
      throw new Error("Trip ID missing");
    }

    const paymentAmount = Number(formData.get("amount"));

    if (!paymentAmount || paymentAmount <= 0) {
      throw new Error("Invalid payment amount");
    }

    await prisma.$transaction(async (tx) => {
      const freshTrip = await tx.trip.findUnique({
        where: { id: tripId },
        include: {
          payments: true,
        },
      });

      if (!freshTrip) {
        throw new Error("Trip not found");
      }

      if (freshTrip.status !== "ACTIVE") {
        throw new Error("Only ACTIVE trips can be modified");
      }

      const outstanding = calculateOutstanding(freshTrip);

      if (paymentAmount > outstanding) {
        throw new Error(
          `Payment exceeds outstanding balance of ₹${outstanding.toFixed(0)}`,
        );
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
        throw new Error("Possible duplicate payment detected");
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

    revalidatePath(`/trips/${tripId}`);
  }

  // Delete expense
  async function deleteExpense(formData) {
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

      await tx.expense.delete({
        where: { id: expenseId },
      });
    });

    revalidatePath(`/trips/${tripId}`);
  }

  return (
    <div className="min-h-screen bg-zinc-100 p-6">
      <div className="space-y-6">
        <div>
          <Link
            href="/trips"
            className="
      inline-flex
      items-center
      rounded-lg
      border
      border-zinc-300
      bg-white
      px-4
      py-2
      text-sm
      font-medium
      text-zinc-700
      transition
      hover:bg-zinc-50
    "
          >
            ← Back to Trips
          </Link>
        </div>
        {/*Trip detail and status*/}
        <div className="rounded-xl border border-zinc-200 bg-white shadow-sm">
          <div className="border-b border-zinc-200 px-6 py-5">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-semibold text-zinc-800">
                  {trip.source} → {trip.destination}
                </h1>

                <p className="mt-1 text-sm text-zinc-500">
                  Operational trip details and financial tracking
                </p>
              </div>

              <span
                className={`
          rounded-full
          px-3
          py-1
          text-xs
          font-semibold
          ${
            trip.status === "ACTIVE"
              ? "bg-amber-100 text-amber-700 border border-amber-200"
              : trip.status === "CLOSED"
                ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                : "bg-zinc-100 text-zinc-600 border border-zinc-200"
          }
        `}
              >
                {trip.status}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-6 px-6 py-5 text-sm">
            <div>
              <p className="text-zinc-500">Truck</p>
              <p className="mt-1 font-medium text-zinc-800">
                {trip.truck.numberPlate}
              </p>
            </div>

            <div>
              <p className="text-zinc-500">Start Date</p>
              <p className="mt-1 font-medium text-zinc-800">
                {trip.startDate
                  ? new Date(trip.startDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-zinc-500">End Date</p>
              <p className="mt-1 font-medium text-zinc-800">
                {trip.endDate
                  ? new Date(trip.endDate).toLocaleDateString()
                  : "-"}
              </p>
            </div>

            <div>
              <p className="text-zinc-500">Trip Status</p>
              <p className="mt-1 font-medium text-zinc-800">{trip.status}</p>
            </div>
          </div>
        </div>

        {/* Financial Summary */}
        <div className="grid grid-cols-4 gap-4">
          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Revenue</p>

            <div className="mt-2 flex items-center gap-2">
              <p className="text-2xl font-semibold text-zinc-800">
                ₹{revenue.toFixed(0)}
              </p>

              {trip.grossAmount ? (
                <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  Gross Amount
                </span>
              ) : (
                <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                  Qty × Rate
                </span>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Expenses</p>

            <p className="mt-2 text-2xl font-semibold text-red-600">
              ₹{totalExpenses.toFixed(0)}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Balance</p>

            <p
              className={`mt-2 text-2xl font-semibold ${
                balance >= 0 ? "text-emerald-600" : "text-red-600"
              }`}
            >
              ₹{balance.toFixed(0)}
            </p>
          </div>

          <div className="rounded-xl border border-zinc-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-zinc-500">Outstanding</p>

            <p
              className={`mt-2 text-2xl font-semibold ${
                outstanding > 0 ? "text-amber-600" : "text-emerald-600"
              }`}
            >
              ₹{outstanding.toFixed(0)}
            </p>

            <p className="mt-1 text-xs text-zinc-500">
              Received: ₹{totalPayments.toFixed(0)}
            </p>
          </div>
        </div>

        {trip.status === "ACTIVE" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-zinc-800">
                Actual Quantity
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Update delivered quantity for final revenue calculation
              </p>
            </div>
            <form action={updateActualQty} className="flex items-end gap-3">
              <input type="hidden" name="tripId" value={id} />
              <input
                name="actualQty"
                type="number"
                step="0.01"
                defaultValue={trip.actualQty ?? ""}
                placeholder="Enter actual quantity"
                className="
  h-10
  w-64
  rounded-lg
  border
  border-zinc-300
  bg-white
  px-3
  text-sm
  text-zinc-700
  outline-none
  focus:border-amber-400
"
                required
              />
              <button
                className="
  h-10
  rounded-lg
  bg-zinc-900
  px-4
  text-sm
  font-medium
  text-white
  transition
  hover:bg-zinc-800
"
              >
                Update Quantity
              </button>
            </form>
          </div>
        )}
        {/*Trip Lifecyle Action*/}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          {trip.status === "PLANNED" && (
            <form action={startTrip}>
              <button className="bg-blue-600 text-white px-4 py-2">
                Start Trip
              </button>
            </form>
          )}
          {trip.status === "ACTIVE" && (
            <details className="rounded-lg border border-red-200 bg-red-50">
              <summary
                className="
    cursor-pointer
    list-none
    px-5
    py-4
    text-sm
    font-semibold
    text-red-700
  "
              >
                Review & Close Trip
              </summary>
              <div className="border-t border-red-200 px-5 py-5 text-sm">
                <p className="font-medium text-red-700">
                  Note: This action is final. Once closed, this trip cannot be
                  edited.
                </p>
                <ul className="space-y-2 text-zinc-700">
                  <li>•Truck is correct</li>
                  <li>•Route is correct</li>
                  <li>•All expenses are entered</li>
                  <li>•All bills are uploaded</li>
                  <li>•Revenue and balance look correct</li>
                </ul>
                {!hasRevenue && (
                  <p className="text-red-600 font-semibold">
                    Cannot close trip: Actual quantity is missing, so revenue is
                    0.
                  </p>
                )}
                {hasOutstanding && (
                  <p className="text-red-600 font-semibold">
                    Cannot close trip- ₹{outstanding.toFixed(0)} is still
                    outstanding.
                  </p>
                )}
                <form action={closeTrip}>
                  <button
                    disabled={!canClose}
                    className={`mt-4 h-11 rounded-lg px-5 text-sm font-medium text-white transition ${
                      canClose
                        ? "bg-red-600 hover:bg-red-700"
                        : "bg-zinc-300 cursor-not-allowed"
                    }`}
                  >
                    Confirm & close
                  </button>
                </form>
              </div>
            </details>
          )}
        </div>
        {/*expense management for ACTIVE trip*/}
        {trip.status === "ACTIVE" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-zinc-800">
                Expense Management
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Record operational trip expenses and upload supporting bills
              </p>
            </div>{" "}
            {Object.keys(expensesBreakdown).length > 0 && (
              <div className="bg-white p-4 rounded border mb-4">
                <h3 className="font-semibold mb-2">Running Expense Totals</h3>

                <div className="space-y-1 text-sm">
                  {Object.entries(expensesBreakdown).map(
                    ([category, amount]) => (
                      <div key={category} className="flex justify-between">
                        <span>{category}</span>

                        <span>₹{amount.toFixed(0)}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            )}
            <form action={addExpense} className="grid grid-cols-2 gap-4">
              <input type="hidden" name="tripId" value={id} />
              <select
                name="category"
                className="
    h-11
    rounded-lg
    border
    border-zinc-300
    bg-white
    px-3
    text-sm
    text-zinc-700
    outline-none
    focus:border-amber-400
  "
                required
              >
                {" "}
                <option value="">Select Category</option>
                <option value="FUEL">Fuel</option>
                <option value="TOLL">Toll</option>
                <option value="BROKER">Broker / Mamool</option>
                <option value="POLICE">Police</option>
                <option value="LOADING">Loading</option>
                <option value="UNLOADING">Unloading</option>
                <option value="REPAIR">Repair</option>
                <option value="OTHER">Other</option>
              </select>
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="Amount"
                className="
  h-11
  rounded-lg
  border
  border-zinc-300
  bg-white
  px-3
  text-sm
  text-zinc-700
  outline-none
  focus:border-amber-400
"
                required
              />

              <input
                name="note"
                placeholder="Note (optional)"
                className="
  h-11
  rounded-lg
  border
  border-zinc-300
  bg-white
  px-3
  text-sm
  text-zinc-700
  outline-none
  focus:border-amber-400
"
              />

              <input
                type="file"
                name="bill"
                accept="image/*,application/pdf"
                className="
  flex
  h-11
  items-center
  rounded-lg
  border
  border-zinc-300
  bg-white
  px-3
  text-sm
  text-zinc-600
"
              />

              <button
                className="
  col-span-2
  h-11
  rounded-lg
  bg-zinc-900
  px-4
  text-sm
  font-medium
  text-white
  transition
  hover:bg-zinc-800
"
              >
                Add Expense
              </button>
            </form>
            {trip.expenses.length > 0 && (
              <div className="mt-6 border-t border-zinc-200 pt-6">
                {" "}
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-zinc-800">
                    Expense Ledger
                  </h2>

                  <span className="text-sm text-zinc-500">
                    {trip.expenses.length} entries
                  </span>
                </div>
                <table className="w-full overflow-hidden rounded-lg text-sm">
                  <thead className="bg-zinc-50 text-zinc-500">
                    <tr className="border-b border-zinc-200">
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                        Category
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wide">
                        Amount
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                        Note
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {await Promise.all(
                      trip.expenses.map(async (e) => {
                        const signedUrl = e.billPath
                          ? await getSignedUrl(e.billPath)
                          : null;

                        return (
                          <tr
                            key={e.id}
                            className={`border-b border-zinc-100 hover:bg-zinc-50 transition ${
                              !e.billPath ? "bg-red-50" : ""
                            }`}
                          >
                            <td className="px-4 py-3 text-zinc-600">
                              {new Date(e.expenseDate).toLocaleDateString()}
                            </td>
                            <td className="px-4 py-3 text-sm">{e.category}</td>
                            <td className="px-4 py-3 text-right font-medium text-zinc-800">
                              ₹{e.amount}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {e.note || "-"}
                            </td>
                            <td className="px-4 py-3 text-sm">
                              {!signedUrl && (
                                <span className="text-xs text-red-500 mr-2">
                                  No Bill
                                </span>
                              )}
                              {signedUrl && (
                                <a
                                  href={signedUrl}
                                  target="_blank"
                                  className="text-blue-600 underline mr-2"
                                >
                                  View Bill
                                </a>
                              )}

                              {trip.status === "ACTIVE" && (
                                <>
                                  <form
                                    action={replaceBill}
                                    className="mt-2 flex items-center gap-2"
                                  >
                                    <input
                                      type="hidden"
                                      name="tripId"
                                      value={id}
                                    />
                                    <input
                                      type="hidden"
                                      name="expenseId"
                                      value={e.id}
                                    />
                                    <label
                                      className="
    rounded
    border
    border-zinc-300
    px-2
    py-1
    text-xs
    text-zinc-600
    cursor-pointer
    hover:bg-zinc-50
  "
                                    >
                                      {" "}
                                      Replace Bill
                                    </label>
                                    <input
                                      type="file"
                                      name="bill"
                                      accept="image/*,application/pdf"
                                      className="text-xs text-zinc-500"
                                    />
                                    <button
                                      className="
    rounded
    bg-zinc-900
    px-2
    py-1
    text-xs
    font-medium
    text-white
    hover:bg-zinc-800
  "
                                    >
                                      {" "}
                                      Upload
                                    </button>
                                  </form>

                                  <Link
                                    href={`/trips/${id}?editExpense=${e.id}`}
                                    className="
    inline-flex
    rounded-md
    border
    border-zinc-300
    px-3
    py-1.5
    text-xs
    font-medium
    text-zinc-700
    transition
    hover:bg-zinc-100
    ml-2
  "
                                  >
                                    Edit
                                  </Link>

                                  <form
                                    action={deleteExpense}
                                    className="inline ml-2"
                                  >
                                    <input
                                      type="hidden"
                                      name="tripId"
                                      value={id}
                                    />
                                    <input
                                      type="hidden"
                                      name="expenseId"
                                      value={e.id}
                                    />
                                    <button
                                      className="
    text-xs
    font-medium
    text-red-600
    hover:text-red-700
  "
                                    >
                                      {" "}
                                      Delete
                                    </button>
                                  </form>
                                </>
                              )}
                            </td>
                          </tr>
                        );
                      }),
                    )}
                  </tbody>
                  <tfoot>
                    <tr className="font-semibold border-t">
                      <td colSpan="2" className="px-4 py-3">
                        Total
                      </td>

                      <td className="px-4 py-3 text-right font-semibold">
                        {" "}
                        ₹{totalExpenses.toFixed(0)}
                      </td>

                      <td></td>
                      <td></td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>
        )}
        {/* Payment Management */}
        {trip.status === "ACTIVE" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-5">
              <h2 className="text-lg font-semibold text-zinc-800">
                Payment Management
              </h2>

              <p className="mt-1 text-sm text-zinc-500">
                Record incoming customer payments and settlements
              </p>
            </div>
            <form action={addPayment} className="grid grid-cols-2 gap-4">
              <input type="hidden" name="tripId" value={id} />
              <input
                name="amount"
                type="number"
                step="0.01"
                placeholder="Amount"
                className="
  h-11
  rounded-lg
  border
  border-zinc-300
  bg-white
  px-3
  text-sm
  text-zinc-700
  outline-none
  focus:border-amber-400
"
                required
              />
              <select
                name="type"
                className="
  h-11
  rounded-lg
  border
  border-zinc-300
  bg-white
  px-3
  text-sm
  text-zinc-700
  outline-none
  focus:border-amber-400
"
                required
              >
                <option value="">Payment Type</option>
                <option value="ADVANCE">Advance</option>
                <option value="SETTLEMENT">Settlement</option>
              </select>
              <select
                name="mode"
                className="
  h-11
  rounded-lg
  border
  border-zinc-300
  bg-white
  px-3
  text-sm
  text-zinc-700
  outline-none
  focus:border-amber-400
"
                required
              >
                <option value="">Payment Mode</option>
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK">Bank</option>
              </select>
              <input
                name="note"
                placeholder="Note (optional)"
                className="
  h-11
  rounded-lg
  border
  border-zinc-300
  bg-white
  px-3
  text-sm
  text-zinc-700
  outline-none
  focus:border-amber-400
"
              />
              <button
                className="
    col-span-2
    h-11
    rounded-lg
    bg-zinc-900
    px-4
    text-sm
    font-medium
    text-white
    transition
    hover:bg-zinc-800
  "
              >
                Add Payment
              </button>
            </form>
          </div>
        )}
        {/*Payment List / cash flow*/}
        {trip.payments.length > 0 && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-800">
                Payment Ledger
              </h2>

              <span className="text-sm text-zinc-500">
                {trip.payments.length} entries
              </span>
            </div>
            <table className="w-full overflow-hidden rounded-lg text-sm">
              <thead className="bg-zinc-50 text-zinc-500">
                <tr className="border-b border-zinc-200">
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Date
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Mode
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Note
                  </th>
                </tr>
              </thead>
              <tbody>
                {trip.payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-zinc-100 transition hover:bg-zinc-50"
                  >
                    <td className="px-4 py-3 text-zinc-600">
                      {new Date(p.paymentDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3">{p.type}</td>
                    <td className="px-4 py-3">{p.mode}</td>
                    <td className="px-4 py-3 text-right font-medium text-zinc-800">
                      ₹{p.amount}
                    </td>
                    <td className="px-4 py-3">{p.note || "-"}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-semibold border-t">
                  <td colSpan="3" className="px-4 py-3">
                    Total Received
                  </td>

                  <td className="px-4 py-3 text-right font-semibold">
                    ₹{totalPayments.toFixed(0)}
                  </td>

                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {/*Closed trip audit {read only}*/}
        {trip.status === "CLOSED" && (
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-emerald-800">
              Trip Certified & Locked
            </h2>

            <div className="mt-5 grid grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-zinc-500">Certified On</p>

                <p className="mt-1 font-medium text-zinc-800">
                  {trip.closedAt
                    ? new Date(trip.closedAt).toLocaleString()
                    : "-"}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Certified By</p>

                <p className="mt-1 font-medium text-zinc-800">
                  {trip.closedBy || "—"}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Final Revenue</p>

                <p className="mt-1 font-medium text-zinc-800">
                  ₹{trip.finalRevenue?.toFixed(0)}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Final Expenses</p>

                <p className="mt-1 font-medium text-zinc-800">
                  ₹{trip.finalExpenses?.toFixed(0)}
                </p>
              </div>

              <div>
                <p className="text-zinc-500">Final Balance</p>

                <p
                  className={`mt-1 font-medium ${
                    trip.finalBalance >= 0 ? "text-emerald-700" : "text-red-700"
                  }`}
                >
                  ₹{trip.finalBalance?.toFixed(0)}
                </p>
              </div>

              <div className="col-span-3">
                <p className="rounded-lg border border-emerald-200 bg-white px-4 py-3 text-xs text-zinc-600">
                  This trip is locked. No further changes are permitted.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
