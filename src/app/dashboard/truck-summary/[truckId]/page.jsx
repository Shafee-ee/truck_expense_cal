import { prisma } from "@/lib/prisma";
import { getTruckExpenseDocument } from "@/lib/truckExpensesDocuments";
import TruckMaintenanceView from "@/components/TruckMaintenanceView";
import Link from "next/link";

export default async function TruckDetailPage({ params }) {
  const { truckId } = await params;

  const truck = await prisma.truck.findUnique({
    where: {
      id: truckId,
    },
    include: {
      truckExpenses: {
        orderBy: {
          expenseDate: "desc",
        },
      },
    },
  });

  if (!truck) {
    return <div className="p-6">Truck not found.</div>;
  }

  const expenses = await Promise.all(
    truck.truckExpenses.map(async (expense) => ({
      ...expense,
      documentUrl: await getTruckExpenseDocument(expense.documentPath),
    })),
  );

  const totalMaintenance = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const categoryGroups = {
    TYRE: ["TYRE"],
    REPAIR: ["REPAIR"],
    ELECTRICAL: ["ELECTRICAL"],
    COMPLIANCE: [
      "INSURANCE",
      "ROAD_TAX",
      "FITNESS",
      "PERMIT",
      "NATIONAL_PERMIT",
    ],
    WASHING: ["WASHING"],
    ADD_BLUE: ["ADD_BLUE"],
    OTHER: ["OTHER"],
  };

  const categoryTotals = Object.entries(categoryGroups).map(
    ([label, categories]) => {
      const total = expenses
        .filter((expense) => categories.includes(expense.category))
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        label,
        total,
        percentage:
          totalMaintenance === 0
            ? 0
            : Math.round((total / totalMaintenance) * 100),
      };
    },
  );

  const now = new Date();

  const currentYear = now.getFullYear();

  const currentMonth = now.getMonth();

  const thisYear = expenses
    .filter(
      (expense) => new Date(expense.expenseDate).getFullYear() === currentYear,
    )
    .reduce((sum, expense) => sum + expense.amount, 0);

  const lastSixMonths = expenses
    .filter((expense) => {
      const date = new Date(expense.expenseDate);

      return date >= new Date(currentYear, currentMonth - 5, 1);
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const thisMonth = expenses
    .filter((expense) => {
      const date = new Date(expense.expenseDate);

      return (
        date.getMonth() === currentMonth && date.getFullYear() === currentYear
      );
    })
    .reduce((sum, expense) => sum + expense.amount, 0);

  const lastExpense = expenses[0] ?? null;

  const largestExpense =
    expenses.length === 0
      ? null
      : expenses.reduce((largest, expense) =>
          expense.amount > largest.amount ? expense : largest,
        );

  const categoryCounts = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1],
  );

  const mostFrequentCategory =
    sortedCategories.length > 0 ? sortedCategories[0] : null;

  const hasDominantCategory =
    sortedCategories.length === 1 ||
    (sortedCategories.length > 1 &&
      sortedCategories[0][1] > sortedCategories[1][1]);

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border bg-white p-6">
        <Link
          href="/dashboard/truck-summary"
          className="mb-4 inline-flex items-center text-sm font-medium text-slate-600 transition hover:text-slate-900"
        >
          ← Back to Fleet Summary
        </Link>
        <h1 className="text-3xl font-bold">{truck.numberPlate}</h1>
        <p className="mt-2 text-slate-500">
          {truck.vehicleType || "Truck"} • Registered{" "}
          {truck.registrationDate
            ? new Date(truck.registrationDate).toLocaleDateString("en-GB")
            : "-"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard title="Lifetime Spend" amount={totalMaintenance} />

        <StatCard title="This Year" amount={thisYear} />

        <StatCard title="Last 6 Months" amount={lastSixMonths} />

        <StatCard title="This Month" amount={thisMonth} />
      </div>

      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-6 text-lg font-semibold">Maintenance Snapshot</h2>

        <div className="grid gap-6 md:grid-cols-4">
          <SnapshotItem title="Total Entries" value={expenses.length} />

          <SnapshotItem
            title="Last Maintenance"
            value={
              lastExpense
                ? new Date(lastExpense.expenseDate).toLocaleDateString("en-GB")
                : "-"
            }
          />

          <SnapshotItem
            title="Largest Expense"
            value={
              largestExpense
                ? `₹${largestExpense.amount.toLocaleString("en-IN")}`
                : "-"
            }
            subValue={
              largestExpense ? formatCategory(largestExpense.category) : ""
            }
          />

          <SnapshotItem
            title="Most Frequent Category"
            value={
              hasDominantCategory && mostFrequentCategory
                ? formatCategory(mostFrequentCategory[0])
                : "No dominant category"
            }
            subValue={
              hasDominantCategory && mostFrequentCategory
                ? `${mostFrequentCategory[1]} maintenance records`
                : "Needs more maintenance history"
            }
          />
        </div>
      </div>

      <TruckMaintenanceView expenses={expenses} />
    </div>
  );
}

function formatCategory(category) {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function StatCard({ title, amount }) {
  return (
    <div className="rounded-xl border bg-white p-6">
      <p className="text-sm text-slate-500">{title}</p>

      <h2 className="mt-2 text-3xl font-bold text-emerald-600">
        ₹{amount.toLocaleString("en-IN")}
      </h2>
    </div>
  );
}

function SnapshotItem({ title, value, subValue }) {
  return (
    <div>
      <p className="text-sm text-slate-500">{title}</p>

      <h3 className="mt-2 text-xl font-semibold">{value}</h3>

      {subValue && <p className="mt-1 text-sm text-slate-500">{subValue}</p>}
    </div>
  );
}
