export default function ImportSummary({
  total = 0,
  created = 0,
  updated = 0,
  skipped = 0,
  errors = 0,
}) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Processed</p>
        <p className="text-3xl font-bold">{total}</p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Created</p>
        <p className="text-3xl font-bold text-green-600">{created}</p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Updated</p>
        <p className="text-3xl font-bold text-blue-600">{updated}</p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Skipped</p>
        <p className="text-3xl font-bold text-yellow-600">{skipped}</p>
      </div>

      <div className="rounded-xl border p-4">
        <p className="text-sm text-gray-500">Errors</p>
        <p
          className={`text-3xl font-bold ${
            errors > 0 ? "text-red-600" : "text-gray-900"
          }`}
        >
          {errors}
        </p>
      </div>
    </div>
  );
}
