import { prisma } from "@/lib/prisma";
import TruckSummaryTable from "@/components/TruckSummaryTable";

export default async function TruckSummaryPage() {
  const trucks = await prisma.truck.findMany({
    include: {
      company: true,
    },
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

  const totalExpense = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const trucksWithExpenses = new Set(expenses.map((expense) => expense.truckId))
    .size;

  const averagePerTruck =
    trucksWithExpenses === 0 ? 0 : totalExpense / trucksWithExpenses;

  return (
    <div className="p-6">
      <TruckSummaryTable
        trucks={trucks}
        expenses={expenses}
        stats={{
          totalTrucks: trucks.length,
          trucksWithExpenses,
          totalExpense,
          averagePerTruck,
        }}
      />
    </div>
  );
}
