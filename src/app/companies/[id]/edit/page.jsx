import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CreateCompanyForm from "@/components/CreateCompanyForm";
import { updateCompany } from "./actions";

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

      <CreateCompanyForm
        company={company}
        action={updateCompany}
        successMessage="Company updated successfully"
      />
    </div>
  );
}
