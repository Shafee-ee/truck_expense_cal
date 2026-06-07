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

    const truckStatus = getTruckStatus({
      taxDays,
      permitDays,
      insuranceDays,
    });

    const taxStatus = getHealthStatus(taxDays);
    const permitStatus = getHealthStatus(permitDays);
    const insuranceStatus = getHealthStatus(insuranceDays);

    return {
      truck: truck.numberPlate,

      taxDays,
      permitDays,
      insuranceDays,

      truckStatus,

      taxStatus,
      permitStatus,
      insuranceStatus,

      lastTax,
      lastPermit,
      lastInsurance,
      lastRepair,
    };
  });

  const summary = {
    missing: fleetHealth.filter(
      (t) => t.truckStatus.label === "Missing Records",
    ).length,

    overdue: fleetHealth.filter((t) => t.truckStatus.label === "Overdue")
      .length,

    dueSoon: fleetHealth.filter((t) => t.truckStatus.label === "Due Soon")
      .length,

    healthy: fleetHealth.filter((t) => t.truckStatus.label === "Healthy")
      .length,
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Fleet Health</h1>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Missing Records</p>

          <p className="text-2xl font-bold">{summary.missing}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Overdue</p>

          <p className="text-2xl font-bold text-red-600">{summary.overdue}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Due Soon</p>

          <p className="text-2xl font-bold text-amber-600">{summary.dueSoon}</p>
        </div>

        <div className="border rounded p-4">
          <p className="text-sm text-gray-500">Healthy</p>

          <p className="text-2xl font-bold text-green-600">{summary.healthy}</p>
        </div>
      </div>

      <div className="space-y-4">
        {fleetHealth.map((truck) => (
          <div key={truck.truck} className="border rounded p-4">
            <h2 className="font-semibold">{truck.truck}</h2>

            <p className={`font-semibold ${truck.truckStatus.color}`}>
              Status: {truck.truckStatus.label}
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
    </div>
  );
}
