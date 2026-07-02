"use client";

import { useState } from "react";
import CompanyCombobox from "@/components/CompanyCombobox";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createTruck } from "@/app/trucks/new/actions";

export default function CreateTruckForm({ companies }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companyName, setCompanyName] = useState("");

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await createTruck(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Truck created successfully");

      router.replace("/trips");
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm rounded-sm font-medium mb-1">
          Vehicle
        </label>

        <input
          type="text"
          name="numberPlate"
          placeholder="KA01AB1234"
          className="border p-2 w-full"
          required
        />
      </div>

      <div>
        <label className="block text-sm mb-1 font-medium ">Vehicle Type</label>

        <select
          name="vehicleType"
          className="border p-2 rounded-sm w-full"
          required
        >
          <option value="">Select Vehicle</option>
          <option value="TRUCK">Truck</option>
          <option value="TEMPO">Tempo</option>
          <option value="CAR">Car</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Owner Company</label>

        <CompanyCombobox
          companies={companies}
          selectedCompany={selectedCompany}
          onChange={setSelectedCompany}
          companyName={companyName}
          setCompanyName={setCompanyName}
        />
        <input
          type="hidden"
          name="companyId"
          value={selectedCompany?.id ?? ""}
        />
        <input type="hidden" name="companyName" value={companyName} />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">
          Registration Date
        </label>

        <input
          type="date"
          name="registrationDate"
          className="border p-2 w-full"
        />
      </div>

      <button
        disabled={isPending}
        className="bg-black text-white px-4 py-2 disabled:opacity-50 "
      >
        {isPending ? "Saving..." : "Save Truck"}
      </button>
    </form>
  );
}
