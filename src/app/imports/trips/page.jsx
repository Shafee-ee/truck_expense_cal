"use client";

import { useActionState } from "react";
import { importTripRows } from "./actions";
import SubmitButton from "@/components/ui/SubmitButton";
import FormLoadingOverlay from "@/components/ui/FormLoadingOverlay";
import ImportSummary from "@/components/imports/ImportSummary";

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
        <FormLoadingOverlay
          title="Importing Trips"
          message="Please wait while the application processes your Excel file."
        />

        <input type="file" name="file" accept=".xlsx,.xls" required />

        <SubmitButton>Import Trips</SubmitButton>
      </form>

      {importState && !importState.error && (
        <>
          <ImportSummary
            total={importState.total}
            created={importState.created}
            updated={importState.updated}
            skipped={importState.skipped}
            errors={importState.errors}
          />

          <pre className="overflow-auto rounded bg-gray-100 p-4 text-sm">
            {JSON.stringify(importState.comparison, null, 2)}
          </pre>
        </>
      )}
    </main>
  );
}
