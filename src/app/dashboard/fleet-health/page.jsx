import { prisma } from "@/lib/prisma";

function getLatestExpense(truckExpenses, category) {
  return truckExpenses.find((expense) => expense.category === category);
}

const fleetHealth = trucks.map((truck) => {
  const lastTax = getLatestExpense(truck.truckExpenses, "TAX");

  const lastPermit = getLatestExpense(truck.truckExpenses, "PERMIT");

  const lastInsurance = getLatestExpense(truck.truckExpenses, "INSURANCE");

  const lastRepair = getLatestExpense(truck.truckExpenses, "REPAIR");

  return {
    truck: truck.numberPlate,
    lastTax,
    lastPermit,
    lastInsurance,
    lastRepair,
  };
});

export default async function FleetHealthPage() {
  const trucks = await prisma.truck.findMany({
    include: {
      truckExpenses: {
        orderBy: {
          expenseDate: "desc",
        },
      },
    },
  });

  console.log(trucks);

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Fleet Health</h1>
      </div>
      <div className="mt-6 space-y-4">
        {fleetHealth.map((truck) => (
          <div key={truck.truck} className="border rounded p-4">
            <h2 className="font-semibold">{truck.truck}</h2>

            <p>
              Tax:{" "}
              {truck.lastTax
                ? new Date(truck.lastTax.expenseDate).toLocaleDateString()
                : "No record"}
            </p>

            <p>
              Permit:{" "}
              {truck.lastPermit
                ? new Date(truck.lastPermit.expenseDate).toLocaleDateString()
                : "No record"}
            </p>

            <p>
              Insurance:{" "}
              {truck.lastInsurance
                ? new Date(truck.lastInsurance.expenseDate).toLocaleDateString()
                : "No record"}
            </p>

            <p>
              Repair:{" "}
              {truck.lastRepair
                ? new Date(truck.lastRepair.expenseDate).toLocaleDateString()
                : "No record"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
