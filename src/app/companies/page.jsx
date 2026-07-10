import { prisma } from "@/lib/prisma";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <a
          href="/companies/new"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + New Company
        </a>
      </div>
    </div>
  );
}
