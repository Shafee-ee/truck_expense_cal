export default function StatCard({ title, value }) {
  return (
    <div className="rounded-lg border bg-white p-4">
      <p className="text-sm text-gray-500">{title}</p>

      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
