"use client";

import { deletePayment } from "@/app/trips/[id]/actions";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function DeletePaymentButton({ tripId, paymentId }) {
  const router = useRouter();

  async function handleDelete() {
    const formData = new FormData();

    formData.append("tripId", tripId);
    formData.append("paymentId", paymentId);

    const result = await deletePayment(formData);

    if (result?.error) {
      toast.error(result.error);
      return;
    }

    toast.success("Payment deleted");

    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleDelete}
      className="text-xs font-medium text-red-600 hover:text-red-700"
    >
      Delete
    </button>
  );
}
