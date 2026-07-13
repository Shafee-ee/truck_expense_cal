"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import TruckCombobox from "@/components/TruckCombobox";

import { createTrip } from "@/app/trips/new/actions";
export default function CreateTripForm({ trucks, cities }) {
  const router = useRouter();
  const [revenueMode, setRevenueMode] = useState("FIXED");
  const [loadType, setLoadType] = useState("EXTERNAL");
  const [isPending, startTransition] = useTransition();
  const [selectedTruck, setSelectedTruck] = useState(null);
  const [truckNumber, setTruckNumber] = useState("");

  const inputClass =
    "w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200";

  function handleSubmit(formData) {
    startTransition(async () => {
      if (!selectedTruck) {
        toast.error("Please select a truck from the list.");
        return;
      }
      const result = await createTrip(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Trip created successfully");

      router.replace("/trips");
    });
  }

  return (
    <form
      action={handleSubmit}
      className="space-y-4"
      onKeyDown={(e) => {
        if (e.key === "Enter" && e.target.tagName !== "TEXTAREA") {
          e.preventDefault();
        }
      }}
    >
      <div>
        <label className="block text-sm font-medium">Truck</label>

        <TruckCombobox
          trucks={trucks}
          selectedTruck={selectedTruck}
          onChange={setSelectedTruck}
          truckNumber={truckNumber}
          setTruckNumber={setTruckNumber}
        />

        <input
          type="hidden"
          name="truckId"
          className={inputClass}
          value={selectedTruck?.id ?? ""}
        />
      </div>
      <div>
        <label className="block text-sm font-medium">Source</label>

        <input
          name="source"
          list="source-cities"
          required
          className={inputClass}
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
          className={inputClass}
        />

        <datalist id="destination-cities">
          {cities.map((city) => (
            <option key={city} value={city} />
          ))}
        </datalist>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div>
          <label className="block text-sm font-medium">Distance (KM)</label>

          <input
            type="number"
            name="tripDistance"
            step="0.1"
            min="0"
            required
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium">
            Freight Weight (Tonnes)
          </label>

          <input
            type="number"
            name="freightWeight"
            step="0.01"
            min="0"
            required
            className={inputClass}
          />
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="block text-sm font-medium mb-2">Load Type</label>
        <label className="flex items-center gap-3 cursor-pointer rounded-md border border-transparent p-2 hover:bg-white">
          <input
            type="radio"
            name="loadType"
            value="COMPANY"
            checked={loadType === "COMPANY"}
            onChange={(e) => setLoadType(e.target.value)}
          />
          <div>
            <p className="font-medium">Company (GJ)</p>

            <p className="text-xs text-slate-500">
              Uses your own company's goods.
            </p>
          </div>{" "}
        </label>

        <label className="flex items-center gap-3 cursor-pointer rounded-md border border-transparent p-2 hover:bg-white">
          <input
            type="radio"
            name="loadType"
            value="EXTERNAL"
            checked={loadType === "EXTERNAL"}
            onChange={(e) => setLoadType(e.target.value)}
          />

          <div>
            External
            <p className="text-xs text-slate-500">
              Customer or third-party transport.
            </p>
          </div>
        </label>
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
        <label className="block text-sm font-semibold text-slate-700 mb-3">
          Revenue Type
        </label>

        <div className="space-y-3">
          <label className="flex items-center gap-3 cursor-pointer rounded-md border border-transparent p-2 hover:bg-white">
            <input
              type="radio"
              name="revenueMode"
              value="FIXED"
              checked={revenueMode === "FIXED"}
              onChange={(e) => setRevenueMode(e.target.value)}
            />
            <div>
              <p className="font-medium">Total Amount</p>
              <p className="text-xs text-slate-500">
                Enter the agreed freight amount.
              </p>
            </div>
          </label>

          <label className="flex items-center gap-3 cursor-pointer rounded-md border border-transparent p-2 hover:bg-white">
            <input
              type="radio"
              name="revenueMode"
              value="VARIABLE"
              checked={revenueMode === "VARIABLE"}
              onChange={(e) => setRevenueMode(e.target.value)}
            />
            <div>
              <p className="font-medium">Rate Per Tonne</p>
              <p className="text-xs text-slate-500">
                Revenue will be calculated using freight weight × rate.
              </p>
            </div>
          </label>
        </div>
      </div>

      {revenueMode == "VARIABLE" && (
        <>
          <div>
            <label className="block text-sm font-medium">
              Rate (₹ / Tonne)
            </label>

            <input
              type="number"
              name="ratePerUnit"
              step="0.01"
              required={revenueMode === "VARIABLE"}
              className={inputClass}
            />
          </div>
        </>
      )}
      {loadType === "EXTERNAL" && (
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">
            Mamool
          </label>
          <input
            name="mamool"
            max="3000"
            min="0"
            placeholder="0"
            className={inputClass}
          />

          <p
            className="
      text-xs
      text-gray-500
      mt-1
      "
          >
            External trips only
          </p>
        </div>
      )}
      {revenueMode === "FIXED" && (
        <div>
          <label className="block text-sm font-medium">
            Freight Amount(Gross)
          </label>

          <input
            name="grossAmount"
            type="number"
            step="0.01"
            required={revenueMode === "FIXED"}
            className={inputClass}
          />

          <p className="text-xs text-gray-500 mt-1">
            Enter the total freight agreed with the customer.
          </p>
        </div>
      )}
      <button
        disabled={isPending}
        className="
        bg-slate-700
hover:bg-slate-800
text-white
rounded-md
py-2 px-4 
      "
      >
        {isPending ? "Creating..." : "Create Trip"}
      </button>
    </form>
  );
}
