"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";

import { updateActualQty } from "@/app/trips/[id]/actions";

export default function UpdateActualQtyForm({ tripId, actualQty }) {
  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await updateActualQty(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Actual quantity updated");
    });
  }

  return (
    <form action={handleSubmit} className="flex items-end gap-3">
      <input type="hidden" name="tripId" value={tripId} />

      <input
        name="actualQty"
        type="number"
        step="0.01"
        defaultValue={actualQty ?? ""}
        placeholder="Enter actual quantity"
        className="
          h-10
          w-64
          rounded-lg
          border
          border-zinc-300
          bg-white
          px-3
          text-sm
          text-zinc-700
          outline-none
          focus:border-amber-400
        "
        required
      />

      <button
        disabled={isPending}
        className="
          h-10
          rounded-lg
          bg-zinc-900
          px-4
          text-sm
          font-medium
          text-white
          transition
          hover:bg-zinc-800
          disabled:opacity-50
        "
      >
        {isPending ? "Updating..." : "Update Quantity"}
      </button>
    </form>
  );
}
