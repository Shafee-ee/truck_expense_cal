import "./globals.css";
import Link from "next/link";
import Providers from "@/components/providers";

export const metadata = {
  title: "Logisco",
  description: "Truck expense tracking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-[#f5f7fb] text-gray-900">
        <Providers>
          <div className="flex min-h-screen">
            {/* SIDEBAR */}
            <aside className="w-64 bg-gradient-to-b from-[#071120] to-[#0b1730] shadow-2xl text-white flex flex-col border-r border-white/10">
              {" "}
              {/* LOGO */}
              <div className="px-6 py-8 border-b border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex font-2xl items-center justify-center font-bold text-amber-400">
                    L
                  </div>

                  <div>
                    <h1 className="text-lg font-semibold tracking-tight">
                      Logisco
                    </h1>

                    <p className="text-xs text-gray-400">
                      Financial Operations
                    </p>
                  </div>
                </div>
              </div>
              {/* NAVIGATION */}
              <nav className="flex-1 p-4 space-y-2">
                <Link
                  href="/dashboard"
                  className="
      block
      px-4
      py-3
      rounded-xl
bg-gradient-to-r from-amber-500/25 to-transparent border border-amber-500/10 shadow-lg shadow-amber-500/10     text-amber-400
      font-medium
      "
                >
                  Dashboard
                </Link>

                <Link
                  href="/trips"
                  className="
      block
      px-4
      py-3
      rounded-xl
      text-gray-300
      hover:bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm
      hover:text-white
      transition
      "
                >
                  Trips
                </Link>

                <Link
                  href="/trucks"
                  className="
      block
      px-4
      py-3
      rounded-xl
      text-gray-300
      hover:bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm
      hover:text-white
      transition
      "
                >
                  Trucks
                </Link>
              </nav>
              {/* FOOTER */}
              <div className="p-4 border-t border-white/10">
                <div className="rounded-xl bg-white/5 p-4">
                  <p className="text-sm text-gray-400">System Status</p>

                  <p className="text-sm font-medium text-green-400 mt-1">
                    Operational
                  </p>
                </div>
              </div>
            </aside>
            {/* MAIN CONTENT */}
            <div className="flex-1 flex flex-col">
              {/* TOP HEADER */}
              <header
                className="
    h-20
    bg-white
    border-b
    border-gray-200
    px-8
    flex
    items-center
    justify-between
  "
              >
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Operations Dashboard
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Financial visibility across trips and trucks
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div
                    className="
        w-10 h-10
        rounded-full
        bg-[#071120]
        text-white
        flex items-center justify-center
        font-semibold
      "
                  >
                    A
                  </div>
                </div>
              </header>

              {/* PAGE CONTENT */}
              <main className="flex-1 p-8 overflow-y-auto">{children}</main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
