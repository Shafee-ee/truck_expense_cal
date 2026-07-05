export default function TruckMaintenanceSummary({ trucks }) {
  return (
    <div className="mt-8 rounded-xl border bg-white p-6">
      <h2 className="mb-6 text-lg font-semibold">Truck Maintenance Summary</h2>

      <div className="overflow-hidden rounded-lg border">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-left text-sm text-slate-600">
              <th className="p-4">Truck</th>
              <th className="p-4">Total</th>
              <th className="p-4">Last Expense</th>
              <th className="p-4">Updated</th>
              <th className="p-4"></th>
            </tr>
          </thead>

          <tbody>
            {trucks.map((truck) => (
              <tr key={truck.id} className="border-t hover:bg-slate-50">
                <td className="p-4 font-semibold">{truck.numberPlate}</td>

                <td className="p-4">₹{truck.total.toLocaleString()}</td>

                <td className="p-4">{truck.lastExpense?.category || "-"}</td>

                <td className="p-4">
                  {truck.lastExpense
                    ? new Date(
                        truck.lastExpense.expenseDate,
                      ).toLocaleDateString("en-GB")
                    : "-"}
                </td>

                <td className="p-4 text-right">→</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
