import { Wallet, TrendingUp, Truck, AlertTriangle } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard";
const formatCurrency = (num) => new Intl.NumberFormat("en-IN").format(num);

export default async function DashboardPage(props) {
  const searchParams = await props.searchParams;
  const selectedMonth =
    searchParams?.month ?? new Date().toISOString().slice(0, 7);

  const data = await getDashboardData(selectedMonth);

  const truckProfitability = data.truckProfitability ?? [];

  const operationalProfit = data.operationalProfit ?? 0;

  const fixedCost = data.fixedCost ?? 0;

  const total = operationalProfit + fixedCost;

  const operationalPercent = total > 0 ? (operationalProfit / total) * 100 : 0;

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {" "}
      {/* MONEY SECTION */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-semibold">Financial Summary</h2>

        <form className="flex items-center gap-3">
          <input
            type="month"
            name="month"
            defaultValue={selectedMonth}
            className="
      rounded-lg
      border border-gray-300
      px-3 py-2
      text-sm
    "
          />

          <button
            type="submit"
            className="
      rounded-lg
      bg-zinc-900
      px-4 py-2
      text-sm
      text-white
    "
          >
            Apply
          </button>
        </form>

        <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
          <div className="grid grid-cols-4 gap-8 items-center">
            {/* NET PROFIT */}
            <div className="border-r border-gray-100 pr-6">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Net Profit
              </p>

              <p
                className={`mt-4 text-3xl font-bold tracking-tight ${
                  (data.trueNetProfit ?? 0) >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                ₹{formatCurrency(data.trueNetProfit ?? 0)}
              </p>

              <div className="mt-5 space-y-2">
                <div
                  className={`flex items-center gap-2 text-sm ${
                    data.trueNetProfit >= 0 ? "text-green-600" : "text-red-500"
                  }`}
                >
                  <span>{data.trueNetProfit >= 0 ? "▲" : "▼"}</span>

                  <span>
                    {data.trueNetProfit >= 0
                      ? "Profitable operations"
                      : "Operational decline"}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  {data.trueNetProfit > 0
                    ? "Business is operating profitably"
                    : "Business is operating at a loss"}
                </p>
              </div>
            </div>
            {/* OPERATIONAL */}
            <div className="border-r border-gray-100 pr-6">
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Operational Profit
              </p>

              <p className="mt-4 text-3xl font-bold tracking-tight">
                ₹{formatCurrency(data.operationalProfit ?? 0)}
              </p>

              <div className="mt-5 space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>—</span>
                  <span>
                    {data.operationalProfit >= 0
                      ? "Closed trip earnings"
                      : "Operational losses"}
                  </span>
                </div>

                <p className="text-sm text-gray-500">Based on closed trips</p>
              </div>
            </div>
            {/* FIXED COST */}
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                Fixed Cost
              </p>

              <p className="mt-4 text-3xl font-bold tracking-tight">
                ₹{formatCurrency(data.fixedCost ?? 0)}
              </p>

              <div className="mt-5 space-y-2">
                <div
                  className={`flex items-center gap-2 text-sm ${
                    data.fixedCost > data.operationalProfit
                      ? "text-red-500"
                      : "text-green-600"
                  }`}
                >
                  <span>
                    {data.fixedCost > data.operationalProfit ? "▲" : "✓"}
                  </span>
                  <span>
                    {data.fixedCost > data.operationalProfit
                      ? "High maintenance pressure"
                      : "Maintenance under control"}
                  </span>
                </div>

                <p className="text-sm text-gray-500">
                  {data.fixedCost > data.operationalProfit
                    ? "Maintenance costs exceed earnings"
                    : "Maintenance costs under control"}
                </p>
              </div>
            </div>

            {/* VISUAL KPI */}
            <div className="flex flex-col items-center justify-center">
              <div
                className="
    relative
    w-40 h-40
    rounded-full
    flex items-center justify-center
    "
                style={{
                  background: `conic-gradient(
       #22c55e 0% ${operationalPercent}%,
#ef4444 ${operationalPercent}% 100%
      )`,
                }}
              >
                <div className="w-28 h-28 bg-white rounded-full flex flex-col items-center justify-center shadow-inner">
                  <span className="text-sm text-gray-500">Costs</span>
                  <span className="text-2xl font-bold">
                    {operationalPercent.toFixed(0)}%
                  </span>{" "}
                </div>
              </div>

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-green-500" />

                  <span className="text-gray-600">Operational Profit</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500" />

                  <span className="text-gray-600">Fixed Cost</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* OPERATIONS SECTION */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-semibold">Cash Position</h2>

        <div className="grid grid-cols-2 gap-6">
          {/* CASH DEPLOYED */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Cash Deployed</p>

              <p className="mt-3 text-4xl font-bold tracking-tight">
                ₹{formatCurrency(data.statusStrip?.cashDeployed ?? 0)}
              </p>

              <p className="mt-3 text-sm text-green-600">
                Active operational spending
              </p>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center">
              <Wallet size={28} className="text-green-600" />
            </div>
          </div>

          {/* RECEIVABLES */}
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  Outstanding (Receivable)
                </p>

                <p className="mt-3 text-4xl font-bold tracking-tight text-blue-600">
                  ₹{formatCurrency(data.statusStrip?.outstandingAmount ?? 0)}
                </p>

                <p className="mt-3 text-sm text-blue-500">
                  Pending collections
                </p>
              </div>

              <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center">
                <TrendingUp size={28} className="text-blue-600" />
              </div>
            </div>

            <div className="mt-6">
              {data.outstandingTrips?.length === 0 ? (
                <p className="text-sm text-gray-500">No pending receivables</p>
              ) : (
                <div className="space-y-3">
                  {data.outstandingTrips?.map((trip) => (
                    <div
                      key={trip.id}
                      className="
                  border border-gray-100
                  rounded-xl
                  p-4
                "
                    >
                      <div className="flex justify-between items-center">
                        <p className="font-semibold">
                          {trip.source} → {trip.destination}
                        </p>

                        <p className="font-bold text-blue-600">
                          ₹{formatCurrency(trip.outstanding)}
                        </p>
                      </div>

                      <div className="mt-2">
                        <span
                          className={`
                      inline-flex
                      rounded-full
                      px-3 py-1
                      text-sm font-medium
                      ${
                        trip.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }
                    `}
                        >
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {(() => {
          const cashDeployed = data.statusStrip?.cashDeployed ?? 0;

          const outstanding = data.statusStrip?.outstandingAmount ?? 0;

          const netProfit = data.trueNetProfit ?? 0;

          if (netProfit < 0 && cashDeployed > outstanding) {
            return (
              <p className="text-sm text-red-600 mt-2 font-semibold">
                Loss + cash outflow → high risk situation
              </p>
            );
          }

          if (netProfit > 0 && cashDeployed > outstanding) {
            return (
              <p className="text-sm text-orange-600 mt-2 font-semibold">
                Profitable but cash flow is weak
              </p>
            );
          }

          if (outstanding < cashDeployed * 0.5) {
            return (
              <p className="text-sm text-orange-500 mt-2">
                Collections are weak compared to expenses
              </p>
            );
          }

          return null;
        })()}
      </div>
      {/* LOSS TRIPS */}
      <div className="grid grid-cols-2 gap-6 pt-2">
        {/* LOSS TRIPS */}
        <div
          className="
    bg-white
    border border-gray-200
    rounded-2xl
    p-6
    shadow-sm
    "
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-red-600">
                Loss-Making Trips
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                Trips operating below profitability threshold
              </p>
            </div>

            <div
              className="
        w-14 h-14
        rounded-2xl
        bg-red-100
        flex items-center justify-center
        text-xl
        "
            >
              <AlertTriangle size={26} className="text-red-600" />{" "}
            </div>
          </div>

          <div className="mt-6">
            {data.lossTrips?.length === 0 ? (
              <p className="text-sm text-gray-500">
                No loss-making trips this month
              </p>
            ) : (
              <div className="space-y-3">
                {data.lossTrips?.map((trip) => (
                  <div
                    key={trip.id}
                    className="
              flex justify-between
              items-center
              border border-gray-100
              rounded-xl
              p-4
              "
                  >
                    <div>
                      <span className="font-medium">
                        {trip.source} →{trip.destination}
                      </span>

                      <div className="text-xs text-gray-500 mt-1">
                        {trip.tripDays} days • ₹
                        {formatCurrency(Math.round(trip.earningsPerDay))}
                        /day
                      </div>
                    </div>

                    <span className="text-red-600 font-bold">
                      -₹{formatCurrency(Math.abs(trip.finalBalance ?? 0))}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* TRUCK PROFITABILITY */}
        <div
          className="
    bg-white
    border border-gray-200
    rounded-2xl
    p-6
    shadow-sm
    "
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Truck Profitability</h2>

              <p className="mt-2 text-sm text-gray-500">
                Monthly truck-level performance
              </p>
            </div>

            <div
              className="
        w-14 h-14
        rounded-2xl
        bg-amber-100
        flex items-center justify-center
        text-xl
        "
            >
              <Truck size={28} className="text-amber-600" />{" "}
            </div>
          </div>

          <div className="mt-6">
            {data.truckProfitability?.length === 0 ? (
              <p className="text-sm text-gray-500">
                No truck profitability data
              </p>
            ) : (
              <div className="space-y-3">
                {data.truckProfitability.slice(0, 5).map((truck) => (
                  <div
                    key={truck.truckNumber}
                    className="
              border border-gray-100
              rounded-xl
              p-4
              "
                  >
                    <div className="flex justify-between items-center">
                      <p className="font-semibold">{truck.truckNumber}</p>

                      <p
                        className={`font-bold ${
                          truck.netProfit >= 0
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        ₹{formatCurrency(truck.netProfit)}
                      </p>
                    </div>

                    <div className="mt-2 text-sm text-gray-500">
                      Trips Completed:
                      {truck.tripCount}
                    </div>

                    <div className="text-sm text-gray-500">
                      Earnings/Day: ₹
                      {formatCurrency(Math.round(truck.earningsPerDay))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* COLLECTION RISK */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-semibold">Collections Risk</h2>

        {data.outstandingTrips?.length === 0 ? (
          <div
            className="
      bg-white
      border border-gray-200
      rounded-2xl
      p-6
      text-sm
      text-gray-500
      "
          >
            No outstanding collections
          </div>
        ) : (
          <div
            className="
      bg-white
      rounded-2xl
      border border-gray-200
      shadow-sm
      overflow-hidden
      "
          >
            <div
              className="
        grid
        grid-cols-5
        px-6 py-4
        bg-gray-50
        border-b
        border-gray-200
        text-xs
        uppercase
        tracking-wide
        text-gray-500
        font-semibold
        "
            >
              <div>Truck</div>
              <div>Route</div>
              <div className="text-right">Outstanding</div>
              <div className="text-center">Age</div>
              <div className="text-center">Risk</div>
            </div>

            {data.outstandingTrips.map((trip) => {
              const riskStyle = {
                NORMAL: "bg-green-100 text-green-700",

                WATCH: "bg-yellow-100 text-yellow-700",

                RISK: "bg-orange-100 text-orange-700",

                CRITICAL: "bg-red-100 text-red-700",
              }[trip.risk];

              return (
                <div
                  key={trip.id}
                  className="
            grid
            grid-cols-5
            items-center
            px-6 py-5
            border-b
            border-gray-100
            hover:bg-gray-50
            transition
            "
                >
                  <div
                    className="
              font-medium
              "
                  >
                    {trip.truckNumber}
                  </div>

                  <div>
                    {trip.source}
                    {" → "}
                    {trip.destination}
                  </div>

                  <div
                    className="
              text-right
              font-semibold
              text-blue-600
              "
                  >
                    ₹{formatCurrency(trip.outstanding)}
                  </div>

                  <div
                    className="
              text-center
              "
                  >
                    {trip.ageDays}d
                  </div>

                  <div
                    className="
              flex
              justify-center
              "
                  >
                    <span
                      className={`
                px-3
                py-1
                rounded-full
                text-sm
                font-medium
                ${riskStyle}
                `}
                    >
                      {trip.risk}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {/* COMPANY RECEIVABLES */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-semibold">Company Receivables</h2>

        {data.companyReceivables?.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 text-sm text-gray-500">
            No outstanding receivables
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <div className="grid grid-cols-5 px-6 py-4 bg-gray-50 border-b border-gray-200 text-xs uppercase tracking-wide text-gray-500 font-semibold">
              <div>Company</div>
              <div className="text-right">Receivable</div>
              <div className="text-right text-green-400 font-bold">
                Received
              </div>
              <div className="text-right text-blue-400 font-bold">
                Outstanding
              </div>
              <div className="text-center">Trips</div>
            </div>

            {data.companyReceivables.map((company) => (
              <div
                key={company.company}
                className="grid grid-cols-5 items-center px-6 py-5 border-b border-gray-100 hover:bg-gray-50 transition"
              >
                <div className="font-medium">{company.company}</div>

                <div className="text-right">
                  ₹{formatCurrency(company.receivable)}
                </div>

                <div className="text-right text-green-600">
                  ₹{formatCurrency(company.received)}
                </div>

                <div className="text-right font-semibold text-blue-600">
                  ₹{formatCurrency(company.outstanding)}
                </div>

                <div className="text-center">{company.tripCount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* TOP ACTIVE TRIPS */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-semibold">
          Highest Expense Active Trips{" "}
        </h2>

        {data.topActiveTrips?.length === 0 ? (
          <p className="text-sm text-gray-500">No active trips</p>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            {/* TABLE HEADER */}
            <div
              className="
    grid grid-cols-3
    px-6 py-4
    bg-gray-50
    border-b border-gray-200
    text-sm font-semibold text-gray-500
    uppercase tracking-wide
    "
            >
              <div>Route</div>
              <div>Status</div>
              <div className="text-right">Expense</div>
            </div>

            {/* TABLE ROWS */}
            {data.topActiveTrips?.map((trip) => (
              <div
                key={trip.id}
                className="
      grid grid-cols-3
      items-center
      px-6 py-5
      border-b border-gray-100
      hover:bg-gray-50
      transition
      "
              >
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {trip.source} → {trip.destination}
                  </p>

                  <p className="text-sm text-gray-500 mt-1">Active route</p>
                </div>

                <div>
                  <span
                    className="
          inline-flex
          items-center
          px-3 py-1
          rounded-full
          text-sm
          font-medium
          bg-green-100
          text-green-700
          "
                  >
                    Active
                  </span>
                </div>

                <div className="text-right">
                  <p className="font-semibold text-gray-900">
                    ₹{formatCurrency(trip.totalExpense ?? 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
