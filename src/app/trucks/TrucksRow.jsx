"use client";
import Link from "next/link";

import { useRouter } from "next/navigation";

export default function TruckRow({ truck, index, health }) {
  const router = useRouter();

  return (
    <tr
      onClick={() => {
        router.push(`/trucks/${truck.id}/statement`);
      }}
      className="
      border-b
      hover:bg-slate-50
      transition
      cursor-pointer
      "
    >
      <td
        className="
                    px-6
                    py-5
                    font-semibold
                    "
      >
        #{index + 1}
      </td>
      <td
        className="
                    px-4
                    py-5
                    "
      ></td>
      <td
        className="
                    text-right
                    px-4
                    "
      >
        ₹{truck.metrics.totalRevenue.toLocaleString("en-IN")}
      </td>
      <td
        className="
                    text-right
                    px-4
                    "
      >
        ₹
        {(
          truck.metrics.totalExpenses + truck.metrics.maintenanceCost
        ).toLocaleString("en-IN")}
      </td>
      <td
        className="
text-right
px-4
"
      >
        ₹{truck.metrics.outstanding.toLocaleString("en-IN")}
      </td>
      <td
        className={`
                    text-right
                    px-4
                    font-semibold

                    ${
                      truck.metrics.netProfit >= 0
                        ? "text-emerald-600"
                        : "text-red-600"
                    }
                    `}
      >
        ₹{truck.metrics.netProfit.toLocaleString("en-IN")}
      </td>
      <td
        className="
                    text-right
                    px-4
                    "
      >
        {truck.metrics.tripCount}
      </td>
      <td
        className="
  text-right
  px-4
  "
      >
        {truck.metrics.tripCount > 0
          ? `₹${Math.round(truck.metrics.earningsPerDay).toLocaleString("en-IN")}`
          : "-"}
      </td>
      <td
        className="
                    text-center
                    px-6
                    "
      >
        <span
          className={`
                      px-3
                      py-1
                      rounded-full
                      text-xs
                      font-semibold

                      ${
                        health === "HEALTHY"
                          ? "bg-green-100 text-green-700"
                          : health === "COLLECTION"
                            ? "bg-yellow-100 text-yellow-700"
                            : health === "INACTIVE"
                              ? "bg-slate-100 text-slate-600"
                              : "bg-red-100 text-red-700"
                      }
                      `}
        >
          {health}
        </span>
      </td>
    </tr>
  );
}
