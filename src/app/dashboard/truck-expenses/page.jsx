import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import FileUpload from "@/components/FileUpload";
import TruckExpenseForm from "@/components/TruckExpenseForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

async function createTruckExpense(formData) {
  "use server";

  const truckId = formData.get("truckId");
  const category = formData.get("category");
  const amount = Number(formData.get("amount"));
  const vendor = formData.get("vendor");
  const note = formData.get("note");
  const expiryDate = formData.get("expiryDate");
  const expenseDate = formData.get("expenseDate");
  const file = formData.get("document");

  console.log({
    hasFile: !!file,
    fileType: file?.constructor?.name,
    fileSize: file?.size,
    fileName: file?.name,
  });

  console.log({
    truckId,
    category,
    amount,
    expenseDate,
  });

  console.log("createTruckExpense called");

  if (!truckId || !category || !amount || !expenseDate) {
    throw new Error("Missing required fields");
  }

  let documentPath = null;

  if (file && file.size > 0) {
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExt = file.name.split(".").pop();

    const fileName = `maintenance/${truckId}/${crypto.randomUUID()}.${fileExt}`;

    const { error } = await supabase.storage
      .from("expense-bills")
      .upload(fileName, buffer, {
        contentType: file.type,
      });

    if (error) {
      console.error("Upload failed:", error);
      throw new Error("Document upload failed");
    }

    documentPath = fileName;
  }

  const date = new Date(expenseDate);
  await prisma.truckExpense.create({
    data: {
      truckId,
      category,
      amount,
      vendor,
      note,
      expiryDate: expiryDate ? new Date(expiryDate) : null,
      documentPath,
      expenseDate: date,
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    },
  });

  revalidatePath("/dashboard/truck-expenses");
}

async function deleteTruckExpense(formData) {
  "use server";

  const id = formData.get("id");

  const expense = await prisma.truckExpense.findUnique({
    where: { id },
  });

  if (expense?.documentPath) {
    await supabase.storage.from("expense-bills").remove([expense.documentPath]);
  }

  await prisma.truckExpense.delete({
    where: { id },
  });

  revalidatePath("/dashboard/truck-expenses");
}

export default async function TruckExpensesPage(props) {
  const searchParams = await props.searchParams;

  const monthParam = searchParams?.month;

  const selectedDate = monthParam ? new Date(`${monthParam}-01`) : new Date();

  const currentMonth = selectedDate.getMonth() + 1;
  const currentYear = selectedDate.getFullYear();
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

  const truckSummaries = trucks
    .map((truck) => {
      const truckExpenses = expenses.filter(
        (expense) => expense.truckId === truck.id,
      );

      if (truckExpenses.length === 0) return null;

      const categoryTotals = {};

      truckExpenses.forEach((expense) => {
        categoryTotals[expense.category] =
          (categoryTotals[expense.category] || 0) + expense.amount;
      });

      const total = truckExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0,
      );

      return {
        truck: truck.numberPlate,
        total,
        categoryTotals,
      };
    })
    .filter(Boolean);

  return (
    <div className="p-6">
      <form className="mb-6">
        <input
          type="month"
          name="month"
          defaultValue={
            monthParam ||
            `${currentYear}-${String(currentMonth).padStart(2, "0")}`
          }
          className="border rounded p-2"
        />

        <button className="ml-2 rounded bg-black px-4 py-2 text-white">
          Apply
        </button>
      </form>
      <div className="mb-8 border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Add Maintenance Expense</h2>

        <TruckExpenseForm trucks={trucks} action={createTruckExpense} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
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
              <div key={truck.truck} className="border rounded p-3 mb-3">
                <div className="flex justify-between font-semibold">
                  <span>{truck.truck}</span>
                  <span>₹{truck.total.toLocaleString()}</span>
                </div>

                <div className="mt-2 space-y-1 text-sm">
                  {Object.entries(truck.categoryTotals).map(
                    ([category, amount]) => (
                      <div
                        key={category}
                        className="flex justify-between text-gray-600"
                      >
                        <span>{category}</span>
                        <span>₹{amount.toLocaleString()}</span>
                      </div>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <select name="documents">
          <option value="">All</option>
          <option value="with">With Documents</option>
          <option value="without">Without Documents</option>
        </select>
        <table className="w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-3">Truck</th>
              <th className="text-left p-3">Category</th>
              <th className="text-left p-3">Amount</th>
              <th className="text-left p-3">Vendor</th>
              <th className="text-left p-3">Date</th>
              <th className="text-left p-3">Document</th>
              <th className="text-left p-3">Actions</th>
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
                <td className="p-3">
                  {expense.documentPath ? (
                    <a
                      href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/expense-bills/${expense.documentPath}`}
                      target="_blank"
                      className="rounded bg-blue-500 px-3 py-1 text-white text-sm"
                    >
                      View
                    </a>
                  ) : (
                    "No Document"
                  )}
                </td>

                <td className="p-3">
                  <form action={deleteTruckExpense}>
                    <input type="hidden" name="id" value={expense.id} />

                    <button className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
