"use client";

import { useTransition } from "react";
import toast from "react-hot-toast";
import { startTrip } from "@/app/trips/[id]/actions";

export default function StartTripButton({ tripId }) {
  const [isPending, startTransition] = useTransition();

  async function handleStartTrip() {
    startTransition(async () => {
      const result = await startTrip(tripId);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Trip started successfully");
    });
  }

  return (
    <button
      type="button"
      onClick={handleStartTrip}
      disabled={isPending}
      className="
        rounded-lg
        bg-blue-600
        px-4
        py-2
        text-sm
        font-medium
        text-white
        transition
        hover:bg-blue-700
        disabled:cursor-not-allowed
        disabled:opacity-50
      "
    >
      {isPending ? "Starting..." : "Start Trip"}
    </button>
  );
}
