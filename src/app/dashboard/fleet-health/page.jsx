import { prisma } from "@/lib/prisma";

function getLatestExpense(truckExpenses, category) {
  return truckExpenses.find((expense) => expense.category === category);
}

function getTruckStatus({ taxDays, permitDays, insuranceDays }) {
  const values = [taxDays, permitDays, insuranceDays];

  if (values.some((v) => v === null)) {
    return {
      label: "Missing Records",
      color: "text-amber-600",
    };
  }

  if (values.some((v) => v > 365)) {
    return {
      label: "Overdue",
      color: "text-red-600",
    };
  }

  if (values.some((v) => v > 330)) {
    return {
      label: "Due Soon",
      color: "text-amber-600",
    };
  }

  return {
    label: "Healthy",
    color: "text-green-600",
  };
}

function getHealthStatus(days) {
  if (days === null) {
    return {
      label: "No Record",
      color: "text-gray-500",
    };
  }

  if (days > 365) {
    return {
      label: "Overdue",
      color: "text-red-600",
    };
  }

  if (days > 330) {
    return {
      label: "Due Soon",
      color: "text-amber-600",
    };
  }

  return {
    label: "Healthy",
    color: "text-green-600",
  };
}

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

  function daysSince(date) {
    if (!date) return null;

    return Math.floor(
      (Date.now() - new Date(date).getTime()) / (1000 * 60 * 60 * 24),
    );
  }

  const fleetHealth = trucks.map((truck) => {
    const lastTax = getLatestExpense(truck.truckExpenses, "TAX");

    const lastPermit = getLatestExpense(truck.truckExpenses, "PERMIT");

    const lastInsurance = getLatestExpense(truck.truckExpenses, "INSURANCE");

    const lastRepair = getLatestExpense(truck.truckExpenses, "REPAIR");
    const taxDays = daysSince(lastTax?.expenseDate);
    const permitDays = daysSince(lastPermit?.expenseDate);
    const insuranceDays = daysSince(lastInsurance?.expenseDate);
    const taxStatus = getHealthStatus(taxDays);
    const permitStatus = getHealthStatus(permitDays);
    const insuranceStatus = getHealthStatus(insuranceDays);

    return {
      truck: truck.numberPlate,

      taxDays,
      permitDays,
      insuranceDays,

      taxStatus,
      permitStatus,
      insuranceStatus,

      lastTax,
      lastPermit,
      lastInsurance,
      lastRepair,
    };
  });

  return (
    <>
      <div className="p-6">
        <h1 className="text-2xl font-bold">Fleet Health</h1>
      </div>
      <div className="mt-6 space-y-4">
        {fleetHealth.map((truck) => (
          <div key={truck.truck} className="border rounded p-4">
            <h2 className="font-semibold">{truck.truck}</h2>
            <p className={truck.insuranceStatus.color}>
              Insurance Status: {truck.insuranceStatus.label}
            </p>
            <p>
              Tax:
              {truck.taxDays !== null
                ? `${truck.taxDays} days ago`
                : " No record"}
            </p>

            <p>
              Permit:
              {truck.permitDays !== null
                ? `${truck.permitDays} days ago`
                : " No record"}
            </p>

            <p>
              Insurance:
              {truck.insuranceDays !== null
                ? `${truck.insuranceDays} days ago`
                : " No record"}
            </p>

            <p>
              Repair:
              {truck.lastRepair
                ? new Date(truck.lastRepair.expenseDate).toLocaleDateString()
                : " No record"}
            </p>
          </div>
        ))}
      </div>
    </>
  );
}
