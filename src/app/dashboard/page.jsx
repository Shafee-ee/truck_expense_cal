export default async function DashboardPage() {
  const res = await fetch("http://localhost:3000/api/dashboard", {
    cache: "no-store",
  });

  const data = await res.json();

  return (
    <div className="p-6 space-y-8">
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      {/*Money section*/}
      <div className="space-y-2">
        <h2>Financial Summary</h2>

        <div>
          <p>Operational Profit: ₹{data.operationalProfit}</p>
          <p>Fixed Cost: ₹{data.fixedCost}</p>
          <p>Net Profit: ₹{data.trueNetProfit}</p>
        </div>
      </div>

      {/*Operations Section*/}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">Live Operations</h2>

        <div>
          <p>Active Trips:{data.statusStrip.activeTrips}</p>
          <p>Cash Deployed: ₹{data.statusStrip.cashDeployed}</p>
        </div>
      </div>
    </div>
  );
}
