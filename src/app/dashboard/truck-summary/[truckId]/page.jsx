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

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

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
        <StatCard title="Lifetime Spend" amount={totalSpent} />

        <StatCard title="This Year" amount={thisYear} />

        <StatCard title="Last 6 Months" amount={lastSixMonths} />

        <StatCard title="This Month" amount={thisMonth} />
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
                {category.label.replace("_", " ")}
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
    </div>
  );
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
