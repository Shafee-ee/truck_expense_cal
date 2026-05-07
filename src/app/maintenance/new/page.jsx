export const runtime = "nodejs";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export default async function NewMaintenancePage() {
  async function createMaintenance(formData) {
    "use server";

    const truckNumber = formData.get("truckNumber");
    const month = formData.get("month");
    const totalCost = Number(formData.get("totalCost"));
    const note = formData.get("note") || null;

    if (!truckNumber || !month || !totalCost) {
      throw new Error("Missing required fields");
    }

    await prisma.truckMaintenance.create({
      data: {
        truckNumber,
        month,
        totalCost,
        note,
      },
    });

    redirect("/dashboard");
  }

  const trucks = await prisma.truck.findMany({
    orderBy: {
      numberPlate: "asc",
    },
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="max-w-md bg-white p-6 rounded shadow">
        <h1 className="text-2xl font-bold mb-4">Add Monthly Maintenance</h1>

        <form action={createMaintenance} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Truck</label>

            <select name="truckNumber" required className="border p-2 w-full">
              <option value="">Select Truck</option>

              {trucks.map((truck) => (
                <option key={truck.id} value={truck.numberPlate}>
                  {truck.numberPlate}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Month</label>

            <input
              type="month"
              name="month"
              required
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Total Maintenance Cost
            </label>

            <input
              type="number"
              step="0.01"
              name="totalCost"
              placeholder="Enter total amount"
              required
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Note (Optional)
            </label>

            <textarea
              name="note"
              rows="3"
              placeholder="Optional notes"
              className="border p-2 w-full"
            />
          </div>

          <button className="bg-black text-white px-4 py-2">
            Save Maintenance
          </button>
        </form>
      </div>
    </div>
  );
}
