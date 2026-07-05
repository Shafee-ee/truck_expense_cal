import {
  calculateRevenue,
  calculateExpenses,
  calculateTripProfit,
  calculateTripDays,
} from "@/lib/finance";

import { getTruckStatement } from "@/lib/getTruckStatement";

import { Truck } from "lucide-react";
export const runtime = "nodejs";

export default async function TruckStatementPage(props) {
  const params = await props.params;

  const statement = await getTruckStatement(params.id, null);
  const summary = statement.summary;

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
  flex
  justify-between
  items-center
  shadow-sm
"
      >
        <div>
          <p
            className="
      text-sm
      uppercase
      tracking-wide
      text-slate-500
      font-medium
      "
          >
            Truck Statement
          </p>

          <h1
            className="
      text-3xl
      font-bold
      text-slate-900
      mt-1
      flex
      "
          >
            <Truck className="mt-2 mr-2" />
            {statement.truckNumber}
          </h1>
          <p
            className="
      text-sm
      text-slate-500
      mt-1
      "
          >
            Financial visibility across trips
          </p>
        </div>

        <div
          className="
    px-4
    py-2
    rounded-xl
    bg-slate-100
    text-sm
    font-medium
    text-slate-700
    "
        >
          Current Month
        </div>
      </div>
      <div
        className="
  grid
  grid-cols-1
  sm:grid-cols-2
  lg:grid-cols-4
  xl:grid-cols-7
  gap-4
  "
      >
        <Metric title="Revenue" value={summary.totalRevenue} />

        <Metric title="Trip Expense" value={summary.totalExpenses} />

        <Metric title="Maintenance" value={summary.maintenanceCost} />

        <Metric title="Outstanding" value={summary.outstanding} />

        <Metric title="Net Profit" value={summary.netProfit} />

        <Metric title="Trips" currency={false} value={summary.tripCount} />

        <Metric title="Per Day" value={summary.earningsPerDay} />
      </div>

      <div className="space-y-3">
        {statement.trips
          .filter((trip) => calculateRevenue(trip) <= 0)
          .map((trip) => (
            <div
              key={trip.id}
              className="
        bg-red-50
        border-l-4
        border-red-500
        rounded-lg
        px-4
        py-3
        "
            >
              <div className="font-semibold text-red-700">Missing Revenue</div>

              <div
                className="
          text-sm
          text-slate-700
          mt-1
          "
              >
                {trip.source}

                {" → "}

                {trip.destination}
              </div>

              <div
                className="
          text-xs
          text-red-600
          mt-1
          "
              >
                Trip closed without final revenue
              </div>
            </div>
          ))}

        {statement.trips
          .filter((trip) => calculateTripDays(trip) > 20)
          .map((trip) => (
            <div
              key={trip.id}
              className="
        bg-amber-50
        border-l-4
        border-amber-500
        rounded-lg
        px-4
        py-3
        "
            >
              <div
                className="
          font-semibold
          text-amber-700
          "
              >
                Operational Alert
              </div>

              <div
                className="
          text-sm
          text-slate-700
          mt-1
          "
              >
                {trip.source}

                {" → "}

                {trip.destination}
              </div>

              <div
                className="
          text-xs
          text-amber-700
          mt-1
          "
              >
                Active for {calculateTripDays(trip)}
                {" days"}
              </div>
            </div>
          ))}
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
        <div
          className="
    px-6
    py-5
    border-b
    bg-slate-50
    "
        >
          <h2
            className="
      text-lg
      font-semibold
      text-slate-900
      "
          >
            Trip Ledger
          </h2>

          <p
            className="
      text-sm
      text-slate-500
      mt-1
      "
          >
            Financial performance across completed trips
          </p>
        </div>

        <div className="overflow-x-auto">
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
          text-slate-600
          uppercase
          text-xs
          tracking-wide
          "
              >
                <th
                  className="
            text-left
            px-6
            py-4
            "
                >
                  Route
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
                  Profit
                </th>

                <th
                  className="
            text-right
            px-6
            py-4
            "
                >
                  Days
                </th>
              </tr>
            </thead>

            <tbody>
              {statement.trips.map((trip) => {
                const expense = calculateExpenses(trip.expenses);

                const revenue = calculateRevenue(trip);

                const profit = calculateTripProfit(trip);

                return (
                  <tr
                    key={trip.id}
                    className="
                border-b
                hover:bg-slate-50
                transition-colors
                "
                  >
                    <td
                      className="
                  px-6
                  py-4
                  font-medium
                  text-slate-800
                  "
                    >
                      {trip.source}

                      {" → "}

                      {trip.destination}
                    </td>

                    <td
                      className="
                  text-right
                  px-4
                  py-4
                  font-medium
                  "
                    >
                      ₹{revenue.toLocaleString()}
                    </td>

                    <td
                      className="
                  text-right
                  px-4
                  py-4
                  text-slate-700
                  "
                    >
                      ₹{expense.toLocaleString()}
                    </td>

                    <td
                      className={`
                  text-right
                  px-4
                  py-4
                  font-semibold

                  ${profit >= 0 ? "text-emerald-600" : "text-red-600"}
                  `}
                    >
                      ₹{profit.toLocaleString()}
                    </td>

                    <td
                      className="
                  text-right
                  px-6
                  py-4
                  text-slate-600
                  "
                    >
                      {trip.startDate && trip.endDate
                        ? calculateTripDays(trip)
                        : "-"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
        <div
          className="
    px-6
    py-5
    border-b
    bg-slate-50
    "
        >
          <h2
            className="
      text-lg
      font-semibold
      text-slate-900
      "
          >
            Monthly Truck Expenses
          </h2>

          <p
            className="
      text-sm
      text-slate-500
      mt-1
      "
          >
            Ownership and maintenance costs affecting profitability
          </p>
        </div>

        <div className="overflow-x-auto">
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
          text-slate-600
          uppercase
          text-xs
          tracking-wide
          "
              >
                <th
                  className="
            text-left
            px-6
            py-4
            "
                >
                  Date
                </th>

                <th
                  className="
            text-left
            px-4
            py-4
            "
                >
                  Category
                </th>

                <th
                  className="
            text-left
            px-4
            py-4
            "
                >
                  Notes
                </th>

                <th
                  className="
            text-right
            px-6
            py-4
            "
                >
                  Amount
                </th>
              </tr>
            </thead>

            <tbody>
              {statement.maintenance.map((expense) => (
                <tr
                  key={expense.id}
                  className="
              border-b
              hover:bg-slate-50
              transition-colors
              "
                >
                  <td
                    className="
                px-6
                py-4
                text-slate-700
                "
                  >
                    {new Date(expense.expenseDate).toLocaleDateString("en-IN")}
                  </td>

                  <td
                    className="
                px-4
                py-4
                "
                  >
                    <span
                      className="
                  px-2
                  py-1
                  rounded-full
                  text-xs
                  bg-slate-100
                  font-medium
                  "
                    >
                      {expense.category}
                    </span>
                  </td>

                  <td
                    className="
                px-4
                py-4
                text-slate-600
                "
                  >
                    {expense.notes || "-"}
                  </td>

                  <td
                    className="
                text-right
                px-6
                py-4
                font-semibold
                text-red-600
                "
                  >
                    ₹{expense.amount.toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
function Metric({ title, value, currency = true }) {
  return (
    <div
      className="
      bg-white
      border
      border-slate-200
      rounded-xl
      px-4
      py-3
      shadow-sm
      "
    >
      <div
        className="
        flex
        justify-between
        items-start
        "
      >
        <p
          className="
          text-[11px]
          uppercase
          tracking-[0.12em]
          text-slate-500
          font-semibold
          "
        >
          {title}
        </p>

        <div
          className="
          h-8
          w-[2px]
          rounded-full
          bg-slate-200
          "
        />
      </div>

      <p
        className="
        mt-2
        text-xl
        font-bold
        text-slate-900
        "
      >
        {currency ? "₹" : ""}

        {Number(value || 0).toLocaleString()}
      </p>
    </div>
  );
}
