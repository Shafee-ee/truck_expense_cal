"use client";

import toast from "react-hot-toast";

import { addTransporterPayment } from "@/app/trips/[id]/actions";

export default function TransporterPaymentForm({
  tripId,
  tripStatus,
  payments = [],
}) {
  if (tripStatus !== "ACTIVE" && tripStatus !== "CLOSED") {
    return null;
  }

  async function handleSubmit(formData) {
    const result = await addTransporterPayment(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Transporter payment added");
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-800">
          Transporter Payments
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Record payments made to the transporter
        </p>
      </div>

      <form action={handleSubmit} className="grid grid-cols-2 gap-4">
        <input type="hidden" name="tripId" value={tripId} />

        <input
          name="amount"
          type="number"
          step="0.01"
          placeholder="Amount"
          className="h-11 rounded-lg border border-zinc-300 px-3"
          required
        />

        <select
          name="mode"
          className="h-11 rounded-lg border border-zinc-300 px-3"
          required
        >
          <option value="">Payment Mode</option>
          <option value="CASH">Cash</option>
          <option value="UPI">UPI</option>
          <option value="BANK">Bank</option>
        </select>

        <input
          name="note"
          placeholder="Note"
          className="h-11 rounded-lg border border-zinc-300 px-3 col-span-2"
        />

        <button className="col-span-2 h-11 rounded-lg bg-zinc-900 text-white">
          Add Transporter Payment
        </button>
      </form>
      {payments.length > 0 && (
        <div className="mt-6 border-t pt-4">
          <h3 className="mb-3 text-sm font-semibold text-zinc-700">
            Payment History
          </h3>

          <div className="space-y-2">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between rounded border p-3 text-sm"
              >
                <div>
                  <p className="text-xs text-zinc-500">
                    {new Date(payment.paymentDate).toLocaleDateString()} •{" "}
                    {payment.mode}
                  </p>
                </div>

                <p className="font-semibold">
                  ₹{payment.amount.toLocaleString("en-IN")}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
