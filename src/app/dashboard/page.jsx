const formatCurrency = (num) => new Intl.NumberFormat("en-IN").format(num);

export default async function DashboardPage() {
  const res = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <div className="p-20 bg-gray-100 space-y-8">
      <h1 className="text-2xl font-bold">Dashboard</h1>

      {/* MONEY SECTION */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold">Financial Summary</h2>

        <div className="bg-white p-6 rounded shadow">
          <p className="text-sm text-gray-500">Net Profit</p>
          <p
            className={`text-3xl font-bold ${
              (data.trueNetProfit ?? 0) >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ₹{formatCurrency(data.trueNetProfit ?? 0)}
          </p>

          {/* Insight */}
          {(data.trueNetProfit ?? 0) < 0 && (
            <p className="text-sm text-red-500 mt-2">
              Loss driven by fixed costs. No profitable closed trips yet.
            </p>
          )}
        </div>

        {/* Secondary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Operational Profit</p>
            <p className="text-xl font-bold">
              ₹{formatCurrency(data.operationalProfit ?? 0)}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Fixed Cost</p>
            <p className="text-xl font-bold">
              ₹{formatCurrency(data.fixedCost ?? 0)}
            </p>
          </div>
        </div>
      </div>

      {/* OPERATIONS SECTION */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold">Live Operations</h2>

        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Active Trips</p>
            <p className="text-xl font-bold">
              {data.statusStrip?.activeTrips ?? 0}
            </p>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <p className="text-sm text-gray-500">Cash Deployed</p>
            <p className="text-xl font-bold">
              ₹{formatCurrency(data.statusStrip?.cashDeployed ?? 0)}
            </p>
          </div>
        </div>

        {(data.statusStrip?.cashDeployed ?? 0) > 500000 && (
          <p className="text-xs text-orange-500 mt-1">
            High cash locked in active trips
          </p>
        )}
      </div>

      {/* TOP ACTIVE TRIPS */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold">Top Active Trips (By Expense)</h2>

        {data.topActiveTrips?.length === 0 ? (
          <p className="text-sm text-gray-500">No active trips</p>
        ) : (
          <div className="bg-white rounded shadow">
            {data.topActiveTrips?.map((trip) => (
              <div key={trip.id} className="flex justify-between p-3 border-b">
                <span className="text-gray-700 capitalize">
                  {trip.source} → {trip.destination}
                </span>
                <span className="font-semibold">
                  ₹{formatCurrency(trip.totalExpense ?? 0)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* LOSS TRIPS */}
      <div className="space-y-4 border-t pt-6">
        <h2 className="text-lg font-semibold text-red-600">
          Loss-Making Trips
        </h2>

        {data.lossTrips?.length === 0 ? (
          <p className="text-sm text-gray-500">
            No loss-making trips this month
          </p>
        ) : (
          <div className="bg-white rounded shadow">
            {data.lossTrips?.map((trip) => (
              <div key={trip.id} className="flex justify-between p-3 border-b">
                <span>
                  {trip.source} → {trip.destination}
                </span>
                <span className="text-red-600 font-semibold">
                  -₹{formatCurrency(Math.abs(trip.finalBalance ?? 0))}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
