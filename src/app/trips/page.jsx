export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import Link from "next/link";

import { prisma } from "@/lib/prisma";
import TripsTable from "./TripsTable";
import { calculateBalance } from "@/lib/finance";

export default async function TripsPage() {
  const trips = await prisma.trip.findMany({
    include: {
      truck: true,
      expenses: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const processedTrips = trips.map((trip) => {
    let result = null;

    if (trip.status === "CLOSED") {
      result = calculateBalance(trip);
    }

    return {
      ...trip,
      result,
    };
  });

  return (
    <div className="min-h-screen bg-zinc-100 p-6">
      <div className="w-full rounded-xl border border-zinc-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-zinc-200 px-6 py-5">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-800">Trips</h1>

            <p className="mt-1 text-sm text-zinc-500">
              Operational trip activity and financial status
            </p>
          </div>

          <Link
            href="/trips/new"
            className="
    rounded-lg
    border
    border-zinc-300
    bg-white
    px-4
    py-2
    text-sm
    font-medium
    text-zinc-700
    transition
    hover:bg-zinc-50
  "
          >
            New Trip
          </Link>
        </div>

        <div className="p-0">
          <TripsTable trips={processedTrips} />
        </div>
      </div>
    </div>
  );
}
