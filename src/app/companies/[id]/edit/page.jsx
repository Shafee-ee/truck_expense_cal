import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function EditCompanyPage({ params }) {
  const { id } = await params;

  const company = await prisma.company.findUnique({
    where: {
      id,
    },
  });

  if (!company) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Edit Company</h1>

      <div className="rounded-lg border bg-white p-6">
        <p className="text-lg font-medium">{company.name}</p>

        <p className="mt-2 text-zinc-500">
          {company.isInternal ? "Internal Company" : "External Company"}
        </p>
      </div>
    </div>
  );
}
