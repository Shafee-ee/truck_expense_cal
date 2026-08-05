"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
export default function TripsTable({ trips }) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [truckFilter, setTruckFilter] = useState("ALL");
  const [routeFilter, setRouteFilter] = useState("ALL");
  const [monthFilter, setMonthFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const getStatusStyles = (status) => {
    if (status === "PLANNED") {
      return "bg-zinc-100 text-zinc-600 border border-zinc-200";
    }

    if (status === "ACTIVE") {
      return "bg-amber-100 text-amber-700 border border-amber-200";
    }

    return "bg-emerald-100 text-emerald-700 border border-emerald-200";
  };

  const trucks = [
    ...new Set(trips.map((trip) => trip.truck.numberPlate)),
  ].sort();

  const routes = [
    ...new Set(trips.map((trip) => `${trip.source} → ${trip.destination}`)),
  ].sort();

  const months = [
    ...new Set(
      trips
        .filter((trip) => trip.startDate)
        .map((trip) =>
          new Date(trip.startDate).toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
          })
        )
    ),
  ].sort((a, b) => new Date(b) - new Date(a));
  const getResultClass = (value) => {
    if (value > 0) return "text-emerald-600 font-semibold";
    if (value < 0) return "text-red-600 font-semibold";

    return "text-zinc-400";
  };
  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const term = search.toLowerCase();

      const matchesSearch =
        term === "" ||
        trip.truck.numberPlate.toLowerCase().includes(term) ||
        trip.source.toLowerCase().includes(term) ||
        trip.destination.toLowerCase().includes(term) ||
        (trip.gcNumber ?? "").toLowerCase().includes(term) ||
        (trip.billNumber ?? "").toLowerCase().includes(term);

      const matchesTruck =
        truckFilter === "ALL" || trip.truck.numberPlate === truckFilter;

      const route = `${trip.source} → ${trip.destination}`;

      const matchesRoute = routeFilter === "ALL" || route === routeFilter;

      const tripMonth = trip.startDate
        ? new Date(trip.startDate).toLocaleString("en-IN", {
            month: "long",
            year: "numeric",
          })
        : "";

      const matchesType =
        typeFilter === "ALL" || (trip.loadType || "COMPANY") === typeFilter;

      const matchesMonth = monthFilter === "ALL" || tripMonth === monthFilter;

      const matchesStatus =
        statusFilter === "ALL" || trip.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesTruck &&
        matchesRoute &&
        matchesMonth
      );
    });
  }, [
    trips,
    search,
    statusFilter,
    typeFilter,
    truckFilter,
    routeFilter,
    monthFilter,
  ]);
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm">
      <div className="border-b border-zinc-200 bg-zinc-50 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="text"
            placeholder="Search truck, route, GC or bill..."
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
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
          >
            <option value="ALL">All Status</option>
            <option value="PLANNED">PLANNED</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="CLOSED">CLOSED</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
          >
            <option value="ALL">All Types</option>
            <option value="COMPANY">Company</option>
            <option value="EXTERNAL">External</option>
          </select>

          <select
            value={truckFilter}
            onChange={(e) => setTruckFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
          >
            <option value="ALL">All Trucks</option>

            {trucks.map((truck) => (
              <option key={truck} value={truck}>
                {truck}
              </option>
            ))}
          </select>
          <select
            value={routeFilter}
            onChange={(e) => setRouteFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
          >
            <option value="ALL">All Routes</option>

            {routes.map((route) => (
              <option key={route} value={route}>
                {route}
              </option>
            ))}
          </select>

          <select
            value={monthFilter}
            onChange={(e) => setMonthFilter(e.target.value)}
            className="h-10 rounded-lg border border-zinc-300 bg-white px-3 text-sm text-zinc-700"
          >
            <option value="ALL">All Months</option>

            {months.map((month) => (
              <option key={month} value={month}>
                {month}
              </option>
            ))}
          </select>

          <div className="ml-auto text-sm text-zinc-500">
            Showing <span className="font-medium">{filteredTrips.length}</span>{" "}
            of <span className="font-medium">{trips.length}</span> trips
          </div>
        </div>
      </div>
      <table className="w-full">
        <thead className="bg-zinc-50">
          <tr className="border-b border-zinc-200 text-xs uppercase tracking-wide text-zinc-500">
            <th className="px-6 py-3 text-left font-medium">Truck</th>
            <th className="px-6 py-3 text-left font-medium">Type</th>

            <th className="px-6 py-3 text-left font-medium">Route</th>

            <th className="px-6 py-3 text-left font-medium">Status</th>

            <th className="px-6 py-3 text-left font-medium">Start Date</th>

            <th className="px-6 py-3 text-right font-medium">Result</th>
          </tr>
        </thead>

        <tbody>
          {filteredTrips.length === 0 ? (
            <tr>
              <td colSpan={6} className="px-6 py-10 text-center text-zinc-500">
                No trips found.
              </td>
            </tr>
          ) : (
            filteredTrips.map((trip) => (
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

                <td className="px-6 py-5">
                  <span
                    className={`inline-flex rounded-md px-2 py-0.5 text-[11px] font-medium
    ${
      (trip.loadType || "COMPANY") === "COMPANY"
        ? "bg-emerald-100 text-emerald-700"
        : "bg-amber-100 text-amber-700"
    }`}
                  >
                    {trip.loadType || "COMPANY"}
                  </span>
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
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
