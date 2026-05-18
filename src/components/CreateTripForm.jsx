"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createTrip } from "@/app/trips/new/actions";
export default function CreateTripForm({ trucks, cities }) {
  const router = useRouter();
  const [revenueMode, setRevenueMode] = useState("FIXED");

  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await createTrip(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Trip created successfully");

      router.push("/trips");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Truck</label>

        <select name="truckId" required className="border p-2 w-full">
          <option value="">Select Truck</option>

          {trucks.map((t) => (
            <option key={t.id} value={t.id}>
              {t.numberPlate}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium">Source</label>

        <input
          name="source"
          list="source-cities"
          required
          className="border p-2 w-full"
        />

        <datalist id="source-cities">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium">Destination</label>

        <input
          name="destination"
          list="destination-cities"
          required
          className="border p-2 w-full"
        />

        <datalist id="destination-cities">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Revenue Type</label>

        <div className="flex gap-4">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="FIXED"
              checked={revenueMode === "FIXED"}
              onChange={(e) => setRevenueMode(e.target.value)}
            />
            Fixed Gross Amount
          </label>

          <label className="flex items-center gap-2">
            <input
              type="radio"
              value="VARIABLE"
              checked={revenueMode === "VARIABLE"}
              onChange={(e) => setRevenueMode(e.target.value)}
            />
            Quantity × Rate
          </label>
        </div>
      </div>

      {revenueMode == "VARIABLE" && (
        <>
          <div>
            <label className="block text-sm font-medium">Estimated Qty</label>

            <input
              name="estimatedQty"
              type="number"
              step="0.01"
              className="border p-2 w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium">Rate/Unit</label>

            <input
              type="number"
              name="ratePerUnit"
              step="0.01"
              className="border p-2 w-full"
            />
          </div>
        </>
      )}

      {revenueMode === "FIXED" && (
        <div>
          <label className="block text-sm font-medium">Gross Amount</label>

          <input
            name="grossAmount"
            type="number"
            step="0.01"
            className="border p-2 w-full"
          />

          <p className="text-xs text-gray-500 mt-1">
            If provided, Gross Amount overrides Qty × Rate calculations.
          </p>
        </div>
      )}

      <button
        disabled={isPending}
        className="
        bg-black
        text-white
        px-4
        py-2
        disabled:opacity-50
      "
      >
        {isPending ? "Creating..." : "Create Trip"}
      </button>
    </form>
  );
}
