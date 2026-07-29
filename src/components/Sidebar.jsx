"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const activeClass = `
    block
    px-4
    py-3
    rounded-xl
    bg-gradient-to-r
    from-amber-500/25
    to-transparent
    border
    border-amber-500/10
    shadow-lg
    shadow-amber-500/10
    text-amber-400
    font-medium
  `;

  const inactiveClass = `
    block
    px-4
    py-3
    rounded-xl
    text-gray-300
    hover:bg-gradient-to-br
    from-white/10
    to-white/5
    backdrop-blur-sm
    hover:text-white
    transition
  `;

  return (
    <>
      <div className="px-6 py-8 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex font-2xl items-center justify-center font-bold text-amber-400">
            L
          </div>

          <div>
            <h1 className="text-lg font-semibold tracking-tight">Logisco</h1>

            <p className="text-xs text-gray-400">Financial Operations</p>
          </div>
        </div>
      </div>
      {/* NAVIGATION */}
      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/dashboard"
          className={pathname === "/dashboard" ? activeClass : inactiveClass}
        >
          Dashboard
        </Link>

        <Link
          href="/companies"
          className={
            pathname.startsWith("/companies") ? activeClass : inactiveClass
          }
        >
          Companies
        </Link>

        <Link
          href="/trips"
          className={
            pathname.startsWith("/trips") ? activeClass : inactiveClass
          }
        >
          Trips
        </Link>

        <Link
          href="/trucks"
          className={
            pathname.startsWith("/trucks") ? activeClass : inactiveClass
          }
        >
          Trucks
        </Link>

        <Link
          href="/dashboard/truck-summary"
          className={
            pathname.startsWith("/dashboard/truck-summary")
              ? activeClass
              : inactiveClass
          }
        >
          Truck Summary
        </Link>

        <Link
          href="/dashboard/truck-expenses"
          className={
            pathname.startsWith("/dashboard/truck-expenses")
              ? activeClass
              : inactiveClass
          }
        >
          Maintenance
        </Link>

        <Link
          href="/dashboard/fleet-register"
          className={
            pathname.startsWith("/dashboard/fleet-register")
              ? activeClass
              : inactiveClass
          }
        >
          Fleet Register
        </Link>

        <Link
          href="/dashboard/accounts"
          className={
            pathname.startsWith("/dashboard/accounts")
              ? activeClass
              : inactiveClass
          }
        >
          Accounts
        </Link>

        <Link
          href="/imports"
          className={
            pathname.startsWith("/imports") ? activeClass : inactiveClass
          }
        >
          Migration Wizard
        </Link>
      </nav>
      {/* FOOTER */}
      <div className="p-4 border-t border-white/10">
        <div className="rounded-xl bg-white/5 p-4">
          <p className="text-sm text-gray-400">System Status</p>

          <p className="text-sm font-medium text-green-400 mt-1">Operational</p>
        </div>
      </div>
    </>
  );
}
