import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

async function createTruckExpense(formData) {
  "use server";

  const truckId = formData.get("truckId");
  const category = formData.get("category");
  const amount = Number(formData.get("amount"));
  const vendor = formData.get("vendor");
  const notes = formData.get("notes");
  const expenseDate = formData.get("expenseDate");

  if (!truckId || !category || !amount || !expenseDate) {
    throw new Error("Missing required fields");
  }

  const date = new Date(expenseDate);

  await prisma.truckExpense.create({
    data: {
      truckId,
      category,
      amount,
      vendor,
      notes,
      expenseDate: date,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    },
  });

  revalidatePath("/dashboard/truck-expenses");
}

export default async function TruckExpensesPage() {
  const currentDate = new Date();

  const currentMonth = currentDate.getMonth() + 1;
  const currentYear = currentDate.getFullYear();
  const trucks = await prisma.truck.findMany({
    orderBy: {
      numberPlate: "asc",
    },
  });

  const expenses = await prisma.truckExpense.findMany({
    where: {
      month: currentMonth,
      year: currentYear,
    },
    include: {
      truck: true,
    },
    orderBy: {
      expenseDate: "desc",
    },
  });

  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  );

  const truckSummaries = trucks.map((truck) => {
    const truckExpenses = expenses.filter(
      (expense) => expense.truckId === truck.id,
    );

    const total = truckExpenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );

    return {
      truck: truck.numberPlate,
      total,
    };
  });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Truck Maintenance Ledger</h1>

      <div className="mb-8 border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Add Maintenance Expense</h2>

        <form action={createTruckExpense} className="grid grid-cols-2 gap-4">
          <select name="truckId" className="border rounded p-2">
            <option>Select Truck</option>

            {trucks.map((truck) => (
              <option key={truck.id} value={truck.id}>
                {truck.numberPlate}
              </option>
            ))}
          </select>

          <select name="category" className="border rounded p-2">
            <option>Select Category</option>

            <option value="TYRE">Tyre</option>
            <option value="REPAIR">Repair</option>
            <option value="ELECTRICAL">Electrical</option>
            <option value="INSURANCE">Insurance</option>
            <option value="SALARY">Salary</option>
            <option value="TAX">Tax</option>
            <option value="PERMIT">Permit</option>
            <option value="WASHING">Washing</option>
            <option value="OTHER">Other</option>
          </select>

          <input
            name="amount"
            type="number"
            placeholder="Amount"
            className="border rounded p-2"
          />

          <input
            name="vendor"
            type="text"
            placeholder="Vendor"
            className="border rounded p-2"
          />

          <input
            name="expenseDate"
            type="date"
            className="border rounded p-2"
          />

          <input
            name="notes"
            type="text"
            placeholder="Notes"
            className="border rounded p-2"
          />

          <button className="bg-black text-white rounded p-2">
            Add Expense
          </button>
        </form>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="border rounded-lg p-4">
          <p className="text-sm text-gray-500">Total Maintenance Cost</p>

          <h2 className="text-2xl font-bold">
            ₹{totalExpenses.toLocaleString()}
          </h2>
        </div>

        <div className="border rounded-lg p-4 col-span-2">
          <p className="text-sm text-gray-500 mb-2">Truck Expense Summary</p>

          <div className="space-y-2">
            {truckSummaries.map((truck) => (
              <div key={truck.truck} className="flex justify-between">
                <span>{truck.truck}</span>

                <span>₹{truck.total.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Truck</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Vendor</th>
              <th className="text-left p-3">Date</th>
            </tr>
          </thead>

          <tbody>
            {expenses.map((expense) => (
              <tr key={expense.id} className="border-t">
                <td className="p-3">{expense.truck.numberPlate}</td>

                <td className="p-3">{expense.category}</td>

                <td className="p-3">₹{expense.amount.toLocaleString()}</td>

                <td className="p-3">{expense.vendor || "-"}</td>

                <td className="p-3">
                  {new Date(expense.expenseDate).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
