import { redirect } from "next/navigation";
import CreateTruckForm from "@/components/CreateTruckForm";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

export default async function NewTruckPage() {
  const companies = await prisma.company.findMany({
    orderBy: {
      name: "asc",
    },
  });

  return (
    <div className="p-6 max-w-md">
      <h1 className="text-2xl font-bold mb-4">Add truck</h1>
      <CreateTruckForm companies={companies} />
    </div>
  );
}
