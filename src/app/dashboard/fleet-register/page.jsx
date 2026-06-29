import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const runtime = "nodejs";

export default async function FleetRegisterPage() {
  const trucks = await prisma.truck.findMany({
    include: {
      truckExpenses: {
        orderBy: {
          expenseDate: "desc",
        },
      },
    },
    orderBy: {
      numberPlate: "asc",
    },
  });

  function getExpiry(truck, category) {
    const expense = truck.truckExpenses.find(
      (expense) => expense.category === category,
    );

    return expense?.expiryDate ? expense.expiryDate.toLocaleDateString() : "-";
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Fleet Register</h1>
        <p className="mt-2 text-slate-500">
          Vehicle Compliance and Document Tracking
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-3 text-left">Vehicle</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Registration</th>
              <th className="p-3 text-left">Fitness</th>
              <th className="p-3 text-left">Road Tax</th>
              <th className="p-3 text-left">Insurance</th>
              <th className="p-3 text-left">Permit</th>
              <th className="p-3 text-left">National Permit</th>
              <th className="p-3 text-left">Action</th>
            </tr>
          </thead>

          <tbody>
            {trucks.map((truck) => (
              <tr key={truck.id} className="border-t">
                <td className="p-3 font-medium">{truck.numberPlate}</td>

                <td className="p-3">{truck.vehicleType || "-"}</td>

                <td className="p-3">
                  {truck.registrationDate
                    ? truck.registrationDate.toLocaleDateString()
                    : "-"}
                </td>

                <td className="p-3">{getExpiry(truck, "FITNESS")}</td>

                <td className="p-3">{getExpiry(truck, "ROAD_TAX")}</td>

                <td className="p-3">{getExpiry(truck, "INSURANCE")}</td>

                <td className="p-3">{getExpiry(truck, "PERMIT")}</td>

                <td className="p-3">{getExpiry(truck, "NATIONAL_PERMIT")}</td>

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
