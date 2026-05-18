"use client";

import { closeTrip } from "@/app/trips/[id]/actions";
import toast from "react-hot-toast";

export default function CloseTripButton({ id, canClose }) {
  async function handleClose() {
    const result = await closeTrip(id);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Trip closed successfully");
  }

  return (
    <button
      onClick={handleClose}
      disabled={!canClose}
      className={`mt-4 h-11 rounded-lg px-5 text-sm font-medium text-white transition ${
        canClose
          ? "bg-red-600 hover:bg-red-700"
          : "bg-zinc-300 cursor-not-allowed"
      }`}
    >
      Confirm & close
    </button>
  );
}
