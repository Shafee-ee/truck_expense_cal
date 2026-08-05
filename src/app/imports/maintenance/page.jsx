"use client";

import { useActionState } from "react";
import { importMaintenanceRows } from "./actions";
import SubmitButton from "@/components/ui/SubmitButton";
import FormLoadingOverlay from "@/components/ui/FormLoadingOverlay";

export default function MaintenanceImportPage() {
  const [state, formAction] = useActionState(importMaintenanceRows, null);
  console.log(state);

  return (
    <main className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Vehicle Maintenance Import</h1>
      <form action={formAction} className="space-y-4">
        <FormLoadingOverlay
          title="Importing Vehicle Maintenance"
          message="Please wait while HH Trucks processes your Excel file."
        />

        <input type="file" name="file" accept=".xlsx,.xls" required />

        <SubmitButton>Import Maintenance</SubmitButton>
      </form>
      {state?.error && <p className="mt-4 text-red-600">{state.error}</p>}
      {state?.success && (
        <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-5">
          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Processed</p>
            <p className="text-3xl font-bold">{state.total}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Created</p>
            <p className="text-3xl font-bold text-green-600">{state.created}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Updated</p>
            <p className="text-3xl font-bold text-blue-600">{state.updated}</p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Skipped</p>
            <p className="text-3xl font-bold text-yellow-600">
              {state.skipped}
            </p>
          </div>

          <div className="rounded-xl border p-4">
            <p className="text-sm text-gray-500">Errors</p>
            <p
              className={`text-3xl font-bold ${
                state.errors > 0 ? "text-red-600" : "text-gray-900"
              }`}
            >
              {state.errors}
            </p>
          </div>
        </div>
      )}
    </main>
  );
}
