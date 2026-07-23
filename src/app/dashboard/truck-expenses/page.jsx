import { prisma } from "@/lib/prisma";
import { Wallet, Shield, Wrench, CircleDot, Ellipsis } from "lucide-react";
import { revalidatePath } from "next/cache";
import crypto from "crypto";
import TruckMaintenanceSummary from "@/components/TruckMaintenanceSummary";
import { createClient } from "@supabase/supabase-js";
import FileUpload from "@/components/FileUpload";
import TruckExpenseForm from "@/components/TruckExpenseForm";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
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

  const complianceCategories = [
    "INSURANCE",
    "ROAD_TAX",
    "FITNESS",
    "PERMIT",
    "NATIONAL_PERMIT",
  ];

  const isCompliance = complianceCategories.includes(category);

  const date = new Date(expenseDate);

  if (isCompliance) {
    const existing = await prisma.truckExpense.findFirst({
      where: {
        truckId,
        category,
      },
      orderBy: {
        expenseDate: "desc",
      },
    });

    if (existing) {
      let data = {
        amount,
        vendor,
        note,
        expenseDate: date,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      };

      // Only overwrite the document if a new one was uploaded
      if (documentPath) {
        data.documentPath = documentPath;
      }

      await prisma.truckExpense.update({
        where: {
          id: existing.id,
        },
        data,
      });
    } else {
      await prisma.truckExpense.create({
        data: {
          truckId,
          category,
          amount,
          vendor,
          note,
          expenseDate: date,
          expiryDate: expiryDate ? new Date(expiryDate) : null,
          documentPath,
          month: date.getMonth() + 1,
          year: date.getFullYear(),
        },
      });
    }
  } else {
    await prisma.truckExpense.create({
      data: {
        truckId,
        category,
        amount,
        vendor,
        note,
        expenseDate: date,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        documentPath,
        month: date.getMonth() + 1,
        year: date.getFullYear(),
      },
    });
  }

  revalidatePath("/dashboard/truck-expenses");
}

