import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { calculateTruckMetrics } from "@/lib/finance";
export const runtime = "nodejs";

export default async function TrucksPage() {
  const trucks = await prisma.truck.findMany({
    include: {
      trips: {
        include: {
          expenses: true,
          payments: true,
        },
      },

      truckExpenses: true,
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

      <div
        className="
  grid
  grid-cols-2
  md:grid-cols-3
  xl:grid-cols-5
  gap-4
  "
      >
        {" "}
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
                <Link
                  key={truck.id}
                  href={`/trucks/${truck.id}/statement`}
                  className="
  contents
  "
                >
                  <tr
                    className="
    border-b
    hover:bg-slate-50
    transition
    cursor-pointer
    "
                  >
                    <td
                      className="
                    px-6
                    py-5
                    font-semibold
                    "
                    >
                      #{index + 1}
                    </td>

                    <td
                      className="
                    px-4
                    py-5
                    "
                    >
                      <Link
                        href={`/trucks/${truck.id}/statement`}
                        className="
  font-semibold
  hover:text-blue-700
  flex
  items-center
  justify-between
  "
                      >
                        {truck.numberPlate}

                        <span
                          className="
    ml-2
    text-slate-400
    "
                        >
                          →
                        </span>
                      </Link>
                    </td>

                    <td
                      className="
                    text-right
                    px-4
                    "
                    >
                      ₹{truck.metrics.totalRevenue.toLocaleString()}
                    </td>

                    <td
                      className="
                    text-right
                    px-4
                    "
                    >
                      ₹
                      {(
                        truck.metrics.totalExpenses +
                        truck.metrics.maintenanceCost
                      ).toLocaleString()}
                    </td>
                    <td
                      className="
text-right
px-4
"
                    >
                      ₹{truck.metrics.outstanding.toLocaleString()}
                    </td>
                    <td
                      className={`
                    text-right
                    px-4
                    font-semibold

                    ${
                      truck.metrics.netProfit >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                    `}
                    >
                      ₹{truck.metrics.netProfit.toLocaleString()}
                    </td>

                    <td
                      className="
                    text-right
                    px-4
                    "
                    >
                      {truck.metrics.tripCount}
                    </td>
                    <td
                      className="
  text-right
  px-4
  "
                    >
                      {truck.metrics.tripCount > 0
                        ? `₹${Math.round(
                            truck.metrics.earningsPerDay,
                          ).toLocaleString()}`
                        : "-"}
                    </td>
                    <td
                      className="
                    text-center
                    px-6
                    "
                    >
                      <span
                        className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold

                      ${
                        health === "HEALTHY"
                          ? "bg-green-100 text-green-700"
                          : health === "COLLECTION"
                            ? "bg-yellow-100 text-yellow-700"
                            : health === "INACTIVE"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-red-100 text-red-700"
                      }
                      `}
                      >
                        {health}
                      </span>
                    </td>
                  </tr>
                </Link>
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
