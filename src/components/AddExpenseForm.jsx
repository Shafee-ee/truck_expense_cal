"use client";

import { addExpense } from "@/app/trips/[id]/actions";
import toast from "react-hot-toast";

export default function AddExpenseForm({ tripId }) {
  async function handleSubmit(formData) {
    const result = await addExpense(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Expense added");
  }

  return (
    <form action={handleSubmit} className="grid grid-cols-2 gap-4">
      <input type="hidden" name="tripId" value={tripId} />

      <select
        name="category"
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
        <option value="">Select Category</option>
        <option value="FUEL">Fuel</option>
        <option value="TOLL">Toll</option>
        <option value="POLICE">Police</option>
        <option value="LOADING">Loading</option>
        <option value="UNLOADING">Unloading</option>
        <option value="REPAIR">Repair</option>
        <option value="OTHER">Other</option>
      </select>

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

      <input
        type="file"
        name="bill"
        accept="image/*,application/pdf"
        className="
          flex
          h-11
          items-center
          rounded-lg
          border
          border-zinc-300
          bg-white
          px-3
          text-sm
          text-zinc-600
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
        Add Expense
      </button>
    </form>
  );
}
