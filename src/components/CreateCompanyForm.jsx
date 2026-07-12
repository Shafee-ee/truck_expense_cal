"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function CreateCompanyForm({
  company = null,
  action,
  successMessage,
}) {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await action(formData);
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success(successMessage);
      router.push("/companies");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        {company && <input type="hidden" name="id" value={company.id} />}
        <label className="mb-1 block text-sm font-medium">Company Name</label>

        <input
          type="text"
          name="name"
          defaultValue={company?.name || ""}
          className="w-full rounded border p-2"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="internal"
          type="checkbox"
          name="isInternal"
          value="true"
          defaultChecked={company?.isInternal}
        />
        <label htmlFor="internal">Internal Company</label>
      </div>

      <button
        disabled={isPending}
        className="rounded bg-black px-4 py-2 text-white disabled:opacity-50"
      >
        {isPending ? "Saving..." : "Save Company"}
      </button>
    </form>
  );
}
