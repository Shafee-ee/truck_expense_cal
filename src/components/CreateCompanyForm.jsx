"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createCompany } from "@/app/companies/new/actions";

export default function CreateCompanyForm() {
  const router = useRouter();

  const [isPending, startTransition] = useTransition();

  function handleSubmit(formData) {
    startTransition(async () => {
      const result = await createCompany(formData);

      if (result?.error) {
        toast.error(result.error);
        return;
      }

      toast.success("Company created successfully");

      router.push("/companies");
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium">Company Name</label>

        <input
          type="text"
          name="name"
          className="w-full rounded border p-2"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input id="internal" type="checkbox" name="isInternal" value="true" />

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
