"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createTruck } from "@/app/trucks/new/actions";

export default function CreateTruckForm() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

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
        <label className="block text-sm font-medium mb-1">
          Truck number plate
        </label>

        <input
          type="text"
          name="numberPlate"
          placeholder="TN09AB1234"
          className="border p-2 w-full"
          required
        />
      </div>

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
        {isPending ? "Saving..." : "Save Truck"}
      </button>
    </form>
  );
}
