"use client";

import { useActionState } from "react";
import { importTripRows } from "./actions";

export default function TripImportPage() {
  const [importState, importAction] = useActionState(importTripRows, null);

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Trip Register Import</h1>
        <p className="text-gray-500">
          Upload an AS Transport or Logisco Transport Excel file.
        </p>
      </div>

      <form action={importAction} className="space-y-4">
        <input type="file" name="file" accept=".xlsx,.xls" required />

        <button
          type="submit"
          className="rounded bg-green-600 px-4 py-2 text-white"
        >
          Preview Import
        </button>
      </form>

      {importState?.comparison && (
        <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
          {JSON.stringify(importState.comparison, null, 2)}
        </pre>
      )}
    </main>
  );
}
