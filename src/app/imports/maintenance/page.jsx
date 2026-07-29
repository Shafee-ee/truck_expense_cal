"use client";

import { useActionState } from "react";
import { importMaintenanceRows } from "./actions";
import SubmitButton from "@/components/ui/SubmitButton";
import FormLoadingOverlay from "@/components/ui/FormLoadingOverlay";

export default function MaintenanceImportPage() {
  const [state, formAction] = useActionState(importMaintenanceRows, null);

  return (
    <main className="p-6">
      <h1 className="mb-6 text-2xl font-bold">Vehicle Maintenance Import</h1>

      <form action={formAction} className="space-y-4">
        <FormLoadingOverlay
          title="Importing Vehicle Maintenance"
          message="Please wait while HH Trucks processes your Excel file."
        />

        <input type="file" name="file" accept=".xlsx,.xls" required />

        <SubmitButton>Import</SubmitButton>
      </form>

      {state?.error && <p className="mt-4 text-red-600">{state.error}</p>}

      {state?.success && (
        <p className="mt-4 text-green-600">Import completed.</p>
      )}
    </main>
  );
}
