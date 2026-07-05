import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FleetRegisterAccordion from "@/components/FleetRegisterAccordion";

export const runtime = "nodejs";

export default async function FleetRegisterPage() {
  const trucks = await prisma.truck.findMany({
    include: {
      truckExpenses: {
        orderBy: {
          expenseDate: "desc",
        },
      },
    },
    orderBy: {
      numberPlate: "asc",
    },
  });

  function getExpiry(truck, category) {
    const expense = truck.truckExpenses.find(
      (expense) => expense.category === category,
    );

    return expense?.expiryDate ? expense.expiryDate.toLocaleDateString() : "-";
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Fleet Register</h1>
        <p className="mt-2 text-slate-500">
          Vehicle Compliance and Document Tracking
        </p>
      </div>

      <FleetRegisterAccordion trucks={trucks} />
    </div>
  );
}
