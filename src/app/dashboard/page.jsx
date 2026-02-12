export default async function DashboardPage() {
    const res = await fetch("http://localhost:3000/api/dashboard", {
        cache: "no-store",
    });

    const data = await res.json();

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold">Dashboard</h1>
            <h2>Active Trips: {data.statusStrip.activeTrips}</h2>
            <h2>Cash Deployed: {data.statusStrip.cashDeployed}</h2>
            <h2>Operational Profit (This Month): ₹{data.operationalProfit}</h2>

        </div>
    );
}