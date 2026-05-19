import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

import { calculateTruckMetrics } from "@/lib/finance";

export async function GET(request, props) {
  const params = await props.params;

  const truckId = params.id;

  const { searchParams } = new URL(request.url);

  const monthParam = searchParams.get("month");

  const now = monthParam ? new Date(`${monthParam}-01`) : new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

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
    return NextResponse.json(
      {
        error: "Truck not found",
      },

      {
        status: 404,
      },
    );
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

  return NextResponse.json({
    truckId: truck.id,

    truckNumber: truck.numberPlate,

    month: monthParam,

    summary,

    trips: truck.trips,

    maintenance: truck.truckExpenses,
  });
}
