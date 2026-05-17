"use client";

import { addPayment } from "@/app/trips/[id]/actions";
import toast from "react-hot-toast";

export default function AddPaymentForm({ tripId, tripStatus }) {
  if (tripStatus !== "ACTIVE" && tripStatus !== "CLOSED") {
    return null;
  }
  async function handleSubmit(formData) {
    const result = await addPayment(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Payment added");
  }
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-800">
          Payment Management
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Record incoming customer payments and settlements
        </p>
      </div>

      <form action={handleSubmit} className="grid grid-cols-2 gap-4">
        <input type="hidden" name="tripId" value={tripId} />
        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount"
          className="
            h-11
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
        <select
          name="type"
          className="
            h-11
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
        >
          <option value="">Payment Type</option>
          <option value="ADVANCE">Advance</option>
          <option value="SETTLEMENT">Settlement</option>
        </select>
        <select
          name="mode"
          className="
            h-11
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
        >
          <option value="">Payment Mode</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="BANK">Bank</option>
        </select>
        <input
          name="note"
          placeholder="Note (optional)"
          className="
            h-11
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
        />
        <button
          className="
            col-span-2
            h-11
            rounded-lg
            bg-zinc-900
            px-4
            text-sm
            font-medium
            text-white
            transition
            hover:bg-zinc-800
          "
        >
          Add Payment
        </button>
      </form>
    </div>
  );
}
