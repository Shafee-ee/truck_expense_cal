import { prisma } from "@/lib/prisma";

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

  const expenses = truck.truckExpenses;

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

  const mostFrequentCategory =
    Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0] ?? null;

  return (
    <div className="space-y-6 p-6">
      <div className="rounded-xl border bg-white p-6">
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
            title="Most Frequent"
            value={
              mostFrequentCategory
                ? formatCategory(mostFrequentCategory[0])
                : "-"
            }
            subValue={
              mostFrequentCategory ? `${mostFrequentCategory[1]} entries` : ""
            }
          />
        </div>
      </div>

      <div className="mt-8 rounded-xl border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Monthly Expense Breakdown</h2>

          <p className="text-sm text-slate-500">Current Month</p>
        </div>

        <div className="space-y-5">
          {categoryTotals.map((category) => (
            <div
              key={category.label}
              className="grid grid-cols-12 items-center gap-4"
            >
              <div className="col-span-2 font-medium">
                {formatCategory(category.label)}{" "}
              </div>

              <div className="col-span-2">
                ₹{category.total.toLocaleString("en-IN")}
              </div>

              <div className="col-span-1 text-sm text-slate-500">
                {category.percentage}%
              </div>

              <div className="col-span-7 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-amber-400"
                  style={{
                    width: `${category.percentage}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Expense History</h2>

          <p className="text-sm text-slate-500">
            {expenses.length} {expenses.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div className="overflow-x-auto">
          {expenses.length === 0 ? (
            <div className="py-12 text-center text-slate-500">
              No maintenance records found.
            </div>
          ) : (
            <table className="min-w-full text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Date
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Category
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Vendor
                  </th>

                  <th className="px-4 py-3 text-right font-medium text-slate-600">
                    Amount
                  </th>

                  <th className="px-4 py-3 text-left font-medium text-slate-600">
                    Notes
                  </th>

                  <th className="px-4 py-3 text-center font-medium text-slate-600">
                    Document
                  </th>
                </tr>
              </thead>

              <tbody>
                {expenses.map((expense, index) => (
                  <tr
                    key={expense.id}
                    className={`border-b transition-colors hover:bg-slate-100 ${
                      index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      {new Date(expense.expenseDate).toLocaleDateString(
                        "en-GB",
                      )}
                    </td>

                    <td className="px-4 py-3">
                      {formatCategory(expense.category)}{" "}
                    </td>

                    <td className="px-4 py-3">{expense.vendor || "-"}</td>

                    <td className="px-4 py-3 text-right font-medium text-emerald-600">
                      ₹{expense.amount.toLocaleString("en-IN")}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {expense.notes ? (
                        expense.notes
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}{" "}
                    </td>

                    <td className="px-4 py-3 text-center">
                      {expense.documentPath ? (
                        <button className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium transition hover:bg-slate-100">
                          View
                        </button>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
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
