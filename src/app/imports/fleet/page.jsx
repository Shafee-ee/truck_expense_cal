"use client";

import { useActionState } from "react";
import ImportSummary from "@/components/imports/ImportSummary";
import { importFleetRows } from "./actions";

export default function FleetImportPage() {
  const [importState, importAction] = useActionState(importFleetRows, null);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Fleet Register Import</h1>
        <p className="text-gray-500">
          Upload the Fleet Register Excel file and import it.
        </p>
      </div>

      <form action={importAction} className="space-y-4">
        <input type="file" name="file" accept=".xlsx,.xls" required />

        <button
          type="submit"
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Import
        </button>
      </form>

      {importState && (
        <ImportSummary
          total={
            importState.created + importState.updated + importState.skipped
          }
          created={importState.created}
          updated={importState.updated}
          skipped={importState.skipped}
        />
      )}
    </main>
  );
}
