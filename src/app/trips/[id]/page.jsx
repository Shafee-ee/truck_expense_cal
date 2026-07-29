export const runtime = "nodejs";
import { createClient } from "@supabase/supabase-js";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import BillUploader from "./BillUploader";
import AddExpenseForm from "@/components/AddExpenseForm";
import CloseTripButton from "@/components/CloseTripButton";
import StartTripButton from "@/components/StartTripButton";
import EditExpenseForm from "@/components/EditExpenseForm";
import MamoolEditor from "@/components/MamoolEditor";
import SettlementDetails from "@/components/SettlementDetails";
import ExpenseSummary from "@/components/ExpenseSummary";
import FastagImportForm from "@/components/FastagImportForm";

import CustomerPaymentForm from "@/components/CustomerPaymentForm";
import TransporterPaymentForm from "@/components/TransporterPaymentForm";
import {
  startTrip,
  closeTrip,
  deleteExpense,
  addExpense,
  replaceBill,
  updateMamool,
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
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

  const trip = await prisma.trip.findUnique({
    where: { id },
    include: {
      truck: true,
      expenses: true,

      customerPayments: true,
      transporterPayments: true,

      clientCompany: true,
      transporterCompany: true,
    },
  });

  const companies = await prisma.company.findMany({
    orderBy: {
      name: "asc",
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
  const expensesBreakdown = {};

  for (const expense of trip.expenses ?? []) {
    const signedUrl = expense.billPath
      ? await getSignedUrl(expense.billPath)
      : null;

    if (!expensesBreakdown[expense.category]) {
      expensesBreakdown[expense.category] = {
        total: 0,
        entries: [],
      };
    }

    expensesBreakdown[expense.category].total += expense.amount;

    expensesBreakdown[expense.category].entries.push({
      ...expense,
      signedUrl,
    });
  }

  const totalPayments = calculatePayments(trip.customerPayments);
  const outstanding = calculateOutstanding(trip);

  const transporterPaid = calculatePayments(trip.transporterPayments);

  const transporterRemaining = Math.max(
    (trip.transporterPayable || 0) - transporterPaid,
    0
  );
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

        {/*Trip Lifecyle Action*/}
        {trip.status === "PLANNED" && (
          <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
            <StartTripButton tripId={id} />
          </div>
        )}
        {editingExpense && (
          <EditExpenseForm expense={editingExpense} tripId={id} />
        )}
        {/*expense management for ACTIVE trip*/}

        <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
          <div className="mb-5">
            <h2 className="text-lg font-semibold text-zinc-800">
              {trip.status === "ACTIVE"
                ? "Expense Management"
                : "Expense History"}
            </h2>

            <p className="mt-1 text-sm text-zinc-500">
              {trip.status === "ACTIVE"
                ? "Record operational trip expenses and upload supporting bills"
                : "Read-only history of all recorded trip expenses and supporting bills"}
            </p>
          </div>
          {Object.keys(expensesBreakdown).length > 0 && (
            <ExpenseSummary
              breakdown={expensesBreakdown}
              tripId={id}
              tripStatus={trip.status}
              replaceBill={replaceBill}
              onDeleteExpense={deleteExpense}
            />
          )}

          {trip.status === "ACTIVE" && (
            <FastagImportForm
              tripId={trip.id}
              truckNumberPlate={trip.truck.numberPlate}
            />
          )}

          {trip.status === "ACTIVE" && <AddExpenseForm tripId={id} />}
        </div>

        <div className="rounded-xl border border-blue-200 bg-blue-50/40 p-6 shadow-sm">
          <SettlementDetails trip={trip} companies={companies} />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <CustomerPaymentForm
            tripId={trip.id}
            tripStatus={trip.status}
            payments={trip.customerPayments}
          />

          {trip.loadType === "EXTERNAL" && (
            <TransporterPaymentForm
              tripId={trip.id}
              tripStatus={trip.status}
              payments={trip.transporterPayments}
            />
          )}
        </div>

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
                  Cannot close trip: Revenue has not been calculated.
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
