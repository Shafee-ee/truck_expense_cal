import Link from "next/link";

export default function ImportCard({ step, title, description, status, href }) {
  return (
    <div className="flex items-center justify-between rounded-lg border p-6">
      <div>
        <p className="text-sm text-gray-500">Step {step}</p>

        <h2 className="text-xl font-semibold">{title}</h2>

        <p className="mt-1 text-sm text-gray-500">{description}</p>

        <p className="mt-3 text-sm font-medium">Status: {status}</p>
      </div>

      <Link href={href} className="rounded bg-blue-600 px-4 py-2 text-white">
        Open
      </Link>
    </div>
  );
}
