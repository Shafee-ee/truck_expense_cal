"use client";

import { useMemo, useState } from "react";

function formatCategory(category) {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const categoryGroups = {
  ALL: [],
  TYRE: ["TYRE"],
  REPAIR: ["REPAIR"],
  ELECTRICAL: ["ELECTRICAL"],
  COMPLIANCE: ["INSURANCE", "ROAD_TAX", "FITNESS", "PERMIT", "NATIONAL_PERMIT"],
  WASHING: ["WASHING"],
  ADD_BLUE: ["ADD_BLUE"],
  OTHER: ["OTHER"],
};

export default function ExpenseHistoryTable({ expenses }) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");

  const filteredExpenses = useMemo(() => {
    return expenses.filter((expense) => {
      const searchTerm = search.toLowerCase();

      const matchesSearch =
        (expense.vendor ?? "").toLowerCase().includes(searchTerm) ||
        (expense.note ?? "").toLowerCase().includes(searchTerm);

      const matchesCategory =
        category === "ALL"
          ? true
          : categoryGroups[category].includes(expense.category);

      return matchesSearch && matchesCategory;
    });
  }, [expenses, search, category]);

  return (
    <>
      <div className="mb-6 flex flex-col gap-3 md:flex-row">
        <input
          type="text"
          placeholder="Search vendor or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="flex-1 rounded-lg border px-3 py-2"
        />

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border px-3 py-2"
        >
          {Object.keys(categoryGroups).map((key) => (
            <option key={key} value={key}>
              {formatCategory(key)}
            </option>
          ))}
        </select>
      </div>

      {filteredExpenses.length === 0 ? (
        <div className="py-12 text-center text-slate-500">
          No maintenance records found.
        </div>
      ) : (
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50">
            <tr>
              <th className="px-4 py-3 text-left">Date</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Vendor</th>
              <th className="px-4 py-3 text-right">Amount</th>
              <th className="px-4 py-3 text-left">Notes</th>
              <th className="px-4 py-3 text-center">Document</th>
            </tr>
          </thead>

          <tbody>
            {filteredExpenses.map((expense, index) => (
              <tr
                key={expense.id}
                className={`border-b hover:bg-slate-100 ${
                  index % 2 === 0 ? "bg-white" : "bg-slate-50/50"
                }`}
              >
                <td className="px-4 py-3">
                  {new Date(expense.expenseDate).toLocaleDateString("en-GB")}
                </td>

                <td className="px-4 py-3">
                  {formatCategory(expense.category)}
                </td>

                <td className="px-4 py-3">{expense.vendor || "-"}</td>

                <td className="px-4 py-3 text-right font-medium text-emerald-600">
                  ₹{expense.amount.toLocaleString("en-IN")}
                </td>

                <td className="px-4 py-3">
                  {expense.note || <span className="text-slate-400">—</span>}
                </td>

                <td className="px-4 py-3 text-center">
                  {expense.documentUrl ? (
                    <a
                      href={expense.documentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block rounded-md border px-3 py-1 text-xs hover:bg-slate-100"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-slate-400">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </>
  );
}
