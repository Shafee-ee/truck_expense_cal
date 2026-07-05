import { prisma } from "@/lib/prisma";
import { calculateTruckMetrics } from "@/lib/finance";

export async function getTruckStatement(truckId, monthParam) {
  const now = monthParam ? new Date(`${monthParam}-01`) : new Date();

  const truck = await prisma.truck.findUnique({
    where: {
      id: truckId,
    },

    include: {
      trips: {
        where: {
          status: "CLOSED",
        },

        include: {
          expenses: true,
          payments: true,
        },

        orderBy: {
          closedAt: "asc",
        },
      },

      truckExpenses: {
        where: {
          month: now.getMonth() + 1,
          year: now.getFullYear(),
        },

        orderBy: {
          expenseDate: "asc",
        },
      },
    },
  });

  if (!truck) {
    return null;
  }

  const maintenanceCost = truck.truckExpenses.reduce(
    (sum, e) => sum + e.amount,
    0,
  );

  const summary = calculateTruckMetrics({
    truckNumber: truck.numberPlate,
    trips: truck.trips,
    maintenanceCost,
  });

  return {
    truckId: truck.id,
    truckNumber: truck.numberPlate,
    month: monthParam,
    summary,
    trips: truck.trips,
    maintenance: truck.truckExpenses,
  };
}
