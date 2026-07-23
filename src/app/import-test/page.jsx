import { readExcel } from "@/lib/imports/excel";

async function uploadExcel(formData) {
  "use server";

  const file = formData.get("file");

  if (!(file instanceof File) || file.size === 0) {
    throw new Error("Please select an Excel file.");
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  const rows = readExcel(buffer);
}

export default function ImportTestPage() {
  return (
    <main className="max-w-2xl p-8">
      <h1 className="mb-6 text-2xl font-bold">Import Test</h1>

      <form action={uploadExcel} className="space-y-4">
        <input type="file" name="file" accept=".xlsx,.xls" required />

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white"
        >
          Read Excel
        </button>
      </form>
    </main>
  );
}
