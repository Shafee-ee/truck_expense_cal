"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Link from "next/link";

import { updateExpense } from "@/app/trips/[id]/actions";

export default function EditExpenseForm({ expense, tripId }) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await updateExpense(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Expense updated successfully");

      router.push(`/trips/${tripId}`);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border border-blue-300 bg-blue-50 p-4">
      <form action={handleSubmit} className="space-y-4">
        <input type="hidden" name="expenseId" value={expense.id} />

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Category
          </label>

          <select
            name="category"
            defaultValue={expense.category}
            className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
          >
            <option value="FUEL">Fuel</option>

            <option value="TOLL">Toll</option>

            <option value="BROKER">Broker / Mamool</option>

            <option value="POLICE">Police</option>

            <option value="LOADING">Loading</option>

            <option value="UNLOADING">Unloading</option>

            <option value="REPAIR">Repair</option>

            <option value="OTHER">Other</option>
          </select>
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Amount
          </label>

          <input
            type="number"
            step="0.01"
            name="amount"
            defaultValue={expense.amount}
            className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-sm font-medium text-zinc-700">
            Note
          </label>

          <input
            type="text"
            name="note"
            defaultValue={expense.note || ""}
            className="h-11 w-full rounded-lg border border-zinc-300 bg-white px-3 text-sm"
          />
        </div>

        <div className="flex items-center gap-3">
          <button
            disabled={isPending}
            className="
              rounded-lg
              bg-zinc-900
              px-4
              py-2
              text-sm
              text-white
              disabled:opacity-50
            "
          >
            {isPending ? "Updating..." : "Update Expense"}
          </button>

          <Link
            href={`/trips/${tripId}`}
            className="rounded-lg border border-zinc-300 px-4 py-2 text-sm"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
