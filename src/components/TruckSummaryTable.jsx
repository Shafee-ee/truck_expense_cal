"use client";

import { useRouter } from "next/navigation";

export default function TruckSummaryTable({ trucks, expenses }) {
  const router = useRouter();
  const summary = trucks
    .map((truck) => {
      const truckExpenses = expenses.filter(
        (expense) => expense.truckId === truck.id,
      );

      if (truckExpenses.length === 0) return null;

      const total = truckExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      const lastExpense = truckExpenses[0];

      return {
        id: truck.id,
        numberPlate: truck.numberPlate,
        total,
        lastExpense,
        expenseCount: truckExpenses.length,
      };
    })
    .filter(Boolean);

  return (
    <div className="rounded-xl border bg-white p-6">
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold">Truck Maintenance Summary</h2>

          <p className="mt-1 text-sm text-slate-500">
            Overview of maintenance expenses across all trucks
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="text"
            placeholder="Search truck..."
            className="rounded-lg border px-4 py-2 text-sm w-72"
          />

          <select className="rounded-lg border px-4 py-2 text-sm w-48">
            <option>All Categories</option>
          </select>

          <select className="rounded-lg border px-4 py-2 text-sm w-44">
            <option>Latest Updated</option>
          </select>
        </div>
      </div>
      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="bg-slate-50 text-left text-sm text-slate-600">
              <th className="p-4">Truck</th>
              <th className="p-4">Total Expense</th>
              <th className="p-4">Last Expense</th>
              <th className="p-4">Updated</th>
              <th className="p-4"></th>
            </tr>
          </thead>

          <tbody>
            {summary.map((truck) => (
              <tr
                key={truck.id}
                onClick={() =>
                  router.push(`/dashboard/truck-summary/${truck.id}`)
                }
                className="cursor-pointer border-t transition hover:bg-slate-50"
              >
                <td className="p-4 font-semibold">
                  <div>
                    <p className="font-semibold">{truck.numberPlate}</p>

                    <p className="text-sm text-slate-500">
                      {truck.lastExpense.vendor || "Maintenance"}
                    </p>
                  </div>
                </td>

                <td className="p-4">
                  <span className="font-bold text-emerald-600">
                    ₹{truck.total.toLocaleString("en-IN")}
                  </span>
                </td>

                <td className="p-4">
                  <div>
                    <p className="font-medium">
                      {truck.lastExpense.category.replaceAll("_", " ")}
                    </p>

                    <p className="text-sm text-slate-500">
                      ₹{truck.lastExpense.amount.toLocaleString("en-IN")}
                    </p>
                  </div>
                </td>

                <td className="p-4">
                  <div>
                    <p>
                      {new Date(
                        truck.lastExpense.expenseDate,
                      ).toLocaleDateString("en-IN")}
                    </p>

                    <p className="text-sm text-slate-500">Latest Entry</p>
                  </div>
                </td>

                <td className="p-4 text-right">
                  <span className="font-semibold text-blue-600">→</span>
                </td>
              </tr>
            ))}

            {summary.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-500">
                  No maintenance expenses found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
