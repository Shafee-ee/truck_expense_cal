import { Wallet, TrendingUp, Truck, AlertTriangle } from "lucide-react";
import { getDashboardData } from "@/lib/dashboard";
const formatCurrency = (num) => new Intl.NumberFormat("en-IN").format(num);

export default async function DashboardPage(props) {
  const searchParams = await props.searchParams;
  const selectedMonth =
    searchParams?.month ?? new Date().toISOString().slice(0, 7);

  const data = await getDashboardData(selectedMonth);

  const truckProfitability = data.truckProfitability ?? [];
  const fleetMetrics = data.fleetMetrics ?? {};

  const lossTrips = data.lossTrips ?? [];

  const routeMetrics = data.routeMetrics ?? [];

  const outstandingTrips = data.outstandingTrips ?? [];

  const companyReceivables = data.companyReceivables ?? [];
  const companyReceivableSummary = data.companyReceivableSummary ?? {
    companyCount: 0,
    outstanding: 0,
  };

  const topActiveTrips = data.topActiveTrips ?? [];

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
          <div className="grid grid-cols-3 gap-8 items-center">
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
          </div>
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

        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="rounded-xl bg-green-50 p-4">
            <p className="text-xs text-gray-500">Best Truck</p>

            <p className="mt-2 font-semibold">
              {fleetMetrics?.mostProfitableTruck?.truckNumber ?? "-"}
            </p>

            <p className="text-green-600 font-bold">
              ₹
              {formatCurrency(
                fleetMetrics?.mostProfitableTruck?.netProfit ?? 0
              )}
            </p>
          </div>

          <div className="rounded-xl bg-red-50 p-4">
            <p className="text-xs text-gray-500">Worst Truck</p>

            <p className="mt-2 font-semibold">
              {fleetMetrics?.leastProfitableTruck?.truckNumber ?? "-"}
            </p>

            <p className="text-red-600 font-bold">
              ₹
              {formatCurrency(
                fleetMetrics?.leastProfitableTruck?.netProfit ?? 0
              )}
            </p>
          </div>
        </div>

        <div className="mt-6">
          {truckProfitability?.length === 0 ? (
            <p className="text-sm text-gray-500">No truck profitability data</p>
          ) : (
            <div className="space-y-3">
              {truckProfitability.slice(0, 5).map((truck) => (
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
                        truck.netProfit >= 0 ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      ₹{formatCurrency(truck.netProfit)}
                    </p>
                  </div>
                  <div className="mt-2 flex justify-between text-sm text-gray-500">
                    <p>Trips: {truck.tripCount}</p>

                    <p>Maintenance: ₹{formatCurrency(truck.maintenanceCost)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {/* COMPANY RECEIVABLES */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-semibold">Company Receivables</h2>

        <div className="grid grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Outstanding</p>

            <p className="mt-2 text-3xl font-bold text-blue-600">
              ₹{formatCurrency(companyReceivableSummary.outstanding)}
            </p>

            <p className="mt-1 text-sm text-gray-500">
              {companyReceivableSummary.companyCount} Companies
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <p className="text-sm text-gray-500">Average Outstanding</p>

            <p className="mt-2 text-3xl font-bold">
              ₹
              {formatCurrency(
                companyReceivableSummary.outstanding /
                  Math.max(companyReceivableSummary.companyCount, 1)
              )}
            </p>

            <p className="mt-1 text-sm text-gray-500">Per Company</p>
          </div>
        </div>
      </div>
      {/* TOP ACTIVE TRIPS */}
      <div className="space-y-4 pt-2">
        <h2 className="text-base font-semibold">Route Profitability</h2>

        {routeMetrics.length === 0 ? (
          <p className="text-sm text-gray-500">No route data available</p>
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
              <div>Trips</div>
              <div className="text-right">Profit</div>
            </div>

            {/* TABLE ROWS */}
            {routeMetrics
              .sort((a, b) => a.profit - b.profit)
              .slice(0, 5)
              .map((route) => (
                <div
                  key={route.route}
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
                      {route.route}{" "}
                    </p>

                    <p className="text-sm text-gray-500 mt-1">
                      {route.tripCount} trips
                    </p>
                  </div>

                  <div>
                    <p className="font-medium">{route.tripCount}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ₹{formatCurrency(route.profit)}{" "}
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
