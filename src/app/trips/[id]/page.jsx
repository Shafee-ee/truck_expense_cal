export const runtime = "nodejs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@supabase/supabase-js";
import AddPaymentForm from "@/components/AddPaymentForm";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import BillUploader from "./BillUploader";
import AddExpenseForm from "@/components/AddExpenseForm";
import CloseTripButton from "@/components/CloseTripButton";
import StartTripButton from "@/components/StartTripButton";
import DeletePaymentButton from "@/components/DeletePaymentButton";
import UpdateActualQtyForm from "@/components/UpdateActualQtyForm";
import EditExpenseForm from "@/components/EditExpenseForm";
import MamoolEditor from "@/components/MamoolEditor";
import SettlementDetails from "@/components/SettlementDetails";
import {
  startTrip,
  closeTrip,
  updateActualQty,
  addPayment,
  deleteExpense,
  addExpense,
  replaceBill,
  updateMamool,
  deletePayment,
} from "./actions";

import {
  calculateRevenue,
  calculateExpenses,
  calculatePayments,
  calculateOutstanding,
  calculateBalance,
} from "@/lib/finance";
import { Upload, BookX, RefreshCcw } from "lucide-react";

const formatCurrency = (num) => new Intl.NumberFormat("en-IN").format(num);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function getSignedUrl(path) {
  const { data } = await supabase.storage
    .from("expense-bills")
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

  const editingExpense =
    trip?.expenses?.find((e) => e.id === editingExpenseId) || null;

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
  const canClose = hasRevenue && trip.expenses.length > 0;

  const balance =
    trip.status === "CLOSED" ? trip.finalBalance || 0 : calculateBalance(trip);

  //add payment just fixed

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

          <div className="grid grid-cols-6 gap-6 px-6 py-5 text-sm">
            <div>
              <p className="text-zinc-500">Truck</p>
              <p className="mt-1 font-medium text-zinc-800">
                {trip.truck.numberPlate}
              </p>
            </div>

            <div>
              <p className="text-zinc-500">Load Type</p>

              <p
                className={`mt-1 inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium
    ${
      (trip.loadType || "COMPANY") === "COMPANY"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-amber-100 text-amber-700"
    }`}
              >
                {trip.loadType || "COMPANY"}
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
            <div>
              <div>
                <MamoolEditor tripId={trip.id} mamool={trip.mamool} />
              </div>
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

              {trip.revenueMode === "FIXED" ? (
                <span className="rounded bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                  Fixed Revenue
                </span>
              ) : (
                <span className="rounded bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600">
                  Quantity Based
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
            {trip.status === "ACTIVE" && trip.revenueMode === "VARIABLE" && (
              <UpdateActualQtyForm tripId={id} actualQty={trip.actualQty} />
            )}
          </div>
        )}
        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-6 shadow-sm">
          <SettlementDetails trip={trip} />
        </div>
        {/*Trip Lifecyle Action*/}
        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          {trip.status === "PLANNED" && <StartTripButton tripId={id} />}
          {trip.status === "ACTIVE" && (
            <details className="rounded-lg border border-red-200 bg-red-50">
              <summary className="cursor-pointer list-none px-5 py-4 text-sm font-semibold text-red-700">
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
                {!hasRevenue && trip.revenueMode === "VARIABLE" && (
                  <p className="text-red-600 font-semibold">
                    Cannot close trip: Actual quantity is missing, so revenue is
                    0.
                  </p>
                )}
                {hasOutstanding && (
                  <p className="mt-3 text-sm font-medium text-amber-600">
                    Outstanding Amount: ₹{formatCurrency(outstanding)}
                  </p>
                )}
                <CloseTripButton id={id} canClose={canClose} />
              </div>
            </details>
          )}
        </div>
        {editingExpense && (
          <EditExpenseForm expense={editingExpense} tripId={id} />
        )}
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
            </div>
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

            <AddExpenseForm tripId={id} />

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
                      <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500">
                        Bill
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

                            <td>
                              <BillUploader
                                id={id}
                                expenseId={e.id}
                                signedUrl={signedUrl}
                                replaceBill={replaceBill}
                              />
                            </td>
                            <td className="px-4 py-3 text-sm align-middle">
                              {trip.status === "ACTIVE" && (
                                <div className="flex items-center gap-3">
                                  <Link
                                    href={`/trips/${id}?editExpense=${e.id}`}
                                    className="inline-flex rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 transition hover:bg-zinc-100"
                                  >
                                    Edit
                                  </Link>

                                  <form action={deleteExpense}>
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

                                    <button className="text-xs font-medium text-red-600 hover:text-red-700">
                                      Delete
                                    </button>
                                  </form>
                                </div>
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
        <AddPaymentForm tripId={id} tripStatus={trip.status} />{" "}
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
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide">
                    Actions
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
                    <td className="px-4 py-3">
                      <DeletePaymentButton tripId={id} paymentId={p.id} />
                    </td>
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
