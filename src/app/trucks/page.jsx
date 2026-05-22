import { prisma } from "@/lib/prisma";
import Link from "next/link";
import TruckRow from "./TrucksRow";
import { calculateTruckMetrics } from "@/lib/finance";
export const runtime = "nodejs";

export default async function TrucksPage(props) {
  const searchParams = await props.searchParams;

  const selectedMonth = searchParams?.month || null;
  const now = selectedMonth ? new Date(`${selectedMonth}-01`) : new Date();

  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const trucks = await prisma.truck.findMany({
    include: {
      trips: {
        where: {
          status: "CLOSED",

          closedAt: {
            gte: startOfMonth,
            lt: startOfNextMonth,
          },
        },

        include: {
          expenses: true,

          payments: true,
        },
      },

      truckExpenses: {
        where: {
          month: now.getMonth() + 1,

          year: now.getFullYear(),
        },
      },
    },
  });

  const rankedTrucks = trucks
    .map((truck) => {
      const maintenanceCost = truck.truckExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      const metrics = calculateTruckMetrics({
        truckNumber: truck.numberPlate,

        trips: truck.trips.filter((trip) => trip.status === "CLOSED"),

        maintenanceCost,
      });

      return {
        ...truck,
        metrics,
      };
    })

    .sort((a, b) => {
      if (a.metrics.tripCount === 0 && b.metrics.tripCount > 0) {
        return 1;
      }

      if (b.metrics.tripCount === 0 && a.metrics.tripCount > 0) {
        return -1;
      }

      return b.metrics.netProfit - a.metrics.netProfit;
    });

  const fleetRevenue = rankedTrucks.reduce(
    (sum, truck) => sum + truck.metrics.totalRevenue,
    0,
  );

  const fleetProfit = rankedTrucks.reduce(
    (sum, truck) => sum + truck.metrics.netProfit,
    0,
  );

  const fleetOutstanding = rankedTrucks.reduce(
    (sum, truck) => sum + truck.metrics.outstanding,
    0,
  );

  const activeTrucks = rankedTrucks.filter(
    (truck) => truck.metrics.tripCount > 0,
  ).length;

  const lossTrucks = rankedTrucks.filter(
    (truck) => truck.metrics.netProfit < 0,
  ).length;
  return (
    <div
      className="
    min-h-screen
    bg-slate-100
    p-6
    space-y-6
    "
    >
      <div
        className="
      bg-white
      border
      rounded-2xl
      p-6
      shadow-sm
      "
      >
        <p
          className="
        text-xs
        uppercase
        tracking-widest
        text-slate-500
        font-semibold
        "
        >
          Fleet Intelligence
        </p>

        <h1
          className="
        text-3xl
        font-bold
        mt-1
        "
        >
          Fleet Performance
        </h1>

        <p
          className="
        text-sm
        text-slate-500
        mt-2
        "
        >
          Profitability ranking across trucks
        </p>
      </div>
      <div className="mt-4">
        <form>
          <input
            type="month"
            name="month"
            defaultValue={
              selectedMonth ||
              `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
                2,
                "0",
              )}`
            }
            className="
      border
      rounded-lg
      px-3
      py-2
      "
          />

          <button
            className="
      ml-2
      px-4
      py-2
      bg-slate-900
      text-white
      rounded-lg
      "
          >
            Apply
          </button>
        </form>
      </div>

      <div
        className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-5
  gap-4
  "
      >
        <Card title="Fleet Revenue" value={fleetRevenue} />
        <Card title="Fleet Profit" value={fleetProfit} />
        <Card title="Outstanding" value={fleetOutstanding} />
        <Card title="Active Trucks" value={activeTrucks} raw />
        <Card title="Loss Trucks" value={lossTrucks} raw />
      </div>

      <div
        className="
      bg-white
      border
      border-slate-200
      rounded-2xl
      shadow-sm
      overflow-hidden
      "
      >
        <table
          className="
        w-full
        text-sm
        "
        >
          <thead>
            <tr
              className="
            bg-slate-100
            uppercase
            text-xs
            tracking-wide
            text-slate-500
            "
            >
              <th
                className="
              text-left
              px-6
              py-4
              "
              >
                Rank
              </th>

              <th
                className="
              text-left
              px-4
              py-4
              "
              >
                Truck
              </th>

              <th
                className="
              text-right
              px-4
              py-4
              "
              >
                Revenue
              </th>

              <th
                className="
              text-right
              px-4
              py-4
              "
              >
                Expense
              </th>

              <th
                className="
text-right
px-4
py-4
"
              >
                Outstanding
              </th>

              <th
                className="
              text-right
              px-4
              py-4
              "
              >
                Net
              </th>

              <th
                className="
              text-right
              px-4
              py-4
              "
              >
                Trips
              </th>

              <th
                className="
text-right
px-4
py-4
"
              >
                Efficiency
              </th>

              <th
                className="
              text-center
              px-6
              py-4
              "
              >
                Health
              </th>
            </tr>
          </thead>

          <tbody>
            {rankedTrucks.map((truck, index) => {
              const health =
                truck.metrics.tripCount === 0
                  ? "INACTIVE"
                  : truck.metrics.netProfit < 0
                    ? "LOSS"
                    : truck.metrics.outstanding > 100000
                      ? "COLLECTION"
                      : "HEALTHY";
              return (
                <TruckRow
                  key={truck.id}
                  truck={truck}
                  index={index}
                  health={health}
                />
              );
            })}
          </tbody>
        </table>
      </div>

      <Link
        href="/trucks/new"
        className="
      bg-black
      text-white
      px-4
      py-2
      rounded-lg
      inline-block
      "
      >
        Add Truck
      </Link>
    </div>
  );
}
function Card({ title, value, raw = false }) {
  return (
    <div
      className="
    bg-white
rounded-xl
border
border-slate-200
p-4
shadow-sm
hover:shadow-md
transition
      "
    >
      <p
        className="
        text-xs
        uppercase
        text-slate-500
        font-semibold
        "
      >
        {title}
      </p>

      <p
        className="
        text-2xl
        font-bold
        mt-2
        "
      >
        {raw ? value : `₹${Number(value).toLocaleString()}`}
      </p>
    </div>
  );
}
