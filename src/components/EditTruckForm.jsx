"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { updateTruck } from "@/app/dashboard/fleet-register/[id]/actions";

export default function EditTruckForm({ truck }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await updateTruck(truck.id, formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Truck updated successfully");

      router.replace("/dashboard/fleet-register");
    });
  }
  function formatDate(date) {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Vehicle Number</label>

        <input
          type="text"
          name="numberPlate"
          defaultValue={truck.numberPlate}
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Vehicle Type</label>

        <select
          name="vehicleType"
          defaultValue={truck.vehicleType}
          className="border p-2 w-full"
        >
          <option value="TRUCK">Truck</option>
          <option value="TEMPO">Tempo</option>
          <option value="CAR">Car</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Registration Date
        </label>

        <input
          type="date"
          name="registrationDate"
          defaultValue={formatDate(truck.registrationDate)}
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Fitness Expiry</label>

        <input
          type="date"
          name="fitnessExpiry"
          defaultValue={formatDate(truck.fitnessExpiry)}
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Road Tax Expiry
        </label>

        <input
          type="date"
          name="roadTaxExpiry"
          defaultValue={formatDate(truck.roadTaxExpiry)}
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Insurance Expiry
        </label>

        <input
          type="date"
          name="insuranceExpiry"
          defaultValue={formatDate(truck.insuranceExpiry)}
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Permit Expiry</label>

        <input
          type="date"
          name="permitExpiry"
          defaultValue={formatDate(truck.permitExpiry)}
          className="border p-2 w-full"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          National Permit Expiry
        </label>

        <input
          type="date"
          name="nationalPermitExpiry"
          defaultValue={formatDate(truck.nationalPermitExpiry)}
          className="border p-2 w-full"
        />
      </div>
      <button
        disabled={isPending}
        className="bg-black text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Changes"}
      </button>
    </form>
  );
}
