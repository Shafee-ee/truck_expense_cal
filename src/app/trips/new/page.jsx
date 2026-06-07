export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import CreateTripForm from "@/components/CreateTripForm";

export default async function NewTripPage() {
  const trucks = await prisma.truck.findMany({
    orderBy: { numberPlate: "asc" },
  });

  console.log(
    "TRUCKS:",
    trucks.map((t) => ({
      id: t.id,
      plate: t.numberPlate,
    })),
  );

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
    <div className="p-6 bg-blue-50">
      <h1 className="text-2xl font-bold mb-4">Create Trip</h1>

      <CreateTripForm trucks={trucks} cities={cities} />
    </div>
  );
}
