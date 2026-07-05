"use client";

import { useState } from "react";
import { closeTrip } from "@/app/trips/[id]/actions";
import toast from "react-hot-toast";

export default function CloseTripButton({ id, canClose }) {
  const [showDate, setShowDate] = useState(false);

  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0],
  );

  async function handleClose() {
    const result = await closeTrip(id, endDate);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Trip closed successfully");

    setShowDate(false);
  }

  if (!showDate) {
    return (
      <button
        onClick={() => setShowDate(true)}
        disabled={!canClose}
        className={`mt-4 h-11 rounded-lg px-5 text-sm font-medium text-white transition ${
          canClose
            ? "bg-red-600 hover:bg-red-700"
            : "bg-zinc-300 cursor-not-allowed"
        }`}
      >
        Confirm & Close
      </button>
    );
  }

  return (
    <div className="mt-4 flex items-center gap-2">
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        className="
          rounded-lg
          border
          border-zinc-300
          px-3
          py-2
        "
      />

      <button
        onClick={handleClose}
        className="
          rounded-lg
          bg-red-600
          px-4
          py-2
          text-white
        "
      >
        Close Trip
      </button>
    </div>
  );
}
