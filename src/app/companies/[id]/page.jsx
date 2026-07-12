import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

import Table from "@/components/ui/Table";
import TableRow from "@/components/ui/TableRow";

export default async function CompanyDetailpage({ params }) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: {
      id,
    },
    include: {
      trucks: {
        include: {
          trips: true,
        },
      },

      customerTrips: {
        include: {
          truck: true,
        },
      },

      transporterTrips: {
        include: {
          truck: true,
        },
      },
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold">{company.name}</h1>

          <p className="mt-2 text-zinc-500">
            {company.isInternal ? "Internal Company" : "External Company"}
          </p>
        </div>

        <Link
          href={`/companies/${company.id}/edit`}
          className="rounded-lg border border-zinc-300 px-4 py-2 text-sm font-medium hover:bg-zinc-50"
        >
          Edit Company
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Owned Trucks</p>

          <p className="mt-2 text-2xl font-bold">{company.trucks.length}</p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Customer Trips</p>

          <p className="mt-2 text-2xl font-bold">
            {company.customerTrips.length}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Transporter Trips</p>

          <p className="mt-2 text-2xl font-bold">
            {company.transporterTrips.length}
          </p>
        </div>

        <div className="rounded-lg border bg-white p-4">
          <p className="text-sm text-zinc-500">Type</p>

          <p className="mt-2 text-2xl font-bold">
            {company.isInternal ? "Internal" : "External"}
          </p>
        </div>
      </div>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold">Owned Trucks</h2>

        <Table
          columns={[
            { key: "numberPlate", label: "Number Plate" },
            { key: "vehicleType", label: "Vehicle Type" },
            { key: "trips", label: "Trips" },
          ]}
        >
          {company.trucks.map((truck) => (
            <TableRow key={truck.id}>
              <td className="px-4 py-3 font-medium">{truck.numberPlate}</td>

              <td className="px-4 py-3">{truck.vehicleType || "-"}</td>

              <td className="px-4 py-3">{truck.trips.length}</td>
            </TableRow>
          ))}
        </Table>
      </section>
    </div>
  );
}
