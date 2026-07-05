"use client";

import { useState } from "react";
import {
  Shield,
  Receipt,
  BadgeCheck,
  FileText,
  FileBadge,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

function formatDate(date) {
  if (!date) return "-";

  return new Date(date).toLocaleDateString("en-GB");
}
export default function FleetRegisterAccordion({ trucks }) {
  const [openTruck, setOpenTruck] = useState(null);
  const [search, setSearch] = useState("");

  function getExpense(truck, category) {
    return truck.truckExpenses.find((expense) => expense.category === category);
  }

  function getTruckHealth(truck) {
    const categories = [
      "INSURANCE",
      "ROAD_TAX",
      "FITNESS",
      "PERMIT",
      "NATIONAL_PERMIT",
    ];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let hasMissing = false;
    let hasExpired = false;
    let hasExpiringSoon = false;

    let reason = "All documents valid";

    for (const category of categories) {
      const expense = getExpense(truck, category);

      if (!expense?.expiryDate) {
        hasMissing = true;

        if (reason === "All documents valid") {
          reason = `${category.replaceAll("_", " ")} missing`;
        }

        continue;
      }

      const expiry = new Date(expense.expiryDate);
      expiry.setHours(0, 0, 0, 0);

      const days = Math.floor((expiry - today) / (1000 * 60 * 60 * 24));
      if (days < 0) {
        hasExpired = true;
        reason = `${category.replaceAll("_", " ")} expired`;
        break;
      }

      if (days <= 30 && !hasExpiringSoon) {
        hasExpiringSoon = true;
        reason = `${category.replaceAll("_", " ")} expires in ${days} days`;
      }
    }

    if (hasExpired)
      return {
        label: "Expired",
        color: "bg-red-100 text-red-700",
        reason,
      };

    if (hasExpiringSoon)
      return {
        label: "Expiring Soon",
        color: "bg-yellow-100 text-yellow-700",
        reason,
      };

    if (hasMissing)
      return {
        label: "Incomplete",
        color: "bg-slate-200 text-slate-700",
        reason,
      };

    return {
      label: "Healthy",
      color: "bg-green-100 text-green-700",
      reason,
    };
  }

  const complianceRows = [
    {
      label: "Insurance",
      category: "INSURANCE",
      icon: Shield,
    },
    {
      label: "Road Tax",
      category: "ROAD_TAX",
      icon: Receipt,
    },
    {
      label: "Fitness",
      category: "FITNESS",
      icon: BadgeCheck,
    },
    {
      label: "Permit",
      category: "PERMIT",
      icon: FileText,
    },
    {
      label: "National Permit",
      category: "NATIONAL_PERMIT",
      icon: FileBadge,
    },
  ];

  const filteredTrucks = trucks.filter((truck) =>
    truck.numberPlate.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-4">
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search vehicle number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border p-3"
        />
      </div>

      {filteredTrucks.map((truck) => {
        const health = getTruckHealth(truck);
        return (
          <div
            key={truck.id}
            className="overflow-hidden rounded-xl border bg-white"
          >
            <button
              onClick={() =>
                setOpenTruck(openTruck === truck.id ? null : truck.id)
              }
              className="flex w-full items-center justify-between p-5 text-left"
            >
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold">{truck.numberPlate}</h2>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${health.color}`}
                  >
                    {health.label}
                  </span>
                </div>

                <p className="mt-1 text-sm text-slate-500">
                  {truck.vehicleType} • Registered{" "}
                  {formatDate(truck.registrationDate)}
                </p>

                <p className="mt-2 text-sm font-medium text-slate-700">
                  {health.reason}
                </p>

                <div className="mt-3 flex items-center gap-4">
                  {complianceRows.map((item) => {
                    const expense = getExpense(truck, item.category);
                    const Icon = item.icon;

                    let color = "text-slate-400";

                    if (!expense?.expiryDate) {
                      color = "text-slate-400";
                    } else {
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);

                      const expiry = new Date(expense.expiryDate);
                      expiry.setHours(0, 0, 0, 0);

                      const days = Math.floor(
                        (expiry - today) / (1000 * 60 * 60 * 24),
                      );

                      if (days < 0) {
                        color = "text-red-600";
                      } else if (days <= 30) {
                        color = "text-yellow-500";
                      } else {
                        color = "text-green-600";
                      }
                    }

                    return (
                      <Icon
                        key={item.category}
                        title={item.label}
                        className={`h-6 w-6 ${color}`}
                      />
                    );
                  })}
                </div>
              </div>

              {openTruck === truck.id ? (
                <ChevronUp className="h-6 w-6 text-slate-600" />
              ) : (
                <ChevronDown className="h-6 w-6 text-slate-600" />
              )}
            </button>

            {openTruck === truck.id && (
              <div className="border-t bg-slate-50 p-5">
                <div className="space-y-3">
                  {complianceRows.map((item) => {
                    const expense = getExpense(truck, item.category);
                    const Icon = item.icon;

                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    const expiry = expense?.expiryDate
                      ? new Date(expense.expiryDate)
                      : null;

                    if (expiry) {
                      expiry.setHours(0, 0, 0, 0);
                    }

                    const expired = expiry && expiry < today;

                    return (
                      <div
                        key={item.category}
                        className="flex items-center justify-between rounded-xl border bg-white p-4"
                      >
                        <div className="flex items-center gap-4">
                          <div className="rounded-lg bg-slate-100 p-3">
                            <Icon className="h-5 w-5 text-slate-700" />
                          </div>

                          <div>
                            <p className="font-semibold">{item.label}</p>

                            <p
                              className={`text-sm ${
                                expired ? "text-red-600" : "text-slate-500"
                              }`}
                            >
                              Expires: {formatDate(expense?.expiryDate)}
                            </p>
                          </div>
                        </div>

                        {expense?.documentPath ? (
                          <a
                            href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/expense-bills/${expense.documentPath}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="rounded bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700"
                          >
                            View
                          </a>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No Document
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
