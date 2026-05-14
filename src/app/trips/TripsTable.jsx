"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
export default function TripsTable({ trips }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");

  const getStatusStyles = (status) => {
    if (status === "PLANNED") {
      return "bg-zinc-100 text-zinc-600 border border-zinc-200";
    }

    if (status === "ACTIVE") {
      return "bg-amber-100 text-amber-700 border border-amber-200";
    }

    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  };

  const getResultClass = (value) => {
    if (value > 0) return "text-emerald-600 font-semibold";
    if (value < 0) return "text-red-600 font-semibold";

    return "text-zinc-400";
  };
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const matchesSearch =
        trip.truck.numberPlate.toLowerCase().includes(search.toLowerCase()) ||
        trip.source.toLowerCase().includes(search.toLowerCase()) ||
        trip.destination.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" || trip.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [trips, search, statusFilter]);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search truck or route..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
        h-10
        w-72
        rounded-lg
        border
        border-zinc-300
        bg-white
        px-3
        text-sm
        text-zinc-700
        outline-none
        focus:border-amber-400
      "
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="
        h-10
        rounded-lg
        border
        border-zinc-300
        bg-white
        px-3
        text-sm
        text-zinc-700
      "
          >
            <option value="ALL">All Status</option>
            <option value="PLANNED">PLANNED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
          </select>
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-zinc-50">
          <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-6 py-3 text-left font-medium">Truck</th>

            <th className="px-6 py-3 text-left font-medium">Route</th>

            <th className="px-6 py-3 text-left font-medium">Status</th>

            <th className="px-6 py-3 text-left font-medium">Start Date</th>

            <th className="px-6 py-3 text-right font-medium">Result</th>
          </tr>
        </thead>

        <tbody>
          {filteredTrips.map((trip) => (
            <tr
              key={trip.id}
              onClick={() => router.push(`/trips/${trip.id}`)}
              className={`
                     border-b
                     border-zinc-100
                        text-sm
                    text-zinc-700
                    transition
                    hover:bg-amber-50
                    odd:bg-white
                    even:bg-zinc-50/40
                    cursor-pointer
                    ${trip.status === "ACTIVE" ? "bg-amber-50/60" : ""}
                    `}
            >
              <td className="px-6 py-3 font-medium text-zinc-900">
                {trip.truck.numberPlate}
              </td>

              <td className="px-6 py-3">
                {trip.source} → {trip.destination}
              </td>

              <td className="px-6 py-3">
                <span
                  className={`
                                inline-flex
                                rounded-full
                                px-2.5
                                py-1
                                text-xs
                                font-semibold
                                ${getStatusStyles(trip.status)}
                            `}
                >
                  {trip.status}
                </span>
              </td>

              <td className="px-6 py-3 text-zinc-500">
                {trip.startDate
                  ? new Date(trip.startDate).toISOString().slice(0, 10)
                  : "-"}
              </td>

              <td
                className={`px-6 py-3 text-right ${getResultClass(trip.result)}`}
              >
                {trip.status === "CLOSED"
                  ? trip.result >= 0
                    ? `₹${trip.result.toFixed(0)}`
                    : `-₹${Math.abs(trip.result).toFixed(0)}`
                  : "-"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
