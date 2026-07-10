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
          href="/companies/new"
          className="rounded-lg bg-black px-4 py-2 text-white"
        >
          + New Company
        </Link>
      </div>

      <Table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Trucks</th>
          </tr>
        </thead>

        <tbody>
          {companies.map((company) => (
            <TableRow key={company.id}>
              <td>{company.name}</td>

              <td>{company.isInternal ? "Internal" : "External"}</td>

              <td>{company.trucks.length}</td>
            </TableRow>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
