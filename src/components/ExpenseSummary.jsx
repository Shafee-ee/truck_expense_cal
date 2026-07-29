"use client";

import { useState } from "react";
import { ChevronRight, ChevronDown, Trash2 } from "lucide-react";
import Link from "next/link";
import BillUploader from "@/app/trips/[id]/BillUploader";
function formatCategory(category) {
  return category
    .toLowerCase()
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ExpenseSummary({
  breakdown,
  tripId,
  tripStatus,
  replaceBill,
  onDeleteExpense,
}) {
  const [expanded, setExpanded] = useState(new Set());
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4">
      <h3 className="mb-4 text-lg font-semibold text-zinc-800">
        Expense Summary
      </h3>

      <div className="space-y-3">
        {Object.entries(breakdown).map(([category, data]) => {
          const isExpanded = expanded.has(category);
          return (
            <div
              key={category}
              className="overflow-hidden rounded-lg border border-zinc-200"
            >
              <button
                onClick={() => {
                  const next = new Set(expanded);

                  if (next.has(category)) {
                    next.delete(category);
                  } else {
                    next.add(category);
                  }

                  setExpanded(next);
                }}
                className="flex w-full items-center justify-between px-4 py-3 transition hover:bg-zinc-50"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? (
                    <ChevronDown size={18} />
                  ) : (
                    <ChevronRight size={18} />
                  )}

                  <div className="flex items-center gap-2">
                    <span className="font-medium">
                      {formatCategory(category)}
                    </span>

                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-[11px] text-zinc-500">
                      {data.entries.length}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="font-bold ">₹{data.total.toFixed(0)}</div>

                  <div className="text-xs text-zinc-500">
                    {data.entries.length}
                    {data.entries.length === 1 ? " Entry" : " Entries"}
                  </div>
                </div>
              </button>

              {isExpanded && (
                <div className="border-t border-zinc-200 bg-zinc-50">
                  <div className="max-h-64 overflow-y-auto">
                    <table className="w-full text-sm">
                      <thead className="sticky top-0 bg-zinc-100 text-xs  font-medium uppercase text-zinc-500">
                        <tr>
                          <th className="px-4 py-2 text-left">Date</th>
                          <th className="px-4 py-2 text-left">Note</th>
                          <th className="w-32 px-4 py-2 text-left">Bill</th>
                          <th className="px-4 py-2 text-right">Amount</th>
                          {tripStatus === "ACTIVE" && (
                            <th className="px-4 py-2 text-center">Actions</th>
                          )}
                        </tr>
                      </thead>

                      <tbody>
                        {[...data.entries]
                          .sort(
                            (a, b) =>
                              new Date(b.expenseDate) - new Date(a.expenseDate)
                          )
                          .map((expense) => (expense) => (
                            <tr
                              key={expense.id}
                              className="border-t border-zinc-200 hover:bg-white"
                            >
                              <td className="px-4 py-2">
                                {new Date(
                                  expense.expenseDate
                                ).toLocaleDateString("en-IN", {
                                  day: "2-digit",
                                  month: "short",
                                })}
                              </td>

                              <td className="px-4 py-2 text-zinc-600">
                                {expense.note || "—"}
                              </td>

                              <td className="px-4 py-2">
                                {tripStatus === "ACTIVE" ? (
                                  <BillUploader
                                    id={tripId}
                                    expenseId={expense.id}
                                    signedUrl={expense.signedUrl}
                                    replaceBill={replaceBill}
                                  />
                                ) : expense.signedUrl ? (
                                  <a
                                    href={expense.signedUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline"
                                  >
                                    View Bill
                                  </a>
                                ) : (
                                  "-"
                                )}
                              </td>

                              <td className="px-4 py-2 text-right font-semibold text-zinc-900">
                                ₹{expense.amount.toFixed(0)}
                              </td>

                              <td className="px-4 py-2">
                                <div className="flex items-center justify-center gap-2">
                                  <Link
                                    href={`/trips/${tripId}?editExpense=${expense.id}`}
                                    className="rounded border border-zinc-300 px-2 py-0.5 text-[11px] hover:bg-zinc-100"
                                  >
                                    Edit
                                  </Link>

                                  <form action={onDeleteExpense}>
                                    <input
                                      type="hidden"
                                      name="tripId"
                                      value={expense.tripId}
                                    />

                                    <input
                                      type="hidden"
                                      name="expenseId"
                                      value={expense.id}
                                    />

                                    <button
                                      className="rounded p-2 text-red-600 hover:bg-red-100"
                                      title="Delete expense"
                                    >
                                      <Trash2 size={16} />
                                    </button>
                                  </form>
                                </div>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
