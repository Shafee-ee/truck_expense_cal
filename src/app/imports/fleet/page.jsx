"use client";

import { useActionState } from "react";
import ImportSummary from "@/components/imports/ImportSummary";
import { importFleetRows } from "./actions";

import SubmitButton from "@/components/ui/SubmitButton";
import FormLoadingOverlay from "@/components/ui/FormLoadingOverlay";

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
        <FormLoadingOverlay
          title="Importing Fleet Register"
          message="Please wait while HH Trucks processes your Excel file."
        />

        <input type="file" name="file" accept=".xlsx,.xls" required />

        <SubmitButton>Import Fleet</SubmitButton>
      </form>

      {importState && (
        <ImportSummary
          total={importState.total}
          created={importState.created}
          updated={importState.updated}
          skipped={importState.skipped}
          errors={importState.errors}
        />
      )}
    </main>
  );
}
