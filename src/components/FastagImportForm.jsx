"use client";

import { useActionState } from "react";
import {
  previewFastagImport,
  importFastagImport,
} from "@/app/imports/fastag/actions";

const initialState = null;

export default function FastagImportForm({ tripId, truckNumberPlate }) {
  const [state, formAction, pending] = useActionState(
    previewFastagImport,
    initialState
  );

  const [importState, importAction, importPending] = useActionState(
    importFastagImport,
    initialState
  );
  const readyRows =
    state?.preview?.filter((row) => row.action === "IMPORT") ?? [];

  const duplicateRows =
    state?.preview?.filter((row) => row.action === "DUPLICATE") ?? [];

  const errorRows =
    state?.preview?.filter((row) => row.errors.length > 0) ?? [];

  const totalAmount = readyRows.reduce((sum, row) => sum + row.amount, 0);
  return (
    <div className="mt-6 rounded-lg border border-zinc-200 bg-zinc-50 p-5">
      <h3 className="text-lg font-semibold text-zinc-800">
        Import FASTag Statement
      </h3>

      <p className="mt-1 text-sm text-zinc-500">
        Upload a FASTag statement to automatically import toll expenses.
      </p>

      <form action={formAction} className="mt-4 space-y-4">
        <input type="hidden" name="tripId" value={tripId} />

        <input type="hidden" name="truckNumberPlate" value={truckNumberPlate} />

        <input type="file" name="file" accept=".xlsx,.xls" className="block" />

        <button
          type="submit"
          disabled={pending}
          className="rounded bg-black px-4 py-2 text-white"
        >
          {pending ? "Previewing..." : "Preview"}
        </button>
      </form>

      {state?.success && (
        <div className="mt-6 space-y-6">
          {/* Summary */}

          <div className="rounded border bg-white p-4">
            <h4 className="mb-3 font-semibold text-zinc-800">FASTag Preview</h4>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-zinc-500">Transactions</span>
                <span className="font-medium">{readyRows.length}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Total Toll</span>
                <span className="font-medium">₹{totalAmount.toFixed(0)}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Duplicates</span>
                <span className="font-medium text-amber-600">
                  {duplicateRows.length}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-zinc-500">Errors</span>
                <span className="font-medium text-red-600">
                  {errorRows.length}
                </span>
              </div>
            </div>
          </div>

          {/* Preview Table */}
          <div className="overflow-hidden rounded-lg border">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50">
                <tr>
                  <th className="px-4 py-3 text-left">Date</th>
                  <th className="px-4 py-3 text-left">Toll Plaza</th>
                  <th className="px-4 py-3 text-right">Amount</th>
                  <th className="px-4 py-3 text-center">Status</th>
                </tr>
              </thead>

              <tbody>
                {state.preview.map((row) => (
                  <tr key={row.fastagTransactionId} className="border-t">
                    <td className="px-4 py-3">
                      {new Date(row.expenseDate).toLocaleDateString()}
                    </td>

                    <td className="px-4 py-3">{row.fastagPlazaName}</td>

                    <td className="px-4 py-3 text-right">₹{row.amount}</td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-medium
                    ${
                      row.errors.length > 0
                        ? "bg-red-100 text-red-700"
                        : row.action === "IMPORT"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                    }`}
                      >
                        {row.errors.length > 0 ? "ERROR" : row.action}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <form action={importAction} className="mt-4">
            <input type="hidden" name="tripId" value={tripId} />

            <input
              type="hidden"
              name="rows"
              value={JSON.stringify(readyRows)}
            />

            <button
              type="submit"
              disabled={readyRows.length === 0 || importPending}
              className="rounded bg-emerald-600 px-4 py-2 text-white hover:bg-emerald-700 disabled:opacity-50"
            >
              {importPending
                ? "Importing..."
                : `Import ${readyRows.length} Toll ${
                    readyRows.length === 1 ? "Expense" : "Expenses"
                  }`}
            </button>
          </form>
        </div>
      )}

      {state && !state.success && (
        <div className="mt-4 rounded border border-red-200 bg-red-50 p-4 text-red-700">
          {state.error}
        </div>
      )}
    </div>
  );
}
