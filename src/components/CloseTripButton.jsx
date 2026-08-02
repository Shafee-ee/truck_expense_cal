"use client";

import { useState } from "react";
import { closeTrip } from "@/app/trips/[id]/actions";
import toast from "react-hot-toast";

export default function CloseTripButton({
  id,
  canClose,
  startOdometer,
  tripDistance,
}) {
  const [showDate, setShowDate] = useState(false);

  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const hasSuggestion = startOdometer != null && tripDistance != null;

  const suggestedOdometer = hasSuggestion
    ? Number(startOdometer) + Number(tripDistance)
    : null;

  const [endOdometer, setEndOdometer] = useState(
    suggestedOdometer ? suggestedOdometer.toString() : ""
  );

  async function handleClose() {
    const result = await closeTrip(id, endDate, endOdometer);
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

      {hasSuggestion && (
        <p className="text-sm text-zinc-600">
          Suggested Closing Odometer:{" "}
          <span className="font-medium">
            {suggestedOdometer.toLocaleString()}
          </span>
        </p>
      )}

      <input
        type="number"
        step="1"
        min="1"
        placeholder="Closing Odometer"
        value={endOdometer}
        onChange={(e) => setEndOdometer(e.target.value)}
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
