"use client";

import { useActionState } from "react";
import { importMaintenanceRows } from "./actions";

export default function MaintenanceImportPage() {
  const [state, formAction] = useActionState(importMaintenanceRows, null);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-6">Vehicle Maintenance Import</h1>

      <form action={formAction}>
        <input type="file" name="file" accept=".xlsx,.xls" required />

        <button
          type="submit"
          className="ml-4 rounded bg-black px-4 py-2 text-white"
        >
          Import
        </button>
      </form>

      {state?.error && <p className="mt-4 text-red-600">{state.error}</p>}

      {state?.success && (
        <p className="mt-4 text-green-600">Import completed.</p>
      )}
    </main>
  );
}
