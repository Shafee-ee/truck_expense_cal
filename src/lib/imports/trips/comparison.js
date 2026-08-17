import { prisma } from "@/lib/prisma";

function sameNumber(a, b) {
  return Math.abs((a ?? 0) - (b ?? 0)) < 0.01;
}

function sameDate(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;

  return (
    new Date(a).toISOString().slice(0, 10) ===
    new Date(b).toISOString().slice(0, 10)
  );
}

function getExpenseTotals(expenses) {
  return expenses.reduce(
    (totals, expense) => {
      switch (expense.category) {
        case "FUEL":
          totals.diesel += expense.amount;
          break;

        case "TOLL":
          totals.toll += expense.amount;
          break;

        case "LOADING":
          totals.loading += expense.amount;
          break;

        case "POLICE":
          totals.police += expense.amount;
          break;

        case "DRIVER_PAYMENT":
          totals.driver += expense.amount;
          break;

        case "OTHER":
          totals.other += expense.amount;
          break;
      }

      return totals;
    },
    {
      diesel: 0,
      toll: 0,
      loading: 0,
      police: 0,
      driver: 0,
      other: 0,
    }
  );
}

export async function compareTripRows(rows) {
  const comparison = [];

  for (const [index, row] of rows.entries()) {
    if (!row.vehicleNumber) {
      throw new Error(`Vehicle number is missing in row ${index + 1}`);
    }

    const truck = await prisma.truck.findUnique({
      where: {
        numberPlate: row.vehicleNumber,
      },
    });

    if (!truck) {
      comparison.push({
        rowNumber: index + 1,
        action: "ERROR",
        error: `Truck '${row.vehicleNumber}' not found`,
        row,
      });

      continue;
    }

    let trip = null;

    if (row.gcNumber) {
      trip = await prisma.trip.findFirst({
        where: {
          gcNumber: row.gcNumber,
          truckId: truck.id,
          grossAmount: row.grossAmount,
        },
        include: {
          expenses: true,
        },
      });

      if (!trip) {
        const candidates = await prisma.trip.findMany({
          where: {
            gcNumber: row.gcNumber,
            truckId: truck.id,
          },
          include: {
            expenses: true,
          },
        });

        if (candidates.length === 1) {
          trip = candidates[0];
        } else if (candidates.length > 1) {
          comparison.push({
            rowNumber: index + 1,
            action: "ERROR",
            error: `Multiple trips found for GC '${row.gcNumber}' and truck '${row.vehicleNumber}', but none matched gross amount ${row.grossAmount}`,
            row,
          });

          continue;
        }
      }
    }

    if (!trip) {
      comparison.push({
        rowNumber: index + 1,
        action: "CREATE",
        changes: [],
        truck,
        trip: null,
        row,
      });

      continue;
    }

    const expenses = getExpenseTotals(trip.expenses);

    const expectedOtherExpenses = (row.rto ?? 0) + (row.other ?? 0);

    const differences = {
      truckId: trip.truckId !== truck.id,
      gcNumber: trip.gcNumber !== row.gcNumber,
      billNumber: trip.billNumber !== row.billNumber,

      source: (trip.source ?? "") !== (row.source ?? ""),
      destination: (trip.destination ?? "") !== (row.destination ?? ""),

      startDate: !sameDate(trip.startDate, row.startDate),
      endDate: !sameDate(trip.endDate, row.endDate),

      freightWeight: !sameNumber(trip.freightWeight, row.freightWeight),

      ratePerUnit: !sameNumber(trip.ratePerUnit, row.ratePerUnit),

      grossAmount: !sameNumber(trip.grossAmount, row.grossAmount),

      customerDiesel: !sameNumber(trip.customerDiesel, row.customerDiesel),

      customerAdvance: !sameNumber(trip.customerAdvance, row.customerAdvance),

      tds: !sameNumber(trip.tds, row.tds),

      charges: !sameNumber(trip.charges, row.charges),

      damageAmount: !sameNumber(trip.damageAmount, row.damageAmount),
      gcBalance: !sameNumber(trip.gcBalance, row.gcBalance),

      expenseDiesel: !sameNumber(expenses.diesel, row.expenseDiesel),

      expenseToll: !sameNumber(expenses.toll, row.toll),

      expenseLoading: !sameNumber(expenses.loading, row.loading),

      expensePolice: !sameNumber(expenses.police, row.police),

      expenseDriver: !sameNumber(expenses.driver, row.driver),

      expenseOther: !sameNumber(expenses.other, expectedOtherExpenses),
    };

    const changed = Object.values(differences).some(Boolean);

    comparison.push({
      rowNumber: index + 1,
      action: changed ? "UPDATE" : "UNCHANGED",
      changes: [],
      truck,
      trip,
      row,
    });
  }

  return comparison;
}
