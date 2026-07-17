"use client";
import { useActionState, useRef } from "react";
import ImportSummary from "@/components/imports/ImportSummary";
import ImportPreviewTable from "@/components/imports/ImportPreviewTable";
import { previewFleetImport, importFleetRows } from "./actions";

export default function FleetImportPage() {
  const formRef = useRef(null);
  const [previewState, previewAction] = useActionState(
    previewFleetImport,
    null
  );
  const [importState, importAction] = useActionState(importFleetRows, null);
  return (
    <main className="mx-auto max-w-4xl space-y-6 p-8">
      <div>
        <h1 className="text-3xl font-bold">Fleet Register Import</h1>
        <p className="text-gray-500">
          Upload the Fleet Register Excel file to preview the data before
          importing.
        </p>
      </div>

      <form ref={formRef} action={previewAction} className="space-y-4">
        <input type="file" name="file" accept=".xlsx,.xls" required />

        <div className="flex gap-2">
          <button
            formAction={previewAction}
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Preview
          </button>

          <button
            formAction={importAction}
            type="submit"
            className="rounded bg-green-600 px-4 py-2 text-white"
          >
            Import
          </button>
        </div>
      </form>
      {previewState && (
        <>
          <ImportSummary
            total={previewState.summary.total}
            success={previewState.summary.create}
            warnings={previewState.summary.update}
            errors={previewState.summary.errors}
          />
          <ImportPreviewTable rows={previewState.rows} />
        </>
      )}
    </main>
  );
}
