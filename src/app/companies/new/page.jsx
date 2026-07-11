import Link from "next/link";
import { prisma } from "@/lib/prisma";

import Table from "@/components/ui/Table";
import TableRow from "@/components/ui/TableRow";

export default async function CompaniesPage() {
  const companies = await prisma.company.findMany({
    include: {
      trucks: true,
    },
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Companies</h1>

        <Link
          href="/dashboard/companies/new"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + New Company
        </Link>
      </div>

      <Table
        columns={[
          { key: "name", label: "Name" },
          { key: "type", label: "Type" },
          { key: "trucks", label: "Trucks" },
        ]}
      >
        {companies.map((company) => (
          <TableRow key={company.id}>
            <td className="px-4 py-3">{company.name}</td>

            <td className="px-4 py-3">
              {company.isInternal ? "Internal" : "Customer"}
            </td>

            <td className="px-4 py-3">{company.trucks.length}</td>
          </TableRow>
        ))}
      </Table>
    </div>
  );
}
