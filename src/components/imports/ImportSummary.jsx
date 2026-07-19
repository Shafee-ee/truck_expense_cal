export default function ImportSummary({
  total = 0,
  created = 0,
  updated = 0,
  skipped = 0,
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Total Rows</p>
        <p className="text-2xl font-bold">{total}</p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Created</p>
        <p className="text-2xl font-bold">{created}</p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Updated</p>
        <p className="text-2xl font-bold">{updated}</p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Skipped</p>
        <p className="text-2xl font-bold">{skipped}</p>
      </div>
    </div>
  );
}
