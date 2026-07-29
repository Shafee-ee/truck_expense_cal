"use client";

import { useActionState } from "react";
import { previewFastagImport } from "./actions";

const initialState = null;

export default function FastagImportPage() {
  const [state, formAction, pending] = useActionState(
    previewFastagImport,
    initialState
  );

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <h1 className="text-2xl font-bold">FASTag Import (Test)</h1>

      <form action={formAction} className="space-y-4">
        <input
          type="text"
          name="truckNumberPlate"
          placeholder="Truck Number"
          defaultValue="KA01AN1571"
          className="border rounded px-3 py-2 w-full"
        />

        <input type="file" name="file" accept=".xlsx,.xls" className="block" />

        <button
          type="submit"
          disabled={pending}
          className="px-4 py-2 rounded bg-black text-white"
        >
          {pending ? "Previewing..." : "Preview"}
        </button>
      </form>

      {state && (
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
    </div>
  );
}
