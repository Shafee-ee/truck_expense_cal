"use client";

import toast from "react-hot-toast";

import { addCustomerPayment } from "@/app/trips/[id]/actions";

export default function CustomerPaymentForm({
  tripId,
  tripStatus,
  payments = [],
}) {
  if (tripStatus !== "ACTIVE" && tripStatus !== "CLOSED") {
    return null;
  }

  async function handleSubmit(formData) {
    const result = await addCustomerPayment(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Customer payment added");
  }

  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold text-zinc-800">
          Customer Payments
        </h2>

        <p className="mt-1 text-sm text-zinc-500">
          Record payments received from the customer
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
          name="type"
          className="h-11 rounded-lg border border-zinc-300 px-3"
          required
        >
          <option value="">Payment Type</option>
          <option value="ADVANCE">Advance</option>
          <option value="SETTLEMENT">Settlement</option>
        </select>

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
          className="h-11 rounded-lg border border-zinc-300 px-3"
        />

        <button className="col-span-2 h-11 rounded-lg bg-zinc-900 text-white">
          Add Customer Payment
        </button>

        {payments.length > 0 && (
          <div className="col-span-2 mt-6 border-t pt-4">
            <h3 className="font-semibold mb-2">Payment History</h3>

            <div className="space-y-2">
              {payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between rounded border p-2 text-sm"
                >
                  <div>
                    <p className="font-medium">
                      ₹{payment.amount.toLocaleString("en-IN")}
                    </p>

                    <p className="text-zinc-500">
                      {payment.type} • {payment.mode}
                    </p>
                  </div>

                  <div className="text-right text-zinc-500">
                    {new Date(payment.paymentDate).toLocaleDateString("en-IN")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
