export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import CreateTripForm from "@/components/CreateTripForm";

export default async function NewTripPage() {
  const trucks = await prisma.truck.findMany({
    include: {
      company: true,
    },
    orderBy: {
      numberPlate: "asc",
    },
  });

  const trips = await prisma.trip.findMany({
    select: {
      source: true,
      destination: true,
    },
  });

  const cities = [
    ...new Set(trips.flatMap((t) => [t.source, t.destination])),
  ].filter(Boolean);

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg p-6 shadow border border-slate-200">
      <h1 className="text-2xl font-bold mb-4">Create Trip</h1>
      <CreateTripForm trucks={trucks} cities={cities} />
    </div>
  );
}
