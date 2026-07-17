export default function ImportSummary({
  total = 0,
  success = 0,
  warnings = 0,
  errors = 0,
}) {
  return (
    <div className="grid grid-cols-4 gap-4">
      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Total Rows</p>
        <p className="text-2xl font-bold">{total}</p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Ready</p>
        <p className="text-2xl font-bold">{success}</p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Warnings</p>
        <p className="text-2xl font-bold">{warnings}</p>
      </div>

      <div className="rounded border p-4">
        <p className="text-sm text-gray-500">Errors</p>
        <p className="text-2xl font-bold">{errors}</p>
      </div>
    </div>
  );
}
