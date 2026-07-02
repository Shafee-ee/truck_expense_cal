"use client";
import { useMemo, useState } from "react";

import ExpenseHistoryTable from "./ExpenseHistoryTable";

const monthOptions = [
  { value: "ALL", label: "All Months" },
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function TruckMaintenanceView({ expenses }) {
  const [selectedMonth, setSelectedMonth] = useState("ALL");

  const filteredExpenses = useMemo(() => {
    if (selectedMonth === "ALL") {
      return expenses;
    }
    return expenses.filter(
      (expense) => expense.month === Number(selectedMonth),
    );
  }, [expenses, selectedMonth]);

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

  const totalMaintenance = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const categoryTotals = Object.entries(categoryGroups).map(
    ([label, categories]) => {
      const total = filteredExpenses
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

  return (
    <>
      <div className="mt-8 rounded-xl border bg-white p-6">
        <div className="mb-6 flex justify-end">
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-lg border bg-white px-3 py-2 text-sm"
          >
            {monthOptions.map((month) => (
              <option key={month.value} value={month.value}>
                {month.label}
              </option>
            ))}
          </select>
        </div>

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
              <div className="col-span-2 font-medium">{category.label}</div>

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

        <ExpenseHistoryTable expenses={filteredExpenses} />
      </div>
    </>
  );
}
