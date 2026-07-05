"use client";

import { useState, useTransition } from "react";
import toast from "react-hot-toast";
import { startTrip } from "@/app/trips/[id]/actions";

export default function StartTripButton({ tripId }) {
  const [isPending, startTransition] = useTransition();

  const [showDate, setShowDate] = useState(false);

  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  async function handleStartTrip() {
    startTransition(async () => {
      const result = await startTrip(tripId, startDate);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Trip started successfully");

      setShowDate(false);
    });
  }

  if (!showDate) {
    return (
      <button
        type="button"
        onClick={() => setShowDate(true)}
        className="
          rounded-lg
          bg-blue-600
          px-4
          py-2
          text-sm
          font-medium
          text-white
        "
      >
        Start Trip
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        className="
          rounded-lg
          border
          border-zinc-300
          px-3
          py-2
        "
      />

      <button
        type="button"
        onClick={handleStartTrip}
        disabled={isPending}
        className="
          rounded-lg
          bg-blue-600
          px-4
          py-2
          text-white
        "
      >
        {isPending ? "Starting..." : "Confirm"}
      </button>
    </div>
  );
}
