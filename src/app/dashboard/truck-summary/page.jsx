import { prisma } from "@/lib/prisma";
import TruckSummaryTable from "@/components/TruckSummaryTable";

export default async function TruckSummaryPage() {
  const trucks = await prisma.truck.findMany({
    orderBy: {
      numberPlate: "asc",
    },
  });

  const expenses = await prisma.truckExpense.findMany({
    include: {
      truck: true,
    },
    orderBy: {
      expenseDate: "desc",
    },
  });

  return (
    <div className="p-6">
      <TruckSummaryTable trucks={trucks} expenses={expenses} />
    </div>
  );
}