function formatCategory(label) {
  const names = {
    TYRE: "Tyres",
    REPAIR: "Repairs",
    ELECTRICAL: "Electrical",
    COMPLIANCE: "Compliance",
    WASHING: "Washing",
    ADD_BLUE: "AdBlue",
    OTHER: "Other",
  };

  return names[label] || label;
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
    0
  );

  const categoryGroups = {
    TYRE: ["TYRE"],

    REPAIR: ["REPAIR"],

    ELECTRICAL: ["ELECTRICAL"],

    COMPLIANCE: [
      "INSURANCE",
      "ROAD_TAX",
      "FITNESS",
      "PERMIT",
      "NATIONAL_PERMIT",
    ],

    WASHING: ["WASHING"],

    ADD_BLUE: ["ADD_BLUE"],

    OTHER: ["OTHER"],
  };

  const categoryTotals = Object.entries(categoryGroups).map(
    ([label, categories]) => {
      const total = expenses
        .filter((expense) => categories.includes(expense.category))
        .reduce((sum, expense) => sum + expense.amount, 0);

      return {
        label,
        total,
        percentage:
          totalExpenses === 0 ? 0 : Math.round((total / totalExpenses) * 100),
      };
    }
  );

  const truckSummaries = trucks
    .map((truck) => {
      const truckExpenses = expenses.filter(
        (expense) => expense.truckId === truck.id
      );

      if (truckExpenses.length === 0) return null;

      const categoryTotals = {};

      truckExpenses.forEach((expense) => {
        categoryTotals[expense.category] =
          (categoryTotals[expense.category] || 0) + expense.amount;
      });

      const total = truckExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      return {
        truck: truck.numberPlate,
        total,
        categoryTotals,
      };
    })
    .filter(Boolean);

  const selectedMonthLabel = selectedDate.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });

  const truckMaintenance = trucks
    .map((truck) => {
      const truckExpenses = expenses.filter(
        (expense) => expense.truckId === truck.id
      );

      if (truckExpenses.length === 0) return null;

      const total = truckExpenses.reduce(
        (sum, expense) => sum + expense.amount,
        0
      );

      return {
        id: truck.id,
        numberPlate: truck.numberPlate,
        total,
        lastExpense: truckExpenses[0],
      };
    })
    .filter(Boolean);

  return (
    <div className="p-6">
      <div className="mb-8 border rounded-lg p-4">
        <h2 className="font-semibold mb-4">Add Maintenance Expense</h2>

        <TruckExpenseForm trucks={trucks} action={createTruckExpense} />
      </div>

      <div className="mb-6 rounded-xl border bg-white p-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-semibold text-lg">Maintenance Dashboard</h2>
          <form className="mb-4 flex justify-end">
            <input
              type="month"
              name="month"
              defaultValue={
                monthParam ||
                `${currentYear}-${String(currentMonth).padStart(2, "0")}`
              }
              className="rounded-lg border px-3 py-2"
            />

            <button className="ml-2 rounded-lg bg-black px-4 py-2 text-white">
              Apply
            </button>
          </form>
        </div>
        <div className="grid gap-4 md:grid-cols-5">
          <Card
            icon={<Wallet className="h-5 w-5 text-indigo-600" />}
            title="Total Maintenance"
            amount={totalExpenses}
            subtitle={selectedMonthLabel}
          />

          <Card
            icon={<CircleDot className="h-5 w-5 text-blue-600" />}
            title="Tyres"
            amount={categoryTotals.find((c) => c.label === "TYRE")?.total || 0}
            subtitle={`${
              categoryTotals.find((c) => c.label === "TYRE")?.percentage || 0
            }% of total`}
          />

          <Card
            icon={<Wrench className="h-5 w-5 text-orange-600" />}
            title="Repairs"
            amount={
              categoryTotals.find((c) => c.label === "REPAIR")?.total || 0
            }
            subtitle={`${
              categoryTotals.find((c) => c.label === "REPAIR")?.percentage || 0
            }% of total`}
          />

          <Card
            icon={<Shield className="h-5 w-5 text-green-600" />}
            title="Compliance"
            amount={
              categoryTotals.find((c) => c.label === "COMPLIANCE")?.total || 0
            }
            subtitle={`${
              categoryTotals.find((c) => c.label === "COMPLIANCE")
                ?.percentage || 0
            }% of total`}
          />

          <Card
            icon={<Ellipsis className="h-5 w-5 text-purple-600" />}
            title="Other"
            amount={categoryTotals.find((c) => c.label === "OTHER")?.total || 0}
            subtitle={`${
              categoryTotals.find((c) => c.label === "OTHER")?.percentage || 0
            }% of total`}
          />
        </div>
        <div className="mt-8 rounded-xl border bg-white p-6">
          <h2 className="mb-6 font-semibold">Expenses by Category</h2>

          <div className="space-y-5">
            {categoryTotals.map((category) => (
              <div
                key={category.label}
                className="grid grid-cols-12 items-center gap-4"
              >
                <div className="col-span-2 font-medium">
                  {formatCategory(category.label)}
                </div>

                <div className="col-span-2">
                  ₹{category.total.toLocaleString()}
                </div>

                <div className="col-span-1 text-sm text-slate-500">
                  {category.percentage}%
                </div>

                <div className="col-span-7 h-2 overflow-hidden rounded-full bg-slate-200">
                  <div
                    className="h-full rounded-full bg-amber-400"
                    style={{ width: `${category.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        <TruckMaintenanceSummary trucks={truckMaintenance} />
      </div>
    </div>
  );
}

function Card({ icon, title, amount, subtitle }) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-full bg-slate-100">
        {icon}
      </div>

      <p className="text-sm text-slate-500">{title}</p>

      <h3 className="mt-1 text-2xl font-bold">₹{amount.toLocaleString()}</h3>

      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}
