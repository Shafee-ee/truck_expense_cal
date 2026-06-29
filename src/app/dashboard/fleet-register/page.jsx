import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

export default async function FleetRegisterPage() {
  const trucks = await prisma.truck.findMany({
    orderBy: {
      numberPlate: "asc",
    },
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Fleet Register</h1>
        <p className="text-slate-500 mt-2">
          Vehicle Compliance and document Tracking
        </p>
      </div>

      <div className="overflow-x-auto border rounded-xl bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-3">vehicle</th>
              <th className="text-left p-3">Type</th>
              <th className="text-left p-3">Registration</th>
              <th className="text-left p-3">Fitness</th>
              <th className="text-left p-3">Road Tax</th>
              <th className="text-left p-3">Insurance</th>
              <th className="text-left p-3">Permit</th>
              <th className="text-left p-3">National Permit</th>
              <th className="text-left p-3">Action</th>
            </tr>
          </thead>

          <tbody>
            {trucks.map((truck) => (
              <tr key={truck.id} className="border-t">
                <td className="p-3 font-medium">{truck.numberPlate}</td>
                <td className="p-3 font-medium">{truck.vehicleType || "-"}</td>
                <td className="p-3 font-medium">
                  {truck.registrationDate
                    ? truck.registrationDate.toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3 font-medium">
                  {truck.fitnessExpiry
                    ? truck.fitnessExpiry.toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3 font-medium">
                  {truck.roadTaxExpiry
                    ? truck.roadTaxExpiry.toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3 font-medium">
                  {truck.insuranceExpiry
                    ? truck.insuranceExpiry.toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3 font-medium">
                  {truck.permitExpiry
                    ? truck.permitExpiry.toLocaleDateString()
                    : "-"}
                </td>
                <td className="p-3 font-medium">
                  {truck.nationalPermitExpiry
                    ? truck.nationalPermitExpiry.toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">
                  <Link
                    href={`/dashboard/fleet-register/${truck.id}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
